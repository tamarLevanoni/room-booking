import { AlertCircle } from 'lucide-react';
import { Button } from '../ui';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorMessage = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again'
}: ErrorMessageProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4" role="alert">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 text-center max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
