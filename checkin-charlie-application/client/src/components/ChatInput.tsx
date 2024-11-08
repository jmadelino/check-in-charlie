import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, SendHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useWebSocket } from '@/hooks/WebSocketContextProvider';

interface ChatInputProps {
  disabled: boolean;
  onSubmit: (value: string) => void;
}

export const ChatInput = ({ disabled, onSubmit }: ChatInputProps) => {
  const [value, setValue] = useState('');
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const [transcribing, setTranscribing] = useState<boolean>(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const tempValue = useRef<string>('');
  const maxHeight = 13 * 16; // 13rem in pixels

  const handleSubmit = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      if (value.trim().length > 0) {
        onSubmit(value);
        setValue('');
        if (textAreaRef.current) {
          textAreaRef.current.style.height = 'auto';
          setIsOverflowing(false);
        }
      }
    },
    [onSubmit, value],
  );

  const handleEnterKey = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        handleSubmit(e);
      }
    },
    [handleSubmit],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
    },
    [],
  );

  // Auto resize text area height as you type
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto'; // Reset height
      const scrollHeight = textAreaRef.current.scrollHeight;

      if (scrollHeight > maxHeight) {
        textAreaRef.current.style.height = `${maxHeight}px`;
        setIsOverflowing(true);
      } else {
        textAreaRef.current.style.height = `${scrollHeight}px`;
        setIsOverflowing(false);
      }
    }
  }, [value, maxHeight]);

  const { socket, sendAudioForTranscription } = useWebSocket();

  const toggleRecording = useCallback(async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorderRef.current = new MediaRecorder(stream);

        const audioChunks: Blob[] = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        // Once the recording stops, send the audio chunks to the server
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          sendAudioForTranscription(audioBlob);
        };

        mediaRecorderRef.current.onerror = (event) => {
          console.error('MediaRecorder error:', event);
          stopRecording();
        };

        tempValue.current = value;
        mediaRecorderRef.current.start();
        setRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    } else {
      stopRecording();
    }
  }, [recording, sendAudioForTranscription, value]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setTranscribing(true);
      setRecording(false);
      setValue('');
    }
  }, []);

  // useEffect to handle transcription results
  useEffect(() => {
    if (socket) {
      socket.on('transcription_result', (data: { transcription: string }) => {
        setValue(`${tempValue.current} ${data.transcription}`.trim());
        setTranscribing(false);
      });

      socket.on('transcription_error', (data: { error: string }) => {
        console.error('Transcription error:', data.error);
        setTranscribing(false);
      });

      return () => {
        socket.off('transcription_result');
        socket.off('transcription_error');
      };
    }
  }, [socket]);

  return (
    <div className="flex w-2/3 items-center justify-center rounded-3xl border-2 border-neutral-400 px-1.5 focus-within:border-black">
      <div className="flex flex-1 items-center justify-center">
        <Textarea
          ref={textAreaRef}
          value={value}
          onChange={handleChange}
          onKeyUp={handleEnterKey}
          placeholder={transcribing ? 'Transcribing...' : 'Type here to chat'}
          disabled={disabled || transcribing}
          className={isOverflowing ? 'overflow-y-auto' : 'overflow-hidden'}
        />
        <div className="ml-2 flex flex-row items-center gap-4 pr-2">
          <Button
            variant={'secondary'}
            size={'icon'}
            disabled={
              disabled || value.trim().length === 0 || recording || transcribing
            }
            onClick={handleSubmit}
          >
            <SendHorizontal size={20} />
          </Button>
          <Button
            variant={'secondary'}
            size={'icon'}
            disabled={disabled}
            onClick={toggleRecording}
            className={recording ? 'bg-red-500 hover:bg-red-500/80' : ''}
          >
            {recording ? <MicOff size={20} /> : <Mic size={20} />}
          </Button>
        </div>
      </div>
    </div>
  );
};
