import type { User, Room, Booking } from '@/types';

// Test data factories
export const createMockUser = (overrides?: Partial<User>): User => ({
  _id: '123456789',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockRoom = (overrides?: Partial<Room>): Room => ({
  _id: 'room123',
  name: 'Conference Room A',
  city: 'New York',
  country: 'USA',
  capacity: 10,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockBooking = (overrides?: Partial<Booking>): Booking => ({
  _id: 'booking123',
  userId: '123456789',
  roomId: 'room123',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 86400000).toISOString(),
  status: 'CONFIRMED',
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});
