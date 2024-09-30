import json
from typing import Callable, Optional
from scripts.helpers.helpers import create_driver, get_supabase_client
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from TikTokApi import TikTokApi
import asyncio
import os
from dotenv import load_dotenv
import time
import openai
from tqdm import tqdm

from scripts.new_tiktok.models import (
    TikTokAuthor,
    TikTokComment,
    TikTokTrend,
    TikTokVideo,
    Validate,
)

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env.local"))

ms_token = os.getenv("MS_TOKEN")


def filter_to_politics(video: TikTokVideo) -> bool:
    response = openai.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "Determine if the video is related to politics, policy, or anything that could be partisan in any way.",
            },
            {
                "role": "user",
                "content": f"Account: {video.author.unique_id}\nVideo Caption: {video.caption}\nVideo Hashtags: {video.hashtags}",
            },
        ],
        response_format=Validate,
    )
    return response.choices[0].message.parsed.satisfies_contraints


# Make sure to run this script inside /scripts (i.e. python3 new_tiktok/scrape_tiktok.py)
def get_ms_token():
    driver = create_driver()
    driver.get("https://www.tiktok.com")
    print("Getting ms token")

    def wait_for_ms_token(driver: WebDriver):
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            cookies = driver.get_cookies()
            ms_token_cookie = next(
                (cookie for cookie in cookies if cookie["name"] == "msToken"), None
            )
            if ms_token_cookie:
                return ms_token_cookie["value"]
            else:
                raise ValueError("msToken cookie not found")
        except:
            return False

    WebDriverWait(driver, 10).until(lambda driver: bool(wait_for_ms_token(driver)))
    print("msToken cookie found")
    return wait_for_ms_token(driver)


# Get trending videos
async def get_trending_videos(
    api: TikTokApi,
    video_count: int = 30,
    validate_func: Callable[[TikTokVideo], bool] = lambda x: True,
):
    # print("Getting trending videos")
    data: list[TikTokVideo] = []
    print("Attempting to loop through trending videos")
    async for video in api.trending.videos(count=video_count):
        try:
            video = TikTokVideo.from_dict(video.as_dict, is_trending=True)
            if validate_func(video):
                data.append(video)
        except Exception as e:
            print(e)
            raise e
    return data


async def get_videos_by_hashtag(
    api: TikTokApi, hashtag: str, video_count: int = 10
) -> list[TikTokVideo]:
    # print(f"Getting videos by hashtag {hashtag}")
    data: list[TikTokVideo] = []
    async for video in api.hashtag(hashtag).videos(count=video_count):
        try:
            data.append(TikTokVideo.from_dict(video.as_dict, is_trending=False))
        except Exception as e:
            print(e)
            print(json.dumps(video.as_dict, indent=2))
            raise e
    return data


async def get_video_by_url(api: TikTokApi, video_url: str, is_trending: bool = False):
    # print(f"Getting video by url {video_url}")
    video = await api.video(url=video_url).info()
    return TikTokVideo.from_dict(video, is_trending=is_trending)


async def get_comments_for_video(api: TikTokApi, video_id: str, count: int = 30):
    print(f"Getting comments for video {video_id}")
    comments: list[TikTokComment] = []
    try:
        async for comment in api.video(video_id).comments(count=count):
            comments.append(TikTokComment.from_dict(comment.as_dict))
    except Exception as e:
        print(e)
        print(json.dumps(comment.as_dict, indent=2))
        raise e
    finally:
        print(f"Returning comments for {video_id}")
        return comments


def push_video_to_db(video: Optional[TikTokVideo]):
    global push_video_counter
    push_video_counter += 1
    if video is None:
        return
    supabase_client = get_supabase_client()
    video_data = video.model_dump(mode="json")
    author = video_data.pop("author", None)
    if author:
        video_data["author_id"] = author.get("id")
    supabase_client.schema("tiktoks").table("stg_videos").upsert(video_data).execute()


def push_user_to_db(user: Optional[TikTokAuthor]):
    global push_user_counter
    push_user_counter += 1
    if user is None:
        return
    supabase_client = get_supabase_client()
    supabase_client.schema("tiktoks").table("stg_creators").upsert(
        user.model_dump(mode="json")
    ).execute()


def push_comments_to_db(comments: Optional[list[TikTokComment]]):
    global push_comments_counter
    push_comments_counter += 1
    if not comments or len(comments) == 0:
        return
    supabase_client = get_supabase_client()
    for comment in comments:
        supabase_client.schema("tiktoks").table("stg_comments").upsert(
            comment.model_dump(mode="json")
        ).execute()


