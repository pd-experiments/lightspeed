from dataclasses import dataclass
import json
import re
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

from scripts.threads.models import EnhancedIGThread, IGThreadAISummary, RawIGThread


def get_hashtags_from_text(text: str) -> list[str]:
    return re.findall(r"#\w+", text)


@retry(
    retry=retry_if_exception_type(openai.RateLimitError),
    wait=wait_exponential(multiplier=1, min=2, max=4),
    stop=stop_after_attempt(6),
)
def process_ig_thread(ig_thread: RawIGThread) -> EnhancedIGThread:
    try:
        if not ig_thread.text:
            return

        response: IGThreadAISummary = (
            openai.beta.chat.completions.parse(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are given an Instagram Thread that someone posted on a political topic. Write a summary of at most three sentences summarizing the thread. Denote political keywords (broad voter concerns) that the news thread mentions. If the thread doesn't mention any political keywords (e.g. only a call to vote), return an empty list or return unknown. Denote the political leaning of the thread. If the thread doesn't lean any particular direction, return unknown. Denote one or more tones present in the thread. If the thread doesn't have a clear tone, return unknown. Compile a list of issues that contains more specific issues discussed by the article.",
                    },
                    {"role": "user", "content": ig_thread.text},
                ],
                response_format=IGThreadAISummary,
            )
            .choices[0]
            .message.parsed
        )

        response.political_keywords = list(
            filter(lambda item: item != "Unknown", response.political_keywords)
        )
        response.political_tones = list(
            filter(lambda item: item != "Unknown", response.political_tones)
        )

        summary_embedding: list[float] = (
            openai.embeddings.create(
                input=response.ai_summary, model="text-embedding-3-small"
            )
            .data[0]
            .embedding
        )

        return EnhancedIGThread(
            **dict(ig_thread),
            **dict(response),
            raw_text_embedding=ig_thread.embedding,
            summary_embedding=summary_embedding,
            hashtags=get_hashtags_from_text(ig_thread.text)
        )

    except openai.RateLimitError as e:
        raise e
    except Exception as e:
        print(e)


def get_ig_threads() -> list[RawIGThread]:
    ig_threads: list[RawIGThread] = []
    supabase_client = get_supabase_client()
    start, offset = 0, 1000
    while True:
        new_threads = (
            supabase_client.table("threads")
            .select("*")
            .range(start, start + offset - 1)
            .execute()
            .data
        )
        ig_threads.extend(map(RawIGThread.model_validate, new_threads))
        if len(new_threads) < offset:
            break
        start += offset
    return ig_threads


if __name__ == "__main__":
    raw_ig_threads = get_ig_threads()

    with tqdm(total=len(raw_ig_threads), desc="Processing IG threads") as pbar:

        def update(enhanced_ig_thread: EnhancedIGThread | None):
            if enhanced_ig_thread:
                supabase_client = get_supabase_client()
                supabase_client.table("int_threads").upsert(
                    enhanced_ig_thread.model_dump(mode="json")
                ).execute()
            pbar.update(1)

        with Pool(cpu_count()) as pool:
            for thread in raw_ig_threads:
                pool.apply_async(process_ig_thread, args=(thread,), callback=update)

            pool.close()
            pool.join()

    print("All content processed successfully")
