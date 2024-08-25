import os
import supabase
from dotenv import load_dotenv
from postgrest.base_request_builder import SingleAPIResponse
from models import TikTokVideoData, TikTokAISummaries, TikTokVideoDataWithEmbeddings
from openai.types.chat import ParsedChatCompletion
import openai
from tqdm import tqdm
import multiprocessing as mp


load_dotenv(".env.local")


def get_supabase_client():
    return supabase.create_client(
        os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
        os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    )


def get_tiktok_data() -> list[TikTokVideoData]:
    supabase_client = get_supabase_client()
    response: SingleAPIResponse = supabase_client.rpc("get_tiktok_video_data").execute()
    data = [TikTokVideoData(**row) for row in response.data]
    return data


def create_tiktok_embeddings(tiktok: TikTokVideoData) -> TikTokVideoDataWithEmbeddings:
    response: ParsedChatCompletion = openai.beta.chat.completions.parse(
        model="gpt-4o-mini",
        response_format=TikTokAISummaries,
        messages=[
            {
                "role": "system",
                "content": "You are given data on a politically motivated TikTok video. Write a summary of at most 3 sentences describing the TikTok. Extract a list of political keywords that describe the video, or if there are none that fit, return an empty list. Deduce the political leaning, or if it is not clear, select Unknown. Extract a list of tones that describe the video, or if there are none that fit, return an empty list.",
            },
            {
                "role": "user",
                "content": tiktok.model_dump_json(
                    include=["author", "caption", "hashtags", "topic", "comments"]
                ),
            },
        ],
    )
    tiktok_ai_summaries: TikTokAISummaries = response.choices[0].message.parsed

    caption_embedding: list[float] | None = (
        openai.embeddings.create(input=tiktok.caption, model="text-embedding-3-small")
        .data[0]
        .embedding
        if tiktok.caption
        else None
    )

    summary_embedding: list[float] | None = (
        openai.embeddings.create(
            input=tiktok_ai_summaries.summary, model="text-embedding-3-small"
        )
        .data[0]
        .embedding
        if tiktok_ai_summaries.summary
        else None
    )

    tiktok_embeddings = TikTokVideoDataWithEmbeddings(
        **dict(tiktok),
        **dict(tiktok_ai_summaries),
        caption_embedding=caption_embedding,
        summary_embedding=summary_embedding
    )
    return tiktok_embeddings


if __name__ == "__main__":
    tiktok_data = get_tiktok_data()
    supabase_client = get_supabase_client()
    with tqdm(total=len(tiktok_data), desc="Processing TikTok videos") as pbar:

        def update(tiktok_embeddings: TikTokVideoDataWithEmbeddings | None):
            if tiktok_embeddings:
                supabase_client.table("tiktok_embeddings").upsert(
                    tiktok_embeddings.model_dump(mode="json")
                ).execute()
            pbar.update(1)

        with mp.Pool(mp.cpu_count()) as p:
            for tiktok in tiktok_data:
                embeddings: TikTokVideoDataWithEmbeddings = create_tiktok_embeddings(
                    tiktok
                )
                p.apply_async(create_tiktok_embeddings, args=(tiktok,), callback=update)

            p.close()
            p.join()

    print("All video finished processing")
