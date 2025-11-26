# Component Structure - Simplified

## 📁 Structure

```
src/components/
├── index.ts                  # Central export hub
│
├── ui/                       # All reusable UI components
│   ├── index.ts
│   │
│   ├── button.tsx           # Base primitives (shadcn/ui)
│   ├── card.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── dialog.tsx
│   ├── calendar.tsx
│   ├── skeleton.tsx
│   ├── toast.tsx
│   │
│   ├── FormField.tsx        # Form components
│   ├── FormGroup.tsx
│   ├── FormActions.tsx
│   │
│   ├── LoadingSpinner.tsx   # Feedback components
│   ├── LoadingOverlay.tsx
│   ├── PageLoader.tsx
│   ├── ErrorMessage.tsx
│   └── EmptyState.tsx
│
├── layout/                   # Layout structure
│   ├── Layout.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Navigation.tsx
│   └── index.ts
│
└── rooms/                    # Room feature components
    ├── RoomCard.tsx
    ├── RoomCardSkeleton.tsx
    ├── RoomGrid.tsx
    └── index.ts
```

## 🎯 שימוש

### ייבוא רכיבים
```typescript
import {
  Button,
  Card,
  FormField,
  ErrorMessage,
  RoomCard
} from '@/components';
```

## 📊 סטטיסטיקה

| קטגוריה | רכיבים |
|---------|--------|
| UI | 17 |
| Layout | 4 |
| Rooms | 3 |
| **סה"כ** | **24** |

## ✨ יתרונות המבנה הפשוט

1. **פחות תיקיות** - קל יותר לנווט
2. **הכל ב-`ui/`** - כל הרכיבים הכלליים במקום אחד
3. **עדיין מאורגן** - קל למצוא רכיבים לפי סוג
4. **לא over-engineered** - מתאים לגודל הפרויקט

## 📖 דוקומנטציה נוספת

- [README_COMPONENTS.md](./README_COMPONENTS.md) - מדריך מהיר
- [STYLING_GUIDE.md](./STYLING_GUIDE.md) - מדריך עיצוב
