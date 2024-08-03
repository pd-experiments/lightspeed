-- Delete rows where summary is less than 15 words
DELETE FROM public.news
WHERE array_length(regexp_split_to_array(summary, '\s+'), 1) < 15;

-- Delete rows where summary or text is empty or null
DELETE FROM public.news
WHERE summary IS NULL OR summary = '' OR text IS NULL OR text = '';