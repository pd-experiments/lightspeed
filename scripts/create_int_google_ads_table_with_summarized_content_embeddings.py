from openai.types.chat.parsed_chat_completion import ParsedChatCompletion
import openai
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    NoTranscriptAvailable,
    TranscriptsDisabled,
    VideoUnavailable,
    TooManyRequests,
    InvalidVideoId,
    NoTranscriptFound,
)
from xml.etree.ElementTree import ParseError
from datetime import date
from typing import Any
import os
from dotenv import load_dotenv
import supabase
import re
import multiprocessing as mp
from tqdm import tqdm

from models import (
    EmbeddedGoogleAd,
    Transcript,
    VersionedGoogleAd,
    VideoDescription,
)


# Load environment variables
load_dotenv(".env.local")


# Connect to Supabase
def get_supabase_client():
    return supabase.create_client(
        os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
        os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    )


# Get YouTube records
def get_records() -> list[dict[str, Any]]:
    supabase_client = get_supabase_client()

    records = []
    start, offset = 0, 1000
    while True:
        try:
            response = (
                supabase_client.table("int_ads__google_ads_versioned")
                .select("*")
                .eq("format", "Video")
                .like("content", "%youtube%")
                .range(start, start + offset - 1)
                .execute()
            )
            data = response.data
            records.extend(response.data)
            if len(data) < offset:
                break
            start += offset
        except Exception as e:
            print("Supabase raised exception while pulling records:", e)
            break

    return list(map(lambda record: VersionedGoogleAd.model_validate(record), records))


def extract_youtube_video_id(url: str | None) -> str | None:
    if url is None:
        return
    pattern = r"(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S*\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})"
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    return


# Get transcripts for record and create embeddings
def process_record(record: VersionedGoogleAd) -> EmbeddedGoogleAd:
    try:
        assert record.format == "Video"
        video_id: str | None = extract_youtube_video_id(record.content)
        if video_id is None:
            return

        soundbytes: list[Transcript] = list(
            map(
                Transcript.model_validate, YouTubeTranscriptApi.get_transcript(video_id)
            )
        )
        joined_transcript = re.sub(
            r"\s+", " ", " ".join(map(lambda soundbyte: soundbyte.text, soundbytes))
        )

        response: ParsedChatCompletion = openai.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are given the transcript of a political video ad. Write a summary of at most three sentences describing the ad. Denote political issues that the video mentions. If the video doesn't mention any political issues (e.g. only a call to vote), return an empty list or return unknown. Denote the political leaning of the ad. If the video doesn't lean any particular direction, return unknown.",
                },
                {
                    "role": "user",
                    "content": f"Advertiser name: {record.advertiser_name}\nTranscript: {joined_transcript}",
                },
            ],
            response_format=VideoDescription,
        )

        video_description: VideoDescription = response.choices[0].message.parsed
        return EmbeddedGoogleAd(versioned_ad_id=record.id, **dict(video_description))
    except (
        NoTranscriptAvailable,
        TranscriptsDisabled,
        VideoUnavailable,
        TooManyRequests,
        InvalidVideoId,
        NoTranscriptFound,
        ParseError,
    ):
        return None
    except Exception as e:
        print(f"Error with ad ({record.advertisement_url}):", type(e))


if __name__ == "__main__":
    records = get_records()

    with tqdm(total=len(records), desc="Processing videos") as pbar:

        def update_progress(row: EmbeddedGoogleAd | None):
            if row is not None:
                supabase_client = get_supabase_client()
                (
                    supabase_client.table("int_ads__google_ads_embeddings")
                    .upsert(row.model_dump(mode="json"))
                    .execute()
                )
            pbar.update(1)

        with mp.Pool(mp.cpu_count()) as p:
            for record in records:
                p.apply_async(process_record, args=(record,), callback=update_progress)

            p.close()
            p.join()

    print("All videos processed successfully")
