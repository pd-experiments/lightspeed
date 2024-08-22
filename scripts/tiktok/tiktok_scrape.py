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

# USE THESE if opts bug reoccurs:
# pip install playwright==1.37.0
# playwright install

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env.local'))

ms_token = os.getenv("MS_TOKEN")
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    logging.error("Supabase URL or key is not set. Please set the environment variables.")
    raise EnvironmentError("Supabase URL or key is not set.")

supabase: Client = create_client(supabase_url, supabase_key)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

async def get_trending_videos(api, count=50):
    trending_videos = []
    async for video in api.trending.videos(count=count):
        video_dict = video.as_dict
        video_dict["comments"] = await get_video_comments(api, video_dict["id"])
        stored_video = store_data_in_supabase(video_dict, is_trending=True)
        trending_videos.append(stored_video)
    return trending_videos

async def get_hashtag_videos(api, hashtag_name, count=50):
    videos = []
    tag = api.hashtag(name=hashtag_name)
    async for video in tag.videos(count=count):
        videos.append(video.as_dict)
    return videos

async def get_video_comments(api, video_id, count=100):
    comments = []
    video = api.video(id=video_id)
    try:
        async for comment in video.comments(count=count):
            comments.append(comment.as_dict)
    except AttributeError:
        logging.warning(f"Unable to fetch comments for video {video_id}")
    except Exception as e:
        logging.error(f"Error fetching comments for video {video_id}: {str(e)}")
    return comments

async def process_hashtag(api, hashtag):
    print(f"Processing hashtag: {hashtag}")
    videos = await get_hashtag_videos(api, hashtag)
    results = []
    for video in videos:
        video["hashtag"] = hashtag
        video["comments"] = await get_video_comments(api, video["id"])
        stored_video = store_data_in_supabase(video)
        results.append(stored_video)
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
                stored_video = store_data_in_supabase(video_data)
                user_info["videos"].append(stored_video)

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

        political_hashtags = [
            "politics", "election2024", "government", "president", "democracy",
            "congress", "senate", "house", "supremecourt", "policy",
            "vote", "campaign", "law", "legislation", "party",
            "liberal", "conservative", "progressive", "reform", "activism",
            "climatechange", "healthcare", "education", "immigration", "economy"
        ]

        political_keywords = ["politics", "election", "government", "president", "democracy"]
        target_users = ["kamalahq", "joebiden", "whitehouse", "speakermccarthy", "senatemajldr"]
        all_users = political_keywords + target_users

        print("Processing hashtags and users...")
        hashtag_tasks = [process_hashtag(api, hashtag) for hashtag in political_hashtags]
        user_tasks = [process_user(api, keyword) for keyword in all_users]

        hashtag_results = await asyncio.gather(*hashtag_tasks)
        user_results = await asyncio.gather(*user_tasks)

        for hashtag_result in hashtag_results:
            results["political_content"].extend(hashtag_result)

        for user_result in user_results:
            if user_result:
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

def store_data_in_supabase(video, is_trending=False):
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

    for comment in video.get("comments", []):
        comment_data = {
            "comment_id": comment["cid"],
            "video_id": video["id"],
            "author": comment["user"]["unique_id"],
            "text": comment["text"],
            "created_at": datetime.fromtimestamp(comment["create_time"]).isoformat(),
            "likes": comment["digg_count"]
        }
        supabase_upsert("tiktok_comments", [comment_data], on_conflict="comment_id")

    return video_data

if __name__ == "__main__":
    start_time = time.time()
    asyncio.run(search_users_and_content())
    end_time = time.time()
    print(f"Total execution time: {end_time - start_time:.2f} seconds")