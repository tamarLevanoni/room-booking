import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../ui";
import toast from "react-hot-toast";

interface BookingFormProps {
  onCheckAvailability: (start: string, end: string) => void;
  onBookNow: () => void;
  isAvailable: boolean | undefined;
  availabilityChecked: boolean;
  checkingAvailability: boolean;
}

export const BookingForm = ({
  onCheckAvailability,
  onBookNow,
  isAvailable,
  availabilityChecked,
  checkingAvailability,
}: BookingFormProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");

  // Generate time options (every 30 minutes)
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  });

  const validateDates = (): boolean => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return false;
    }

    if (endDate < startDate) {
      toast.error("End date must be after start date");
      return false;
    }

    if (
      startDate.toDateString() === endDate.toDateString() &&
      endTime <= startTime
    ) {
      toast.error("End time must be after start time");
      return false;
    }

    return true;
  };

  const handleCheckAvailability = () => {
    if (!validateDates()) {
      return;
    }

    const startDateTime = `${format(startDate!, "yyyy-MM-dd")}T${startTime}:00`;
    const endDateTime = `${format(endDate!, "yyyy-MM-dd")}T${endTime}:00`;

    onCheckAvailability(startDateTime, endDateTime);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Book This Room</h2>

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
        className="w-full bg-blue-300"
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
              <Button onClick={onBookNow} className="w-full bg-blue-300" size="lg">
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
  );
};