push_video_counter = 0
push_comments_counter = 0
push_user_counter = 0


# Crawl outwards from a video
async def crawl_helper(
    api: TikTokApi, video_id: str, video_url: str, hashtag_crawl_count: int, depth: int
):
    print(f"Crawling video {video_url} at depth {depth}")
    if depth == 0:
        return

    # Run get_video_by_id and get_comments_for_video concurrently
    video_task = asyncio.create_task(get_video_by_url(api, video_url))
    comments_task = asyncio.create_task(get_comments_for_video(api, video_id))

    # Wait for both tasks to complete with tqdm
    for task in tqdm(
        asyncio.as_completed([video_task, comments_task]),
        total=2,
        desc="Fetching video and comments",
        leave=False,
    ):
        await task
    video, comments = video_task.result(), comments_task.result()

    if not filter_to_politics(video):
        return

    # Push creator, video, and comments to DB
    push_user_to_db(video.author)
    push_video_to_db(video)
    push_comments_to_db(comments)

    # Get hashtags for the video
    all_hashtag_videos: list[TikTokVideo] = []
    for hashtag in tqdm(video.hashtags, desc="Fetching videos by hashtag", leave=False):
        hashtag_videos = await get_videos_by_hashtag(api, hashtag, hashtag_crawl_count)
        all_hashtag_videos.extend(hashtag_videos)
        if len(all_hashtag_videos) >= hashtag_crawl_count:
            all_hashtag_videos = all_hashtag_videos[:hashtag_crawl_count]
            break

    crawl_tasks = [
        crawl_helper(
            api,
            hashtag_video.id,
            f"https://www.tiktok.com/@{hashtag_video.author.unique_id}/video/{hashtag_video.id}",
            hashtag_crawl_count,
            depth - 1,
        )
        for hashtag_video in all_hashtag_videos
    ]

    # Use tqdm to show progress of crawl tasks
    for task in tqdm(
        asyncio.as_completed(crawl_tasks),
        total=len(crawl_tasks),
        desc=f"Crawling at depth {depth}",
        leave=False,
    ):
        await task


async def crawl_videos_from_given_hashtags(
    hashtags: list[str],
    hashtag_crawl_count: int = 10,
    depth: int = 10,
):
    async with TikTokApi() as api:
        await api.create_sessions(
            ms_tokens=[ms_token],
            num_sessions=3,
            sleep_after=3,
        )
        data_async = []

        # For each hashtag, create a task to get the videos
        for hashtag in tqdm(hashtags, desc="Fetching videos by hashtag", leave=False):
            data_async.append(get_videos_by_hashtag(api, hashtag, hashtag_crawl_count))

        print(f"Fetching videos for {len(data_async)} hashtags")

        # Get the results of each task
        videos: list[TikTokVideo] = []
        for future in tqdm(
            asyncio.as_completed(data_async),
            total=len(data_async),
            desc="Fetching videos by hashtag",
            leave=False,
        ):
            result: list[TikTokVideo] = await future
            videos.extend(result)

        print(len(videos))

        async_tasks = []

        # Minor functions to get and push comments and process videos

        async def get_and_push_comments(api: TikTokApi, video_id: str):
            try:
                comments = await get_comments_for_video(api, video_id)
                push_comments_to_db(comments)
            except Exception as e:
                print(e)

        async def process_video(api: TikTokApi, video: TikTokVideo):
            push_user_to_db(video.author)
            push_video_to_db(video)
            comments_task = get_and_push_comments(api, video.id)
            crawl_task = crawl_helper(
                api=api,
                video_id=video.id,
                video_url=f"https://www.tiktok.com/@{video.author.unique_id}/video/{video.id}",
                hashtag_crawl_count=hashtag_crawl_count,
                depth=depth,
            )
            await asyncio.gather(comments_task, crawl_task)

        # Create each async task to process a video
        print(f"Processing {len(videos)} videos")
        async_tasks = []
        for video in videos:
            try:
                async_tasks.append(asyncio.create_task(process_video(api, video)))
            except Exception as e:
                print(e)

        # Await each task to complete
        print(f"Awaiting {len(async_tasks)} tasks")
        for task in tqdm(
            asyncio.as_completed(async_tasks),
            total=len(async_tasks),
            desc="Processing videos",
            leave=False,
        ):
            await task

        print("Finished")


