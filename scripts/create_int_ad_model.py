from typing import Literal
from pydantic import BaseModel, HttpUrl


class Property(BaseModel):
    label: str | None
    value: str | None


class Targeting(BaseModel):
    category_subheading: str | None
    criterion_included: str | None
    criterion_excluded: str | None


class GoogleAd(BaseModel):
    # Supabase model should have created_at and updated_at that are automatically maintained by Supabase
    advertisement_url: HttpUrl
    advertiser_name: str | None
    advertiser_url: HttpUrl | None
    properties: list[Property] | None
    age_targeting: Targeting | None
    gender_targeting: Targeting | None
    geo_targeting: Targeting | None
    media_links: list[str] | None


class Ad(BaseModel):
    # Supabase model should have created_at and updated_at that are automatically maintained by Supabase
    advertisement_url: HttpUrl
    advertiser_name: str | None
    advertiser_url: HttpUrl | None
    source: Literal["Google", "Meta"]
