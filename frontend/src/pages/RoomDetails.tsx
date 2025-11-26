import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useRoom, useRoomAvailability } from "../hooks/useRooms";
import { useCreateBooking } from "../hooks/useBookings";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Calendar } from "../components/ui/calendar";
import { Skeleton } from "../components/ui/skeleton";
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const {
    data: room,
    isLoading: roomLoading,
    error: roomError,
  } = useRoom(id || "");

  const startDateTime =
    startDate && startTime
      ? `${format(startDate, "yyyy-MM-dd")}T${startTime}:00`
      : "";
  const endDateTime =
    endDate && endTime ? `${format(endDate, "yyyy-MM-dd")}T${endTime}:00` : "";

  const {
    data: isAvailable,
    isLoading: checkingAvailability,
    refetch: checkAvailability,
  } = useRoomAvailability(id || "", startDateTime, endDateTime);

  const { mutate: createBooking, isPending: bookingInProgress } =
    useCreateBooking();

  const handleCheckAvailability = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (endDate < startDate) {
      toast.error("End date must be after start date");
      return;
    }

    if (
      startDate.toDateString() === endDate.toDateString() &&
      endTime <= startTime
    ) {
      toast.error("End time must be after start time");
      return;
    }

    checkAvailability();
    setAvailabilityChecked(true);
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error("Please login to book a room");
      navigate("/login");
      return;
    }
    setShowBookingModal(true);
  };

  const handleConfirmBooking = () => {
    if (!id || !startDateTime || !endDateTime) return;

    createBooking(
      {
        roomId: id,
        startDate: startDateTime,
        endDate: endDateTime,
      },
      {
        onSuccess: () => {
          toast.success("Booking confirmed successfully!");
          setShowBookingModal(false);
          setAvailabilityChecked(false);
          setStartDate(undefined);
          setEndDate(undefined);
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to create booking");
        },
      }
    );
  };

  // Generate time options (every 30 minutes)
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  });

  if (roomLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-32 mb-6" />
        <Card className="p-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-48 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </Card>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to rooms
        </Link>
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Room Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The room you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to rooms
      </Link>

      {/* Room Information */}
      <Card className="p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{room.name}</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Room Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Room Details
            </h2>

            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-gray-600">
                  {room.city}, {room.country}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Capacity</p>
                <p className="text-sm text-gray-600">
                  Up to {room.capacity}{" "}
                  {room.capacity === 1 ? "person" : "people"}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Book This Room
            </h2>

            {/* Date Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Start Date & Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                    onChange={(e) =>
                      setStartDate(
                        e.target.value ? new Date(e.target.value) : undefined
                      )
                    }
                    min={format(new Date(), "yyyy-MM-dd")}
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  End Date & Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                    onChange={(e) =>
                      setEndDate(
                        e.target.value ? new Date(e.target.value) : undefined
                      )
                    }
                    min={
                      startDate
                        ? format(startDate, "yyyy-MM-dd")
                        : format(new Date(), "yyyy-MM-dd")
                    }
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Check Availability Button */}
            <Button
              onClick={handleCheckAvailability}
              disabled={!startDate || !endDate || checkingAvailability}
              className="w-full"
            >
              {checkingAvailability ? "Checking..." : "Check Availability"}
            </Button>

            {/* Availability Result */}
            {availabilityChecked && !checkingAvailability && (
              <div className="mt-4">
                {isAvailable ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">
                        Room is available for selected dates!
                      </span>
                    </div>
                    <Button
                      onClick={handleBookNow}
                      className="w-full"
                      size="lg"
                    >
                      Book Now
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">
                      Not available for selected dates
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Booking Confirmation Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <h2 className="text-2xl font-bold text-gray-900">
              Confirm Booking
            </h2>
          </DialogHeader>

          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Room</p>
              <p className="font-medium text-gray-900">{room.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Guest</p>
              <p className="font-medium text-gray-900">{user?.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Start Date & Time</p>
              <p className="font-medium text-gray-900">
                {startDate && format(startDate, "MMM dd, yyyy")} at {startTime}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">End Date & Time</p>
              <p className="font-medium text-gray-900">
                {endDate && format(endDate, "MMM dd, yyyy")} at {endTime}
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowBookingModal(false)}
              disabled={bookingInProgress}
              className="flex-1"
            >
              Cancel
            </Button>

            <Button
              onClick={handleConfirmBooking}
              disabled={bookingInProgress}
              className="flex-1"
            >
              {bookingInProgress ? "Confirming..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomDetails;
