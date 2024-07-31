from dataclasses import dataclass
from datetime import datetime, timezone
import os
import supabase
from dotenv import load_dotenv
from uuid import uuid4
import openai
from multiprocessing import Pool, Queue, cpu_count
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


def process_video(video_metadata):
    # print(f"Processing video {video_metadata['video_id']}")
    supabase_client = get_supabase_client()
    rows = []
    for soundbyte in video_metadata["transcript"]:
        embedding = (
            openai.embeddings.create(
                input=soundbyte["text"], model="text-embedding-3-small"
            )
            .data[0]
            .embedding
        )
        rows.append(
            {
                "video_uuid": video_metadata["id"],
                "video_id": video_metadata["video_id"],
                "timestamp": datetime.fromtimestamp(
                    soundbyte["offset"], tz=timezone.utc
                ).isoformat(),
                "duration": datetime.fromtimestamp(
                    soundbyte["duration"], tz=timezone.utc
                ).isoformat(),
                "text": soundbyte["text"],
                "embedding": embedding,
            }
        )
    # supabase_client.table("video_embeddings").insert(rows).execute()
    return rows


# Queue for insertion operations
insert_queue = Queue()


def db_insert_worker():
    """Worker function for processing database inserts from a queue."""
    supabase_client = get_supabase_client()
    while True:
        item = insert_queue.get()
        if item is None:  # None is the signal to stop.
            break
        for chunk in range(0, len(item), 100):
            supabase_client.table("video_embeddings").insert(
                item[chunk : chunk + 100]
            ).execute()
        insert_queue.task_done()


if __name__ == "__main__":
    supabase_client = get_supabase_client()

    # Clear table
    print("Clearing video_embeddings table")
    dummy = uuid4()
    supabase_client.table("video_embeddings").delete().neq("id", dummy).execute()

    # Get latest unique YouTube videos
    print("Fetching latest unique YouTube videos")
    youtube_table = (
        supabase_client.rpc("get_latest_unique_youtube_videos").execute().data
    )

    # Create a progress bar
    print("Processing videos")
    with tqdm(total=len(youtube_table), desc="Processing videos") as pbar:

        def update_progress(rows):
            # global insert_queue
            for chunk in range(0, len(rows), 100):
                supabase_client.table("video_embeddings").insert(
                    rows[chunk : chunk + 100]
                ).execute()
                # insert_queue.put(rows[chunk : chunk + 100])
            # if rows:
            #     supabase_client.table("video_embeddings").insert(rows).execute()
            pbar.update(1)

        with Pool(cpu_count()) as p:
            for video in youtube_table:
                p.apply_async(process_video, args=(video,), callback=update_progress)

            p.close()
            p.join()

    print("All videos processed successfully!")
