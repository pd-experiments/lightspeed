import json
from typing import Dict, List
import jmespath
from parsel import Selector
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
from nested_lookup import nested_lookup
from collections import Counter
import re
from textblob import TextBlob
import nltk
import ssl
import time
import random
import logging
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import datetime
from multiprocessing import Pool, cpu_count
from tqdm import tqdm
from political_keywords import political_keywords

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    logging.error("Supabase URL or key is not set. Please set the environment variables.")
    raise EnvironmentError("Supabase URL or key is not set.")

supabase: Client = create_client(supabase_url, supabase_key)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

def download_nltk_data():
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt', quiet=True)
    
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords', quiet=True)
    
    try:
        nltk.data.find('tokenizers/punkt_tab')
    except LookupError:
        nltk.download('punkt_tab', quiet=True)

download_nltk_data()

from nltk.corpus import stopwords

def parse_thread(data: Dict) -> Dict:
    result = jmespath.search(
        """{
        id: post.id,
        text: post.caption.text,
        created_at: post.taken_at,
        likes: post.like_count,
        replies: post.text_post_app_reply_count,
        reposts: post.text_post_app_repost_count,
        conversation_id: post.parent_thread_id || post.id,
        user: {
            username: user.username,
            full_name: user.full_name,
            is_verified: user.is_verified
        }
    }""",
        data,
    )
    return result

