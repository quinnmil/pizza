import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { ChatMessage } from '..';
// import fetch from 'node-fetch';

// const elevenLabApiKey = process.env.ELEVENLABS_API_KEY as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const chat: ChatMessage[] = req.body.messages;

      // Process the chat messages and generate a GPT response
      const lastMessage: ChatMessage | undefined = chat.slice(-1).pop()
      const gptResponse = `GPT answer. Last msg: ${lastMessage?.content}`;

      // Read the local MP3 file
      const filePath = path.join(process.cwd(), 'public', 'welcome.mp3');
      const audioBuffer = fs.readFileSync(filePath);

      // Make the text-to-speech API call
      // const textToSpeechRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'accept': 'audio/mpeg',
      //     'xi-api-key': elevenLabApiKey,
      //   },
      //   body: JSON.stringify({
      //     text: gptResponse,
      //     voice_settings: {
      //       stability: 0,
      //       similarity_boost: 0
      //     }
      //   }),
      // });

      // Get the audio response
      // const audioBuffer = await textToSpeechRes.arrayBuffer();
      // const audioBase64 = Buffer.from(audioBuffer).toString('base64');

      // Send the response with the message and the MP3 file
      res.setHeader('Content-Type', 'audio/mpeg');
      res.status(200).json({ message: gptResponse, audio: audioBuffer.toString('base64') });
    } catch (error) {
      res.status(500).json({ message: 'Error processing request.' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

