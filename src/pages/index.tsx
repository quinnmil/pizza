import { useState, useEffect } from 'react'
import { Inter } from 'next/font/google'
import { initialMessage } from './initialMessage'

const inter = Inter({ subsets: ['latin'] })

interface ChatProps {
  children: React.ReactNode;
}

export interface ChatMessage {
  content: string;
  role: string;
}

const Chat: React.FC<ChatProps> = ({ children }) => {
  return (
    <div className="flex flex-col flex-grow h-0 p-4 overflow-auto bg-white">
      {children}
    </div>
  );
};

const GPTMessage: React.FC<ChatMessage> = ({ content }) => {
  return (
    <div className="flex w-full mt-2 space-x-3 max-w-xs">
      <div>
        <div className="bg-gray-400 text-white p-3 rounded-r-lg rounded-bl-lg">
          <p className="text-sm">{content}</p>
        </div>
      </div>
    </div>
  );
};

const UserMessage: React.FC<ChatMessage> = ({ content }) => {
  return (
    <div className="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end">
      <div>
        <div className="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg">
          <p className="text-sm">{content}</p>
        </div>
      </div>
    </div>
  );
};

const Input: React.FC<{ onSubmit: (userMessage: ChatMessage) => void; role: string }> = ({ onSubmit, role }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ content: inputValue, role: role });
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
  const [chat, setChat] = useState<ChatMessage[]>([]);

  const sendMessage = async (message: ChatMessage) => {
    let chatHistory = [...chat, message]

    const res = await fetch("/api/mockchat", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chatHistory
      })
    })

    const gptResponse = await res.json()
    const gptMessage: ChatMessage = {
      content: gptResponse.response,
      role: "assistant",
    }

    return gptMessage;
  }

  useEffect(() => {
    const sendInitialMessage = async () => {
      const gptGreeting = await sendMessage(initialMessage);
      setChat((prevChat) => [...prevChat, gptGreeting]);
    };

    sendInitialMessage();
  }, []); // The empty array dependency makes sure this runs only on the initial render


  const handleNewMessage = async (userMessage: ChatMessage) => {
    // Update the chat state with the user message
    setChat((prevChat) => [...prevChat, userMessage]);

    // Call sendMessage with the user message and wait for the GPT response
    const gptMessage = await sendMessage(userMessage);

    // Update the chat state with the GPT response
    setChat((prevChat) => [...prevChat, gptMessage]);
  };

  return (
    <main className={`flex flex-col items-center justify-center w-full min-h-screen bg-gray-100 text-gray-800 p-10 ${inter.className}`}>
      <div className="flex flex-col flex-grow w-full max-w-xl bg-white shadow-xl rounded-lg overflow-hidden">
        <Chat>
          {chat
            .slice(1) // skip the initial system message
            .map((msg, index) =>
              msg.role === "assistant" ? (
                <GPTMessage key={index + 1} content={msg.content} role={msg.role} />
              ) : (
                <UserMessage key={index + 1} content={msg.content} role={msg.role} />
              ),
            )}
        </Chat>

        <Input onSubmit={handleNewMessage} role="user" />
      </div>
    </main>
  );
}

