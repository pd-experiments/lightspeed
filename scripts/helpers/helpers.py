from dotenv import load_dotenv
import os
import supabase

# Load environment variables
load_dotenv(".env.local")


# Connect to Supabase
def get_supabase_client():
    return supabase.create_client(
        os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
        os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    )
