import fetch from 'node-fetch';
import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';
import { initialMessage }  from '../../initialMessage';
import type { ChatCompletionRequestMessage } from 'openai'

const elevenLabApiKey = process.env.ELEVENLABS_API_KEY as string;
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { messages } = (req.body)
    const messageObjects = [initialMessage, ...messages]
    try {
        const chatGPTResponse = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: messageObjects,
            max_tokens: 2048,
            n: 1,
            stop: '\n',
        });
        const chatGPTMessage = chatGPTResponse.data.choices[0].message

        console.log(chatGPTMessage)

      // Make the text-to-speech API call
      const textToSpeechRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'audio/mpeg',
          'xi-api-key': elevenLabApiKey,
        },
        body: JSON.stringify({
          text: chatGPTMessage?.content,
          voice_settings: {
            stability: 0,
            similarity_boost: 0
          }
        }),
      });

      // Get the audio response
      const audioBuffer = await textToSpeechRes.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');

        res.status(200).json({ message: chatGPTMessage?.content, audio: audioBase64})
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}
