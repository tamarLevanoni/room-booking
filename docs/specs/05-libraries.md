# 5. Required Libraries

## 5.1 Backend Libraries

### Core Framework
- **express** - Web framework
- **typescript** - Type safety
- **ts-node** - TypeScript execution for dev
- **tsx** - Fast TypeScript execution (alternative to ts-node)

### Database & ODM
- **mongoose** - MongoDB ODM
- **@types/mongoose** - TypeScript types for Mongoose

### Authentication
- **jsonwebtoken** - JWT creation and verification
- **bcrypt** - Password hashing
- **@types/bcrypt** - TypeScript types for bcrypt
- **@types/jsonwebtoken** - TypeScript types for JWT

### Validation
- **zod** - Input validation and type inference

### Redis
- **redis** or **ioredis** - Redis client for caching

### Middleware
- **express-rate-limit** - Rate limiting
- **helmet** - Security headers
- **cors** - CORS configuration
- **cookie-parser** - Parse cookies (for refresh tokens)

### Error Handling & Logging
- **@sentry/node** - Error tracking (optional for MVP)
- **winston** or **pino** - Logging (choose one)

### Development
- **nodemon** - Auto-restart on file changes
- **dotenv** - Environment variable loading

### Testing
- **vitest** - Test runner
- **@vitest/ui** - Test UI (optional)
- **supertest** - HTTP assertions for API tests
- **@types/supertest** - TypeScript types

## 5.2 Frontend Libraries

### Core Framework
- **react** - UI library
- **react-dom** - React DOM renderer
- **typescript** - Type safety

### Routing
- **react-router-dom** - Client-side routing

### Build Tool
- **vite** - Fast build tool
- **@vitejs/plugin-react** - Vite plugin for React

### Data Fetching & State
- **@tanstack/react-query** - Server state management, caching
- **zustand** - Global client state management (auth state)
- **axios** or **ky** - HTTP client (choose one)

### Forms
- **react-hook-form** - Form state management
- **@hookform/resolvers** - Validation resolvers (for Zod)
- **zod** - Schema validation (shared with backend)

### UI Components
- **shadcn/ui** - Component library (install via CLI, not npm)
  - Uses: **@radix-ui/** primitives
  - **tailwindcss** - Utility-first CSS
  - **tailwind-merge** - Merge Tailwind classes
  - **clsx** - Conditional class names

### UI Utilities
- **date-fns** or **dayjs** - Date manipulation (choose one)
- **react-hot-toast** or **sonner** - Toast notifications (choose one)
- **lucide-react** - Icons

### Development
- **@types/react** - TypeScript types for React
- **@types/react-dom** - TypeScript types for React DOM
- **eslint** - Linting
- **@typescript-eslint/parser** - TypeScript parser for ESLint
- **@typescript-eslint/eslint-plugin** - TypeScript rules

### Testing
- **vitest** - Test runner
- **@testing-library/react** - React component testing
- **@testing-library/jest-dom** - DOM matchers
- **jsdom** - DOM implementation for tests

## 5.3 Shared/Common

### TypeScript
- **typescript** - Shared version across frontend/backend (5.0+)

### Validation
- **zod** - Shared schemas for API contracts (optional: monorepo)

## 5.4 Installation Commands

### Backend
```bash
cd backend
npm install express typescript ts-node
npm install mongoose
npm install jsonwebtoken bcrypt zod
npm install redis
npm install express-rate-limit helmet cors cookie-parser
npm install dotenv
npm install -D @types/mongoose @types/node @types/express @types/bcrypt @types/jsonwebtoken
npm install -D vitest supertest @types/supertest
npm install -D nodemon
```

### Frontend
```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install react-router-dom
npm install @tanstack/react-query zustand axios
npm install react-hook-form @hookform/resolvers zod
npm install date-fns react-hot-toast lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### shadcn/ui Setup
```bash
cd frontend
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input calendar dialog toast
```

## 5.5 Optional Enhancements (Future)

- **@sentry/react** - Frontend error tracking
- **react-error-boundary** - Error boundaries
- **@tanstack/react-table** - Advanced tables (for admin panel)
- **recharts** or **victory** - Charts/graphs (for analytics)
- **socket.io** - Real-time updates (booking conflicts)
