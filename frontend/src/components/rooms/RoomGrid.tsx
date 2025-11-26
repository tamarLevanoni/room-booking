import { ReactNode } from 'react';

interface RoomGridProps {
  children: ReactNode;
  className?: string;
}

export const RoomGrid = ({ children, className = '' }: RoomGridProps) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {children}
    </div>
  );
};
