import { MapPin, Users } from "lucide-react";

interface RoomInfoProps {
  name: string;
  city: string;
  country: string;
  capacity: number;
}

export const RoomInfo = ({ name, city, country, capacity }: RoomInfoProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Details</h2>

      <div className="flex items-center gap-3 text-gray-700">
        <MapPin className="h-5 w-5 text-blue-600" />
        <div>
          <p className="font-medium">Location</p>
          <p className="text-sm text-gray-600">
            {city}, {country}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-gray-700">
        <Users className="h-5 w-5 text-blue-600" />
        <div>
          <p className="font-medium">Capacity</p>
          <p className="text-sm text-gray-600">
            Up to {capacity} {capacity === 1 ? "person" : "people"}
          </p>
        </div>
      </div>
    </div>
  );
};
