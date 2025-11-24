import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../services/api';
import type { CreateBookingRequest } from '../types';
import toast from 'react-hot-toast';

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingApi.createBooking(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Booking confirmed!');
        queryClient.invalidateQueries({ queryKey: ['rooms'] });
      } else {
        const message = response.error?.message || 'Booking failed';
        toast.error(message);
      }
    },
    onError: (error: any) => {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message;

      if (status === 409) {
        toast.error(message || 'Room no longer available, please try again');
      } else if (status === 401) {
        toast.error('Please login to book a room');
      } else {
        toast.error(message || 'Something went wrong, please try later');
      }
    },
  });
};
