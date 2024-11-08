import { cn } from '@/lib/utils';

interface ChatAvatarProps {
  className?: string;
  children: React.ReactNode | React.ReactNode[];
}

export const ChatAvatar = ({ className, children }: ChatAvatarProps) => {
  return (
    <div
      className={cn(
        'relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-700',
        className,
      )}
    >
      {children}
    </div>
  );
};
