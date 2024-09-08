from enum import Enum
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
from typing import Any, Literal
import os
from dotenv import load_dotenv
import supabase
import re
import multiprocessing as mp
from tqdm import tqdm
import whisper
import yt_dlp
from scripts.google_ads.models import (
    EmbeddedGoogleAd,
    Transcript,
    VersionedGoogleAd,
    MediaDescription,
)
import requests
from PIL import Image
from io import BytesIO
import pytesseract
import easyocr
import warnings
from tenacity import retry, stop_after_attempt, wait_exponential

warnings.filterwarnings("ignore", category=FutureWarning)

# Load environment variables
load_dotenv(".env.local")


# Connect to Supabase
def get_supabase_client():
    return supabase.create_client(
        os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
        os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    )


class TranscriptRetrievalMethod(str, Enum):
    AUTO_GENERATED = "auto_generated"
    WHISPER = "whisper"


# whisper_model = whisper.load_model("base")


# Get YouTube transcript
def get_youtube_transcript(video_id: str, retrieval_method: TranscriptRetrievalMethod):
    if retrieval_method == TranscriptRetrievalMethod.AUTO_GENERATED:
        soundbytes: list[Transcript] = list(
            map(
                Transcript.model_validate, YouTubeTranscriptApi.get_transcript(video_id)
            )
        )
        joined_transcript = re.sub(
            r"\s+", " ", " ".join(map(lambda soundbyte: soundbyte.text, soundbytes))
        )
        return joined_transcript
    elif (
        retrieval_method == TranscriptRetrievalMethod.WHISPER
    ):  # DON'T USE WHISPER METHOD IT'S BROKEN
        filename: str | None = None
        result: str | None = None
        try:
            filename = f"temp_yt_downloads/{video_id}.mp3"

            directory = os.path.dirname(filename)
            if not os.path.exists(directory):
                os.makedirs(directory)

            ydl_opts = {
                "format": "mp3/bestaudio/best",
                "outtmpl": filename,
                "postprocessors": [
                    {
                        "key": "FFmpegExtractAudio",
                        "preferredcodec": "mp3",
                    }
                ],
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([f"https://www.youtube.com/watch?v={video_id}"])

                result = whisper_model.transcribe(filename)["text"]
        except Exception as e:
            print(e)
        finally:
            if filename and os.path.exists(filename):
                os.remove(filename)
            return result
    else:
        return None


# Get YouTube records
def get_records(
    record_format: Literal["Video", "Image", "Text"]
) -> list[dict[str, Any]]:
    supabase_client = get_supabase_client()

    records = []
    start, offset = 0, 1000
    while True:
        try:
            response = (
                supabase_client.table("int_ads__google_ads_versioned")
                .select("*")
                .eq("format", record_format)
                # .like("content", "%youtube%")
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


# Process video
def process_video(record: VersionedGoogleAd) -> EmbeddedGoogleAd:
    try:
        video_id: str | None = extract_youtube_video_id(record.content)
        if video_id is None:
            print("Invalid video id:", record.content)
            return

        transcript = get_youtube_transcript(
            video_id=video_id, retrieval_method=TranscriptRetrievalMethod.AUTO_GENERATED
        )

        response: ParsedChatCompletion = openai.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are given the transcript of a political video ad. Write a summary of at most three sentences describing the ad. Denote political issues that the video mentions. If the video doesn't mention any political issues (e.g. only a call to vote), return an empty list or return unknown. Denote the political leaning of the ad. If the video doesn't lean any particular direction, return unknown. Denote one or more tones present in the ad. If the ad doesn't have a clear tone, return unknown.",
                },
                {
                    "role": "user",
                    "content": f"Advertiser name: {record.advertiser_name}\nTranscript: {transcript}",
                },
            ],
            response_format=MediaDescription,
        )

        video_description: MediaDescription = response.choices[0].message.parsed
        summary_embeddings: list[float] = (
            openai.embeddings.create(
                input=video_description.summary, model="text-embedding-3-small"
            )
            .data[0]
            .embedding
        )
        advertiser_name_embedding = (
            openai.embeddings.create(
                input=record.advertiser_name, model="text-embedding-3-small"
            )
            .data[0]
            .embedding
        )
        return EmbeddedGoogleAd(
            versioned_ad_id=record.id,
            summary_embeddings=summary_embeddings,
            **dict(video_description),
            advertiser_name_embedding=advertiser_name_embedding,
        )
    except (
        NoTranscriptAvailable,
        TranscriptsDisabled,
        VideoUnavailable,
        TooManyRequests,
        InvalidVideoId,
        NoTranscriptFound,
        ParseError,
    ) as e:
        # print(e)
        print("IP blocked")
        return None
    except Exception as e:
        print(f"Error with ad ({record.advertisement_url}):", type(e))


