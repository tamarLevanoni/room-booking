import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar } from '../components/ui/calendar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useRoom, useRoomAvailability } from '../hooks/useRooms';
import { useAuthStore } from '../stores/authStore';
import { BookingModal } from '../components/BookingModal';

export const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [checkClicked, setCheckClicked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: room, isLoading: isLoadingRoom, error: roomError } = useRoom(id || '');

  const startDateStr = startDate ? format(startDate, 'yyyy-MM-dd') : '';
  const endDateStr = endDate ? format(endDate, 'yyyy-MM-dd') : '';

  const {
    data: isAvailable,
    isLoading: isCheckingAvailability,
    refetch: checkAvailability,
  } = useRoomAvailability(id || '', startDateStr, endDateStr);

  const handleCheckAvailability = () => {
    if (!startDate || !endDate) {
      return;
    }

    if (endDate <= startDate) {
      alert('End date must be after start date');
      return;
    }

    if (startDate < new Date()) {
      alert('Start date cannot be in the past');
      return;
    }

    setCheckClicked(true);
    checkAvailability();
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCheckClicked(false);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  if (isLoadingRoom) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-red-600">Failed to load room details</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate('/')}>Back to Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{room.name}</CardTitle>
          <CardDescription>
            {room.city}, {room.country}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-700">Capacity</p>
            <p className="text-base">{room.capacity} people</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Dates</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>
            </div>

            <Button
              onClick={handleCheckAvailability}
              disabled={!startDate || !endDate || isCheckingAvailability}
              className="w-full md:w-auto"
            >
              {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
            </Button>

            {checkClicked && !isCheckingAvailability && (
              <div className="mt-4">
                {isAvailable ? (
                  <div className="space-y-4">
                    <p className="text-green-600 font-medium">
                      Room is available for the selected dates!
                    </p>
                    <Button onClick={handleBookNow} className="w-full md:w-auto">
                      Book Now
                    </Button>
                  </div>
                ) : (
                  <p className="text-red-600 font-medium">
                    Not available for selected dates
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <BookingModal
        open={isModalOpen}
        onClose={handleModalClose}
        roomId={room._id}
        roomName={room.name}
        startDate={startDateStr}
        endDate={endDateStr}
      />
    </div>
  );
};
