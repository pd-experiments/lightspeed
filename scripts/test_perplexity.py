import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(".env.local")

client = OpenAI(
    api_key=os.getenv("PERPLEXITY_API_KEY"), base_url="https://api.perplexity.ai"
)


response = client.chat.completions.create(
    model="llama-3.1-sonar-large-128k-online",
    messages=[{"role": "user", "content": "Who is Pranav Ramesh?"}],
)

print(response)
