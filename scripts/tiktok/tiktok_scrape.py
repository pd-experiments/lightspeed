# USE THESE if opts bug reoccurs:
# pip install playwright==1.37.0
# playwright install

from TikTokApi import TikTokApi
import asyncio
import os
import json
from dotenv import load_dotenv
from datetime import datetime, timedelta
from supabase import create_client, Client
import logging
from tqdm import tqdm
import time
from tenacity import retry, stop_after_attempt, wait_exponential
import sys
import aiohttp
from openai import OpenAI
from multiprocessing import Pool, Queue, cpu_count
import queue
from itertools import islice

video_queue = Queue()

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from political_words import political_keywords, political_search_terms, political_hashtags

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env.local'))

ms_token = os.getenv("MS_TOKEN")
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

if not all([supabase_url, supabase_key, client.api_key]):
    logging.error("Missing required environment variables. Please check your .env file.")
    raise EnvironmentError("Missing required environment variables.")

supabase: Client = create_client(supabase_url, supabase_key)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

async def filter_content_with_gpt(content, content_type):
    prompt = f"""
    Analyze the following TikTok {content_type}:
    "{content}"
    
    Determine if it meets these criteria:
    1. The content is strictly in English and relevant to the United States of America (USA). 
    1. Discusses US political topics or expresses sentiment about US political issues
    2. Is not spam or from a bot account
    3. Is relevant to civilian sentiment on political topics
    
    Respond with only 'YES' if it meets all criteria, or 'NO' if it doesn't.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a content filter for political TikTok data."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1,
            temperature=0.1
        )
        return response.choices[0].message.content.strip().upper() == "YES"
    except Exception as e:
        logging.error(f"Error in GPT filtering: {str(e)}")
        return False

async def get_trending_videos(api, count=50):
    trending_videos = []
    async for video in api.trending.videos(count=count):
        video_dict = video.as_dict
        video_dict["comments"] = await get_video_comments(api, video_dict["id"])
        stored_video = await store_video_in_supabase(video_dict, is_trending=True)
        if stored_video:
            trending_videos.append(stored_video)
            video_queue.put((video_dict["id"], video_dict["comments"]))
    return trending_videos

async def get_hashtag_videos(api, hashtag_name, count=50):
    videos = []
    tag = api.hashtag(name=hashtag_name)
    async for video in tag.videos(count=count):
        videos.append(video.as_dict)
    return videos

async def get_video_comments(api, video_id, count=20):
    comments = []
    video = api.video(id=video_id)
    try:
        async for comment in video.comments(count=count):
            comments.append(comment.as_dict)
    except Exception as e:
        logging.warning(f"Unable to fetch comments for video {video_id}: {str(e)}")
    return comments

async def process_hashtag(api, hashtag):
    print(f"Processing hashtag: {hashtag}")
    videos = await get_hashtag_videos(api, hashtag)
    results = []
    for video in videos:
        video["hashtag"] = hashtag
        video["comments"] = await get_video_comments(api, video["id"])
        stored_video = await store_video_in_supabase(video)
        if stored_video:
            results.append(stored_video)
            video_queue.put((video["id"], video["comments"]))
    print(f"Finished processing hashtag: {hashtag}")
    return results

async def process_user(api, keyword):
    print(f"Processing user/keyword: {keyword}")
    user_info = {
        "user": None,
        "videos": [],
        "trending_video": None,
        "recent_videos": []
    }
    async for user in api.search.users(keyword, count=1):
        try:
            user_data = await user.info()
            user_info["user"] = user_data
            async for video in user.videos(count=20):
                video_data = video.as_dict
                video_data["comments"] = await get_video_comments(api, video.id)
                stored_video = await store_video_in_supabase(video_data)
                if stored_video:
                    user_info["videos"].append(stored_video)
                    video_queue.put((video_data["id"], video_data["comments"]))

            if user_info["videos"]:
                user_info["trending_video"] = max(user_info["videos"], key=lambda x: x["views"])

            seven_days_ago = datetime.now() - timedelta(days=7)
            user_info["recent_videos"] = [
                video for video in user_info["videos"]
                if datetime.fromisoformat(video["created_at"]) > seven_days_ago
            ]
            print(f"Finished processing user/keyword: {keyword}")
            return user_info
        except Exception as e:
            logging.error(f"Error processing user for keyword '{keyword}': {str(e)}")
    return None

async def search_users_and_content():
    async with TikTokApi() as api:
        await api.create_sessions(ms_tokens=[ms_token], num_sessions=1, sleep_after=3)
        results = {
            "trending_videos": [],
            "political_content": [],
            "user_data": []
        }

        print("Getting trending videos...")
        results["trending_videos"] = await get_trending_videos(api)
        print(f"Found {len(results['trending_videos'])} trending videos")

        print("Processing hashtags and keywords...")
        # political_hashtags = [
        #     "politics", "election2024", "government", "president", "democracy",
        #     "congress", "senate", "house", "supremecourt", "policy",
        #     "vote", "campaign", "law", "legislation", "party",
        #     "liberal", "conservative", "progressive", "reform", "activism",
        #     "climatechange", "healthcare", "education", "immigration", "economy"
        # ]

        # political_keywords = ["politics", "election", "government", "president", "democracy"]


        # political_hashtags = [
        #     "uspolitics", "election2024", "usgovernment", "congress", "scotus",
        #     "votingrights", "guncontrol", "immigration", "healthcare", "climateaction",
        #     "blacklivesmatter", "lgbtqrights", "misinformation", "politicaltiktok", "genzpolitics"
        # ]

        # political_keywords = ["harris", "vance", "trump", "democrat", "republican", "polarization"]

        political_hashtags = [
            "politics", "political", "usa", "freedom", "trump", 
            "politicalmemes", "conservative", "republican", "diversity", 
            "america", "news", "vote", "blm", "maga", "election",
            "biden", "democrat", "government", "policy", "activism"
        ]

        political_keywords = [
            "politics", "election", "democracy", "president", "congress",
            "senate", "house", "supremecourt", "campaign", "debate",
            "policy", "legislation", "voting", "rights", "party",
            "liberal", "conservative", "progressive", "reform", "protest"
        ]

        hashtag_tasks = [process_hashtag(api, hashtag) for hashtag in political_hashtags]
        user_tasks = [process_user(api, keyword) for keyword in political_keywords]

        # Process hashtags with error handling
        hashtag_results = []
        for task in asyncio.as_completed(hashtag_tasks):
            try:
                result = await task
                hashtag_results.append(result)
            except Exception as e:
                logging.error(f"Error processing hashtag: {str(e)}")

        # Process user tasks
        user_results = await asyncio.gather(*user_tasks, return_exceptions=True)

        for hashtag_result in hashtag_results:
            if hashtag_result:
                results["political_content"].extend(hashtag_result)

        for user_result in user_results:
            if isinstance(user_result, Exception):
                logging.error(f"Error processing user: {str(user_result)}")
            elif user_result:
                results["user_data"].append(user_result)
                results["political_content"].extend(user_result["videos"])

        print("Saving results to file...")
        script_dir = os.path.dirname(os.path.abspath(__file__))
        output_file = os.path.join(script_dir, 'tiktok_political_data.json')
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        logging.info(f"Results have been written to {output_file}")

        print("Done.")

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def supabase_upsert(table_name, data, on_conflict):
    try:
        supabase.table(table_name).upsert(data, on_conflict=on_conflict).execute()
    except Exception as e:
        logging.error(f"Error upserting data to {table_name}: {str(e)}")
        raise

async def store_video_in_supabase(video, is_trending=False):
    # Filter video content
    video_text = f"{video['desc']} {' '.join(video.get('hashtags', []))}"
    if not await filter_content_with_gpt(video_text, "video"):
        return None

    video_data = {
        "video_id": video["id"],
        "author": video["author"]["uniqueId"],
        "text": video["desc"],
        "created_at": datetime.fromtimestamp(video["createTime"]).isoformat(),
        "likes": video["stats"]["diggCount"],
        "comments_count": video["stats"]["commentCount"],
        "shares": video["stats"]["shareCount"],
        "views": video["stats"]["playCount"],
        "hashtag": video.get("hashtag"),
        "is_trending": is_trending
    }
    supabase_upsert("tiktok_videos", [video_data], on_conflict="video_id")
    return video_data

def store_comments_in_supabase(video_id, comments):
    filtered_comments = []
    for comment in comments:
        comment_data = {
            "comment_id": comment["cid"],
            "video_id": video_id,
            "author": comment["user"]["unique_id"],
            "text": comment["text"],
            "created_at": datetime.fromtimestamp(comment["create_time"]).isoformat(),
            "likes": comment["digg_count"]
        }
        supabase_upsert("tiktok_comments", [comment_data], on_conflict="comment_id")
        filtered_comments.append(comment_data)
    return filtered_comments

def process_comments_worker():
    while True:
        try:
            video_id, comments = video_queue.get(timeout=5)  # Wait for 5 seconds for new items
            store_comments_in_supabase(video_id, comments)
            video_queue.task_done()
        except queue.Empty:
            break  # Exit the loop if no more items are in the queue

if __name__ == "__main__":
    start_time = time.time()
    
    # Start the comment processing workers
    num_workers = cpu_count()
    with Pool(num_workers) as pool:
        workers = [pool.apply_async(process_comments_worker) for _ in range(num_workers)]
        
        # Run the main scraping process
        asyncio.run(search_users_and_content())
        
        # Wait for all comment processing to finish
        video_queue.join()
        
        # Terminate the workers
        for _ in range(num_workers):
            video_queue.put(None)
        for worker in workers:
            worker.get()
    
    end_time = time.time()
    print(f"Total execution time: {end_time - start_time:.2f} seconds")
