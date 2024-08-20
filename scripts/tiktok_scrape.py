from TikTokApi import TikTokApi
import asyncio
import os
import json
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv(".env.local")

# USE THESE if opts bug reoccurs:
# pip install playwright==1.37.0
# playwright install

ms_token = os.getenv("MS_TOKEN")

async def get_trending_videos(api, count=10):
    trending_videos = []
    async for video in api.trending.videos(count=count):
        trending_videos.append(video.as_dict)
    return trending_videos

async def get_hashtag_videos(api, hashtag_name, count=30):
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
        print(f"Unable to fetch comments for video {video_id}")
    except Exception as e:
        print(f"Error fetching comments for video {video_id}: {str(e)}")
    return comments

async def search_users_and_content():
    async with TikTokApi() as api:
        await api.create_sessions(ms_tokens=[ms_token], num_sessions=1, sleep_after=3)
        results = {
            "trending_videos": [],
            "political_content": [],
            "user_data": []
        }

        # Get trending videos
        results["trending_videos"] = await get_trending_videos(api)

        # Search for political content through users
        political_keywords = ["politics", "election", "government", "president", "democracy"]
        for keyword in political_keywords:
            async for user in api.search.users(keyword, count=5):
                try:
                    user_data = await user.info()
                    user_info = {
                        "user": user_data,
                        "videos": [],
                        "trending_video": None,
                        "recent_videos": []
                    }

                    # Get user's videos
                    async for video in user.videos(count=10):
                        video_data = video.as_dict
                        video_data["comments"] = await get_video_comments(api, video.id)
                        user_info["videos"].append(video_data)
                        results["political_content"].append(video_data)

                    # Process user data similar to the original code
                    if user_info["videos"]:
                        user_info["trending_video"] = max(user_info["videos"], key=lambda x: x["stats"]["playCount"])

                    seven_days_ago = datetime.now() - timedelta(days=7)
                    user_info["recent_videos"] = [
                        video for video in user_info["videos"]
                        if datetime.fromtimestamp(video["createTime"]) > seven_days_ago
                    ]

                    results["user_data"].append(user_info)
                except Exception as e:
                    print(f"Error processing user for keyword '{keyword}': {str(e)}")

        target_users = ["kamalahq", "joebiden", "whitehouse"]
        for username in target_users:
            try:
                async for user in api.search.users(username, count=1):
                    user_data = await user.info()
                    user_info = {
                        "user": user_data,
                        "videos": [],
                        "trending_video": None,
                        "recent_videos": []
                    }

                    async for video in user.videos(count=50):
                        user_info["videos"].append(video.as_dict)

                    if user_info["videos"]:
                        user_info["trending_video"] = max(user_info["videos"], key=lambda x: x["stats"]["playCount"])

                    seven_days_ago = datetime.now() - timedelta(days=7)
                    user_info["recent_videos"] = [
                        video for video in user_info["videos"]
                        if datetime.fromtimestamp(video["createTime"]) > seven_days_ago
                    ]

                    if user_info["trending_video"]:
                        user_info["trending_video"]["comments"] = await get_video_comments(api, user_info["trending_video"]["id"])

                    results["user_data"].append(user_info)
            except Exception as e:
                print(f"Error processing user '{username}': {str(e)}")

        # Save results to a file
        script_dir = os.path.dirname(os.path.abspath(__file__))
        output_file = os.path.join(script_dir, 'tiktok_political_data.json')
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"Results have been written to {output_file}")

if __name__ == "__main__":
    asyncio.run(search_users_and_content())