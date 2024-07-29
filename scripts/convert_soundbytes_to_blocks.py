from datetime import datetime
import os
import supabase
from dotenv import load_dotenv
from uuid import uuid4
import openai
from multiprocessing import Pool, cpu_count

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

min_block_len = 10  # seconds
max_block_len = 60  # seconds


def process_video(video_metadata):
    global min_block_len, max_block_len
    supabase_client = get_supabase_client()

    video_id = video_metadata["video_id"]
    video_uuid = video_metadata["id"]
    embeddings = (
        supabase_client.table("video_embeddings")
        .select("*")
        .eq("video_id", video_id)
        .order("timestamp")
        .execute()
        .data
    )
    if len(embeddings) == 0:
        return
    print(f"Processing {video_id} with {len(embeddings)} embeddings")

    block_start_time = datetime.fromisoformat(embeddings[0]["timestamp"])
    is_block_finished = False
    temp_block_raw_soundbyte_ids = []
    temp_block_text = []
    final_blocks = []

    for idx, embedding in enumerate(embeddings):
        # We've reached the end; add to block and save
        if idx == len(embeddings) - 1:
            temp_block_raw_soundbyte_ids.append(embedding["id"])
            temp_block_text.append(embedding["text"])
            is_block_finished = True

        # Get timestamp
        timestamp = datetime.fromisoformat(embedding["timestamp"])

        # Block length too short; continue adding embeddings
        if (timestamp - block_start_time).seconds < min_block_len:
            temp_block_raw_soundbyte_ids.append(embedding["id"])
            temp_block_text.append(embedding["text"])
            continue

        # Block length too long or we've reached the end; add to block, save, and start new block
        elif (timestamp - block_start_time).seconds > max_block_len:
            temp_block_raw_soundbyte_ids.append(embedding["id"])
            temp_block_text.append(embedding["text"])
            is_block_finished = True

        # Block length within range; check if ends in punctuation
        else:
            temp_block_raw_soundbyte_ids.append(embedding["id"])
            temp_block_text.append(embedding["text"])
            if embedding["text"][-1] in [".", "!", "?"]:
                is_block_finished = True

        if is_block_finished:
            final_blocks.append(
                {
                    "video_uuid": video_uuid,
                    "timestamp": block_start_time.isoformat(),
                    "soundbytes": temp_block_raw_soundbyte_ids,
                    "text": " ".join(temp_block_text),
                    "embedding": openai.embeddings.create(
                        input=temp_block_text, model="text-embedding-3-small"
                    )
                    .data[0]
                    .embedding,
                }
            )
            if idx + 1 < len(embeddings):
                block_start_time = datetime.fromisoformat(
                    embeddings[idx + 1]["timestamp"]
                )
                temp_block_raw_soundbyte_ids = []
                temp_block_text = []
                is_block_finished = False

    supabase_client.table("grouped_video_embeddings").insert(final_blocks).execute()
    print("Finished processing", video_id)


if __name__ == "__main__":

    # Clear all existing embeddings
    print("Deleting table")
    supabase_client = get_supabase_client()
    supabase_client.table("grouped_video_embeddings").delete().neq(
        "id", uuid4()
    ).execute()

    # Get all video ids
    videos = supabase_client.table("youtube").select("id, video_id").execute().data

    with Pool() as pool:
        pool.map(process_video, videos)
