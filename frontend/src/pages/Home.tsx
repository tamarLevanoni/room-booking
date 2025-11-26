import { useState } from 'react';
import { useRoomSearch } from '../hooks/useRooms';
import { RoomCard, RoomCardSkeleton, RoomGrid, Button, Input, ErrorMessage, EmptyState } from '../components';
import { Search, X, Building2, ChevronDown } from 'lucide-react';
import type { RoomSearchFilters } from '../types';

const Home = () => {
  const [filters, setFilters] = useState<Omit<RoomSearchFilters, 'offset' | 'limit'>>({});
  const [tempFilters, setTempFilters] = useState({
    city: '',
    country: '',
    capacity: '',
  });

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRoomSearch(filters);

  const rooms = data?.pages.flatMap((page) => page.rooms) ?? [];

  const handleSearch = () => {
    const newFilters: Omit<RoomSearchFilters, 'offset' | 'limit'> = {};

    if (tempFilters.city.trim()) {
      newFilters.city = tempFilters.city.trim();
    }
    if (tempFilters.country.trim()) {
      newFilters.country = tempFilters.country.trim();
    }
    if (tempFilters.capacity && !isNaN(Number(tempFilters.capacity))) {
      newFilters.capacity = Number(tempFilters.capacity);
    }

    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setTempFilters({ city: '', country: '', capacity: '' });
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Perfect Meeting Room
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse our collection of premium meeting rooms available for booking.
          Filter by location and capacity to find the perfect space for your needs.
        </p>
      </div>

      {/* Search Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Rooms</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* City Filter */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <Input
              id="city"
              type="text"
              placeholder="e.g., Paris, London"
              value={tempFilters.city}
              onChange={(e) => setTempFilters({ ...tempFilters, city: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Country Filter */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <Input
              id="country"
              type="text"
              placeholder="e.g., France, UK"
              value={tempFilters.country}
              onChange={(e) => setTempFilters({ ...tempFilters, country: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Capacity Filter */}
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Capacity
            </label>
            <Input
              id="capacity"
              type="number"
              min="1"
              placeholder="e.g., 10"
              value={tempFilters.capacity}
              onChange={(e) => setTempFilters({ ...tempFilters, capacity: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleSearch}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Search Rooms
          </Button>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Active filters:</p>
            <div className="flex flex-wrap gap-2">
              {filters.city && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  City: {filters.city}
                </span>
              )}
              {filters.country && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Country: {filters.country}
                </span>
              )}
              {filters.capacity && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Capacity: {filters.capacity}+
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div>
        {/* Loading State */}
        {isLoading && (
          <div>
            <p className="text-gray-600 mb-4">Loading available rooms...</p>
            <RoomGrid>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <RoomCardSkeleton key={i} />
              ))}
            </RoomGrid>
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorMessage
            message="Failed to load rooms. Please try again."
            onRetry={() => window.location.reload()}
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && rooms && rooms.length === 0 && (
          <EmptyState
            icon={<Building2 className="h-8 w-8 text-gray-400" />}
            title={hasActiveFilters ? 'No rooms found' : 'No rooms available'}
            message={hasActiveFilters ? 'Try adjusting your search filters' : 'Check back later for available rooms'}
            action={hasActiveFilters ? {
              label: 'Clear All Filters',
              onClick: handleClearFilters
            } : undefined}
          />
        )}

        {/* Rooms Grid */}
        {!isLoading && !error && rooms && rooms.length > 0 && (
          <div>

            <RoomGrid>
              {rooms.map((room) => (
                <RoomCard key={room._id} room={room} />
              ))}
            </RoomGrid>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isFetchingNextPage ? (
                    'Loading...'
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Load More Results
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
