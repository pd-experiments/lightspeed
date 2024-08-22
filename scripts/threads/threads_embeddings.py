import os
from dotenv import load_dotenv
from supabase import create_client, Client
import openai
from multiprocessing import Pool, cpu_count
from tqdm import tqdm

print("Starting Threads embeddings generation script...")

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env.local'))
print("Environment variables loaded.")

supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)
print("Connected to Supabase.")

openai.api_key = os.getenv("OPENAI_API_KEY")
print("OpenAI API key set.")

def get_threads_data():
    print("Fetching Threads data from Supabase...")
    threads = []
    page_size = 1000
    
    thread_count = 0
    while True:
        thread_batch = supabase.table("threads").select("*").range(thread_count, thread_count + page_size - 1).execute().data
        threads.extend(thread_batch)
        thread_count += len(thread_batch)
        if len(thread_batch) < page_size:
            break
    
    print(f"Fetched {len(threads)} threads.")
    return threads

def generate_embedding(text):
    print(f"Generating embedding for text: {text[:50]}...")
    return openai.embeddings.create(input=text, model="text-embedding-3-small").data[0].embedding

def process_item(item):
    username = item.get("username", "")
    text = item.get("text", "")
    if not text or not username:
        print(f"Skipping item due to missing username or text: {item.get('thread_id', 'Unknown ID')}")
        return None
    
    combined_text = f"{username}\n\n{text}"
    embedding = generate_embedding(combined_text)
    print(f"Processed item: {item.get('thread_id', 'Unknown ID')}")
    return {**item, "embedding": embedding}

def update_supabase(data):
    print(f"Updating Supabase table 'threads' with {len(data)} items...")
    chunk_size = 200
    for i in range(0, len(data), chunk_size):
        chunk = data[i:i+chunk_size]
        supabase.table("threads").upsert(chunk, on_conflict=['thread_id']).execute()
    print("Update complete for table 'threads'.")

def process_batch(items):
    print(f"Processing batch of {len(items)} items...")
    processed_items = []
    for item in items:
        processed_item = process_item(item)
        if processed_item:
            processed_items.append(processed_item)
    
    if processed_items:
        update_supabase(processed_items)
    
    print(f"Batch processing complete. Processed {len(processed_items)} items.")
    return len(processed_items)

def process_batch_wrapper(batch):
    return process_batch(batch)

def main():
    print("Starting main processing...")
    threads = get_threads_data()
    
    with tqdm(total=len(threads), desc="Generating embeddings") as pbar:
        with Pool(cpu_count()) as pool:
            print(f"Created process pool with {cpu_count()} workers.")
            batch_size = 50
            
            print("Processing threads...")
            thread_batches = [threads[i:i+batch_size] for i in range(0, len(threads), batch_size)]
            for _ in pool.imap_unordered(process_batch_wrapper, thread_batches):
                pbar.update(_)

    print("Main processing complete.")

if __name__ == "__main__":
    main()
    print("Embedding generation complete!")