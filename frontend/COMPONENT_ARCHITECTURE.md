# Frontend Component Architecture

## Overview

This document describes the organized component structure for the RoomBooking frontend application. Components are separated by concern and purpose for better maintainability and reusability.

## Component Structure

```
frontend/src/components/
├── index.ts                    # Central export point for all components
├── layout/                     # Layout and navigation components
│   ├── index.ts
│   ├── Layout.tsx             # Main layout wrapper
│   ├── Header.tsx             # Application header
│   ├── Footer.tsx             # Application footer
│   └── Navigation.tsx         # Navigation menu with auth state
├── ui/                        # Base UI primitives (shadcn/ui)
│   ├── index.ts
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── dialog.tsx
│   ├── calendar.tsx
│   ├── skeleton.tsx
│   └── toast.tsx
├── forms/                     # Reusable form components
│   ├── index.ts
│   ├── FormField.tsx          # Input field with label and error
│   ├── FormGroup.tsx          # Groups form fields with spacing
│   └── FormActions.tsx        # Button group with alignment options
├── feedback/                  # Loading, error, and empty states
│   ├── index.ts
│   ├── LoadingSpinner.tsx     # Spinner component (sm/md/lg)
│   ├── LoadingOverlay.tsx     # Full-screen loading overlay
│   ├── PageLoader.tsx         # Loading state for page content
│   ├── ErrorMessage.tsx       # Error display with retry option
│   └── EmptyState.tsx         # Empty state with icon and action
└── rooms/                     # Room-specific components
    ├── index.ts
    ├── RoomCard.tsx           # Individual room card
    ├── RoomCardSkeleton.tsx   # Loading skeleton for room card
    └── RoomGrid.tsx           # Responsive grid layout for rooms
```

## Component Categories

### 1. Layout Components (`/layout`)

**Purpose:** Application structure and navigation

- **Layout**: Main layout wrapper with header, footer, and content area
- **Header**: Logo and navigation bar
- **Footer**: Copyright and footer content
- **Navigation**: Auth-aware navigation menu

**Import:**
```typescript
import { Layout, Header, Footer, Navigation } from '@/components';
```

### 2. UI Primitives (`/ui`)

**Purpose:** Base shadcn/ui components with Radix UI and Tailwind styling

Includes: Button, Card, Input, Label, Dialog, Calendar, Skeleton, Toast

**Import:**
```typescript
import { Button, Card, Input, Dialog } from '@/components';
```

### 3. Form Components (`/forms`)

**Purpose:** Reusable form elements with built-in validation display

- **FormField**: Input with label, error message, and helper text
- **FormGroup**: Container for grouping form fields with proper spacing
- **FormActions**: Button container with alignment options (left, center, right, between)

**Usage Example:**
```typescript
import { FormField, FormGroup, FormActions, Button } from '@/components';

<FormGroup>
  <FormField
    label="Email"
    type="email"
    error={errors.email}
    required
    {...register('email')}
  />
  <FormActions align="right">
    <Button variant="outline">Cancel</Button>
    <Button type="submit">Submit</Button>
  </FormActions>
</FormGroup>
```

### 4. Feedback Components (`/feedback`)

**Purpose:** Loading states, errors, and empty data displays

- **LoadingSpinner**: Configurable spinner (sm, md, lg)
- **LoadingOverlay**: Full-screen loading with backdrop
- **PageLoader**: Centered loading state for page content
- **ErrorMessage**: Error display with optional retry button
- **EmptyState**: No data message with icon and optional action

**Usage Examples:**
```typescript
import { LoadingSpinner, ErrorMessage, EmptyState } from '@/components';

// Loading
{isLoading && <LoadingSpinner size="lg" />}

// Error with retry
{error && (
  <ErrorMessage
    message="Failed to load data"
    onRetry={refetch}
  />
)}

// Empty state
{data.length === 0 && (
  <EmptyState
    icon={<Building2 className="h-8 w-8" />}
    title="No rooms found"
    message="Try adjusting your filters"
    action={{ label: "Clear Filters", onClick: clearFilters }}
  />
)}
```

### 5. Feature Components (`/rooms`)

**Purpose:** Room-specific UI components

- **RoomCard**: Display individual room information
- **RoomCardSkeleton**: Loading placeholder for room cards
- **RoomGrid**: Responsive grid layout for room cards

**Usage Example:**
```typescript
import { RoomCard, RoomCardSkeleton, RoomGrid } from '@/components';

<RoomGrid>
  {isLoading
    ? [1,2,3].map(i => <RoomCardSkeleton key={i} />)
    : rooms.map(room => <RoomCard key={room._id} room={room} />)
  }
</RoomGrid>
```

## Import Strategy

### Recommended: Central Import
```typescript
// Import from central index (preferred)
import { Button, Card, FormField, ErrorMessage, RoomCard } from '@/components';
```

### Alternative: Category-Specific Import
```typescript
// Import from specific category
import { Button, Card } from '@/components/ui';
import { FormField } from '@/components/forms';
import { ErrorMessage } from '@/components/feedback';
```

## Styling Standards

### Using Tailwind CSS v4

All components use Tailwind CSS v4 with the following conventions:

- **CSS Variables**: Colors defined in `index.css` using HSL values
- **Dark Mode**: Class-based dark mode support
- **Spacing**: Consistent spacing using Tailwind scale
- **Typography**: Inter font family with proper line-height

### Color Palette

```css
/* Primary color (Blue) */
--primary: 221 83% 53%

/* Destructive/Error (Red) */
--destructive: 0 84% 60%

/* Neutral grays */
--muted: 0 0% 96%
--border: 0 0% 90%
```

## Component Design Principles

1. **Single Responsibility**: Each component has one clear purpose
2. **Composability**: Components can be combined to build complex UIs
3. **Accessibility**: All components include proper ARIA labels and keyboard navigation
4. **Consistent Props**: Similar components share prop naming conventions
5. **Type Safety**: Full TypeScript support with exported prop types

## Adding New Components

When creating new components:

1. **Choose the right category** based on the component's purpose
2. **Create the component file** in the appropriate directory
3. **Export from category index** (`/category/index.ts`)
4. **Document the component** if it introduces new patterns
5. **Use existing utilities** (cn, buttonVariants, etc.)

### Example: Adding a New Component

```typescript
// 1. Create: components/feedback/SuccessMessage.tsx
export interface SuccessMessageProps {
  message: string;
  onClose?: () => void;
}

export const SuccessMessage = ({ message, onClose }: SuccessMessageProps) => {
  // Component implementation
};

// 2. Export: components/feedback/index.ts
export { SuccessMessage } from './SuccessMessage';
export type { SuccessMessageProps } from './SuccessMessage';

// 3. Now usable via: import { SuccessMessage } from '@/components';
```

## Libraries Used

- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Radix UI** - Accessible primitives
- **class-variance-authority** - Variant management
- **lucide-react** - Icon library
- **tailwind-merge** - Class merging utility

## Best Practices

1. **Always use the central import** when possible for cleaner imports
2. **Prefer composition over configuration** - combine simple components
3. **Keep components focused** - if it does too much, split it
4. **Use semantic HTML** - proper tags for accessibility
5. **Include loading states** - use skeleton components during data fetching
6. **Handle errors gracefully** - use ErrorMessage component
7. **Show empty states** - use EmptyState when no data available

## Migration Notes

Components have been reorganized from:
```typescript
// Old
import { RoomCard } from '../components/RoomCard';
import { Button } from '../components/ui/button';

// New
import { RoomCard, Button } from '@/components';
```

All old import paths will continue to work during the transition period.
