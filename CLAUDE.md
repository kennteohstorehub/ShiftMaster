# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ShiftMaster is a modern AI-powered staff scheduling application built with Next.js 14, TypeScript, and Google AI (Gemini). It features intelligent schedule generation, drag-and-drop shift management, and comprehensive leave management.

## Common Development Commands

```bash
npm run dev            # Start development server (http://localhost:3000)
npm run build          # Build for production
npm start              # Start production server
npm run lint           # Run ESLint checks
```

## Architecture

### Tech Stack
- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript with strict mode
- **UI**: Tailwind CSS + Shadcn/ui components
- **Database & Auth**: Supabase
- **AI Integration**: Google AI (Gemini 2.0 Flash) via Firebase Genkit
- **Drag & Drop**: @dnd-kit/core
- **State Management**: React Context API
- **Date Handling**: date-fns

### Project Structure

The application follows Next.js 14 App Router conventions with a clear separation of concerns:

```
src/
├── app/                    # Next.js App Router pages and server actions
│   ├── dashboard/         # Main dashboard (protected route)
│   ├── login/            # Authentication page
│   └── actions.ts        # Server actions for AI scheduling
├── components/           
│   ├── dashboard/        # Dashboard-specific components
│   │   ├── settings/     # Settings panel with staff/user management
│   │   └── *.tsx        # Schedule, staff panels, dialogs
│   └── ui/              # Reusable Shadcn/ui components
├── lib/
│   ├── types.ts         # Core TypeScript types (Staff, Shift, LeaveRequest, etc.)
│   ├── data.ts          # Sample data and constants
│   ├── supabase.ts      # Supabase client configuration
│   └── utils.ts         # Utility functions
└── middleware.ts        # Auth middleware for route protection
```

### Core Architectural Patterns

1. **Context-Based State Management**: The `AppContext` manages global application state for staff, shifts, roles, and tasks. All dashboard components access state through this context.

2. **Server Actions for AI**: AI schedule generation is handled through Next.js server actions (`app/actions.ts`), keeping API keys secure on the server side.

3. **Drag & Drop System**: Uses @dnd-kit for complex drag operations:
   - Staff can be dragged from the panel to empty schedule slots
   - Existing shifts can be dragged to swap staff or move to different slots
   - Shifts can be dragged outside to remove them

4. **Type-First Development**: All data structures are strongly typed in `lib/types.ts`, including:
   - `Staff`: Employee data with skills and availability
   - `Shift`: Time slot assignments with role requirements
   - `LeaveRequest`: Comprehensive leave management system
   - `Role`: Operational roles with staffing requirements

### Authentication & Database

- **Supabase Integration**: Handles both authentication and data persistence
- **Middleware Protection**: Routes under `/dashboard` require authentication
- **Environment Variables**: All Supabase configuration via env vars

### AI Integration

The AI scheduling system uses Google's Gemini model to generate optimal schedules based on:
- Staff skills and availability
- Role requirements and coverage needs
- Existing leave requests
- Business rules (5-day work weeks, skill matching)

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
- The Supabase configuration in `supabase/` is for local development

## Environment Setup

Required environment variables (see env.example):
- `GOOGLE_AI_API_KEY`: For AI schedule generation
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: For server-side Supabase operations