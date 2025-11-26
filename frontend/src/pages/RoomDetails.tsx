import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useRoom, useRoomAvailability } from "../hooks/useRooms";
import { useCreateBooking } from "../hooks/useBookings";
import { useAuthStore } from "../stores/authStore";
import {
  Button,
  Card,
  Skeleton,
  RoomInfo,
  BookingForm,
  BookingConfirmationModal,
} from "../components";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [startDateTime, setStartDateTime] = useState<string>("");
  const [endDateTime, setEndDateTime] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const {
    data: room,
    isLoading: roomLoading,
    error: roomError,
  } = useRoom(id || "");

  const {
    data: isAvailable,
    isLoading: checkingAvailability,
    refetch: checkAvailability,
  } = useRoomAvailability(id || "", startDateTime, endDateTime);

  const { mutate: createBooking, isPending: bookingInProgress } =
    useCreateBooking();

  const handleCheckAvailability = (start: string, end: string) => {
    setStartDateTime(start);
    setEndDateTime(end);

    // Extract time for display
    const [, startTimeStr] = start.split("T");
    const [, endTimeStr] = end.split("T");
    setStartTime(startTimeStr?.substring(0, 5) || "");
    setEndTime(endTimeStr?.substring(0, 5) || "");

    // Trigger the availability check
    setTimeout(() => {
      checkAvailability();
      setAvailabilityChecked(true);
    }, 0);
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
          setStartDateTime("");
          setEndDateTime("");
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to create booking");
        },
      }
    );
  };

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
          <RoomInfo
            name={room.name}
            city={room.city}
            country={room.country}
            capacity={room.capacity}
          />

          <BookingForm
            onCheckAvailability={handleCheckAvailability}
            onBookNow={handleBookNow}
            isAvailable={isAvailable}
            availabilityChecked={availabilityChecked}
            checkingAvailability={checkingAvailability}
          />
        </div>
      </Card>

      {/* Booking Confirmation Modal */}
      {showBookingModal && startDateTime && endDateTime && (
        <BookingConfirmationModal
          open={showBookingModal}
          onOpenChange={setShowBookingModal}
          onConfirm={handleConfirmBooking}
          isConfirming={bookingInProgress}
          roomName={room.name}
          guestName={user?.name || ""}
          startDate={new Date(startDateTime)}
          startTime={startTime}
          endDate={new Date(endDateTime)}
          endTime={endTime}
        />
      )}
    </div>
  );
};

export default RoomDetails;
