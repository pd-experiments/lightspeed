import os
import logging
#pip install git+https://github.com/JuanBindez/pytubefix.git@c0c07b046d8b59574552404931f6ce3c6590137d
#https://github.com/JuanBindez/pytubefix/commit/c0c07b046d8b59574552404931f6ce3c6590137d
from pytubefix import YouTube
from pytubefix.cli import on_progress

from supabase import create_client, Client
from io import BytesIO
from uuid import uuid4
from datetime import datetime, timedelta
import torch
import torchvision.transforms as transforms
from PIL import Image
from torchvision.models import resnet50
from dotenv import load_dotenv
import time
import tempfile

import cv2

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    logging.error("Supabase URL or key is not set. Please set the environment variables.")
    raise EnvironmentError("Supabase URL or key is not set.")

supabase: Client = create_client(supabase_url, supabase_key)

# Load a pre-trained ResNet model
model = resnet50(pretrained=True)
model.eval()

# Define a transform to preprocess the frames
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def download_youtube_video(url):
    logging.info(f"Downloading YouTube video from URL: {url}")
    try:
        yt = YouTube(url, on_progress_callback=on_progress)
        try:
            print("YT", yt.title)
        except KeyError:
            logging.error("Failed to access video title.")
            return None

        stream = yt.streams.get_highest_resolution()

        if stream is None:
            logging.error("No suitable stream found for the video.")
            return None

        print(f"Stream URL: {stream.url}")
        print(f"Stream Resolution: {stream.resolution}")
        print(f"Stream Mime Type: {stream.mime_type}")

        video_data = BytesIO()
        try:
            stream.stream_to_buffer(video_data)
        except Exception as e:
            logging.error(f"Failed to download video: {str(e)}")
            return None

        video_data.seek(0)
        logging.info("Download complete")
        return video_data
    except Exception as e:
        logging.error(f"Failed to download video: {str(e)}")
        return None

def generate_embedding(image):
    logging.info("Generating embedding for the frame")
    image = preprocess(image)
    image = image.unsqueeze(0)  # Add batch dimension
    
    with torch.no_grad():
        embedding = model(image)
    
    logging.info("Embedding generated")
    return embedding.squeeze().numpy()

def extract_frames_and_upload(video_id, video_uuid, video_data, interval=1):
    logging.info(f"Extracting frames from video ID: {video_id}")
    cap = cv2.VideoCapture(video_data)
    frame_count = 0
    success, frame = cap.read()
    
    while success:
        if frame_count % interval == 0:
            frame_filename = f"frame_{frame_count}.jpg"
            is_success, buffer = cv2.imencode(".jpg", frame)
            frame_data = BytesIO(buffer)
            
            # Save frame_data to a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_frame_file:
                temp_frame_file.write(frame_data.getbuffer())
                temp_frame_file_path = temp_frame_file.name
            
            # # Check if frame already exists in storage
            # try:
            #     supabase.storage.from_("frames").download(frame_filename)
            #     logging.warning(f"Frame {frame_filename} already exists in storage. Skipping upload.")
            #     os.remove(temp_frame_file_path)
            #     continue
            # except Exception as e:
            #     if 'Not Found' not in str(e):
            #         logging.error(f"Failed to check frame {frame_filename}: {str(e)}")
            #         os.remove(temp_frame_file_path)
            #         continue
            
            # Upload frame to Supabase storage
            logging.info(f"Uploading frame {frame_count} to Supabase storage")
            supabase.storage.from_("frames").upload(frame_filename, temp_frame_file_path)
            
            # Generate embedding for the frame
            image = Image.open(temp_frame_file_path)
            embedding = generate_embedding(image)
            
            # Get the timestamp in ISO 8601 format
            timestamp_ms = cap.get(cv2.CAP_PROP_POS_MSEC)
            timestamp = (datetime(1970, 1, 1) + timedelta(milliseconds=timestamp_ms)).isoformat() + 'Z'
            
            # Insert frame record into frames_records table
            frame_record = {
                "id": str(uuid4()),
                "video_uuid": video_uuid,
                "video_id": video_id,
                "frame_number": frame_count,
                "storage_path": frame_filename,
                "created_at": datetime.utcnow().isoformat(),
                "timestamp": timestamp,  # Timestamp in ISO 8601 format
                "embedding": embedding.tolist()  # Store the embedding
            }
            logging.info(f"Inserting frame record for frame {frame_count} into database")
            supabase.from_("frames_records").insert(frame_record).execute()
            
            # Clean up the temporary file
            os.remove(temp_frame_file_path)
        
        success, frame = cap.read()
        frame_count += 1
    
    cap.release()
    logging.info(f"Finished extracting frames for video ID: {video_id}")

def fetch_video_ids():
    logging.info("Fetching video IDs and UUIDs from database")
    response = supabase.from_("youtube").select("video_id, id").limit(40).execute()
    video_data = {(item['video_id'], item['id']) for item in response.data}  # Use a set to remove duplicates
    logging.info("Video IDs and UUIDs fetched successfully")
    return list(video_data)

def main(interval=1):
    logging.info("Starting main process")
    video_data = fetch_video_ids()
    print("VIDEO IDS", len(video_data))  # works until here, able to grab video ids 
    for video_id, id in video_data:
        youtube_url = f"https://www.youtube.com/watch?v={video_id}"
        video_data = download_youtube_video(youtube_url) 
        
        if video_data is None:  # Check if download failed
            logging.warning(f"Skipping video ID {video_id} due to download failure.")
            continue  # Skip to the next video
        
        # Save video_data to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video_file:
            temp_video_file.write(video_data.getbuffer())
            temp_video_file_path = temp_video_file.name
        
        # # Check if video already exists in storage
        # try:
        #     supabase.storage.from_("videos").download(f"{video_id}.mp4")
        #     logging.warning(f"Video {video_id} already exists in storage. Skipping upload.")
        #     os.remove(temp_video_file_path)
        #     continue
        # except Exception as e:
        #     if 'Not Found' not in str(e):
        #         logging.error(f"Failed to check video {video_id}: {str(e)}")
        #         os.remove(temp_video_file_path)
        #         continue
        
        # Upload video to Supabase storage
        logging.info(f"Uploading video {video_id} to Supabase storage")
        supabase.storage.from_("videos").upload(f"{video_id}.mp4", temp_video_file_path)
        
        extract_frames_and_upload(video_id, id, temp_video_file_path, interval)
        
        # Clean up the temporary file
        os.remove(temp_video_file_path)
        
    logging.info("Main process completed")

if __name__ == "__main__":
    interval = 1
    main(interval)