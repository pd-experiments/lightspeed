import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { openai_client } from '@/lib/openai-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { outline_id, compliance_doc_id } = req.body;

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
    .eq('id', compliance_doc_id)
    .single();

    if (complianceError) throw complianceError;

    const response = await openai_client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a compliance expert for political advertising, specializing in Federal Election Commission (FEC) rules and regulations.' },
          { role: 'user', content: `
      Analyze the following political advertisement script for compliance with the provided regulatory document. Generate a comprehensive and rigorous compliance report addressing the following aspects:
      
      1. Disclaimer requirements
      2. Funding source disclosure
      3. Content accuracy and truthfulness
      4. Fair use of copyrighted material (if applicable)
      5. Equal time provisions (if applicable)
      6. Any other relevant FEC regulations
      
      Regulatory Document:
      ${complianceDoc.text}
      
      Political Advertisement Script:
      ${JSON.stringify(outline.full_script, null, 2)}
      
      Format your response as a JSON object with the following structure:
      
      {
        "aspects": [
          {
            "header": "Aspect Name",
            "issue": "Description of the compliance issue, if any",
            "background": "Relevant background information or context",
            "recommendation": "Suggested corrections or improvements",
            "reference": "Relevant section of the regulatory document"
          },
          // ... repeat for each aspect
        ],
        "overallAssessment": "Summary of compliance status and next steps"
      }
      
      Ensure that the response is a valid JSON object.
      ` }
        ],
        max_tokens: 2000
      });
      
    const complianceReport = JSON.parse(response.choices[0].message.content ?? '{}');

    const { data: updatedOutline, error: updateError } = await supabase
      .from('outline')
      .update({ compliance_report: complianceReport })
      .eq('id', outline_id)
      .select();

    if (updateError) throw updateError;

    res.status(200).json({ complianceReport, updatedOutline });
  } catch (error) {
    console.error('Error checking compliance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}