def process_text(record: VersionedGoogleAd) -> EmbeddedGoogleAd:
    try:
        response: ParsedChatCompletion = openai.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are given text from a political ad shown in a Google search page. Write a summary of at most three sentences describing the ad. Denote political issues that the ad mentions. If the ad doesn't mention any political issues (e.g. only a call to vote), return an empty list or return unknown. Denote the political leaning of the ad. If the ad doesn't lean any particular direction, return unknown. Denote one or more tones present in the ad. If the ad doesn't have a clear tone, return unknown.",
                },
                {
                    "role": "user",
                    "content": f"Advertiser name: {record.advertiser_name}\nTranscript: {record.content}",
                },
            ],
            response_format=MediaDescription,
        )

        video_description: MediaDescription = response.choices[0].message.parsed
        summary_embeddings: list[float] = (
            openai.embeddings.create(
                input=video_description.summary, model="text-embedding-3-small"
            )
            .data[0]
            .embedding
        )
        advertiser_name_embedding = (
            openai.embeddings.create(
                input=record.advertiser_name, model="text-embedding-3-small"
            )
            .data[0]
            .embedding
        )
        return EmbeddedGoogleAd(
            versioned_ad_id=record.id,
            summary_embeddings=summary_embeddings,
            **dict(video_description),
            advertiser_name_embedding=advertiser_name_embedding,
        )
    except Exception as e:
        print(f"Error with ad ({record.advertisement_url}):", type(e))


# def get_text_from_image_url(image_url: str) -> str:
#     try:
#         # Download the image from the URL
#         response = requests.get(image_url)
#         response.raise_for_status()  # Check if the request was successful

#         # Open the image using PIL
#         image = Image.open(BytesIO(response.content))

#         # Use pytesseract to extract text
#         extracted_text = pytesseract.image_to_string(image)

#         return extracted_text
#     except requests.exceptions.RequestException as e:
#         return f"Failed to download image: {e}"
#     except Exception as e:
#         return f"An error occurred: {e}"


def get_text_from_image_url(image_url: str) -> str:
    # Download the image from the URL
    response = requests.get(image_url)
    response.raise_for_status()  # Check if the request was successful

    # Open the image using PIL
    image = Image.open(BytesIO(response.content))

    # Convert the image to RGB (easyocr expects a color image)
    image = image.convert("RGB")

    # Save the image to a byte stream
    byte_array = BytesIO()
    image.save(byte_array, format="JPEG")

    # Initialize easyocr reader
    reader = easyocr.Reader(["en"])  # Specify the languages

    # Use easyocr to extract text
    extracted_text = reader.readtext(byte_array.getvalue(), detail=0)

    # Join the list of extracted text into a single string
    return " ".join(extracted_text)


def process_image(record: VersionedGoogleAd) -> EmbeddedGoogleAd:
    try:
        text_content: str = get_text_from_image_url(record.content)
        response: ParsedChatCompletion = openai.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are given text from a political image. Write a summary of at most three sentences describing the image ad. Denote political issues that the image ad mentions. If the ad doesn't mention any political issues (e.g. only a call to vote), return an empty list or return unknown. Denote the political leaning of the ad. If the ad doesn't lean any particular direction, return unknown. Denote one or more tones present in the ad. If the ad doesn't have a clear tone, return unknown.",
                },
                {
                    "role": "user",
                    "content": f"Advertiser name: {record.advertiser_name}\nTranscript: {text_content}",
                },
            ],
            response_format=MediaDescription,
        )

        video_description: MediaDescription = response.choices[0].message.parsed
        summary_embeddings: list[float] = (
            openai.embeddings.create(
                input=video_description.summary, model="text-embedding-3-small"
            )
            .data[0]
            .embedding
        )
        advertiser_name_embedding = (
            openai.embeddings.create(
                input=record.advertiser_name, model="text-embedding-3-small"
            )
            .data[0]
            .embedding
        )
        return EmbeddedGoogleAd(
            versioned_ad_id=record.id,
            summary_embeddings=summary_embeddings,
            **dict(video_description),
            advertiser_name_embedding=advertiser_name_embedding,
        )
    except Exception as e:
        print(f"Error with ad ({record.advertisement_url}):", type(e), e)


# Get transcripts for record and create embeddings
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def process_record(record: VersionedGoogleAd) -> EmbeddedGoogleAd:
    if record.format == "Video":
        # return process_video(record)
        return None
    elif record.format == "Text":
        return process_text(record)
    elif record.format == "Image":
        return process_image(record)


if __name__ == "__main__":
    for record_format in ["Video", "Image", "Text"]:
        records = get_records(record_format)

        with tqdm(total=len(records), desc=f"Processing {record_format}") as pbar:

            def update_progress(row: EmbeddedGoogleAd | None):
                if row is not None:
                    supabase_client = get_supabase_client()
                    (
                        supabase_client.table("int_ads__google_ads_embeddings")
                        .upsert(row.model_dump(mode="json"))
                        .execute()
                    )
                else:
                    # print("Row was none")
                    pass
                pbar.update(1)

            with mp.Pool(mp.cpu_count()) as p:
                for record in records:
                    p.apply_async(
                        process_record, args=(record,), callback=update_progress
                    )

                p.close()
                p.join()

    print("All content processed successfully")
