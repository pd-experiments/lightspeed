-- Create meta_ads table
CREATE TABLE IF NOT EXISTS meta_ads (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    ad_id TEXT UNIQUE NOT NULL,
    ad_url TEXT NOT NULL,
    ad_text TEXT,
    advertiser TEXT,
    spend TEXT,
    impressions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meta_ads_demographics table
CREATE TABLE IF NOT EXISTS meta_ads_demographics (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    ad_id TEXT NOT NULL,
    age TEXT,
    gender TEXT,
    percentage TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (ad_id) REFERENCES meta_ads(ad_id) ON DELETE CASCADE,
    UNIQUE(ad_id, age, gender)
);

-- Create meta_ads_regions table
CREATE TABLE IF NOT EXISTS meta_ads_regions (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    ad_id TEXT NOT NULL,
    region TEXT,
    percentage TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (ad_id) REFERENCES meta_ads(ad_id) ON DELETE CASCADE,
    UNIQUE(ad_id, region)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meta_ads_advertiser ON meta_ads(advertiser);
CREATE INDEX IF NOT EXISTS idx_meta_ads_demographics_ad_id ON meta_ads_demographics(ad_id);
CREATE INDEX IF NOT EXISTS idx_meta_ads_regions_ad_id ON meta_ads_regions(ad_id);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_meta_ads_updated_at
BEFORE UPDATE ON meta_ads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meta_ads_demographics_updated_at
BEFORE UPDATE ON meta_ads_demographics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meta_ads_regions_updated_at
BEFORE UPDATE ON meta_ads_regions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();