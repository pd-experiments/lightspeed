from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class Validate(BaseModel):
    satisfies_contraints: bool


class TikTokTrend(BaseModel):
    hashtag: str
    link: str


class TikTokAuthor(BaseModel):
    id: str
    unique_id: str
    nickname: str
    avatar_img: Optional[str]
    signature: Optional[str]
    verified: Optional[bool]
    private_account: Optional[bool]
    follower_count: Optional[int]
    following_count: Optional[int]
    video_count: Optional[int]
    heart_count: Optional[int]
    friend_count: Optional[int]

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id=data["id"],
            unique_id=data["uniqueId"],
            nickname=data["nickname"],
            avatar_img=data.get("avatarLarger"),
            signature=data.get("signature"),
            verified=data.get("verified"),
            private_account=data.get("privateAccount"),
            follower_count=data.get("followerCount"),
            following_count=data.get("followingCount"),
            video_count=data.get("videoCount"),
            heart_count=data.get("heartCount"),
            friend_count=data.get("friendCount"),
        )


class TikTokVideo(BaseModel):
    video_created_at: datetime
    id: str
    author: TikTokAuthor
    caption: str
    hashtags: list[str]
    address: Optional[str]
    comment_count: Optional[int]
    play_count: Optional[int]
    share_count: Optional[int]
    audio_url: Optional[str]
    video_url: Optional[str]
    duration: Optional[int]
    is_trending: bool

    @classmethod
    def from_dict(cls, data: dict, is_trending: bool = False):
        return cls(
            id=data["id"],
            author=TikTokAuthor.from_dict(data["author"]),
            caption=data["desc"],
            video_created_at=datetime.fromtimestamp(int(data["createTime"])),
            hashtags=[
                challenge["title"].encode("utf-8").decode("unicode_escape")
                for challenge in data.get("challenges", [])
            ],
            comment_count=data.get("stats", {}).get("commentCount"),
            play_count=data.get("stats", {}).get("playCount"),
            share_count=data.get("stats", {}).get("shareCount"),
            audio_url=data.get("music", {}).get("playUrl"),
            duration=data.get("music", {}).get("duration"),
            video_url=data.get("video", {}).get("playAddr"),
            address=data.get("poi", {}).get("address"),
            is_trending=is_trending,
        )


class TikTokComment(BaseModel):
    id: str
    video_id: str
    content: str
    comment_created_at: datetime
    digg_count: Optional[int]
    reply_count: Optional[int]

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id=data["cid"],
            video_id=data["aweme_id"],
            content=data["text"].encode("ascii", "ignore").decode("ascii"),
            comment_created_at=datetime.fromtimestamp(data["create_time"]),
            digg_count=data.get("digg_count"),
            reply_count=data.get("reply_comment_total"),
        )
