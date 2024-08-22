import json
import jmespath
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import urllib.parse
import time
import logging
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

# TODO: make this damn thing work 

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    logging.error("Supabase URL or key is not set. Please set the environment variables.")
    raise EnvironmentError("Supabase URL or key is not set.")

supabase: Client = create_client(supabase_url, supabase_key)

def parse_ad(data: dict) -> dict:
    result = jmespath.search(
        """{
        ad_id: id,
        ad_url: ad_url,
        ad_text: ad_text,
        advertiser: advertiser,
        sponsored_info: sponsored_info,
        image_url: image_url,
        spend: spend,
        impressions: impressions
    }""",
        data,
    )
    return result

def extract_ad_data(ad_element):
    ad_id = ad_element.get_attribute('data-ad-id')
    ad_url = f"https://www.facebook.com/ads/library/?id={ad_id}"
    
    ad_text = ad_element.find_element(By.CSS_SELECTOR, '.x1lliihq').text
    advertiser = ad_element.find_element(By.CSS_SELECTOR, '.x8t9es0 > span').text
    sponsored_info = ad_element.find_element(By.CSS_SELECTOR, '.x1jx94hy').text
    
    image = ad_element.find_element(By.TAG_NAME, 'img')
    image_url = image.get_attribute('src')
    
    spend_impressions = ad_element.find_element(By.CSS_SELECTOR, '.x6s0dn4').text
    spend = spend_impressions.split(' · ')[0]
    impressions = spend_impressions.split(' · ')[1]
    
    ad_data = {
        'id': ad_id,
        'ad_url': ad_url,
        'ad_text': ad_text,
        'advertiser': advertiser,
        'sponsored_info': sponsored_info,
        'image_url': image_url,
        'spend': spend,
        'impressions': impressions
    }
    
    return parse_ad(ad_data)

def store_ad_in_supabase(ad_data):
    ad_record = {
        'ad_id': ad_data['ad_id'],
        'ad_url': ad_data['ad_url'],
        'ad_text': ad_data['ad_text'],
        'advertiser': ad_data['advertiser'],
        'sponsored_info': ad_data['sponsored_info'],
        'image_url': ad_data['image_url'],
        'spend': ad_data['spend'],
        'impressions': ad_data['impressions'],
        'created_at': datetime.now().isoformat()
    }
    
    supabase.table('meta_ads').upsert([ad_record], on_conflict='ad_id').execute()

def scrape_ads(driver, max_ads=100):
    ads_scraped = 0
    while ads_scraped < max_ads:
        ads = driver.find_elements(By.CSS_SELECTOR, 'div[class^="x1nhvcw1"]')
        for ad in ads:
            ad_data = extract_ad_data(ad)
            store_ad_in_supabase(ad_data)
            ads_scraped += 1
            if ads_scraped >= max_ads:
                return
        
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)

def main():
    search_term = "politics"
    encoded_search_term = urllib.parse.quote(search_term)
    url = f"https://www.facebook.com/ads/library/?active_status=active&ad_type=political_and_issue_ads&country=US&media_type=all&q={encoded_search_term}&search_type=keyword_unordered"

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    driver.get(url)
    driver.implicitly_wait(10)

    try:
        scrape_ads(driver, max_ads=100)
    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
    finally:
        driver.quit()

if __name__ == "__main__":
    main()