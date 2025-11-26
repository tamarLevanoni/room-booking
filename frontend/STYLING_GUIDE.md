# Styling Guide - Tailwind CSS v4

## Overview

This project uses **Tailwind CSS v4** with a custom design system based on HSL color variables for maximum flexibility and dark mode support.

## Color System

### CSS Variables Approach

Colors are defined as HSL values in CSS variables, allowing for easy theming and dark mode:

```css
:root {
  --primary: 221 83% 53%;           /* Blue #3b82f6 */
  --destructive: 0 84% 60%;         /* Red #dc2626 */
  --background: 0 0% 100%;          /* White */
  --foreground: 0 0% 10%;           /* Near Black */
  --border: 0 0% 90%;               /* Light Gray */
  --muted: 0 0% 96%;                /* Very Light Gray */
}

.dark {
  --background: 0 0% 10%;           /* Dark Background */
  --foreground: 0 0% 98%;           /* Light Text */
  --border: 0 0% 20%;               /* Dark Border */
  --muted: 0 0% 15%;                /* Dark Muted */
}
```

### Using Colors

```typescript
// Background colors
className="bg-background text-foreground"

// Primary actions
className="bg-primary text-primary-foreground"

// Destructive actions
className="bg-destructive text-destructive-foreground"

// Borders and inputs
className="border border-border"

// Muted text and backgrounds
className="text-muted-foreground bg-muted"
```

## Typography

### Font Family

```css
body {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}
```

### Text Sizes

```typescript
// Headings
<h1 className="text-4xl font-bold">         // Page title
<h2 className="text-2xl font-semibold">     // Section title
<h3 className="text-xl font-semibold">      // Card title

// Body text
<p className="text-base">                   // Default body (16px)
<p className="text-sm">                     // Small text (14px)
<p className="text-xs">                     // Extra small (12px)

// Text weights
className="font-normal"      // 400
className="font-medium"      // 500
className="font-semibold"    // 600
className="font-bold"        // 700
```

## Spacing

### Consistent Spacing Scale

```typescript
// Padding/Margin
className="p-4"      // 1rem (16px)
className="p-6"      // 1.5rem (24px)
className="p-8"      // 2rem (32px)
className="p-12"     // 3rem (48px)

// Gaps (for flex/grid)
className="gap-2"    // 0.5rem (8px)
className="gap-3"    // 0.75rem (12px)
className="gap-4"    // 1rem (16px)
className="gap-6"    // 1.5rem (24px)
```

## Border Radius

Custom radius scale defined by `--radius` variable:

```typescript
className="rounded-sm"    // calc(var(--radius) - 4px)
className="rounded-md"    // calc(var(--radius) - 2px)
className="rounded-lg"    // var(--radius) = 0.5rem
className="rounded-full"  // 9999px (circular)
```

## Component Patterns

### Cards

```typescript
<Card className="p-6">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Buttons

```typescript
// Variants
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="destructive">Delete Action</Button>
<Button variant="ghost">Subtle Action</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon Only</Button>
```

### Form Fields

```typescript
<FormField
  label="Email"
  type="email"
  error={errors.email}
  required
/>

// Error styling is automatic via FormField
// Manual error styling:
className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
```

## Responsive Design

### Breakpoints

```typescript
// Mobile first approach
className="text-sm md:text-base lg:text-lg"

// Breakpoint values:
sm: '640px'   // Small tablets
md: '768px'   // Tablets
lg: '1024px'  // Small laptops
xl: '1280px'  // Desktops
2xl: '1400px' // Large desktops (container max-width)
```

### Grid Layouts

```typescript
// Room grid pattern
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>

// Form layouts
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Form fields */}
</div>
```

## Animations

### Built-in Animations

```typescript
// Transitions
className="transition-colors"        // Color transitions
className="transition-shadow"        // Shadow transitions
className="transition-opacity"       // Fade in/out
className="duration-300"             // 300ms duration

// Loading spinner
className="animate-spin"

