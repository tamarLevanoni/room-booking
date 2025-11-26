import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { Navigation } from './Navigation';

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">RoomBooking</span>
          </Link>
          <Navigation />
        </div>
      </div>
    </header>
  );
};
