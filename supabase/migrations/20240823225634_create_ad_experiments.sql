-- Create enums
CREATE TYPE ad_status AS ENUM ('Draft', 'In Review', 'Active');
CREATE TYPE political_leaning AS ENUM ('left', 'center-left', 'center', 'center-right', 'right');
CREATE TYPE campaign_objective AS ENUM ('awareness', 'consideration', 'conversion');
CREATE TYPE ad_platform AS ENUM ('Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube');

-- Create the table
CREATE TABLE ad_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    objective campaign_objective NOT NULL,
    budget DECIMAL(10, 2) NOT NULL,
    duration INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_audience JSONB NOT NULL,
    ad_content JSONB NOT NULL,
    platforms ad_platform[] NOT NULL,
    political_leaning political_leaning NOT NULL,
    key_components TEXT[] NOT NULL,
    status ad_status NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_ad_experiments_modtime
BEFORE UPDATE ON ad_experiments
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Insert dummy data
INSERT INTO ad_experiments (
    title, description, objective, budget, duration, start_date, end_date,
    target_audience, ad_content, platforms, political_leaning, key_components, status
) VALUES
(
    'Economic Policy Ad',
    'Highlighting our economic plan',
    'awareness',
    5000.00,
    30,
    '2023-07-01',
    '2023-07-30',
    '{"age": ["25-34", "35-44"], "gender": ["male", "female"], "interests": ["economy", "jobs"], "location": "Nationwide"}',
    '{"headline": "Building a Stronger Economy", "body": "Our plan focuses on job creation and sustainable growth.", "callToAction": "Learn More", "image": null}',
    ARRAY['Facebook', 'Twitter']::ad_platform[],
    'center',
    ARRAY['Economy', 'Jobs', 'Taxes'],
    'Draft'
),
(
    'Environmental Initiative',
    'Promoting green energy policies',
    'consideration',
    3000.00,
    20,
    '2023-07-15',
    '2023-08-03',
    '{"age": ["18-24", "25-34"], "gender": ["male", "female", "other"], "interests": ["environment", "climate change"], "location": "Urban Areas"}',
    '{"headline": "Green Future, Bright Tomorrow", "body": "Join us in building a sustainable future with clean energy.", "callToAction": "Support Now", "image": null}',
    ARRAY['Instagram', 'TikTok']::ad_platform[],
    'left',
    ARRAY['Climate Change', 'Renewable Energy', 'Conservation'],
    'In Review'
),
(
    'Healthcare Reform',
    'Outlining healthcare policy changes',
    'conversion',
    7000.00,
    45,
    '2023-08-01',
    '2023-09-14',
    '{"age": ["35-44", "45-54", "55+"], "gender": ["male", "female"], "interests": ["healthcare", "policy"], "location": "Swing States"}',
    '{"headline": "Healthcare for All", "body": "Our comprehensive plan ensures quality healthcare for every citizen.", "callToAction": "Get Involved", "image": null}',
    ARRAY['Facebook', 'YouTube', 'LinkedIn']::ad_platform[],
    'center-left',
    ARRAY['Medicare', 'Insurance', 'Prescription Drugs'],
    'Active'
);