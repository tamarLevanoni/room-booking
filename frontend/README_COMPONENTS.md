# Frontend Components - Quick Reference

## 📁 Component Structure

```
src/components/
├── index.ts                     # 🎯 Import from here!
│
├── ui/                          # Base UI Primitives (shadcn/ui)
│   ├── button.tsx              # Button with variants
│   ├── card.tsx                # Card container
│   ├── input.tsx               # Text input
│   ├── label.tsx               # Form label
│   ├── dialog.tsx              # Modal dialog
│   ├── calendar.tsx            # Date picker
│   ├── skeleton.tsx            # Loading skeleton
│   ├── toast.tsx               # Toast notifications
│   └── index.ts
│
├── layout/                      # Application Layout
│   ├── Layout.tsx              # Main layout wrapper
│   ├── Header.tsx              # Top navigation bar
│   ├── Footer.tsx              # Footer content
│   ├── Navigation.tsx          # Nav menu with auth
│   └── index.ts
│
├── forms/                       # Form Components
│   ├── FormField.tsx           # Label + Input + Error
│   ├── FormGroup.tsx           # Field grouping
│   ├── FormActions.tsx         # Button container
│   └── index.ts
│
├── feedback/                    # Feedback States
│   ├── LoadingSpinner.tsx      # Spinner (sm/md/lg)
│   ├── LoadingOverlay.tsx      # Full-screen loader
│   ├── PageLoader.tsx          # Page-level loader
│   ├── ErrorMessage.tsx        # Error with retry
│   ├── EmptyState.tsx          # No data message
│   └── index.ts
│
└── rooms/                       # Room Components
    ├── RoomCard.tsx            # Room display card
    ├── RoomCardSkeleton.tsx   # Loading placeholder
    ├── RoomGrid.tsx            # Grid layout
    └── index.ts
```

## 🚀 Quick Start

### Import Components
```typescript
// ✅ Recommended: Single import
import {
  Button,
  Card,
  Input,
  FormField,
  ErrorMessage,
  EmptyState,
  LoadingSpinner,
  RoomCard,
  RoomGrid
} from '@/components';

// ❌ Avoid: Multiple imports
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// ...etc
```

### Common Patterns

#### Form with Validation
```typescript
import { FormField, FormGroup, FormActions, Button } from '@/components';

<form onSubmit={handleSubmit}>
  <FormGroup>
    <FormField
      label="Email"
      type="email"
      error={errors.email}
      required
    />
    <FormField
      label="Password"
      type="password"
      error={errors.password}
      required
    />
  </FormGroup>

  <FormActions align="right">
    <Button variant="outline" type="button">Cancel</Button>
    <Button type="submit">Submit</Button>
  </FormActions>
</form>
```

#### Loading States
```typescript
import { LoadingSpinner, RoomCardSkeleton, RoomGrid } from '@/components';

{isLoading && <LoadingSpinner size="lg" />}

// Or for skeletons:
<RoomGrid>
  {isLoading
    ? [1,2,3].map(i => <RoomCardSkeleton key={i} />)
    : rooms.map(room => <RoomCard key={room._id} room={room} />)
  }
</RoomGrid>
```

#### Error Handling
```typescript
import { ErrorMessage } from '@/components';

{error && (
  <ErrorMessage
    title="Failed to load"
    message="Could not fetch rooms. Please try again."
    onRetry={refetch}
    retryLabel="Try Again"
  />
)}
```

#### Empty State
```typescript
import { EmptyState } from '@/components';
import { Building2 } from 'lucide-react';

{data.length === 0 && (
  <EmptyState
    icon={<Building2 className="h-8 w-8 text-gray-400" />}
    title="No rooms found"
    message="Try adjusting your search filters"
    action={{
      label: "Clear Filters",
      onClick: handleClearFilters
    }}
  />
)}
```

#### Room Grid
```typescript
import { RoomCard, RoomGrid } from '@/components';

<RoomGrid>
  {rooms.map(room => (
    <RoomCard key={room._id} room={room} />
  ))}
</RoomGrid>
```

## 🎨 Styling

All components use **Tailwind CSS v4** with CSS variables:

```typescript
// Colors
className="bg-primary text-primary-foreground"
className="bg-destructive text-destructive-foreground"
className="text-muted-foreground"

// Buttons
<Button variant="default">Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Subtle</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

## 📚 Component APIs

### Button
```typescript
<Button
  variant="default" | "outline" | "destructive" | "ghost" | "link"
  size="sm" | "default" | "lg" | "icon"
  disabled={boolean}
  onClick={handleClick}
