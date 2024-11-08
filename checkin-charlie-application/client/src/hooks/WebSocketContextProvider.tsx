import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketContextProviderType {
  socket: Socket | null;
  videoSrc: string | null;
  sendChatMessage: (message: string) => void;
  sendAudioForTranscription: (audioBlob: Blob) => void;
}

const WebSocketContext = createContext<WebSocketContextProviderType>({
  socket: null,
  videoSrc: null,
  sendChatMessage: () => {},
  sendAudioForTranscription: () => {},
});

interface WebSocketContextProviderProps {
  children: React.ReactNode | React.ReactNode[];
}

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketContextProvider = ({
  children,
}: WebSocketContextProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io('http://127.0.0.1:5000');

    newSocket.on('connect', () => {
      console.log('Socket.IO connection established');
      newSocket.emit('request_frame');
    });

    newSocket.on('frame', (data: string) => {
      setVideoSrc(`data:image/jpeg;base64,${data}`);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.IO connection closed');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendChatMessage = (message: string) => {
    if (socket) {
      socket.emit('chat_message', message);
    }
  };

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    if (socket) {
      socket.emit('transcribe', audioBlob);
    }
  };

  return (
    <WebSocketContext.Provider
      value={{ socket, videoSrc, sendChatMessage, sendAudioForTranscription }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
