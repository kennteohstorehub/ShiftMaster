# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ShiftMaster is a modern AI-powered staff scheduling application built with Next.js 14, TypeScript, Google AI (Gemini), and PostgreSQL (Neon). It features intelligent schedule generation, drag-and-drop shift management, comprehensive leave management, and role-based authentication.

## Common Development Commands

```bash
npm run dev            # Start development server (http://localhost:3000)
npm run build          # Build for production
npm start              # Start production server
npm run lint           # Run ESLint checks

# Database commands
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Run database migrations
npm run db:seed        # Seed initial data
npm run db:studio      # Open Prisma Studio GUI
```

## Architecture

### Tech Stack
- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript with strict mode
- **UI**: Tailwind CSS + Shadcn/ui components
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Authentication**: NextAuth.js with credentials and GitHub providers
- **AI Integration**: Google AI (Gemini 2.0 Flash) via Firebase Genkit
- **Drag & Drop**: @dnd-kit/core
- **State Management**: React Context API with server persistence
- **Date Handling**: date-fns

### Project Structure

The application follows Next.js 14 App Router conventions with a clear separation of concerns:

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # RESTful API endpoints
│   │   ├── auth/          # NextAuth.js authentication
│   │   ├── staff/         # Staff CRUD operations
│   │   ├── shifts/        # Shift management
│   │   ├── roles/         # Role management
│   │   ├── leave-requests/# Leave request handling
│   │   └── tasks/         # Task management
│   ├── dashboard/         # Main dashboard (protected route)
│   ├── login/            # Authentication page
│   └── actions.ts        # Server actions for AI scheduling
├── components/           
│   ├── dashboard/        # Dashboard-specific components
│   │   ├── settings/     # Settings panel with staff/user management
│   │   └── *.tsx        # Schedule, staff panels, dialogs
│   └── ui/              # Reusable Shadcn/ui components
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # Database operations
│   ├── prisma.ts        # Prisma client instance
│   ├── types.ts         # Core TypeScript types
│   └── utils.ts         # Utility functions
├── hooks/               # Custom React hooks including useAuth
├── middleware.ts        # Auth middleware for route protection
└── prisma/
    ├── schema.prisma    # Database schema
    └── seed.ts          # Database seeding script
```

### Core Architectural Patterns

1. **Context-Based State Management**: The `AppContext` manages global application state for staff, shifts, roles, and tasks. It syncs with the database through API calls.

2. **Server Actions for AI**: AI schedule generation is handled through Next.js server actions (`app/actions.ts`), keeping API keys secure on the server side.

3. **RESTful API Design**: All database operations go through properly authenticated API routes in `app/api/`.

4. **Authentication Flow**: 
   - NextAuth.js handles authentication with multiple providers
   - Middleware protects dashboard routes
   - Role-based access control (SUPER_ADMIN, ADMIN, USER)

5. **Drag & Drop System**: Uses @dnd-kit for complex drag operations:
   - Staff can be dragged from the panel to empty schedule slots
   - Existing shifts can be dragged to swap staff or move to different slots
   - Shifts can be dragged outside to remove them

6. **Type-First Development**: All data structures are strongly typed in `lib/types.ts`

### Database Schema (Prisma)

```prisma
- User: Authentication and role management
- Staff: Employee profiles with skills and availability
- Role: Operational roles with staffing requirements
- Shift: Scheduled work assignments
- LeaveRequest: Time-off management system
- Task: Todo items and reminders
```

### Authentication & Security

- **NextAuth.js**: Handles authentication with credentials and GitHub OAuth
- **Middleware Protection**: Routes under `/dashboard` require authentication
- **Role-Based Access**: Different permissions for SUPER_ADMIN, ADMIN, and USER
- **Environment Variables**: All sensitive data stored in env vars

### AI Integration

The AI scheduling system uses Google's Gemini model to generate optimal schedules based on:
- Staff skills and availability
- Role requirements and coverage needs
- Existing leave requests
- Business rules (5-day work weeks, skill matching)
- Custom rules provided by the user

### Key Business Rules

1. **Operating Hours**: 9 AM - 9 PM (12-hour operation)
2. **Standard Shifts**: 9-6, 11-8, 12-9
3. **Work Week**: Each staff member works exactly 5 days
4. **Role Coverage**: LiveChat, Inbound, and Outbound roles with specific staffing requirements
5. **Leave Management**: Comprehensive system for sick, vacation, medical, personal, emergency, maternity, and paternity leave

## Development Notes

- The application uses absolute imports with `@/` prefix mapping to `./src/`
- ESLint is configured with Next.js core-web-vitals rules
- TypeScript is configured in strict mode
- All UI components are built on Radix UI primitives via Shadcn/ui
- Database migrations are handled through Prisma
- The app supports both development and production environments

## Environment Setup

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `NEXTAUTH_URL`: Application URL for authentication
- `NEXTAUTH_SECRET`: Secret for JWT encryption
- `GOOGLE_AI_API_KEY`: For AI schedule generation
- `GITHUB_ID` & `GITHUB_SECRET`: Optional GitHub OAuth

## Testing and Development

1. Always run `npm run lint` before committing
2. Use `npm run db:studio` to inspect database during development
3. Test authentication flow with both credentials and GitHub
4. Verify drag-and-drop functionality across different scenarios
5. Check role-based permissions for different user types

## Common Tasks

- **Adding new API endpoints**: Create in `app/api/` with proper authentication
- **Modifying database schema**: Update `prisma/schema.prisma` and run migrations
- **Adding new UI components**: Use Shadcn/ui CLI or create in `components/ui/`
- **Updating business logic**: Modify relevant functions in `lib/db.ts`
- **Changing authentication**: Update `lib/auth.ts` and middleware