import os
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import supabase
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv
from tqdm import tqdm

load_dotenv(".env.local")


def get_supabase_client():
    return supabase.create_client(
        os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
        os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    )


def create_driver() -> WebDriver:
    # Set up Selenium options
    chrome_options = Options()
    # chrome_options.add_argument("--headless")  # Run in headless mode (no browser window)
    # chrome_options.add_argument("--no-sandbox")
    # chrome_options.add_argument("--disable-dev-shm-usage")

    # Initialize the WebDriver
    driver: WebDriver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()), options=chrome_options
    )
    return driver


def get_tiktok_video_src(driver: WebDriver, author: str, video_id: str) -> str:
    try:
        # Construct the URL
        url: str = f"https://www.tiktok.com/@{author}/video/{video_id}"

        # Navigate to the TikTok video page
        driver.get(url)

        # Locate the div with a class containing 'DivBasicPlayerWrapper'
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located(
                (By.XPATH, "//div[contains(@class, 'DivBasicPlayerWrapper')]")
            )
        )
        div_element: WebElement = driver.find_element(
            By.XPATH, "//div[contains(@class, 'DivBasicPlayerWrapper')]"
        )

        # Find the video element inside this div
        video_element: WebElement = div_element.find_element(By.TAG_NAME, "video")

        # Extract the src attribute from the video element
        video_src: str = video_element.get_attribute("src")

        return video_src
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    finally:
        # Clean up and close the browser
        driver.quit()


def download_video(video_url: str, file_name: str) -> None:
    try:
        response = requests.get(video_url, stream=True)
        response.raise_for_status()  # Check for request errors

        with open(file_name, "wb") as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)

        print(f"Video downloaded successfully: {file_name}")
    except Exception as e:
        print(f"An error occurred while downloading the video: {e}")


if __name__ == "__main__":
    driver = create_driver()
    supabase_client = get_supabase_client()
    rows = (
        supabase_client.table("tiktok_videos")
        .select("author, video_id")
        .limit(10)
        .execute()
    )

    urls = list(
        map(
            lambda row: (row["author"], row["video_id"]),
            rows.data,
        )
    )

    for author, video_id in urls:
        video_src = get_tiktok_video_src(driver, author, video_id)
        if video_src:
            file_name = f"scripts/tiktok/downloads/{author}_{video_id}.mp4"

            directory = os.path.dirname(file_name)
            if not os.path.exists(directory):
                os.makedirs(directory)

            download_video(video_src, file_name)
