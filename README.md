# Silent Letter

> A modern language learning application built with the T3 Stack, helping users improve their spelling and pronunciation skills through interactive audio exercises.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

## 📋 Table of Contents

* [Features](https://claude.ai/chat/133183ff-413a-4aaf-9150-cfc1a2795940#-features)
* [Tech Stack](https://claude.ai/chat/133183ff-413a-4aaf-9150-cfc1a2795940#-tech-stack)
* [Prerequisites](https://claude.ai/chat/133183ff-413a-4aaf-9150-cfc1a2795940#-prerequisites)
* [Getting Started](https://claude.ai/chat/133183ff-413a-4aaf-9150-cfc1a2795940#-getting-started)
* [Docker Deployment](https://claude.ai/chat/133183ff-413a-4aaf-9150-cfc1a2795940#-docker-deployment)
* [Environment Variables](https://claude.ai/chat/133183ff-413a-4aaf-9150-cfc1a2795940#-environment-variables)
* [Project Structure](https://claude.ai/chat/133183ff-413a-4aaf-9150-cfc1a2795940#-project-structure)
* [Database Schema](https://claude.ai/chat/133183ff-413a-4aaf-9150-cfc1a2795940#-database-schema)
* [API Routes](https://claude.ai/chat/133183ff-413a-4aaf-9150-cfc1a2795940#-api-routes)
* [Contributing](https://claude.ai/chat/133183ff-413a-4aaf-9150-cfc1a2795940#-contributing)
* [License](https://claude.ai/chat/133183ff-413a-4aaf-9150-cfc1a2795940#-license)

## Features

* 🎧  **Audio-Based Learning** : Listen to words and practice spelling
* 🌍  **Multi-Language Support** : Currently supports English (US) and German (DE)
* 📊  **CEFR Level Filtering** : Learn at your pace (A1-C2)
* 🔐  **Authentication** : Secure login with Google OAuth and email/password
* 👤  **User Profiles** : Personalized learning experience with profile management
* 🎨  **Dark Mode** : Eye-friendly interface with theme toggle
* 📝  **Report System** : Submit feedback and report issues
* 🔊  **Sound Effects** : Interactive audio feedback for correct/incorrect answers
* ⚙️  **Customizable Settings** : Adjust delay timers, sound effects, and learning preferences

## Tech Stack

### Core Framework

* **[Next.js 15](https://nextjs.org/)** - React framework with App Router
* **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
* **[React 19](https://react.dev/)** - UI library

### Backend & Database

* **[Prisma](https://www.prisma.io/)** - Next-generation ORM
* **[PostgreSQL](https://www.postgresql.org/)** (via Supabase) - Relational database
* **[tRPC](https://trpc.io/)** - End-to-end typesafe APIs

### Authentication & Storage

* **[Supabase](https://supabase.com/)** - Authentication & Storage
* **Google OAuth** - Social authentication

### UI & Styling

* **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
* **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable components
* **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives

### State Management & Forms

* **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management
* **[React Hook Form](https://react-hook-form.com/)** - Performant forms
* **[Zod](https://zod.dev/)** - Schema validation

### Additional Services

* **[Resend](https://resend.com/)** - Email delivery
* **[Vercel](https://vercel.com/)** - Deployment platform

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js** (v20 or higher)
* **npm** or **yarn** or **pnpm**
* **Docker** (optional, for containerized deployment)
* **PostgreSQL** (or a Supabase account)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hear-and-spell.git
cd hear-and-spell
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in your environment variables (see [Environment Variables](https://claude.ai/chat/133183ff-413a-4aaf-9150-cfc1a2795940#-environment-variables) section).

### 4. Set Up the Database

Run Prisma migrations:

```bash
npx prisma migrate deploy
npx prisma generate
```

Optionally, seed the database:

```bash
npx prisma db seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000/) in your browser.

## 🐳 Docker Deployment

### Quick Start with Docker Compose

1. **Ensure Docker is installed** on your system
2. **Create your `.env` file** with all required variables
3. **Build and run the container** :

```bash
docker-compose up -d
```

The application will be available at `http://localhost:3000`

### Manual Docker Build

Build the Docker image:

```bash
docker build -t hear-and-spell .
```

Run the container:

```bash
docker run -p 3000:3000 \
  --env-file .env \
  --name hear-and-spell \
  hear-and-spell
```

### Docker Commands Reference

```bash
# View logs
docker-compose logs -f app

# Stop the application
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Execute commands inside the container
docker-compose exec app sh

# Check container status
docker-compose ps
```

### Production Deployment

For production deployment, consider:

1. **Using a reverse proxy** (Nginx, Caddy) for SSL/TLS
2. **Setting up health checks** and monitoring
3. **Configuring automatic backups** for your database
4. **Using Docker secrets** for sensitive environment variables
5. **Implementing container orchestration** (Kubernetes, Docker Swarm)

## 🔑 Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://..."              # Supabase connection string with pgbouncer
DIRECT_URL="postgresql://..."                # Direct database connection

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."      # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."         # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY="..."             # Service role key (server-side only)

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID="..."          # Google OAuth client ID
GOOGLE_CLIENT_SECRET="..."                   # Google OAuth client secret

# Email
REPORTS_TO_EMAIL="reports@yourdomain.com"   # Email for receiving reports
RESEND_API_KEY="re_..."                      # Resend API key
```

### Optional Variables

```bash
SUPABASE_ACCESS_TOKEN="..."                  # For Supabase CLI/API access
NODE_ENV="production"                        # Environment mode
SKIP_ENV_VALIDATION="false"                  # Skip environment validation
```

### Getting Your Credentials

#### Supabase Setup

1. Create account at [supabase.com](https://supabase.com/)
2. Create a new project
3. Go to Settings → API to get your keys
4. Go to Settings → Database to get connection strings

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   * `http://localhost:3000/api/auth/callback/google` (development)
   * `https://yourdomain.com/api/auth/callback/google` (production)

#### Resend Setup

1. Sign up at [resend.com](https://resend.com/)
2. Verify your domain
3. Generate an API key from the dashboard

## 📁 Project Structure

```
hear-and-spell/
├── public/                    # Static files
│   ├── audio_files/          # Language audio files
│   │   ├── en-us/           # English audio
│   │   └── de-de/           # German audio
│   └── website_sounds/       # UI sound effects
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── _components/     # Shared components
│   │   ├── api/             # API routes
│   │   ├── auth/            # Authentication pages
│   │   ├── profile/         # User profile
│   │   └── support/         # Support pages
│   ├── components/          # UI components (shadcn/ui)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   │   └── supabase/       # Supabase client setup
│   ├── schema/              # Zod validation schemas
│   ├── server/              # Server-side code
│   │   └── api/            # tRPC routers
│   ├── store/               # Zustand state management
│   ├── styles/              # Global styles
│   └── types/               # TypeScript type definitions
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile              # Docker image definition
├── .dockerignore           # Docker ignore file
├── .env.example            # Example environment variables
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Node.js dependencies
```

## Database Schema

### Main Tables

#### `profiles`

User profile information

* `id` (UUID, PK) - User ID from Supabase Auth
* `name` (String) - Display name
* `image` (String) - Avatar URL
* `createdAt`, `updatedAt` (DateTime)

#### `words_preferences`

User learning preferences

* `id` (UUID, PK)
* `userId` (UUID, FK → profiles)
* `levels` (Level[]) - Selected CEFR levels
* `wordsLanguage` (Enum) - UI language preference
* `delayTimer` (Int) - Delay in seconds

#### `reports`

User-submitted reports and feedback

* `id` (UUID, PK)
* `userId` (UUID, FK → profiles, optional)
* `subject`, `message` (String)
* `problemType` (Enum)
* `priority`, `status` (Enum)
* `attachments` → `report_attachments`

### Enums

* `Level`: A1, A2, B1, B2, C1, C2
* `WordsLanguage`: en, de
* `ProblemType`: SPELLING, PRONUNCIATION, BAD_WORD, UI_UX, SERVER, OTHER
* `ReportStatus`: OPEN, IN_PROGRESS, RESOLVED, DISMISSED
* `ReportPriority`: LOW, MEDIUM, HIGH, CRITICAL

## Customization

### Adding New Languages

1. Add audio files to `public/audio_files/[language-code]/`
2. Update `LANGUAGE_CONFIG` in `src/store/words.store.ts`
3. Add language option to `src/metadata.ts`
4. Update Prisma enum in `prisma/schema.prisma`

## 🧪 Testing Database Connection

Run the test script to verify your database setup:

```bash
node src/test-db.mjs
```

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

### Prisma Scripts

```bash
npx prisma studio           # Open Prisma Studio
npx prisma migrate dev      # Create migration
npx prisma migrate deploy   # Apply migrations
npx prisma generate         # Generate Prisma Client
npx prisma db push          # Push schema without migration
```

### Code Style

* Use TypeScript for all new files
* Follow the existing ESLint configuration
* Use Prettier for code formatting
* Write meaningful commit messages

## Troubleshooting

### Common Issues

**Database Connection Failed**

* Verify your `DATABASE_URL` is correct
* Check if your IP is whitelisted in Supabase
* Ensure database migrations are up to date

**Docker Build Fails**

* Check that all environment variables are set
* Ensure Docker has enough memory (4GB+ recommended)
* Try clearing Docker cache: `docker system prune -a`

**Google OAuth Not Working**

* Verify redirect URIs in Google Cloud Console
* Check that both client ID and secret are correct
* Ensure cookies are enabled in browser

## License

This project is licensed under the MIT License - see the [LICENSE](https://claude.ai/chat/LICENSE) file for details.

## Acknowledgments

* Built with [T3 Stack](https://create.t3.gg/)
* UI components from [shadcn/u](https://ui.shadcn.com/)i

## 📧 Contact

For questions or support, please open an issue or contact

---

**Youssef Abdelrahim**
