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

const playInitialAudio = async () => {
  const res = await fetch(`/api/getAudio`);
  const responseObject = await res.json();

  // Play the received audio
  const audio = new Audio(`data:audio/mpeg;base64,${responseObject.audio}`);
  audio.play();
};

export default function Home() {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(true);

  const handleToggleSpeech = () => {
    setIsSpeaking(!isSpeaking);
  }
  useEffect(() => {
    const initialMessage = {
      role: 'assistant',
      content: 'Hello and welcome to Pizza GPT. What can I get for you?'
    }

    setChat([initialMessage]);
    if (isSpeaking) {
      playInitialAudio()
    }
  }, []);

  const getSpeech = async (text: string): Promise<string> => {
    const res = await fetch("/api/speech", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text
      })
    })
    const resObject = await res.json()
    return resObject.audio
  }

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

    const audio = isSpeaking ? await getSpeech(responseObject.message) : '';
    console.log("IS SPEAKING: ", isSpeaking)
    // Play the received audio
    if (isSpeaking && audio) {
      const audioFile = new Audio(`data:audio/mpeg;base64,${audio}`);
      audioFile.play();
    }
    return {
      content: responseObject.message,
      role: "assistant",
      audio
    };
  };
  
  const handleNewMessage = async (userMessage: ChatMessage) => {
    // Update the chat state with the user message
    setChat((prevChat) => [...prevChat, userMessage]);
    // Call sendMessage with the user message and wait for the GPT response
    const gptResponse = await sendChat([...chat, userMessage]);
    setChat((prevChat) => [...prevChat, gptResponse]);
  }

return (
  <main className={`flex flex-col items-center justify-center w-full min-h-screen bg-gray-100 text-gray-800 p-0 md:p-8 ${inter.className}`}>
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
    <label className="relative inset-x-0 bottom-3 inline-flex items-center cursor-pointer">
      <input type="checkbox" value="" className="sr-only peer" checked={isSpeaking} onChange={handleToggleSpeech} />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
      </div>
      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Speech</span>
    </label>
    <Input onSubmit={handleNewMessage} role="user" />

  </main>
);
}

