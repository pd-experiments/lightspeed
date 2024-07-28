import os
import logging
from pytube import YouTube
from supabase import create_client, Client
from io import BytesIO
from uuid import uuid4
from datetime import datetime
import torch
import torchvision.transforms as transforms
from PIL import Image
from torchvision.models import resnet50

import cv2

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")
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
    yt = YouTube(url)
    stream = yt.streams.filter(file_extension='mp4').first()
    video_data = BytesIO()
    stream.stream_to_buffer(video_data)
    video_data.seek(0)
    logging.info("Download complete")
    return video_data

def generate_embedding(image):
    logging.info("Generating embedding for the frame")
    image = preprocess(image)
    image = image.unsqueeze(0)  # Add batch dimension
    
    with torch.no_grad():
        embedding = model(image)
    
    logging.info("Embedding generated")
    return embedding.squeeze().numpy()

def extract_frames_and_upload(video_id, video_data, interval=1):
    logging.info(f"Extracting frames from video ID: {video_id}")
    cap = cv2.VideoCapture(video_data)
    frame_count = 0
    success, frame = cap.read()
    
    while success:
        if frame_count % interval == 0:
            frame_filename = f"frame_{frame_count}.jpg"
            is_success, buffer = cv2.imencode(".jpg", frame)
            frame_data = BytesIO(buffer)
            
            # Upload frame to Supabase storage
            logging.info(f"Uploading frame {frame_count} to Supabase storage")
            supabase.storage().from_("frames").upload(frame_filename, frame_data)
            
            # Generate embedding for the frame
            image = Image.open(frame_data)
            embedding = generate_embedding(image)
            
            # Insert frame record into frames_records table
            frame_record = {
                "id": str(uuid4()),
                "video_id": video_id,
                "frame_number": frame_count,
                "storage_path": frame_filename,
                "created_at": datetime.utcnow().isoformat(),
                "embedding": embedding.tolist()  # Store the embedding
            }
            logging.info(f"Inserting frame record for frame {frame_count} into database")
            supabase.from_("frames_records").insert(frame_record).execute()
        
        success, frame = cap.read()
        frame_count += 1
    
    cap.release()
    logging.info(f"Finished extracting frames for video ID: {video_id}")

def fetch_video_ids():
    logging.info("Fetching video IDs from database")
    response = supabase \
        .from_("youtube") \
        .select("video_id") \
        .join("video_embeddings", "youtube.id", "video_embeddings.video_uuid") \
        .execute()
    
    if response.error:
        raise Exception(f"Error fetching video IDs: {response.error.message}")
    
    logging.info("Video IDs fetched successfully")
    return [item["video_id"] for item in response.data]

def main(interval=1):
    logging.info("Starting main process")
    video_ids = fetch_video_ids()
    for video_id in video_ids:
        youtube_url = f"https://www.youtube.com/watch?v={video_id}"
        video_data = download_youtube_video(youtube_url)
        
        # Upload video to Supabase storage
        logging.info(f"Uploading video {video_id} to Supabase storage")
        supabase.storage().from_("videos").upload(f"{video_id}.mp4", video_data)
        
        extract_frames_and_upload(video_id, video_data, interval)
    logging.info("Main process completed")

if __name__ == "__main__":
    interval = 1
    main(interval)