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

from scripts.new_tiktok.models import TikTokTrend

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env.local"))


def scrape_trending() -> list[TikTokTrend]:
    driver = create_driver(headless=False)
    driver.get(
        "https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en"
    )
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(
            (By.XPATH, "//*[starts-with(@class, 'CcSelect_ccItemLabelWrap')]")
        )
    )

    time.sleep(1)

    industry_select = driver.find_element(By.ID, "hashtagIndustrySelect")
    industry_select.click()

    time.sleep(1)

    industry_options = driver.find_elements(
        By.CLASS_NAME, "creative-component-single-line"
    )
    for option in industry_options:
        if "news" in option.text.lower():
            option.click()
            break
    else:
        raise Exception("News option not found")

    time.sleep(1)

    hashtags_elements: list[WebElement] = []
    iters = 0
    while len(hashtags_elements) < 100 and iters < 100:
        print(len(hashtags_elements))
        try:
            login_view: WebElement = driver.find_element(
                By.CLASS_NAME, "InduceLogin_induceLogin__pN61i"
            )
            button: WebElement = login_view.find_element(
                By.CLASS_NAME, "CcButton_common__aFDas"
            )
            button.click()

            time.sleep(1)

            temp_elements = driver.find_elements(
                By.CLASS_NAME, "CommonDataList_cardWrapper__kHTJP"
            )
            hashtags_elements = temp_elements
            iters += 1
        except Exception as e:
            print(e)
            break

    hashtags_elements: list[TikTokTrend] = list(
        map(
            lambda elem: TikTokTrend(
                hashtag=elem.find_element(By.CLASS_NAME, "CardPc_titleText__RYOWo")
                .text.strip("#")
                .strip(),
                link=elem.find_element(By.TAG_NAME, "a").get_attribute("href"),
            ),
            driver.find_elements(By.CLASS_NAME, "CommonDataList_cardWrapper__kHTJP"),
        )
    )

    return hashtags_elements


def push_trends_to_supabase(trends: list[TikTokTrend]):
    if len(trends) == 0:
        return
    supabase = get_supabase_client()
    for trend in trends:
        supabase.schema("tiktoks").table("stg_trending_hashtags").insert(
            trend.model_dump(mode="json")
        ).execute()


if __name__ == "__main__":
    trends = scrape_trending()
    push_trends_to_supabase(trends)
