import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    const { stdout, stderr } = await execAsync(`python scripts/compliance_extraction.py "${url}"`);

    if (stdout.includes("Compliance document stored successfully.")) {
      return res.status(200).json({ success: true, message: 'URL processed successfully' });
    } else {
      console.error('Error processing URL:', stdout, stderr);
      return res.status(500).json({ success: false, error: 'Failed to process URL' });
    }
  } catch (error) {
    console.error('Error processing URL:', error);
    return res.status(500).json({ success: false, error: 'Failed to process URL' });
  }
}