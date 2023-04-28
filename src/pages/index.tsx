import { useState } from 'react'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { initialMessage } from './initialMessage'
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from 'openai'

const inter = Inter({ subsets: ['latin'] })

// let messages = [initialMessage]

// const sendChat = async (message: string) => {
//   const newMessageObject: ChatCompletionRequestMessage = {
//     role: "user", 
//     content: message
//   }
//   messages = [...messages, newMessageObject]
//   const res = await fetch("/api/chat", {
//     method: "POST", 
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       messages
//     })
//   })
//   const responseMessageObject: ChatCompletionRequestMessageRoleEnum = {
//     role: res.role,

//   }
//   messages = [
//     ...messages,
//     res
//   ]
// }

interface ChatProps {
  children: React.ReactNode;
}

const Chat: React.FC<ChatProps> = ({ children }) => {
  return (
    <div className="flex flex-col flex-grow h-0 p-4 overflow-auto">
      {children}
    </div>
  );
};

interface MessageProps {
  message: string;
  role: 'gpt' | 'user';
}

const GPTMessage: React.FC<MessageProps> = ({ message }) => {
  return (
    <div className="flex w-full mt-2 space-x-3 max-w-xs">
      <div>
        <div className="bg-gray-300 p-3 rounded-r-lg rounded-bl-lg">
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

const UserMessage: React.FC<MessageProps> = ({ message }) => {
  return (
    <div className="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end">
      <div>
        <div className="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg">
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

const Input: React.FC<{ onSubmit: (message: string, role: 'gpt' | 'user') => void; role: 'gpt' | 'user' }> = ({ onSubmit, role }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(inputValue, role);
    setInputValue('');
  };

  return (
    <form className="bg-gray-300 p-4" onSubmit={handleSubmit}>
      <input
        className="flex items-center h-10 w-full rounded px-3 text-black text-sm"
        type="text"
        placeholder="Type your message…"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
    </form>
  );
};

export default function Home() {
  const [messages, setMessages] = useState<MessageProps[]>([
    { message: 'Hello, this is a GPT message.', role: 'gpt' },
    { message: 'Hello, this is a User message.', role: 'user' },
  ]);

  const handleNewMessage = (message: string, role: 'gpt' | 'user') => {
    setMessages([...messages, { message, role }]);
  };

  return (
    <main className={`flex min-h-screen flex-col flex-grow w-full max-w-full bg-white shadow-xl rounded-lg justify-between p-24 ${inter.className}`}>
      <Chat>
        {messages.map((msg, index) =>
          msg.role === 'gpt' ? (
            <GPTMessage key={index} message={msg.message} role={msg.role} />
          ) : (
            <UserMessage key={index} message={msg.message} role={msg.role} />
          ),
        )}
      </Chat>

      <Input onSubmit={handleNewMessage} role="user" />
    </main>
  );
}
