# Room Booking Platform - Frontend

A React-based frontend application for the room booking platform, built with TypeScript, Vite, and Tailwind CSS.

## Tech Stack

- **Framework**: React 19+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router v7
- **State Management**:
  - Zustand (auth state with localStorage persistence)
  - TanStack React Query (server state)
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with token refresh interceptors
- **Testing**: Vitest + React Testing Library
- **Date Handling**: date-fns
- **Notifications**: Sonner (toast notifications)
- **Icons**: Lucide React

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   └── ui/          # shadcn/ui components
│   ├── pages/           # Page components (routes)
│   ├── hooks/           # React Query hooks, custom logic hooks
│   ├── services/        # API service layer (axios)
│   ├── stores/          # Zustand stores (authStore.ts)
│   ├── types/           # TypeScript types
│   ├── lib/             # Utility functions
│   ├── test/            # Test utilities and factories
│   ├── App.tsx
│   └── main.tsx
├── public/
├── .env.example         # Environment variables template
└── package.json
```

## Setup

### Quick Start with Docker (Recommended)

The easiest way to run the frontend with the entire stack:

```bash
# From project root
docker-compose up -d
```

- Frontend will be available at http://localhost
- No need to configure environment variables - automatically set in docker-compose.yml
- Backend API is pre-configured

See the [root README](../README.md) for detailed Docker instructions.


## Environment Variables

Environment variables are automatically configured in [docker-compose.yml](../docker-compose.yml):

```yaml
environment:
  - VITE_API_URL=http://localhost:3000
```

No `.env` file needed when using Docker.

## Features Implemented

### Foundation Layer
- ✅ Tailwind CSS with custom theme configuration
- ✅ shadcn/ui components (Button, Card, Input, Label, Dialog, Calendar, Toast, Skeleton)
- ✅ Path aliases configured (@/ → src/)
- ✅ TypeScript types for all API contracts
- ✅ Zustand auth store with localStorage persistence
- ✅ Axios service layer with automatic token refresh
- ✅ Vitest + React Testing Library setup
- ✅ Test utilities and mock factories

### Auth Store
The auth store (`src/stores/authStore.ts`) provides:
- User authentication state
- Token management (access + refresh)
- Automatic localStorage persistence
- Methods: `login()`, `logout()`, `setTokens()`, `setUser()`

### API Service
The API service (`src/services/api.ts`) includes:
- Axios instance with base URL configuration
- Request interceptor for adding access tokens
- Response interceptor for automatic token refresh
- API methods for all endpoints:
  - Auth: `register()`, `login()`, `refresh()`
  - Rooms: `getAll()`, `search()`, `getById()`, `checkAvailability()`
  - Bookings: `create()`

### Type Safety
All TypeScript types are defined in `src/types/index.ts`:
- Domain models: User, Room, Booking
- API requests: RegisterRequest, LoginRequest, CreateBookingRequest, etc.
- API responses: AuthResponse, RoomsResponse, AvailabilityResponse, etc.
- Store state: AuthState

## Next Steps

The foundation is complete. Next, implement:

1. **Pages & Routes**
   - Home page with room list
   - Room details page
   - Login/Register pages
   - Protected routes

2. **React Query Hooks**
   - `useRooms()`, `useRoom(id)`, `useRoomSearch()`
   - `useRoomAvailability()`
   - `useLogin()`, `useRegister()`
   - `useCreateBooking()`

3. **UI Components**
   - RoomCard, RoomGrid
   - BookingModal
   - DateRangePicker
   - LoadingSpinner, ErrorBoundary

## Development Notes

- All components use Tailwind CSS with the custom theme
- Forms should use React Hook Form + Zod validation
- Server state management uses React Query (5min cache for rooms)
- Auth state persists in localStorage via Zustand
- API automatically refreshes expired access tokens
- Tests use factories from `src/test/factories.ts`

## License

Private - All Rights Reserved
