#!/bin/bash

# Quick Start Script for Database Migrations
# This script helps you get started with Supabase migrations

set -e

echo "🚀 Supabase Migration Quick Start"
echo "=================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo ""
    echo "Please install it first:"
    echo ""
    echo "macOS/Linux:"
    echo "  brew install supabase/tap/supabase"
    echo ""
    echo "Windows (PowerShell):"
    echo "  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git"
    echo "  scoop install supabase"
    echo ""
    echo "Or via npm:"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI found: $(supabase --version)"
echo ""

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please start Docker Desktop and try again."
    echo ""
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if already initialized
if [ ! -d "supabase" ]; then
    echo "📁 Initializing Supabase project..."
    supabase init
    echo "✅ Supabase initialized"
    echo ""
fi

# Check if migration exists
if [ ! -f "supabase/migrations/20260202000000_initial_schema.sql" ]; then
    echo "⚠️  Initial migration not found!"
    echo "Please make sure supabase-migration.sql is copied to:"
    echo "  supabase/migrations/20260202000000_initial_schema.sql"
    echo ""
    exit 1
fi

echo "📊 Starting local Supabase..."
supabase start
echo ""

echo "✅ Supabase is running!"
echo ""

# Show credentials
echo "📋 Local Database Credentials:"
echo "================================"
supabase status
echo ""

echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "  1. Update your .env.local with local credentials (shown above)"
echo "  2. Run: npm run db:types (generate TypeScript types)"
echo "  3. Run: npm run dev (start Next.js)"
echo "  4. Open: http://localhost:54323 (Supabase Studio)"
echo ""
echo "Useful commands:"
echo "  npm run db:stop         - Stop Supabase"
echo "  npm run db:reset        - Reset database"
echo "  npm run db:migration:new - Create new migration"
echo ""