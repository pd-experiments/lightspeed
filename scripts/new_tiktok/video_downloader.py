import requests


def download_video(url, output_filename):
    # Send a GET request to the URL
    response = requests.get(url, stream=True)

    # Check if the request was successful
    if response.status_code == 200:
        # Open a file with the given filename in binary write mode
        with open(output_filename, "wb") as file:
            # Iterate over the response content in chunks
            for chunk in response.iter_content(chunk_size=8192):
                # Write each chunk to the file
                file.write(chunk)
        print(f"Video downloaded successfully: {output_filename}")
    else:
        print(f"Failed to download video. Status code: {response.status_code}")


# URL of the video
video_url = "https://v16-webapp-prime.us.tiktok.com/video/tos/useast5/tos-useast5-ve-0068c001-tx/osSDgwWGEeRgISFgmRDAhNDfYS4RBaEhEQDjkw/?a=1988&bti=NDU3ZjAwOg%3D%3D&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=4194&bt=2097&cs=0&ds=3&ft=4KJMyMzm8Zmo0GcXX-4jVk~ZQpWrKsd.&mime_type=video_mp4&qs=0&rc=OWk1N2RlZDhkPDRnZjpmNUBpMzQ2N3Y5cjk2dDMzZzczNEBhYy0tMC81NjYxXy4vMDFfYSNsZGYzMmRrNi9gLS1kMS9zcw%3D%3D&btag=e00090000&expire=1727736688&l=202409282249544EB53707C60B27397C45&ply_type=2&policy=2&signature=ae441e282eb230a47e45528b3b403ce9&tk=tt_chain_token"

# Output filename
output_file = "downloaded_video.mp4"

# Download the video
download_video(video_url, output_file)
