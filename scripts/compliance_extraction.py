from urllib.request import urlopen
from bs4 import BeautifulSoup
from supabase import create_client, Client
import os
import openai
import logging
from dotenv import load_dotenv
from pydantic import BaseModel
import json
import sys
import argparse

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    logging.error("Supabase URL or key is not set. Please set the environment variables.")
    raise EnvironmentError("Supabase URL or key is not set.")

supabase = create_client(supabase_url, supabase_key)

class ComplianceResponse(BaseModel):
    title: str
    cleaned_text: str
    type: str

def fetch_compliance_text(url):
    try:
        html = urlopen(url).read()
        soup = BeautifulSoup(html, features="html.parser")

        for script in soup(["script", "style"]):
            script.extract()

        text = soup.get_text()

        # break into lines and remove leading and trailing space on each
        lines = (line.strip() for line in text.splitlines())

        # break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        raw_text = '\n'.join(chunk for chunk in chunks if chunk)

        print(raw_text)

        # clean text and generate title
        openai.api_key = os.getenv("OPENAI_API_KEY")
        client = openai.OpenAI()

        response = client.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06",
            messages=[
                {"role": "system", "content": "You are a text cleaning assistant."},
                {"role": "user", "content": f"Clean the following text by removing duplicate lines and unnecessary whitespace, and generate a JSON with three fields: 'title', 'cleaned_text', and 'type' (which should be FEDERAL, STATE, or LOCAL):\n\n{raw_text}"}
            ],
            response_format=ComplianceResponse,
        )

        message = response.choices[0].message
        if message.parsed:
            result = message.parsed
            print("RESULT", result)
            return result
        else:
            logging.error("OpenAI API refusal: ", message.refusal)
            return None

    except Exception as e:
        print(f"Error fetching the webpage: {e}")
        return None

def store_compliance_text(data, url):
    # Create embeddings
    openai.api_key = os.getenv("OPENAI_API_KEY")
    embeddings_response = openai.embeddings.create(
        model="text-embedding-3-small",
        input=data.cleaned_text
    )
    embeddings = embeddings_response.data[0].embedding

    data_to_store = {
        "url": url,
        "text": data.cleaned_text,
        "embeddings": embeddings,
        "type": data.type,
        "title": data.title
    }

    response = supabase.table("compliance_docs").insert(data_to_store).execute()
    if response:
        print("Compliance document stored successfully.")
    else:
        print(f"Error storing compliance document: {response.model_dump_json()}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Fetch and store compliance text from a URL.')
    parser.add_argument('url', type=str, help='The URL to fetch compliance text from')
    args = parser.parse_args()

    url = args.url
    result = fetch_compliance_text(url)
    
    if result:
        store_compliance_text(result, url)
    else:
        print("Failed to fetch or save the text content.")