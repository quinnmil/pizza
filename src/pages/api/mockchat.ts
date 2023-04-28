import { NextApiRequest, NextApiResponse } from 'next';
import { ChatMessage } from '..';

type Data = {
  response: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === 'POST') {
    try {
      const chat: ChatMessage[] = req.body.chatHistory;

      // Process the chat messages and generate a GPT response
      let gptResponse = 'gptResponse was undefined';
      const lastMessage: ChatMessage | undefined = chat.slice(-1).pop()
      if (lastMessage?.role == "system") {
        gptResponse = 'This is a sample response from GPT.';
      } else {
        gptResponse = `GPT answer. Last msg: ${lastMessage?.content}`;
      }

      res.status(200).json({ response: gptResponse });
    } catch (error) {
      res.status(500).json({ response: 'Error processing request.' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

