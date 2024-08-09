from datetime import datetime, timezone
import os
import sys
import traceback
from typing import Any
import supabase
from dotenv import load_dotenv
from uuid import uuid4
import openai
from multiprocessing import Pool, cpu_count

from tqdm import tqdm

# Load environment variables
load_dotenv(".env.local")

# Connect to Supabase


def get_supabase_client():
    return supabase.create_client(
        os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
        os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    )


# Connect to OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")


def process_video(video_uuid, soundbytes):
    min_block_len = 10  # seconds
    max_block_len = 60  # seconds

    if not soundbytes:
        return []

    final_blocks = []
    current_block = {
        "video_uuid": video_uuid,
        "start_time": datetime.fromisoformat(soundbytes[0]["timestamp"]),
        "soundbyte_ids": [],
        "text_parts": [],
        "duration": 0,
    }

    # print(
    #     "Processing video",
    #     video_uuid,
    #     len(soundbytes),
    #     type(soundbytes),
    #     soundbytes[0].keys(),
    # )

    try:
        for idx, soundbyte in enumerate(soundbytes):
            timestamp = datetime.fromisoformat(soundbyte["timestamp"])
            duration = datetime.fromisoformat(soundbyte["duration"]).timestamp()

            current_block["soundbyte_ids"].append(soundbyte["id"])
            current_block["text_parts"].append(soundbyte["text"])
            current_block["duration"] += duration

            block_length = (timestamp - current_block["start_time"]).total_seconds()
            (datetime.now() - datetime.now())

            if (
                block_length >= max_block_len
                or (
                    block_length >= min_block_len
                    and soundbyte["text"]
                    and soundbyte["text"][-1] in ".!?"
                )
                or idx == len(soundbytes) - 1
            ):
                text = " ".join(current_block["text_parts"])
                final_blocks.append(
                    {
                        "video_uuid": video_uuid,
                        "timestamp": current_block["start_time"].isoformat(),
                        "duration": datetime.fromtimestamp(
                            current_block["duration"], tz=timezone.utc
                        ).isoformat(),
                        "soundbytes": current_block["soundbyte_ids"],
                        "text": text,
                        "embedding": openai.embeddings.create(
                            input=text, model="text-embedding-3-small"
                        )
                        .data[0]
                        .embedding,
                    }
                )

                if idx != len(soundbytes) - 1:
                    current_block = {
                        "video_uuid": video_uuid,
                        "start_time": timestamp,
                        "soundbyte_ids": [],
                        "text_parts": [],
                        "duration": 0,
                    }
    except Exception as e:
        print("Error processing video", video_uuid, e)
        traceback.print_exc()
        return []

    return final_blocks


if __name__ == "__main__":
    supabase_client = get_supabase_client()

    # Clear table
    print("Clearing grouped_video_embeddings table")
    dummy = uuid4()
    supabase_client.table("grouped_video_embeddings").delete().neq(
        "video_uuid", dummy
    ).execute()

    # Get all video embeddings, aggregated by video_uuid
    soundbytes: 'list[dict[str, Any]]' = (
        supabase_client.rpc("get_grouped_video_embeddings").execute().data
    )

    with tqdm(total=len(soundbytes), desc="Processing videos") as pbar:

        def push_to_supabase(blocks):
            supabase_client = get_supabase_client()
            chunk_size = 200
            for offset in range(0, len(blocks), chunk_size):
                supabase_client.table("grouped_video_embeddings").insert(
                    blocks[offset : offset + chunk_size]
                ).execute()

            pbar.update(1)

        with Pool() as pool:
            for row in soundbytes:
                pool.apply_async(
                    process_video,
                    args=(row["video_uuid"], row["soundbytes"]),
                    callback=push_to_supabase,
                )

            pool.close()
            pool.join()

    print("Done")
