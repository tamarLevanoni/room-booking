// Re-export all API modules for convenience
export { apiClient, API_URL } from './api/client';
export { authApi } from './api/auth';
export { roomApi } from './api/rooms';
export { bookingApi } from './api/bookings';

// Default export for backward compatibility
export { apiClient as default } from './api/client';
