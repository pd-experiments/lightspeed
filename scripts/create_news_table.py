from dataclasses import dataclass
from datetime import datetime, timezone
import os
import supabase
from dotenv import load_dotenv
from uuid import uuid4
from multiprocessing import Pool, Queue, cpu_count
from tqdm import tqdm
import newspaper
from newspaper import Article, Source, ArticleException

# Load environment variables
load_dotenv(".env.local")


# Connect to Supabase
def get_supabase_client():
    return supabase.create_client(
        os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
        os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    )


news_sources = [
    "https://cnn.com",
    "https://foxnews.com",
    "https://nytimes.com",
    "https://washingtonpost.com",
]


def build_articles(source) -> list[Article]:
    return newspaper.build(source, memoize_articles=False).articles


def process_article(article: Article):
    try:
        article.download()
        article.parse()
        article.nlp()
        return {
            "source_url": article.source_url,
            "url": article.url,
            "title": article.title,
            "authors": article.authors,
            "publish_date": (
                article.publish_date.isoformat() if article.publish_date else None
            ),
            "summary": article.summary,
            "text": article.text,
            # "html": article.html,
            # "article_html": article.article_html,
            "movies": article.movies,
            "keywords": article.keywords,
            "meta_keywords": article.meta_keywords,
            "tags": list(article.tags),
        }
    except ArticleException as e:
        return None


def process_articles(articles: list[Article]):
    for article in articles:
        process_article(article.url)


def push_to_supabase(client, articles):
    print(f"Pushing {len(articles)} articles to Supabase")
    articles = [a for a in articles if a]
    batch_size = 50
    for idx in range(0, len(articles), batch_size):
        print(f"Pushing articles {idx} to {idx + batch_size}")
        articles_batch = articles[idx : idx + batch_size]
        client.table("news").insert(articles_batch).execute()


if __name__ == "__main__":
    client = get_supabase_client()
    client.table("news").delete().neq("id", uuid4()).execute()
    for source in news_sources:
        articles = build_articles(source)

        with tqdm(
            total=len(articles), desc=f"Processing articles for {source}"
        ) as pbar:

            results = []

            with Pool(cpu_count()) as pool:
                results = [
                    pool.apply_async(
                        process_article, (article,), callback=lambda _: pbar.update(1)
                    )
                    for article in articles
                ]
                for r in results:
                    r.wait()  # Ensure all processes complete
                articles = [r.get() for r in results]

            push_to_supabase(client, articles)
