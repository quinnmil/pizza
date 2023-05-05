import fetch from 'node-fetch';
import { NextApiRequest, NextApiResponse } from 'next';

const elevenLabApiKey = process.env.ELEVENLABS_API_KEY as string;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { text } = (req.body)
    try {
      // Make the text-to-speech API call
      const textToSpeechRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'audio/mpeg',
          'xi-api-key': elevenLabApiKey,
        },
        body: JSON.stringify({
          text: text,
          voice_settings: {
            stability: 0,
            similarity_boost: 0
          }
        }),
      });

      // Get the audio response
      const audioBuffer = await textToSpeechRes.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');

        res.status(200).json({ audio: audioBase64})
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}