def scrape_threads(max_threads: int = 2000, timeout: int = 600) -> List[Dict]:
    logging.info("Starting thread scraping...")
    start_time = time.time()
    
    seen_ids = set()

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True) 
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        scrape_general_threads(page, max_threads, timeout, start_time, seen_ids)

        hashtags = ["politics", "election2024", "government", "democracy"]
        remaining_threads = max_threads - len(seen_ids)
        
        with Pool(cpu_count()) as pool:
            with tqdm(total=len(hashtags), desc="Scraping hashtags") as pbar:
                for hashtag in hashtags:
                    if len(seen_ids) >= max_threads:
                        break
                    pool.apply_async(
                        scrape_hashtag_threads,
                        args=(hashtag, remaining_threads // len(hashtags)),
                        callback=lambda _: pbar.update(1)
                    )

                pool.close()
                pool.join()

    return list(seen_ids)

def store_threads_in_supabase(threads: List[Dict]):
    thread_data = [{
        "thread_id": thread["id"],
        "text": thread["text"],
        "created_at": datetime.datetime.fromtimestamp(thread["created_at"]).isoformat(),
        "likes": thread["likes"],
        "replies": thread["replies"],
        "reposts": thread["reposts"],
        "conversation_id": thread["conversation_id"],
        "username": thread["user"]["username"],
        "full_name": thread["user"]["full_name"],
        "is_verified": thread["user"]["is_verified"],
        "hashtag": thread.get("hashtag")
    } for thread in threads]
    
    try:
        supabase.table("threads").upsert(thread_data, on_conflict="thread_id").execute()
        logging.info(f"Stored {len(thread_data)} threads in Supabase")
    except Exception as e:
        logging.error(f"Error storing threads in Supabase: {str(e)}")

def scrape_general_threads(page, max_threads: int, timeout: int, start_time: float, seen_ids: set) -> None:
    last_thread_count = 0
    stuck_count = 0
    total_parsed_threads = 0

    try:
        page.goto("https://www.threads.net/", wait_until="networkidle", timeout=30000)
        page.wait_for_load_state("domcontentloaded")
    except PlaywrightTimeoutError:
        logging.error("Timeout while loading the page. Proceeding with available content.")

    while len(seen_ids) < max_threads and (time.time() - start_time) < timeout:
        logging.info(f"Scraped {len(seen_ids)} political threads out of {total_parsed_threads} total threads so far...")
        selector = Selector(page.content())
        hidden_datasets = selector.css('script[type="application/json"][data-sjs]::text').getall()
        
        new_threads = 0
        for hidden_dataset in hidden_datasets:
            if '"ScheduledServerJS"' not in hidden_dataset:
                continue
            data = json.loads(hidden_dataset)
            thread_items = nested_lookup('thread_items', data)
            for thread in thread_items:
                for t in thread:
                    parsed_thread = parse_thread(t)
                    total_parsed_threads += 1
                    if parsed_thread['id'] not in seen_ids:
                        if is_political(parsed_thread['text']):
                            seen_ids.add(parsed_thread['id'])
                            store_threads_in_supabase([parsed_thread])
                            new_threads += 1
                            if len(seen_ids) >= max_threads:
                                return

        if new_threads == 0:
            stuck_count += 1
            if stuck_count >= 5:
                logging.warning("Scraping seems to be stuck. Moving to hashtags.")
                break
        else:
            stuck_count = 0

        try:
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(random.uniform(1, 2))  
        except PlaywrightTimeoutError:
            logging.error("Timeout while scrolling. Continuing with available data.")

def scrape_hashtag_threads(hashtag: str, max_threads: int = 500) -> None:
    logging.info(f"Scraping threads for hashtag: {hashtag}")
    seen_ids = set()

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        page.goto(f"https://www.threads.net/tag/{hashtag}", wait_until="networkidle", timeout=30000)
        page.wait_for_load_state("domcontentloaded")

        stuck_count = 0

        while len(seen_ids) < max_threads:
            selector = Selector(page.content())
            hidden_datasets = selector.css('script[type="application/json"][data-sjs]::text').getall()
            
            new_threads = 0
            for hidden_dataset in hidden_datasets:
                if '"ScheduledServerJS"' not in hidden_dataset:
                    continue
                data = json.loads(hidden_dataset)
                thread_items = nested_lookup('thread_items', data)
                for thread in thread_items:
                    for t in thread:
                        parsed_thread = parse_thread(t)
                        if parsed_thread['id'] not in seen_ids:
                            seen_ids.add(parsed_thread['id'])
                            parsed_thread['hashtag'] = hashtag
                            store_threads_in_supabase([parsed_thread])
                            new_threads += 1
                            if len(seen_ids) >= max_threads:
                                return

            if new_threads == 0:
                stuck_count += 1
                if stuck_count >= 5:
                    break
            else:
                stuck_count = 0

            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(random.uniform(1, 2))

def is_political(text: str) -> bool:
    if not text:
        return False
    
    text_lower = text.lower()
    word_count = len(text.split())
    
    exact_matches = sum(1 for keyword in political_keywords if keyword in text_lower)
    
    partial_matches = sum(1 for keyword in political_keywords if any(word.startswith(keyword) for word in text_lower.split()))
    
    political_score = (exact_matches + 0.5 * partial_matches) / word_count
    
    return political_score > 0.03 

def analyze_political_content(threads: List[Dict]) -> Dict:
    logging.info("Analyzing political content...")
    all_text = " ".join([thread['text'] for thread in threads if thread['text'] is not None])
    
    try:
        stop_words = set(stopwords.words('english'))
    except LookupError:
        logging.warning("Stopwords not found. Proceeding without stopword removal.")
        stop_words = set()
    
    words = [word.lower() for word in nltk.word_tokenize(all_text) if word.isalnum() and len(word) > 3 and word.lower() not in stop_words]
    
    topic_counter = Counter(words)
    hot_topics = topic_counter.most_common(20)
    
    politicians = {
        "democrats": ["biden", "harris", "pelosi", "schumer", "aoc", "sanders"],
        "republicans": ["trump", "mccarthy", "mcconnell", "desantis", "cruz", "hawley"]
    }
    politician_mentions = {party: {politician: all_text.lower().count(politician) for politician in politicians_list}
                           for party, politicians_list in politicians.items()}
    
    key_threads = sorted(
        threads,
        key=lambda x: (x.get('likes') or 0) + (x.get('replies') or 0) + (x.get('reposts') or 0),
        reverse=True
    )[:10]
    
    sentiments = [TextBlob(thread['text']).sentiment.polarity for thread in threads if thread['text'] is not None]
    avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0
    
    hashtags = re.findall(r'#\w+', all_text.lower())
    trending_hashtags = Counter(hashtags).most_common(10)
    
    conversations = Counter(thread['conversation_id'] for thread in threads).most_common(10)
    
    logging.info("Analysis complete.")
    return {
        "hot_topics": hot_topics,
        "politician_mentions": politician_mentions,
        "key_threads": key_threads,
        "avg_sentiment": avg_sentiment,
        "trending_hashtags": trending_hashtags,
        "top_conversations": conversations
    }

if __name__ == "__main__":
    try:
        all_threads = scrape_threads(max_threads=500)
        if not all_threads:
            logging.warning("No threads were scraped. Skipping analysis.")
        else:
            analysis = analyze_political_content(all_threads)
            result = {
                "threads": all_threads,
                "info": analysis
            }
            
            script_dir = os.path.dirname(os.path.abspath(__file__))
            output_file = os.path.join(script_dir, 'threads_political_analysis.json')
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            logging.info(f"Analysis results saved to {output_file}")
    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")