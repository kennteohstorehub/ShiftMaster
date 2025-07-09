# ShiftMaster

A modern, AI-powered staff scheduling application built with Next.js, Firebase Studio, and Google AI.

## Features

- **AI-Powered Scheduling**: Automatically generate weekly schedules using Google AI (Gemini 2.0 Flash)
- **Interactive Drag & Drop**: Intuitive staff assignment with drag-and-drop functionality
- **Smart Constraints**: Ensures proper coverage, 5-day work weeks, and skill-based assignments
- **Real-time Updates**: Live schedule modifications with context-based state management
- **Modern UI**: Built with Tailwind CSS and Shadcn/ui components

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **AI Integration**: Firebase Genkit with Google AI
- **UI Components**: Shadcn/ui, Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **State Management**: React Context API

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
cp env.example .env.local
# Add your API keys (see Setup Guide below)
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── ai/                    # AI flows and configuration
│   ├── genkit.ts         # Google AI setup
│   └── flows/            # AI scheduling flows
├── app/                   # Next.js app router
│   ├── dashboard/        # Main dashboard page
│   └── actions.ts        # Server actions
├── components/           # Reusable UI components
│   ├── dashboard/        # Dashboard-specific components
│   └── ui/               # Shadcn/ui components
├── lib/                  # Utilities and types
│   ├── types.ts          # TypeScript definitions
│   ├── data.ts           # Sample data
│   └── utils.ts          # Utility functions
└── hooks/                # Custom React hooks
```

## Core Concepts

### Scheduling Rules
- 12-hour operations (9 AM - 9 PM)
- Three standard shifts: 9-6, 11-8, 12-9
- Each staff member works exactly 5 days per week
- Role-based staffing requirements (LiveChat, Inbound, Outbound)

### AI Integration
The application uses Google AI to generate optimal schedules based on:
- Staff skills and availability
- Operational requirements
- Existing shift constraints
- Custom rules and preferences

## Deployment Guide

### Quick Deploy to Vercel (FREE)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kennteohstorehub/ShiftMaster)

### Manual Setup

1. **Deploy to Vercel**:
   - Connect your GitHub repo to Vercel
   - Vercel will auto-detect Next.js and deploy

2. **Set up Supabase** (Database + Auth):
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and keys

3. **Configure Environment Variables** in Vercel:
   ```
   GOOGLE_GENAI_API_KEY=your_google_ai_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Get API Keys**:
   - **Google AI**: Get free key at [aistudio.google.com](https://aistudio.google.com)
   - **Supabase**: Available in your project dashboard

### Total Cost: $0/month for small teams! 🎉

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
