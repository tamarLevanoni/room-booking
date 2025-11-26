import { LoadingSpinner } from './LoadingSpinner';

interface PageLoaderProps {
  message?: string;
}

export const PageLoader = ({ message = 'Loading...' }: PageLoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-sm text-gray-600">{message}</p>
    </div>
  );
};
