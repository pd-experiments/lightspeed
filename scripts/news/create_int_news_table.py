from dataclasses import dataclass
import json
from uuid import uuid4
from multiprocessing import Pool, Queue, cpu_count
from tqdm import tqdm
import openai
from news.models import (
    FilteredArticle,
    NewsAISummary,
    NewsValidationResponse,
    RawArticle,
)
from helpers.helpers import get_supabase_client
from tenacity import (
    retry,
    wait_exponential,
    stop_after_attempt,
    retry_if_exception_type,
)


@retry(
    retry=retry_if_exception_type(openai.RateLimitError),
    wait=wait_exponential(multiplier=1, min=2, max=4),
    stop=stop_after_attempt(6),
)
def validate_article_on_keywords(article: RawArticle) -> bool:
    try:
        if not article.publish_date:
            return False
        combined_keywords: list[str] = list(
            filter(lambda keyword: keyword, article.keywords + article.meta_keywords)
        )
        if len(combined_keywords) == 0:
            return False
        response: NewsValidationResponse = (
            openai.beta.chat.completions.parse(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "We are building a political news aggregator and want to make sure that a news article that we are processing actually does relate to politics, government, or modern issues. You are given keywords that relate to a news article. Return a boolean of whether or not the article is relevant.",
                    },
                    {"role": "user", "content": str(combined_keywords)},
                ],
                response_format=NewsValidationResponse,
            )
            .choices[0]
            .message.parsed
        )
        return response.is_relevant
    except openai.RateLimitError as e:
        raise e
    except Exception as e:
        print("Error validating article on keywords:", e)


@retry(
    retry=retry_if_exception_type(openai.RateLimitError),
    wait=wait_exponential(multiplier=1, min=2, max=4),
    stop=stop_after_attempt(6),
)
def validate_article_on_content(article: RawArticle) -> bool:
    try:
        if not article.summary or not article.publish_date:
            return False
        response: NewsValidationResponse = (
            openai.beta.chat.completions.parse(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "We are building a political news aggregator and want to make sure that a news article that we are processing actually does relate to politics, government, or modern issues. You are given a summary of a news article. Return a boolean of whether or not the article is relevant.",
                    },
                    {"role": "user", "content": article.summary},
                ],
                response_format=NewsValidationResponse,
            )
            .choices[0]
            .message.parsed
        )
        return response.is_relevant
    except openai.RateLimitError as e:
        raise e
    except Exception as e:
        print("Error validating article on content:", e)


@retry(
    retry=retry_if_exception_type(openai.RateLimitError),
    wait=wait_exponential(multiplier=1, min=2, max=4),
    stop=stop_after_attempt(6),
)
def process_article(article: RawArticle) -> FilteredArticle:
    try:
        if (
            article is not None
            # and validate_article_on_keywords(article)
            and validate_article_on_content(article)
        ):
            response: NewsAISummary = (
                openai.beta.chat.completions.parse(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are given a news article. Write a summary of at most four sentences summarizing the news article. Denote political keywords (broad voter concerns) that the news article mentions. If the article doesn't mention any political keywords (e.g. only a call to vote), return an empty list or return unknown. Denote the political leaning of the article. If the article doesn't lean any particular direction, return unknown. Denote one or more tones present in the article. If the article doesn't have a clear tone, return unknown. Compile a list of issues that contains more specific issues discussed by the article.",
                        },
                        {"role": "user", "content": f"{article.title}\n{article.text}"},
                    ],
                    response_format=NewsAISummary,
                )
                .choices[0]
                .message.parsed
            )

            summary_embedding: list[float] = (
                openai.embeddings.create(
                    input=response.ai_summary, model="text-embedding-3-small"
                )
                .data[0]
                .embedding
            )

            return FilteredArticle(
                **dict(article), **dict(response), summary_embedding=summary_embedding
            )
    except openai.RateLimitError as e:
        raise e
    except Exception as e:
        print("Error processing article:", e)


def get_articles_from_db() -> list[RawArticle]:
    supabase_client = get_supabase_client()
    articles: list[RawArticle] = []
    start, offset = 0, 1000
    while True:
        new_articles = (
            supabase_client.table("stg_news")
            .select("*")
            .range(start, start + offset - 1)
            .execute()
            .data
        )
        articles.extend(map(RawArticle.model_validate, new_articles))
        if len(new_articles) < offset:
            break
        start += offset
    return articles


if __name__ == "__main__":
    articles = get_articles_from_db()

    with tqdm(total=len(articles), desc="Processing articles") as pbar:

        def update(filtered_article: FilteredArticle | None):
            if filtered_article:
                supabase_client = get_supabase_client()
                supabase_client.table("int_news").upsert(
                    filtered_article.model_dump(mode="json")
                ).execute()
            pbar.update(1)

        with Pool(cpu_count()) as pool:
            for article in articles:
                pool.apply_async(process_article, args=(article,), callback=update)

            pool.close()
            pool.join()

    print("All content processed successfully")
