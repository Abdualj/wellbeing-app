#!/bin/bash

# Wellbeing App Backend - Quick Setup Script
# This script sets up the development environment

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║  Wellbeing App Backend - Setup Script                 ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You'll need to set up PostgreSQL manually."
    SKIP_DOCKER=true
else
    echo "✅ Docker detected"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
else
    echo "✅ .env file already exists"
fi

# Start database with Docker
if [ -z "$SKIP_DOCKER" ]; then
    echo ""
    echo "🐳 Starting PostgreSQL with Docker..."
    docker-compose -f docker-compose.dev.yml up -d
    
    echo "⏳ Waiting for database to be ready..."
    sleep 5
    
    # Check if database is running
    if docker ps | grep -q wellbeing-db-dev; then
        echo "✅ Database is running"
    else
        echo "❌ Failed to start database"
        exit 1
    fi
fi

# Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npm run prisma:generate

# Run database migrations
echo ""
echo "🗄️  Running database migrations..."
npm run prisma:migrate

# Seed database
echo ""
read -p "Do you want to seed the database with test data? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    npm run prisma:seed
    echo "✅ Database seeded successfully"
fi

# Create logs directory
mkdir -p logs

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  ✨ Setup Complete!                                    ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Update your .env file with proper configuration"
echo "2. Start the development server: npm run dev"
echo "3. Visit http://localhost:3000/api-docs for API documentation"
echo ""
echo "Test credentials (if seeded):"
echo "  Email: alice@example.com | Password: Password123!"
echo "  Email: bob@example.com   | Password: Password123!"
echo "  Email: carol@example.com | Password: Password123!"
echo ""
echo "Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npm run prisma:studio - Open Prisma Studio (database GUI)"
echo "  npm test             - Run tests"
echo ""
