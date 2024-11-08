import { useEffect, useState } from 'react';
import { Loading } from 'react-daisyui';
import { ChatMessage } from './ChatMessage';
import { Conversations } from '../types';
import { Role } from '../enums';

interface ChatConversationsProps {
  conversations: Conversations;
  isQuerying: boolean;
}

export const ChatConversations = ({
  conversations,
  isQuerying,
}: ChatConversationsProps) => {
  const [latestAssistantMessageId, setLatestAssistantMessageId] = useState<
    string | null
  >(null);

  // Detect the latest assistant message
  useEffect(() => {
    const lastAssistantMessage = conversations
      .filter((msg) => msg.role === Role.ASSISTANT)
      .slice(-1)[0];

    if (lastAssistantMessage) {
      setLatestAssistantMessageId(lastAssistantMessage.id);
    }
  }, [conversations]);

  return (
    <div className="mb-4 flex w-2/3 flex-col px-4">
      {conversations &&
        conversations.map((chatEntry) => (
          <ChatMessage
            key={`chatbot-message-${chatEntry.id}`}
            message={chatEntry}
            is_latest_message={chatEntry.id === latestAssistantMessageId}
          />
        ))}
      {isQuerying && (
        <Loading className="ml-16 mt-4" variant="dots" size="lg" />
      )}
    </div>
  );
};
