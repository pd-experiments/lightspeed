import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Failed to parse form data' });
    }
  
    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    try {
      const fileContent = await fs.promises.readFile(file.filepath);
      const { data, error } = await supabase.storage
        .from('compliance-docs')
        .upload(`${Date.now()}_${file.originalFilename}`, fileContent);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
      .from('compliance-docs')
      .getPublicUrl(data.path);
    
      await new Promise(resolve => setTimeout(resolve, 1000));
    
      const { stdout, stderr } = await execAsync(`python scripts/compliance_pdf_extraction.py "${publicUrl}"`);

      if (stdout.includes("Compliance document stored successfully.")) {
        return res.status(200).json({ success: true, message: 'URL processed successfully' });
      } else {
        console.error('Error processing URL:', stdout, stderr);
        return res.status(500).json({ success: false, error: 'Failed to process URL' });
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      return res.status(500).json({ success: false, error: 'Failed to process PDF' });
    }
  });
}