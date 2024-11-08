import { useCallback, useEffect, useState } from 'react';
import { Role } from './enums/index';
import { Conversations } from './types';
import { ChatUI } from './components/ChatUI';
import { useWebSocket } from './hooks/WebSocketContextProvider';

function App() {
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const { socket, sendChatMessage } = useWebSocket();

  // Initalizing the chat conversations with an assistant message
  const [chatConversations, setChatConversations] = useState<Conversations>([
    {
      id: '1',
      role: Role.ASSISTANT,
      message: 'Hello, I am Check-in Charlie! How can I help you today?',
    },
  ]);

  const handleSubmit = useCallback(
    (value: string) => {
      setIsQuerying(true);
      setChatConversations((conversations) => [
        ...conversations,
        {
          id: (conversations.length + 1).toString(),
          role: Role.USER,
          message: value,
        },
      ]);

      sendChatMessage(value);
    },
    [sendChatMessage],
  );

  useEffect(() => {
    if (socket) {
      socket.on('chat_response', (response: string) => {
        setIsQuerying(false);
        setChatConversations((conversations) => [
          ...conversations,
          {
            id: (conversations.length + 1).toString(),
            role: Role.ASSISTANT,
            message: response,
          },
        ]);
      });
    }
  }, [socket]);

  return (
    <ChatUI
      isQuerying={isQuerying}
      onSubmit={handleSubmit}
      disabled={isQuerying}
      conversations={chatConversations}
    />
  );
}

export default App;
