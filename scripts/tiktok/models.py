from datetime import date, datetime
from pydantic import BaseModel
from typing import List, Literal, Optional
from uuid import UUID


class TikTokComment(BaseModel):
    text: str | None
    likes: int | None


class TikTokVideoData(BaseModel):
    video_id: str
    author: str | None
    caption: str | None
    hashtags: list[str] | None
    topic: str | None
    views: int | None
    created_at: datetime | None
    comments: list[TikTokComment] | None


class TikTokAISummaries(BaseModel):
    summary: str
    keywords: list[
        Literal[
            "Unknown",
            "Immigration",
            "Gun Rights",
            "Healthcare",
            "Climate Change",
            "Economy",
            "Education",
            "National Security",
            "Tax Policy",
            "Social Security",
            "Abortion",
            "Civil Rights",
            "Criminal Justice Reform",
            "Foreign Policy",
            "Voting Rights",
            "Labor Rights",
            "LGBTQ+ Rights",
            "Drug Policy",
            "Infrastructure",
            "Trade Policy",
            "Government Spending",
        ]
    ]
    political_leaning: Literal[
        "Unknown",
        "Faith and Flag Conservatives",
        "Committed Conservatives",
        "Populist Right",
        "Ambivalent Right",
        "Moderate",
        "Outsider Left",
        "Democratic Mainstays",
        "Establishment Liberals",
        "Progressive Left",
    ]
    tone: list[
        Literal[
            "Unknown",
            "Attack on Opponent(s)",
            "Patriotic",
            "Fearmongering",
            "Optimistic",
            "Future-Building",
            "Anger",
            "Compassionate",
            "Authoritative",
        ]
    ]


class TikTokVideoDataWithEmbeddings(TikTokVideoData, TikTokAISummaries):
    caption_embedding: list[float] | None
    summary_embedding: list[float] | None
