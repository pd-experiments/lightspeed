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

def scrape_threads(max_threads: int = 500, timeout: int = 300) -> List[Dict]:
    logging.info("Starting thread scraping...")
    start_time = time.time()
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True) 
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        threads = []
        seen_ids = set()

        threads.extend(scrape_general_threads(page, max_threads, timeout, start_time, seen_ids))

        hashtags = ["politics", "election2024", "government", "democracy"]
        for hashtag in hashtags:
            if len(threads) >= max_threads:
                break
            hashtag_threads = scrape_hashtag_threads(page, hashtag, max_threads - len(threads))
            threads.extend(hashtag_threads)

    return threads

def scrape_general_threads(page, max_threads: int, timeout: int, start_time: float, seen_ids: set) -> List[Dict]:
    threads = []
    last_thread_count = 0
    stuck_count = 0
    total_parsed_threads = 0

    try:
        page.goto("https://www.threads.net/", wait_until="networkidle", timeout=30000)
        page.wait_for_load_state("domcontentloaded")
    except PlaywrightTimeoutError:
        logging.error("Timeout while loading the page. Proceeding with available content.")

    while len(threads) < max_threads and (time.time() - start_time) < timeout:
        logging.info(f"Scraped {len(threads)} political threads out of {total_parsed_threads} total threads so far...")
        selector = Selector(page.content())
        hidden_datasets = selector.css('script[type="application/json"][data-sjs]::text').getall()
        
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
                        seen_ids.add(parsed_thread['id'])
                        if is_political(parsed_thread['text']):
                            threads.append(parsed_thread)
                            if len(threads) >= max_threads:
                                return threads

        if len(threads) == last_thread_count:
            stuck_count += 1
            if stuck_count >= 5:
                logging.warning("Scraping seems to be stuck. Moving to hashtags.")
                break
        else:
            stuck_count = 0
            last_thread_count = len(threads)

        try:
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(random.uniform(2, 4))  # Random delay to avoid detection
        except PlaywrightTimeoutError:
            logging.error("Timeout while scrolling. Continuing with available data.")

    return threads

def scrape_hashtag_threads(page, hashtag: str, max_threads: int = 100) -> List[Dict]:
    logging.info(f"Scraping threads for hashtag: {hashtag}")
    page.goto(f"https://www.threads.net/tag/{hashtag}", wait_until="networkidle", timeout=30000)
    page.wait_for_load_state("domcontentloaded")

    threads = []
    seen_ids = set()
    last_thread_count = 0
    stuck_count = 0

    while len(threads) < max_threads:
        selector = Selector(page.content())
        hidden_datasets = selector.css('script[type="application/json"][data-sjs]::text').getall()
        
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
                        threads.append(parsed_thread)
                        if len(threads) >= max_threads:
                            return threads

        if len(threads) == last_thread_count:
            stuck_count += 1
            if stuck_count >= 5:
                break
        else:
            stuck_count = 0
            last_thread_count = len(threads)

        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(random.uniform(2, 4))

    return threads

def is_political(text: str) -> bool:
    if not text:
        return False
    political_keywords = [
        "politics", "election", "government", "president", "democracy",
        "republican", "democrat", "congress", "senate", "house",
        "biden", "trump", "harris", "pelosi", "mccarthy", "mcconnell",
        "policy", "vote", "campaign", "law", "bill", "legislation",
        "party", "liberal", "conservative", "progressive", "reform"
    ]
    
    return any(keyword in text.lower() for keyword in political_keywords)

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
    }

if __name__ == "__main__":
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