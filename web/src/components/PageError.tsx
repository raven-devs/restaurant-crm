import { CircleAlert } from 'lucide-react';

interface PageErrorProps {
  message: string;
}

export function PageError({ message }: PageErrorProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <CircleAlert className="size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
