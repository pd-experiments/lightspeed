import requests
import json
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

# TODO: make this damn thing work 

def fetch_ads_data():
    url = "https://graph.facebook.com/v20.0/ads_archive"
    params = {
        "search_terms": "california",
        "ad_type": "POLITICAL_AND_ISSUE_ADS",
        "ad_reached_countries": json.dumps(["US"]),
        "access_token": os.getenv("META_ACCESS_TOKEN")
    }

    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return None

ads_data = fetch_ads_data()
if ads_data:
    print(json.dumps(ads_data, indent=2))