import { format } from "date-fns";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui";

interface BookingConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isConfirming: boolean;
  roomName: string;
  guestName: string;
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
}

export const BookingConfirmationModal = ({
  open,
  onOpenChange,
  onConfirm,
  isConfirming,
  roomName,
  guestName,
  startDate,
  startTime,
  endDate,
  endTime,
}: BookingConfirmationModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Confirm Booking
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Room</p>
            <p className="font-medium text-gray-900">{roomName}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Guest</p>
            <p className="font-medium text-gray-900">{guestName}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Start Date & Time</p>
            <p className="font-medium text-gray-900">
              {format(startDate, "MMM dd, yyyy")} at {startTime}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">End Date & Time</p>
            <p className="font-medium text-gray-900">
              {format(endDate, "MMM dd, yyyy")} at {endTime}
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            onClick={onConfirm}
            disabled={isConfirming}
            className="flex-1 bg-green-400"
          >
            {isConfirming ? "Confirming..." : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
