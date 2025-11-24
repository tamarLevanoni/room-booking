import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRooms, useRoomSearch } from '../hooks/useRooms';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { MapPin, Users, Search } from 'lucide-react';
import type { RoomSearchFilters } from '../types';

export function Home() {
  const [filters, setFilters] = useState<RoomSearchFilters>({});
  const [searchInput, setSearchInput] = useState({
    city: '',
    country: '',
    capacity: '',
  });

  const hasFilters = Object.keys(filters).length > 0;
  const { data: allRooms, isLoading: isLoadingAll } = useRooms();
  const { data: searchedRooms, isLoading: isLoadingSearch } = useRoomSearch(filters);

  const rooms = hasFilters ? searchedRooms : allRooms;
  const isLoading = hasFilters ? isLoadingSearch : isLoadingAll;

  const handleSearch = () => {
    const newFilters: RoomSearchFilters = {};
    if (searchInput.city) newFilters.city = searchInput.city;
    if (searchInput.country) newFilters.country = searchInput.country;
    if (searchInput.capacity) newFilters.capacity = parseInt(searchInput.capacity);
    setFilters(newFilters);
  };

  const handleReset = () => {
    setSearchInput({ city: '', country: '', capacity: '' });
    setFilters({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">Find Your Perfect Room</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <Input
                  placeholder="e.g. New York"
                  value={searchInput.city}
                  onChange={(e) => setSearchInput({ ...searchInput, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <Input
                  placeholder="e.g. USA"
                  value={searchInput.country}
                  onChange={(e) => setSearchInput({ ...searchInput, country: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <Input
                  type="number"
                  placeholder="e.g. 10"
                  value={searchInput.capacity}
                  onChange={(e) => setSearchInput({ ...searchInput, capacity: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSearch} className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </Button>
              <Button onClick={handleReset} variant="outline">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : rooms && rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Link key={room._id} to={`/rooms/${room._id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-xl">{room.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{room.city}, {room.country}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Capacity: {room.capacity} people</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No rooms found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
