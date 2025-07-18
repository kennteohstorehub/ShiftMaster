# ShiftMaster

A modern, AI-powered staff scheduling application built with Next.js, Google AI, and PostgreSQL.

## Features

- **AI-Powered Scheduling**: Automatically generate weekly schedules using Google AI (Gemini 2.0 Flash)
- **Interactive Drag & Drop**: Intuitive staff assignment with drag-and-drop functionality
- **Smart Constraints**: Ensures proper coverage, 5-day work weeks, and skill-based assignments
- **Leave Management**: Comprehensive leave request system with multiple leave types
- **Role-Based Access**: Super admin, admin, and user roles with different permissions
- **Real-time Updates**: Live schedule modifications with database persistence
- **Modern UI**: Built with Tailwind CSS and Shadcn/ui components

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Authentication**: NextAuth.js with credentials and GitHub providers
- **AI Integration**: Google AI (Gemini) via Firebase Genkit
- **UI Components**: Shadcn/ui, Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **State Management**: React Context API with server persistence

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ShiftMaster
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Update with your credentials (see Setup Guide below)
```

4. Initialize the database:
```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:seed        # Seed initial data
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── ai/                    # AI flows and configuration
│   ├── genkit.ts         # Google AI setup
│   └── flows/            # AI scheduling flows
├── app/                   # Next.js app router
│   ├── api/              # API routes (staff, shifts, etc.)
│   ├── dashboard/        # Main dashboard page
│   ├── login/            # Authentication page
│   └── actions.ts        # Server actions
├── components/           # Reusable UI components
│   ├── dashboard/        # Dashboard-specific components
│   └── ui/               # Shadcn/ui components
├── lib/                  # Utilities and types
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database operations
│   ├── prisma.ts         # Prisma client
│   ├── types.ts          # TypeScript definitions
│   └── utils.ts          # Utility functions
├── hooks/                # Custom React hooks
└── middleware.ts         # Auth middleware
```

## Core Concepts

### Database Schema
- **Users**: Authentication and role management
- **Staff**: Employee profiles with skills and availability
- **Roles**: Operational roles (LiveChat, Inbound, Outbound)
- **Shifts**: Scheduled work assignments
- **Leave Requests**: Time-off management
- **Tasks**: Todo items and reminders

### Scheduling Rules
- 12-hour operations (9 AM - 9 PM)
- Three standard shifts: 9-6, 11-8, 12-9
- Each staff member works exactly 5 days per week
- Role-based staffing requirements
- Respects leave requests and availability

### AI Integration
The application uses Google AI to generate optimal schedules based on:
- Staff skills and availability
- Operational requirements
- Existing shift constraints
- Leave requests
- Custom rules and preferences

## Setup Guide

### 1. Database Setup (Neon PostgreSQL)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy your connection string from the dashboard
4. Update `DATABASE_URL` in `.env.local`

### 2. Authentication Setup
1. Generate a NextAuth secret:
   ```bash
   openssl rand -base64 32
   ```
2. Update `NEXTAUTH_SECRET` in `.env.local`

### 3. GitHub OAuth (Optional)
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App:
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/api/auth/callback/github`
3. Update `GITHUB_ID` and `GITHUB_SECRET` in `.env.local`

### 4. Google AI Setup
1. Get an API key from [Google AI Studio](https://aistudio.google.com)
2. Update `GOOGLE_AI_API_KEY` in `.env.local`

## Database Commands

```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Run migrations
npm run db:seed        # Seed initial data
npm run db:studio      # Open Prisma Studio (GUI)
```

## Default Credentials

After seeding, you can login with:
- **Email**: kenn.teoh@storehub.com
- **Password**: ShiftMaster2024!

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables:
   - `DATABASE_URL` (Neon PostgreSQL)
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`
   - `GOOGLE_AI_API_KEY`
   - `GITHUB_ID` and `GITHUB_SECRET` (optional)

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- Railway
- Render
- Fly.io
- AWS Amplify
- Netlify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.