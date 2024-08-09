import { supabase } from '@/lib/supabaseClient';
import fetch from 'node-fetch';
import { openai_client } from '@/lib/openai-client';

async function fetchAndStoreComplianceDoc() {
  const url = 'https://www.fec.gov/help-candidates-and-committees/advertising-and-disclaimers/';
  const response = await fetch(url);
  const text = await response.text();

  const embeddingsResponse = await openai_client.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });

  const embeddings = embeddingsResponse.data[0].embedding;

  const { data, error } = await supabase
    .from('compliance_docs')
    .insert([{ url, text, embeddings }]);

  if (error) {
    console.error('Error storing compliance document:', error);
  } else {
    console.log('Compliance document stored successfully:', data);
  }
}

fetchAndStoreComplianceDoc();