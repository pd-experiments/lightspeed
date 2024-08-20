import os
from typing import Any
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from pydantic import BaseModel, HttpUrl
import re
from urllib.parse import urlparse
import traceback

import supabase

# Load environment variables
load_dotenv(".env.local")


# Connect to Supabase
def get_supabase_client():
    return supabase.create_client(
        os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
        os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    )


def main():
    url = "https://adstransparency.google.com/political?region=US&topic=political"
    # Open the website
    driver = webdriver.Chrome()
    driver.get(url)
    all_links: list[str] = []
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.TAG_NAME, "creative-preview"))
        )

        # Get all elements with the tag name 'creative-preview'
        creative_previews = driver.find_elements(By.TAG_NAME, "creative-preview")

        for preview in creative_previews:
            # Save all links
            all_links.append(
                preview.find_element(By.TAG_NAME, "a").get_attribute("href")
            )

        # input("Waiting...")
    except TimeoutException:
        print(
            "Timed out waiting for elements with tag 'creative-preview' to be present."
        )

    # print(*all_links, sep="\n")
    print("Got", len(all_links), "links")
    supabase_client = get_supabase_client()
    for url in all_links:
        data = scrape_ad_data_from_url(url, driver)
        if data is None:
            continue
        json: dict[str, Any] = data.model_dump(mode="json")
        try:
            supabase_client.table("stg_ads__google_ads").upsert(json).execute()
        except Exception as e:
            print("Supabase couldn't upsert:", e)


class Property(BaseModel):
    label: str | None
    value: str | None


class Targeting(BaseModel):
    category_subheading: str | None
    criterion_included: str | None
    criterion_excluded: str | None


class GoogleAd(BaseModel):
    advertisement_url: HttpUrl
    advertiser_name: str | None
    advertiser_url: HttpUrl | None
    properties: list[Property] | None
    age_targeting: Targeting | None
    gender_targeting: Targeting | None
    geo_targeting: Targeting | None
    media_links: list[str] | None


