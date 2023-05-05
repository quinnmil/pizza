import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {

      // Read the local MP3 file
      const filePath = path.join(process.cwd(), 'public', 'welcome.mp3');
      const audioBuffer = fs.readFileSync(filePath);

      // Send the response with the message and the MP3 file
      res.setHeader('Content-Type', 'audio/mpeg');
      res.status(200).json({ audio: audioBuffer.toString('base64') });
    } catch (error) {
      res.status(500).json({ message: 'Error processing request.' });
    }
  } else {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
  }
}

