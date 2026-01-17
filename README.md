# E-Commerce CMS with AI & SEO Features

A production-grade e-commerce CMS built with Next.js 14 (App Router), Supabase, and AI integration. Designed for SEO experts with powerful content management, analytics, and AI-powered tools.

## 🚀 Features

- **🛍️ Full E-Commerce** - Products, categories, variants, inventory management
- **🤖 AI-Powered** - AI-generated product descriptions, SEO metadata, and keyword research
- **📊 Advanced Analytics** - Event tracking, conversion funnels, performance metrics
- **🎯 SEO-First** - Comprehensive SEO tools matching WordPress plugins (Yoast/RankMath)
- **👥 Role-Based Access** - Admin, Editor, SEO Manager roles with granular permissions
- **🔒 Secure by Default** - Row Level Security, authentication, rate limiting
- **⚡ Performance** - Server Components, ISR, intelligent caching
- **🎨 Professional UI** - Dashboard and storefront with modern design

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **AI**: OpenAI / Anthropic
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js 18+ 
- Docker Desktop (for local development)
- Supabase account
- OpenAI API key (optional, for AI features)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Supabase CLI

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Or via npm:**
```bash
npm install -g supabase
```

### 3. Setup Database

```bash
# Start local Supabase (requires Docker)
npm run db:start

# This will:
# - Start PostgreSQL database
# - Run all migrations
# - Seed sample data
# - Start Supabase Studio UI

# View local credentials
npm run db:status
```

### 4. Configure Environment Variables

Create `.env.local`:

```bash
# Copy from example
cp .env.local.example .env.local

# Add your credentials (from `npm run db:status`)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key

# Optional: Add OpenAI key for AI features
OPENAI_API_KEY=your-openai-key
```

### 5. Generate TypeScript Types

```bash
npm run db:types
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Open Supabase Studio: [http://localhost:54323](http://localhost:54323)

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── (shop)/              # Public storefront routes
│   │   ├── (dashboard)/         # Admin CMS routes
│   │   └── api/                 # API endpoints
│   │       ├── ai/              # AI generation
│   │       ├── analytics/       # Analytics
│   │       ├── seo/             # SEO tools
│   │       └── webhooks/        # External webhooks
│   │
│   ├── lib/
│   │   ├── db/                  # Database clients
│   │   ├── services/            # Business logic layer
│   │   ├── validators/          # Zod schemas
│   │   └── utils/               # Helper functions
│   │
│   ├── components/
│   │   ├── dashboard/           # CMS components
│   │   ├── shop/                # Storefront components
│   │   └── ui/                  # Shared components
│   │
│   └── types/                   # TypeScript types
│
├── supabase/
│   ├── migrations/              # Database migrations
│   └── seed.sql                 # Sample data
│
└── scripts/                     # Utility scripts
```

## 🗄️ Database Schema

### Core Tables

- **profiles** - User profiles with roles
- **categories** - Hierarchical product categories
- **products** - Product catalog with full e-commerce fields
- **product_images** - Multiple images per product
- **seo_metadata** - SEO data for any entity
- **analytics_events** - Event tracking
- **ai_jobs** - AI generation queue
- **pages** - Custom CMS pages

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for full schema documentation.

## 🎯 Development Workflow

### Creating a New Feature

1. **Define types** in `src/types/`
2. **Create Zod schema** in `src/lib/validators/`
3. **Create service** in `src/lib/services/`
4. **Create API route** (if needed) in `src/app/api/`
5. **Create UI** in `src/components/` and pages in `src/app/`

### Database Migrations

```bash
# Create new migration
npm run db:migration:new add_new_feature

# Edit the generated file in supabase/migrations/
# Then apply it:
npm run db:reset

# When ready, push to remote
npm run db:migrate
```

### Working with Types

```bash
# Regenerate types after schema changes
npm run db:types

# Types are auto-generated in:
# src/types/database.types.ts
```

## 🔒 Security

- **Row Level Security (RLS)** - All tables protected by policies
- **Role-based access** - Admin, Editor, SEO Manager roles
- **Authentication** - Supabase Auth with email/password
- **Service role** - Only used in trusted backend code
- **Rate limiting** - On sensitive endpoints

## 📊 Available Scripts

```bash
# Development
npm run dev                    # Start Next.js dev server

# Database
npm run db:start              # Start local Supabase
npm run db:stop               # Stop local Supabase
npm run db:reset              # Reset & reapply migrations
npm run db:migrate            # Push migrations to remote
npm run db:migration:new      # Create new migration
npm run db:types              # Generate TypeScript types
npm run db:status             # Show local DB info

# Build
npm run build                 # Build for production
npm run start                 # Start production server

# Testing
npm run type-check            # TypeScript type checking
npx tsx scripts/test-db-connection.ts  # Test DB connection
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables (production Supabase credentials)
4. Deploy!

### Push Migrations to Production

```bash
# Link to production project
npm run db:link

# Push all migrations
npm run db:migrate

# Generate production types
npm run db:types:remote
```

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Initial setup walkthrough
- [Database Setup](./DATABASE_SETUP.md) - Complete database documentation
- [Migration Setup](./MIGRATION_SETUP.md) - Migration workflow guide
- [Quick Reference](./QUICK_REFERENCE.md) - Developer cheat sheet

## 🐛 Troubleshooting

### Docker not running
Start Docker Desktop before running `npm run db:start`

### Port conflicts
If ports are in use, stop Supabase: `npm run db:stop`

### Migration errors
Reset local database: `npm run db:reset`

### Connection issues
Check credentials in `.env.local` match output from `npm run db:status`

## 🤝 Contributing

This is a custom project template. Feel free to:
- Fork and customize for your needs
- Report issues
- Suggest improvements

## 📝 License

MIT

## 🎉 Next Steps

1. ✅ Complete setup following this README
2. ✅ Create your first admin user
3. ✅ Explore Supabase Studio (http://localhost:54323)
4. 🚧 Build authentication pages
5. 🚧 Create product management UI
6. 🚧 Add AI features
7. 🚧 Build analytics dashboard

## 📞 Support

- Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for common patterns
- Review [DATABASE_SETUP.md](./DATABASE_SETUP.md) for schema questions
- See [MIGRATION_SETUP.md](./MIGRATION_SETUP.md) for migration help

---

Built with ❤️ using Next.js, Supabase, and modern web technologies.