>
  Button Text
</Button>
```

### FormField
```typescript
<FormField
  label="Field Label"
  type="text" | "email" | "password" | "number"
  error="Error message"
  helperText="Helper text"
  required={boolean}
  {...inputProps}
/>
```

### ErrorMessage
```typescript
<ErrorMessage
  title="Error Title"          // Optional, defaults to "Something went wrong"
  message="Error description"  // Required
  onRetry={handleRetry}        // Optional retry callback
  retryLabel="Try Again"       // Optional, defaults to "Try Again"
/>
```

### EmptyState
```typescript
<EmptyState
  icon={<IconComponent />}              // Optional icon
  title="Empty State Title"             // Required
  message="Empty state description"     // Optional
  action={{                             // Optional action button
    label: "Button Text",
    onClick: handleAction
  }}
/>
```

### LoadingSpinner
```typescript
<LoadingSpinner
  size="sm" | "md" | "lg"    // Optional, defaults to "md"
  className="custom-class"   // Optional additional classes
/>
```

### RoomCard
```typescript
<RoomCard
  room={{
    _id: string,
    name: string,
    city: string,
    country: string,
    capacity: number
  }}
/>
```

## 📖 Full Documentation

- **[COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md)** - Complete component guide with patterns and principles
- **[STYLING_GUIDE.md](./STYLING_GUIDE.md)** - Tailwind CSS v4 styling reference
- **[COMPONENT_MIGRATION_SUMMARY.md](./COMPONENT_MIGRATION_SUMMARY.md)** - Migration details and changes

## 🛠️ Tech Stack

- **React 19.2** - UI framework
- **TypeScript 5.9** - Type safety
- **Tailwind CSS 4.1** - Styling
- **Radix UI** - Accessible primitives
- **class-variance-authority** - Component variants
- **lucide-react 0.554** - Icon library
- **tailwind-merge** - Class merging utility

## ✨ Benefits

1. **Single Import Point** - Import all components from `@/components`
2. **Type Safe** - Full TypeScript support with exported types
3. **Consistent Design** - All components follow same patterns
4. **Accessible** - ARIA labels and keyboard navigation included
5. **Responsive** - Mobile-first design with breakpoints
6. **Dark Mode Ready** - CSS variable-based theming
7. **Well Documented** - Examples and API references

## 🎯 Best Practices

### ✅ Do
- Import from `@/components`
- Use semantic variants (`destructive`, not custom colors)
- Include loading and error states
- Compose small components
- Use FormField for consistent forms
- Handle empty states with EmptyState

### ❌ Don't
- Create duplicate loading/error UI
- Hardcode colors (use CSS variables)
- Skip accessibility attributes
- Mix layout and business logic
- Import directly from component files

## 🔄 Adding New Components

1. **Choose category** (ui, forms, feedback, or feature-specific)
2. **Create component** in appropriate directory
3. **Export from index.ts** in that directory
4. **Document if needed** in COMPONENT_ARCHITECTURE.md
5. **Use existing patterns** (cn utility, variants, etc.)

Example:
```typescript
// 1. Create: components/feedback/SuccessMessage.tsx
export const SuccessMessage = ({ message }: { message: string }) => {
  return <div className="text-green-600">{message}</div>;
};

// 2. Export: components/feedback/index.ts
export { SuccessMessage } from './SuccessMessage';

// 3. Use: import { SuccessMessage } from '@/components';
```

## 🚦 Component Status

| Category | Status | Components |
|----------|--------|------------|
| UI Primitives | ✅ Complete | 9 components |
| Layout | ✅ Complete | 4 components |
| Forms | ✅ Complete | 3 components |
| Feedback | ✅ Complete | 5 components |
| Rooms | ✅ Complete | 3 components |

## 📝 Quick Reference Card

```typescript
// Layout
import { Layout, Header, Footer, Navigation } from '@/components';

// UI
import { Button, Card, Input, Label, Dialog, Calendar } from '@/components';

// Forms
import { FormField, FormGroup, FormActions } from '@/components';

// Feedback
import { LoadingSpinner, ErrorMessage, EmptyState, PageLoader } from '@/components';

// Features
import { RoomCard, RoomGrid, RoomCardSkeleton } from '@/components';
```

---

**Questions?** Check the full documentation files or component implementations in `src/components/`