# Function to start at trending videos and crawl outwards
async def crawl_videos(
    trending_count: int = 30,
    hashtag_crawl_count: int = 10,
    depth: int = 10,
):

    # Main function
    async with TikTokApi() as api:
        await api.create_sessions(
            ms_tokens=[ms_token],
            num_sessions=3,
            sleep_after=3,
            headless=False,
        )
        # Get trending videos
        # print("About to crawl")
        data: list[TikTokVideo] = await get_trending_videos(
            api, trending_count, validate_func=filter_to_politics
        )
        comments_async = []
        crawlers_async = []

        async def get_and_push_comments(api, video_id):
            print(f"getting comments for {video_id}")
            comments = await get_comments_for_video(api, video_id)
            print(f"pushing comments for {video_id}")
            push_comments_to_db(comments)

        for video in data:
            # Save the video details
            push_user_to_db(video.author)
            push_video_to_db(video)
            comments_async.append(get_and_push_comments(api, video.id))
            crawlers_async.append(
                crawl_helper(
                    api=api,
                    video_id=video.id,
                    video_url=f"https://www.tiktok.com/@{video.author.unique_id}/video/{video.id}",
                    hashtag_crawl_count=hashtag_crawl_count,
                    depth=depth,
                )
            )

        await asyncio.gather(*comments_async, *crawlers_async)


async def test_get_comments_for_video():
    async with TikTokApi() as api:
        await api.create_sessions(ms_tokens=[ms_token], num_sessions=3, sleep_after=3)
        comments: list[TikTokComment] = await get_comments_for_video(
            api, video_id="7386527083150757166"
        )
        return comments


async def test_get_video_details():
    async with TikTokApi() as api:
        await api.create_sessions(ms_tokens=[ms_token], num_sessions=3, sleep_after=3)
        video = await get_video_by_url(
            api,
            video_url="https://www.tiktok.com/@icespicefever/video/7386527083150757166",
        )
        return video


async def test_get_trending_videos() -> list[TikTokVideo]:
    async with TikTokApi() as api:
        await api.create_sessions(ms_tokens=[ms_token], num_sessions=3, sleep_after=3)
        videos: list[TikTokVideo] = []
        async for video in api.trending.videos(count=10):
            videos.append(TikTokVideo.from_dict(video.as_dict, is_trending=True))
        return videos


async def display_live_stats():
    supabase_client = get_supabase_client()

    while True:
        comments_count = (
            supabase_client.schema("tiktoks")
            .table("stg_comments")
            .select("id", count="exact")
            .execute()
            .count
        )
        creators_count = (
            supabase_client.schema("tiktoks")
            .table("stg_creators")
            .select("id", count="exact")
            .execute()
            .count
        )
        videos_count = (
            supabase_client.schema("tiktoks")
            .table("stg_videos")
            .select("id", count="exact")
            .execute()
            .count
        )

        # print("\033[H\033[J")  # Clear the console
        print("Live Stats:")
        print(f"Comments: {comments_count}")
        print(f"Creators: {creators_count}")
        print(f"Videos: {videos_count}")
        print(f"Videos pushed: {push_video_counter}")
        print(f"Comments pushed: {push_comments_counter}")
        print(f"Users pushed: {push_user_counter}")
        await asyncio.sleep(1)


async def main():
    stats_task = asyncio.create_task(display_live_stats())
    crawl_task = asyncio.create_task(
        crawl_videos(trending_count=35, depth=3, hashtag_crawl_count=3)
    )

    await asyncio.gather(stats_task, crawl_task)


async def main_crawl_videos_from_saved_hashtags():
    supabase_client = get_supabase_client()
    hashtags: list[str] = [
        hashtag["hashtag"]
        for hashtag in (
            supabase_client.schema("tiktoks")
            .table("stg_trending_hashtags")
            .select("hashtag")
            .execute()
            .data
        )
    ]

    # stats_task = asyncio.create_task(display_live_stats())
    # crawl_task = asyncio.create_task(
    #     crawl_videos_from_given_hashtags(hashtags, hashtag_crawl_count=3)
    # )

    # await asyncio.gather(crawl_task, stats_task)
    await crawl_videos_from_given_hashtags(hashtags, hashtag_crawl_count=3)


if __name__ == "__main__":
    # print(asyncio.run(test_get_trending_videos()))
    # asyncio.run(main())
    asyncio.run(main_crawl_videos_from_saved_hashtags())
