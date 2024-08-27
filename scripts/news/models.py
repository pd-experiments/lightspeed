from datetime import datetime
from typing import Literal
from pydantic import BaseModel, HttpUrl


class RawArticle(BaseModel):
    source_url: HttpUrl
    url: HttpUrl
    title: str
    authors: list[str]
    publish_date: datetime | None
    summary: str
    text: str
    html: str | None
    article_html: str | None
    movies: list[str]
    keywords: list[str]
    meta_keywords: list[str]
    tags: list[str]


class NewsValidationResponse(BaseModel):
    is_relevant: bool


class NewsAISummary(BaseModel):
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


class FilteredArticle(NewsAISummary):
    source_url: HttpUrl
    url: HttpUrl
    title: str
    authors: list[str]
    publish_date: datetime | None
    summary_embedding: list[float]
