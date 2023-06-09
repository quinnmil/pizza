import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';

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

    const { messages } = req.body;

    try {
        const chatGPTResponse = await openai.createChatCompletion({
            model: 'gp-3.5-turbo',
            messages: messages,
            max_tokens: 2048,
            n: 1,
            stop: '\n',
        });
        const chatGPTMessage = chatGPTResponse.data.choices[0].message

        console.log(chatGPTMessage)

        res.status(200).json({ message: chatGPTMessage })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}
