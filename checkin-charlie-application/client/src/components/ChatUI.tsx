import { ReactNode, useRef } from 'react';
import { ChatConversations } from './ChatConversations';
import { ChatInput } from './ChatInput';
import { Conversations } from '../types';
import { useWebSocket } from '@/hooks/WebSocketContextProvider';

interface ChatUIProps {
  isQuerying: boolean;
  onSubmit: (value: string) => void;
  disabled: boolean;
  conversations: Conversations;
  customSubmitIcon?: ReactNode;
}

export const ChatUI = ({
  disabled,
  conversations,
  isQuerying,
  onSubmit,
}: ChatUIProps) => {
  const { videoSrc } = useWebSocket();
  const videoRef = useRef<HTMLImageElement>(null);

  return (
    <div className="flex h-screen flex-row bg-neutral-100">
      <div className="flex h-full w-1/3 items-center justify-center bg-gray-100">
        {videoSrc ? (
          <img
            ref={videoRef}
            src={videoSrc}
            alt="Live Video Feed"
            className="h-72 w-72 object-cover"
          />
        ) : (
          <p>Loading video feed...</p>
        )}
      </div>
      <div className="flex h-full w-full flex-col items-center justify-between">
        <div className="mt-12 flex w-full justify-center overflow-y-scroll pb-8">
          <ChatConversations
            conversations={conversations}
            isQuerying={isQuerying}
          />
        </div>
        <div className="mb-12 flex w-full items-center justify-center">
          <ChatInput disabled={disabled} onSubmit={onSubmit} />
        </div>
      </div>
    </div>
  );
};
