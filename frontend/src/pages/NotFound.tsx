import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export const NotFound = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardContent className="py-8 text-center space-y-4">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Page Not Found</h2>
          <p className="text-gray-600">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link to="/">
            <Button className="mt-4">Back to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
