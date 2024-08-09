import os
import sys
import argparse
import fitz 
from supabase import create_client, Client
import openai
from dotenv import load_dotenv
import logging
import requests
import io
import json

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")
openai.api_key = os.getenv("OPENAI_API_KEY")

if not supabase_url or not supabase_key:
    logging.error("Supabase URL or key is not set. Please set the environment variables.")
    raise EnvironmentError("Supabase URL or key is not set.")

supabase = create_client(supabase_url, supabase_key)

def extract_text_from_pdf(file_url):
    response = requests.get(file_url)
    pdf_file = io.BytesIO(response.content)
    text = ""
    with fitz.open(stream=pdf_file, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text

def clean_and_process_text(raw_text):
    client = openai.OpenAI()
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a text cleaning assistant. Your response should be a valid JSON object with three fields: 'title', 'cleaned_text', and 'type' (which should be FEDERAL, STATE, or LOCAL)."},
            {"role": "user", "content": f"Clean the following text by removing duplicate lines and unnecessary whitespace:\n\n{raw_text}"}
        ]
    )
    return response.choices[0].message.content

def store_compliance_text(data, file_name):
    embeddings_response = openai.embeddings.create(
        model="text-embedding-3-small",
        input=data['cleaned_text']
    )
    embeddings = embeddings_response.data[0].embedding

    data_to_store = {
        "url": file_name,
        "text": data['cleaned_text'],
        "embeddings": embeddings,
        "type": data['type'],
        "title": data['title']
    }

    response = supabase.table("compliance_docs").insert(data_to_store).execute()
    if response:
        print("Compliance document stored successfully.")
    else:
        print(f"Error storing compliance document: {response.model_dump_json()}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Extract and store compliance text from a PDF.')
    parser.add_argument('file_path', type=str, help='The path to the PDF file')
    args = parser.parse_args()

    raw_text = extract_text_from_pdf(args.file_path)        
    processed_data_str = clean_and_process_text(raw_text)
    try:
        processed_data = json.loads(processed_data_str)
        store_compliance_text(processed_data, os.path.basename(args.file_path))
    except json.JSONDecodeError:
        print("Error: Failed to parse the processed data as JSON")
        sys.exit(1)