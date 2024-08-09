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

    // Execute the Python script
    const { stdout, stderr } = await execAsync(`python scripts/compliance_extraction.py "${url}"`);

    if (stderr) {
      console.error('Error executing Python script:', stderr);
      return res.status(500).json({ success: false, error: 'Failed to process URL' });
    }

    console.log('Python script output:', stdout);

    return res.status(200).json({ success: true, message: 'URL processed successfully' });
  } catch (error) {
    console.error('Error processing URL:', error);
    return res.status(500).json({ success: false, error: 'Failed to process URL' });
  }
}