// Custom animation (defined in tailwind.config)
className="animate-float"            // Float up and down
```

### Hover Effects

```typescript
// Buttons and cards
className="hover:opacity-80 transition-opacity"
className="hover:shadow-lg transition-shadow"
className="hover:bg-accent hover:text-accent-foreground"

// Links
className="hover:text-blue-700 transition-colors"
className="hover:underline"
```

## Utility Patterns

### Container

```typescript
// Centered container with padding
<div className="container mx-auto px-4 py-8">
  {/* Content */}
</div>
```

### Flex Utilities

```typescript
// Center content
className="flex items-center justify-center"

// Space between items
className="flex items-center justify-between"

// Vertical stack
className="flex flex-col gap-4"

// Horizontal row
className="flex items-center gap-2"
```

### Layout Utilities

```typescript
// Full height layouts
className="min-h-screen"
className="min-h-[400px]"
className="flex-1"  // Take remaining space

// Sticky positioning
className="sticky top-0 z-50"

// Hidden on mobile
className="hidden sm:inline"
className="hidden md:block"
```

## Accessibility

### Focus Styles

```typescript
// Focus rings (automatically applied by ui components)
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

// Disabled states
className="disabled:pointer-events-none disabled:opacity-50"
```

### Screen Reader Only

```typescript
<span className="sr-only">Loading...</span>
```

## State-Based Styling

### Loading States

```typescript
{isLoading && <LoadingSpinner className="text-primary" />}
{isLoading && <Skeleton className="h-48 w-full" />}
```

### Error States

```typescript
{error && (
  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
    <p className="text-sm text-red-600">{error}</p>
  </div>
)}
```

### Success States

```typescript
<div className="p-3 bg-green-50 border border-green-200 rounded-md">
  <p className="text-sm text-green-600">Success message</p>
</div>
```

## Dark Mode

### Enabling Dark Mode

Dark mode uses class-based strategy:

```typescript
// In tailwind.config.js
darkMode: ["class"]

// Apply dark mode
<html className="dark">
```

### Dark Mode Utilities

```typescript
// Manual dark mode styling (usually not needed with CSS variables)
className="bg-white dark:bg-gray-900"
className="text-gray-900 dark:text-white"
```

## Best Practices

1. **Use CSS variables for colors** - Ensures consistent theming
2. **Mobile-first responsive design** - Start with mobile, add breakpoints up
3. **Consistent spacing** - Use the spacing scale (gap-4, p-6, etc.)
4. **Semantic class names** - Use variants (destructive, ghost, etc.)
5. **Avoid arbitrary values** - Use design tokens when possible
6. **Group related styles** - Keep layout, spacing, colors, typography together
7. **Use component variants** - Leverage class-variance-authority for variants

## Common Patterns

### Page Layout

```typescript
<div className="container mx-auto px-4 py-8">
  <div className="text-center mb-12">
    <h1 className="text-4xl font-bold text-gray-900 mb-4">
      Page Title
    </h1>
    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
      Description text
    </p>
  </div>

  {/* Content */}
</div>
```

### Card with Hover Effect

```typescript
<Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
  <div className="p-6">
    <h3 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
      Card Title
    </h3>
  </div>
</Card>
```

### Form Layout

```typescript
<form onSubmit={handleSubmit} className="space-y-4">
  <FormGroup>
    <FormField label="Email" type="email" required />
    <FormField label="Password" type="password" required />
  </FormGroup>

  <FormActions align="right">
    <Button variant="outline" type="button">Cancel</Button>
    <Button type="submit">Submit</Button>
  </FormActions>
</form>
```

## Tailwind CSS v4 Features

### New `@import` Syntax

```css
/* index.css */
@import "tailwindcss";
```

### CSS Variables Everywhere

```css
/* Custom properties work seamlessly */
:root {
  --my-custom-color: 220 50% 50%;
}

.my-element {
  background: hsl(var(--my-custom-color));
}
```

### Better Performance

Tailwind v4 includes improved build performance and smaller bundle sizes with the new engine.
