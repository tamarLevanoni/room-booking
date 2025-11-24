import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { useCreateBooking } from '../hooks/useBookings';
import { useAuthStore } from '../stores/authStore';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  startDate: string;
  endDate: string;
}

export const BookingModal = ({
  open,
  onClose,
  roomId,
  roomName,
  startDate,
  endDate,
}: BookingModalProps) => {
  const user = useAuthStore((state) => state.user);
  const { mutate: createBooking, isPending } = useCreateBooking();

  const handleConfirm = () => {
    createBooking(
      {
        roomId,
        startDate,
        endDate,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            onClose();
          }
        },
      }
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Booking</DialogTitle>
          <DialogDescription>
            Please review your booking details before confirming
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Room</p>
            <p className="text-base">{roomName}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">Guest</p>
            <p className="text-base">{user?.name || 'N/A'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">Check-in Date</p>
            <p className="text-base">{formatDate(startDate)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">Check-out Date</p>
            <p className="text-base">{formatDate(endDate)}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending ? 'Confirming...' : 'Confirm Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
