import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';
import { initialMessage } from '../initialMessage';
import type { ChatCompletionRequestMessage } from 'openai'

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
    const newMessageObjects: Array<ChatCompletionRequestMessage> = messages.map((msg: string) => ({
        role: "user", 
        content: msg
    }))
    const messageObjects = [initialMessage, ...newMessageObjects]
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

        res.status(200).json({ message: chatGPTMessage })
    } catch (error) {
        console.error(error.response.status); 
        console.error(error.response.data);
        res.status(500).json({ error: 'Something went wrong' });
    }
}
