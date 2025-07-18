#!/bin/bash
# Build script for Render deployment

echo "🚀 Starting build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma db push

# Build Next.js application
echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"