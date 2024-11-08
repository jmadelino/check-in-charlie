import { Role } from '../enums';
import { Message } from '../types';
import { Bot, User } from 'lucide-react';
import { ChatAvatar } from './ChatAvatar';
import Typewriter from 'typewriter-effect';

interface ChatMessageProps {
  message: Message;
  is_latest_message: boolean;
}

export const ChatMessage = ({
  message,
  is_latest_message,
}: ChatMessageProps) => {
  const isAssistant = message.role !== Role.USER;

  // Depending on the message role, render the message differently
  return isAssistant ? (
    <div className="flex flex-row items-center gap-4 py-4">
      <div className="flex items-center gap-4 self-start">
        <ChatAvatar>
          <Bot className="h-6 w-6 stroke-white" />
        </ChatAvatar>
        <h4 className="select-none text-lg font-semibold">Charlie</h4>
      </div>
      {is_latest_message ? (
        <Typewriter
          options={{
            strings: [message.message],
            autoStart: true,
            delay: 10,
            loop: true,
            deleteSpeed: Infinity,
          }}
        />
      ) : (
        <div className="text-md whitespace-pre-wrap break-all">
          {message.message}
        </div>
      )}
    </div>
  ) : (
    <div className="mt-4 flex flex-row items-center justify-end gap-4">
      <div className="text-md flex items-center whitespace-pre-wrap break-all rounded-3xl bg-gray-300 px-5 py-2.5">
        {message.message}
      </div>
      <div className="flex items-center gap-4 self-start">
        <h4 className="select-none text-lg font-semibold">You</h4>
        <ChatAvatar>
          <User className="h-6 w-6 stroke-white" />
        </ChatAvatar>
      </div>
    </div>
  );
};
