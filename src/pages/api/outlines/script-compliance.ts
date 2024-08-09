import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { openai_client } from '@/lib/openai-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { outline_id } = req.body;

  try {
    const { data: outline, error: outlineError } = await supabase
      .from('outline')
      .select('full_script')
      .eq('id', outline_id)
      .single();

    if (outlineError) throw outlineError;

    const { data: complianceDoc, error: complianceError } = await supabase
      .from('compliance_docs')
      .select('text')
      .single();

    if (complianceError) throw complianceError;

    const response = await openai_client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a compliance expert for political advertising.' },
        { role: 'user', content: `Analyze the following script for compliance with FEC rules based on this document:\n${complianceDoc.text}\n\nScript:\n${JSON.stringify(outline.full_script, null, 2)}` }
      ],
      max_tokens: 1500
    });

    const complianceReport = response.choices[0].message.content;

    const { data: report, error: reportError } = await supabase
      .from('compliance_reports')
      .insert([{ outline_id, report: complianceReport }]);

    if (reportError) throw reportError;

    res.status(200).json({ complianceReport });
  } catch (error) {
    console.error('Error checking compliance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}