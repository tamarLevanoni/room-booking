import { useNavigate } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import { Card, Button } from '../ui';
import type { Room } from '../../types';

interface RoomCardProps {
  room: Room;
}

export const RoomCard = ({ room }: RoomCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
      <div onClick={() => navigate(`/rooms/${room._id}`)} className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
          {room.name}
        </h3>

        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="text-sm">
            {room.city}, {room.country}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <Users className="h-4 w-4 text-blue-600" />
          <span className="text-sm">
            Capacity: {room.capacity} {room.capacity === 1 ? 'person' : 'people'}
          </span>
        </div>

        <Button
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/rooms/${room._id}`);
          }}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
};
