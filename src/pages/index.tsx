import { useEffect, useState } from 'react'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

interface ChatProps {
  children: React.ReactNode;
}

export interface ChatMessage {
  content: string;
  role: string;
  audio?: string;
}

const Chat: React.FC<ChatProps> = ({ children }) => {
  return (
    <div className="flex flex-col flex-grow h-0 p-4 overflow-auto bg-white">
      {children}
    </div>
  );
};

const GPTMessage: React.FC<ChatMessage> = ({ content, audio }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = () => {
    if (audio) {
      const audioObj = new Audio(`data:audio/mpeg;base64,${audio}`);
      setIsPlaying(true);
      audioObj.play().then(() => {
        setIsPlaying(false);
      });
    }
  };

  return (
    <div className="flex w-full mt-2 space-x-3 max-w-xs">
      <div className='flex'>
        <button
          className="mr-2 max-h-8 bg-blue-500 text-white px-2 py-1 rounded"
          onClick={handlePlayAudio}
          disabled={!audio || isPlaying}
        >
          {isPlaying ? 'Playing...' : 'Play'}
        </button>
        <div className="bg-gray-400 text-white p-3 rounded-r-lg rounded-bl-lg">
          <p className="text-base">{content}</p>
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
          <p className="text-base">{content}</p>
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
      <div className="flex items-center w-full">
        <input
          className="flex-grow h-10 rounded-l px-3 text-black text-base"
          type="text"
          placeholder="Type your message…"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r">
          Send
        </button>
      </div>
    </form>
  );
};

export default function Home() {
  const [chat, setChat] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const initialMessage = {
      role: 'assistant',
      content: 'Hello and welcome to Pizza GPT. What can I get for you?'
    }
    const fetchInitialAudio = async () => {
      const res = await fetch(`/api/getAudio`);
      const responseObject = await res.json();

      // Play the received audio
      const audio = new Audio(`data:audio/mpeg;base64,${responseObject.audio}`);
      audio.play();
      const responseMessage = { ...initialMessage, audio: responseObject.audio };
      return responseMessage
    };

    const setInitialChat = async () => {
      const gptResponse = await fetchInitialAudio();
      setChat([gptResponse]);
    };

    setInitialChat();
  }, []);

  const sendChat = async (messages: ChatMessage[]) => {
    // Strip all audio before sending to backend
    const strippedMessages = messages.map((message) => {
      return {
        content: message.content,
        role: message.role,
      };
    });

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: strippedMessages
      })
    })
    const responseObject = await res.json()
    // Play the received audio
    const audio = new Audio(`data:audio/mpeg;base64,${responseObject.audio}`);
    audio.play();
    const responseMessage = { content: responseObject.message, role: "assistant", audio: responseObject.audio };
    return responseMessage
  }

  const handleNewMessage = async (userMessage: ChatMessage) => {
    // Update the chat state with the user message
    setChat((prevChat) => [...prevChat, userMessage]);
    // Call sendMessage with the user message and wait for the GPT response
    const gptResponse = await sendChat([...chat, userMessage]);
    setChat((prevChat) => [...prevChat, gptResponse]);
  }

  return (
    <main className={`flex flex-col items-center justify-center w-full min-h-screen bg-gray-100 text-gray-800 p-0 md:p-8 ${inter.className}`}>
      <div className="flex flex-col flex-grow w-full max-w-xl bg-white shadow-xl rounded-lg overflow-hidden">
        <Chat>
          {chat
            .map((msg, index) =>
              msg.role === "assistant" ? (
                <GPTMessage key={index} content={msg.content} role={msg.role} audio={msg.audio} />
              ) : (
                <UserMessage key={index} content={msg.content} role={msg.role} />
              ),
            )}
        </Chat>

        <Input onSubmit={handleNewMessage} role="user" />
      </div>
    </main>
  );
}

