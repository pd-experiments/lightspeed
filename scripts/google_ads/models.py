from pydantic import BaseModel, UUID4, HttpUrl
from typing import Literal, Any
from datetime import date


class Property(BaseModel):
    label: str | None
    value: str | None


class Targeting(BaseModel):
    category_subheading: str | None
    criterion_included: str | None
    criterion_excluded: str | None


class VersionedGoogleAd(BaseModel):
    id: UUID4
    advertisement_url: HttpUrl
    advertiser_name: str | None
    advertiser_url: HttpUrl | None
    first_shown: date | None
    last_shown: date | None
    days_ran_for: int | None
    format: Literal["Image", "Text", "Video"] | None
    content: str | None
    version: int | None
    targeted_ages: (
        list[Literal["18-24", "25-34", "35-44", "45-54", "55-64", "65+", "Unknown age"]]
        | None
    )
    gender_targeting: dict[str, Any] | None
    geo_targeting: dict[str, Any] | None


class GoogleAd(BaseModel):
    advertisement_url: HttpUrl
    advertiser_name: str | None
    advertiser_url: HttpUrl | None
    properties: list[Property] | None
    age_targeting: Targeting | None
    gender_targeting: Targeting | None
    geo_targeting: Targeting | None
    media_links: list[str] | None
    spend: str | None = None
    impressions: str | None = None


class Transcript(BaseModel):
    text: str
    start: float
    duration: float


class MediaDescription(BaseModel):
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


class EmbeddedGoogleAd(MediaDescription):
    versioned_ad_id: UUID4
    summary_embeddings: list[float]
    advertiser_name_embedding: list[float]
