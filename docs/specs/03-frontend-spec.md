# 3. Frontend Specification

## 3.1 Framework

**Stack:**
- React 18+
- TypeScript
- Vite (build tool)
- React Router v6

**Folder Structure:**
```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components (routes)
│   ├── hooks/           # React Query hooks, custom logic hooks
│   ├── services/        # API calls (axios instances)
│   ├── stores/          # Zustand stores (authStore.ts)
│   ├── types/           # TypeScript types
│   ├── utils/           # Helpers
│   ├── App.tsx
│   └── main.tsx
├── public/
└── package.json
```

## 3.2 Pages & Routes

### Home / Room List (`/`)
- Grid/List of all rooms
- Search filters: city, country, capacity
- Each room card shows: name, city, country, capacity
- Click → navigate to `/rooms/:id`
- Login/Register buttons in header if not authenticated
- Public access

### Room Details (`/rooms/:id`)
- Room info: name, city, country, capacity
- Date range picker (start date, end date) (opened on press 'choose start date'...)
- "Check Availability" button
- If available → "Book Now" button (requires authentication)
- If not available → show "Not available for selected dates"
- Public access for viewing, authentication required for booking

### Booking Modal (modal on Room Details)
- Opens when user clicks "Book Now"
- Display only (non-editable): room name, dates, user name
- All details are read-only for confirmation
- "Confirm Booking" button (primary action)
- "Cancel" button (closes modal)
- Shows loading state during API call
- On success → show success message, close modal
- On error → show error message

### Login (`/login`)
- Email + password form
- "Login" button
- Link to Register
- On success → redirect to previous page or home

### Register (`/register`)
- Email, password, name fields
- "Register" button
- Link to Login
- On success → redirect to /login (user must login manually)

### Not Found (`*`)
- 404 page
- Link back to Home

## 3.3 State Management

**Auth State (Zustand):**
- Use Zustand for global auth state
- Store: `{ user, accessToken, refreshToken, isAuthenticated }`
- Persist both tokens in localStorage using Zustand persist middleware
- Actions: login, logout, setTokens, refreshAccessToken

**Data Fetching (React Query):**
- Use React Query (TanStack Query) for server state
- Cache rooms list (staleTime: 5 minutes)
- Cache room details (staleTime: 5 minutes)
- No cache for availability (always fresh)
- Invalidate queries after booking creation

**Form State:**
- Use local useState for simple forms
- Use react-hook-form for complex validation

## 3.3.1 Hooks Architecture

**Store Hooks (in `stores/`):**
- `stores/authStore.ts` - Exports `useAuthStore` hook
  ```typescript
  export const useAuthStore = create<AuthState>()(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        login: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken, isAuthenticated: true }),
        logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
        setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      }),
      { name: 'auth-storage' }
    )
  )
  ```

**Data Hooks (in `hooks/`):**

**Query Hooks:**
- `useRooms()` - Fetch all rooms (cached 5 min)
- `useRoom(id)` - Fetch single room (cached 5 min)
- `useRoomSearch(filters)` - Search rooms with filters
- `useRoomAvailability(roomId, startDate, endDate)` - Check availability (no cache)

**Mutation Hooks:**
- `useRegister()` - Register new user
- `useLogin()` - Login user, updates authStore
- `useRefreshToken()` - Refresh access token
- `useCreateBooking()` - Create booking, invalidates room queries

**Utility Hooks:**
- `useAuthenticatedFetch()` - HTTP client with auto token refresh

## 3.4 UI Behavior

### Home Page Search Flow
1. User sees all rooms on load
2. User applies filters (city, country, capacity, dates)
3. Frontend calls GET /api/rooms/search with filters
4. Show loading state while fetching
5. Display filtered room list
6. Click room card → navigate to `/rooms/:id`

### Room Details - Availability Check Flow
1. User selects start date and end date
2. Frontend validates: endDate > startDate, startDate >= today
3. User clicks "Check Availability"
4. Frontend calls GET /api/rooms/:id/availability
5. Show loading spinner
6. Response:
   - Available → show "Book Now" button (requires authentication)
   - Not available → show "Not available for selected dates"
7. No backend call on date change, only on explicit "Check Availability" button

### Booking Flow
1. User clicks "Book Now" (after successful availability check)
2. If not authenticated → redirect to /login
3. If authenticated → open booking confirmation modal
4. Modal shows: room name, dates, user info
5. User clicks "Confirm Booking" → POST /api/bookings
6. Show loading state (disable button)
7. On success:
   - Show success toast "Booking confirmed!"
   - Close modal
   - Clear availability check state
8. On error (409 Conflict):
   - Show "Room no longer available, please try again"
   - Re-enable form
9. On other errors:
   - Show generic error message

### Error Handling
- Network errors → show "Connection failed, please retry"
- 401 Unauthorized → redirect to /login
- 403 Forbidden → show "Access denied"
- 409 Conflict → specific message per context
- 500 Server Error → "Something went wrong, please try later"
- Display errors via toast notifications (top-right corner)

### Loading States
- Skeleton loaders for room cards
- Spinner for availability check
- Disabled button + spinner for booking submission
- Page-level loader for route transitions

## 3.5 UI Style Guide

**Component Library:**
- shadcn/ui (Radix UI + Tailwind)
- Use components: Button, Card, Input, Calendar, Dialog, Toast


**Forms:**
- Labels above inputs
- Error messages below inputs (text-red-600, text-sm)
- Validation on blur + submit

**Colors:**
- Primary: blue-600
- Success: green-600
- Error: red-600
- Neutral: gray-500
- Background: white
- Border: gray-200


**Responsive:**
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Navigation: hamburger menu on mobile

**Accessibility:**
- All interactive elements keyboard accessible
- ARIA labels on icons
- Focus visible styles
- Semantic HTML (header, nav, main, footer)
