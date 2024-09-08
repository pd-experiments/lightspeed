import json
import os
import time
from typing import Any
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from tqdm import tqdm
from webdriver_manager.chrome import ChromeDriverManager
import re
from urllib.parse import urlparse
import traceback
import multiprocessing as mp

import supabase

from models import GoogleAd

# Load environment variables
load_dotenv(".env.local")


# Connect to Supabase
def get_supabase_client():
    return supabase.create_client(
        os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
        os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    )


def create_driver() -> WebDriver:
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()), options=chrome_options
    )
    return driver


def get_ads_from_db():
    supabase_client = get_supabase_client()
    ads: list[GoogleAd] = []
    offset = 0
    limit = 1000
    while True:
        data: list[dict[str, Any]] = (
            supabase_client.table("stg_ads__google_ads")
            .select("*")
            .range(offset, offset + limit - 1)
            .execute()
            .data
        )
        ads.extend(list(map(GoogleAd.model_validate, data)))
        if len(data) < limit:
            break
        offset += limit
    return ads


def scrape_ad_stats(ad: GoogleAd):
    try:
        driver = create_driver()
        driver.get(ad.advertisement_url.unicode_string())
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "overview-stats"))
        )
        stats_container: WebElement = driver.find_element(
            By.CLASS_NAME, "overview-stats"
        )

        try:
            spend_container = stats_container.find_element(By.CLASS_NAME, "spend")
            stat = (
                spend_container.find_element(By.CLASS_NAME, "stat").text.strip().lower()
            )
            ad.spend = stat
        except Exception as e:
            print(f"Error with ad ({ad.advertisement_url}):", type(e), e)
            return None

        try:
            impressions_container = stats_container.find_element(
                By.CLASS_NAME, "impressions"
            )
            stat = (
                impressions_container.find_element(
                    By.CLASS_NAME, "region-impression-count"
                )
                .text.strip()
                .lower()
            )
            ad.impressions = stat
        except Exception as e:
            print(f"Error with ad ({ad.advertisement_url}):", type(e), e)
            return None

        return ad
    except Exception as e:
        print(f"Error with ad ({ad.advertisement_url}):", type(e), e)
        return None
    finally:
        if driver is not None:
            driver.quit()


if __name__ == "__main__":
    ads = get_ads_from_db()
    supabase_client = get_supabase_client()

    with tqdm(total=len(ads), desc=f"Processing ads") as pbar:

        def update_progress(ad: GoogleAd | None):
            if ad is not None:
                (
                    supabase_client.table("stg_ads__google_ads")
                    .upsert(ad.model_dump(mode="json"))
                    .execute()
                )
            pbar.update(1)

        with mp.Pool(mp.cpu_count()) as p:
            for ad in ads:
                # print("Scraping ad:", ad.advertisement_url)
                p.apply_async(scrape_ad_stats, args=(ad,), callback=update_progress)

            p.close()
            p.join()