def scrape_ad_data_from_url(url: str, driver: WebDriver | None = None):
    if driver is None:
        driver = webdriver.Chrome()

    ad_details: dict[str, Any] = {"advertisement_url": url}
    driver.get(url)
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "creative-details-container"))
    )

    # Advertiser name
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "advertiser-header-link"))
    )
    advertiser_header = driver.find_element(By.CLASS_NAME, "advertiser-header-link")
    ad_details["advertiser_name"] = advertiser_header.text
    ad_details["advertiser_url"] = advertiser_header.get_attribute("href")

    # Ad properties (first shown, ran for, last shown, format)
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "properties"))
    )
    properties_container = driver.find_element(By.CLASS_NAME, "properties")
    properties = []
    for property in properties_container.find_elements(By.CLASS_NAME, "property"):
        raw_property_text = re.sub(r"\s+", " ", property.text.strip()).split(":")
        label, value = (
            raw_property_text[0].lower().replace(" ", "_"),
            ":".join(raw_property_text[1:]).strip(),
        )
        properties.append({"label": label, "value": value})

    ad_details["properties"] = properties

    # Ad stats (amount spent, number of times shown)
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "overview-stats"))
    )
    stats_container = driver.find_elements(By.CLASS_NAME, "overview-stats")
    stats = []
    for stat_container in stats_container:
        political_stat_header = re.sub(
            r"\s+",
            "_",
            stat_container.find_element(By.CLASS_NAME, "political-stat-header")
            .text.strip()
            .lower(),
        )
        title = re.sub(
            r"\s+",
            "_",
            stat_container.find_element(By.CLASS_NAME, "title").text.strip().lower(),
        )
        stat = stat_container.find_element(By.CLASS_NAME, "stat").text.strip().lower()
        stats.append(
            {
                "political_stat_header": political_stat_header,
                "title": title,
                "stat": stat,
            }
        )

    # Targeting criteria
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "targeting-details"))
    )
    # Containers
    targeting_containers = [
        ["age_targeting", driver.find_element(By.CLASS_NAME, "age-targeting")],
        ["gender_targeting", driver.find_element(By.CLASS_NAME, "gender-targeting")],
        ["geo_targeting", driver.find_element(By.CLASS_NAME, "geo-targeting")],
    ]
    for targeting_label, targeting_container in targeting_containers:
        category = targeting_container.find_element(
            By.CLASS_NAME, "category-subheading"
        ).text.strip()
        try:
            criterion_included = (
                targeting_container.find_element(
                    By.XPATH,
                    "//div[starts-with(@class, 'dsa-') and contains(@class, 'criterion') and contains(@class, 'included')]",
                )
                .find_element(By.CLASS_NAME, "specifics")
                .text.strip()
            )
        except Exception as e:
            print(e)
            criterion_included = None
        try:
            criterion_excluded = (
                targeting_container.find_element(
                    By.XPATH,
                    "//div[starts-with(@class, 'dsa-') and contains(@class, 'criterion') and contains(@class, 'excluded')]",
                )
                .find_element(By.CLASS_NAME, "specifics")
                .text.strip()
            )
        except Exception as e:
            print(e)
            criterion_excluded = None

        ad_details[targeting_label] = {
            "category_subheading": category,
            "criterion_included": criterion_included,
            "criterion_excluded": criterion_excluded,
        }

    # Media
    format_value = None
    for prop in properties:
        if prop["label"] == "format":
            format_value = prop["value"]
            break

    if format_value is None:
        return

    ad_details["media_links"] = []
    while True:
        print("Started another iteration")
        try:
            if format_value == "Image":
                WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located(
                        (By.CLASS_NAME, "creative-container")
                    )
                )
                container: WebElement = driver.find_element(
                    By.CLASS_NAME, "creative-container"
                )
                WebDriverWait(container, 5).until(
                    EC.presence_of_element_located((By.TAG_NAME, "iframe"))
                )
                iframe: WebElement = container.find_element(By.TAG_NAME, "iframe")
                driver.switch_to.frame(iframe)
                img = driver.find_element(By.TAG_NAME, "img")
                ad_details["media_links"].append(img.get_attribute("src"))
            elif format_value == "Text":
                WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located(
                        (By.CLASS_NAME, "creative-container")
                    )
                )
                container: WebElement = driver.find_element(
                    By.CLASS_NAME, "creative-container"
                )
                WebDriverWait(container, 5).until(
                    EC.presence_of_element_located((By.TAG_NAME, "iframe"))
                )
                iframe: WebElement = container.find_element(By.TAG_NAME, "iframe")
                driver.switch_to.frame(iframe)
                WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.TAG_NAME, "div"))
                )
                body = driver.find_element(By.TAG_NAME, "body")
                ad_details["media_links"].append(body.text)
            elif format_value == "Video":
                # WebDriverWait(driver, 10).until(
                #     EC.presence_of_element_located((By.ID, "youtube-mobile"))
                # )
                # video_div = driver.find_element(By.ID, "youtube-mobile")
                # iframe = video_div.find_element(By.ID, "video")
                # youtube_link = iframe.get_attribute("src")

                WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located(
                        (By.CLASS_NAME, "creative-container")
                    )
                )
                container: WebElement = driver.find_element(
                    By.CLASS_NAME, "creative-container"
                )
                # print(
                #     "CONTAINER:\n\n", container.get_attribute("outerHTML"), "\n\n", sep="\n"
                # )
                WebDriverWait(container, 5).until(
                    EC.presence_of_element_located((By.TAG_NAME, "iframe"))
                )
                iframe: WebElement = container.find_element(By.TAG_NAME, "iframe")
                # content = iframe.get_attribute("outerHTML")
                # print("IFRAME\n\n", iframe.get_attribute("outerHTML"), "\n\n", sep="\n")
                driver.switch_to.frame(iframe)

                WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.TAG_NAME, "iframe"))
                )
                nested_iframe: WebElement = driver.find_element(By.TAG_NAME, "iframe")

                driver.switch_to.frame(nested_iframe)

                WebDriverWait(driver, 5).until(find_youtube_link)
                really_nested_iframe: WebElement = driver.find_element(
                    By.TAG_NAME, "iframe"
                )

                url = really_nested_iframe.get_attribute("src")
                parsed_url = urlparse(url)
                youtube_url = f"https://{parsed_url.netloc}{parsed_url.path}"

                ad_details["media_links"].append(youtube_url)

        except Exception as e:
            print("Something happened")
            # print(traceback.format_exc())
        finally:
            driver.switch_to.default_content()
            try:
                WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located(
                        (By.CLASS_NAME, "creative-container")
                    )
                )
                container: WebElement = driver.find_element(
                    By.CLASS_NAME, "creative-container"
                )
                WebDriverWait(container, 5).until(
                    EC.presence_of_element_located(
                        (By.CLASS_NAME, "right-arrow-container")
                    )
                )
                right_arrow_button: WebElement = container.find_element(
                    By.CLASS_NAME, "right-arrow-container"
                ).find_element(By.TAG_NAME, "material-fab")
                print(right_arrow_button.get_attribute("disabled"))
                if right_arrow_button.get_attribute("disabled") != "true":
                    print("Went to next page")
                    right_arrow_button.click()
                else:
                    print("No pagination")
                    break
            except Exception as e:
                print("Something happened while trying to paginate; breaking")
                # print(traceback.format_exc())
                break

    return GoogleAd.model_validate(ad_details)


def find_youtube_link(driver: WebDriver):
    try:
        url: str = driver.find_element(By.TAG_NAME, "iframe").get_attribute("src")
        parsed_url = urlparse(url)
        youtube_url = f"https://{parsed_url.netloc}{parsed_url.path}"
        return bool(youtube_url)
    except Exception as e:
        return None


main()

# for url in all_links:
#     print(scrape_ad_data_from_url(driver, url))
# print(
#     scrape_ad_data_from_url(
#         driver,
#         "https://adstransparency.google.com/advertiser/AR16921747937342521345/creative/CR18374068107460214785?region=US&topic=political",
#     ),
# )
