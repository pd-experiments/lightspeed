import os
from dotenv import load_dotenv
from supabase import create_client, Client
import openai
from multiprocessing import Pool, cpu_count
from tqdm import tqdm

print("Starting TikTok embeddings generation script...")

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env.local'))
print("Environment variables loaded.")

supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)
print("Connected to Supabase.")

openai.api_key = os.getenv("OPENAI_API_KEY")
print("OpenAI API key set.")

def get_tiktok_data():
    print("Fetching TikTok data from Supabase...")
    videos = []
    comments = []
    page_size = 1000
    
    # Fetch videos
    video_count = 0
    while True:
        video_batch = supabase.table("tiktok_videos").select("*").is_("embedding", "null").range(video_count, video_count + page_size - 1).execute().data
        videos.extend(video_batch)
        video_count += len(video_batch)
        if len(video_batch) < page_size:
            break
    
    # Fetch comments
    comment_count = 0
    while True:
        comment_batch = supabase.table("tiktok_comments").select("*").is_("embedding", "null").range(comment_count, comment_count + page_size - 1).execute().data
        comments.extend(comment_batch)
        comment_count += len(comment_batch)
        if len(comment_batch) < page_size:
            break
    
    print(f"Fetched {len(videos)} videos and {len(comments)} comments without embeddings.")
    return videos, comments

def generate_embedding(text):
    print(f"Generating embedding for text: {text[:50]}...")
    return openai.embeddings.create(input=text, model="text-embedding-3-small").data[0].embedding

def process_item(item):
    author = item.get("author", "")
    text = item.get("text", "")
    if not text or not author:
        print(f"Skipping item due to missing author or text: {item.get('id', 'Unknown ID')}")
        return None
    
    combined_text = f"{author}\n\n{text}"
    embedding = generate_embedding(combined_text)
    print(f"Processed item: {item.get('id', 'Unknown ID')}")
    return {**item, "embedding": embedding}

def update_supabase(table_name, data):
    print(f"Updating Supabase table '{table_name}' with {len(data)} items...")
    chunk_size = 200
    for i in range(0, len(data), chunk_size):
        chunk = data[i:i+chunk_size]
        supabase.table(table_name).upsert(chunk, on_conflict=['id']).execute()
    print(f"Update complete for table '{table_name}'.")

def process_batch(items, table_name):
    print(f"Processing batch of {len(items)} items for table '{table_name}'...")
    processed_items = []
    for item in items:
        processed_item = process_item(item)
        if processed_item:
            processed_items.append(processed_item)
    
    if processed_items:
        update_supabase(table_name, processed_items)
    
    print(f"Batch processing complete. Processed {len(processed_items)} items.")
    return len(processed_items)

def process_batch_wrapper(args):
    return process_batch(*args)

def main():
    print("Starting main processing...")
    videos, comments = get_tiktok_data()
    
    with tqdm(total=len(videos) + len(comments), desc="Generating embeddings") as pbar:
        with Pool(cpu_count()) as pool:
            print(f"Created process pool with {cpu_count()} workers.")
            batch_size = 50
            
            print("Processing videos...")
            video_batches = [videos[i:i+batch_size] for i in range(0, len(videos), batch_size)]
            video_args = [(batch, "tiktok_videos") for batch in video_batches]
            for _ in pool.imap_unordered(process_batch_wrapper, video_args):
                pbar.update(_)
            
            print("Processing comments...")
            comment_batches = [comments[i:i+batch_size] for i in range(0, len(comments), batch_size)]
            comment_args = [(batch, "tiktok_comments") for batch in comment_batches]
            for _ in pool.imap_unordered(process_batch_wrapper, comment_args):
                pbar.update(_)

    print("Main processing complete.")

if __name__ == "__main__":
    main()
    print("Embedding generation complete!")