from pydantic import BaseModel, AnyUrl, HttpUrl, field_validator
from typing import Literal
from uuid import UUID
from datetime import datetime


class RawIGThread(BaseModel):
    id: UUID
    thread_id: str
    text: str | None
    created_at: datetime | None
    likes: int | None
    replies: int | None
    reposts: int | None
    conversation_id: str | None
    username: str | None
    is_verified: bool | None
    hashtag: str | None
    user_profile_pic_url: HttpUrl | None
    user_pk: str | None
    user_id: str | None
    url: AnyUrl | None
    image_urls: list[AnyUrl] | None
    embedding: list[float] | None

    @field_validator("embedding", pre=True)
    def convert_embedding(cls, v):
        if isinstance(v, str):
            try:
                return list(map(float, v.strip("[]").split(",")))
            except ValueError:
                raise ValueError("Embedding string is not properly formatted")
        return v


class IGThreadAISummary(BaseModel):
    ai_summary: str
    political_keywords: list[
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
    political_tones: list[
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
    issues: list[str]


class EnhancedIGThread(IGThreadAISummary):
    thread_id: str
    text: str
    created_at: datetime
    likes: int | None
    replies: int | None
    reposts: int | None
    raw_text_embedding: list[float] | None
    summary_embedding: list[float] | None
    hashtags: list[float] | None
