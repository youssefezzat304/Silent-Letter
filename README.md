# Silent Letter (Beta version)

> A modern language learning application built with the T3 Stack, helping users improve their spelling and pronunciation skills through interactive audio exercises.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

## 🚀 Live Demo

**[View Live Application →](https://silent-letter-kappa.vercel.app/)**

## 📋 Table of Contents

* [Features](#-features "null")
* [Teck Stack](#-teck-stack)
* [Prerequisites](#-prerequisites "null")
* [Getting Started](#-getting-started "null")
* [Docker Deployment](#-docker-deployment "null")
* [Environment Variables](#-environment-variables "null")
* [Project Structure](#-project-structure "null")
* [Customization](#customization "null")
* [Testing Database Connection](#-testing-database-connection "null")
* [Troubleshooting](#troubleshooting "null")
* [License](#license "null")

## ✨ Features

* 🎧  **Audio-Based Learning** : Listen to words and practice spelling
* 🌍  **Multi-Language Support** : Currently supports English (US) and German (DE)
* 📊  **CEFR Level Filtering** : Learn at your pace (A1-C2)
* 🔐  **Authentication** : Secure login with Google OAuth and email/password
* 👤  **User Profiles** : Personalized learning experience with profile management
* 🎨  **Dark Mode** : Eye-friendly interface with theme toggle
* 📝  **Report System** : Submit feedback and report issues
* 🔊  **Sound Effects** : Interactive audio feedback for correct/incorrect answers
* ⚙️  **Customizable Settings** : Adjust delay timers, sound effects, and learning preferences

## 🛠 Tech Stack

### Core Framework

* **[Next.js 15](https://nextjs.org/)** - React framework with App Router
* **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
* **[React 19](https://react.dev/)** - UI library

### Backend & Database

* **[Prisma](https://www.prisma.io/)** - Next-generation ORM
* **[PostgreSQL](https://www.postgresql.org/)** (via Supabase) - Relational database

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
* **Docker** and **Docker Compose** (for containerized deployment)
* **PostgreSQL** (or a Supabase account)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/youssefezzat304/Silent-Letter.git
cd Silent-Letter
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

Fill in your environment variables (see [Environment Variables](https://claude.ai/chat/131bcf9f-9b2a-4d55-b9fb-6bfee1db0891#-environment-variables) section).

### 4. Prepare Audio Files

**Important:** This application requires audio files for each language and CEFR level. You need to add your audio files to the `public/audio_files` directory before running the application.

The expected directory structure is:

```
public/
└── audio_files/
    ├── en-us/
    │   ├── index/
    │   │   ├── A1_en_us_index.json
    │   │   ├── A2_en_us_index.json
    │   │   ├── B1_en_us_index.json
    │   │   ├── B2_en_us_index.json
    │   │   ├── C1_en_us_index.json
    │   │   └── C2_en_us_index.json
    │   ├── A1/
    │   │   └── [audio files].mp3
    │   ├── A2/
    │   └── ... (other levels)
    └── de-de/
        ├── index/
        │   ├── A1_de_de_index.json
        │   └── ... (other levels)
        └── A1/
            └── [audio files].mp3
```

Each index JSON file should follow this structure:

```json
{
  "entries": [
    {
      "id": "unique-id",
      "lang": "en-us",
      "level": "A1",
      "index": 0,
      "word": "example",
      "slug": "example",
      "file": "/audio_files/en-us/A1/example.mp3"
    }
  ]
}
```

**Note:** Without audio files, the application will not function properly. If you don't have audio files yet, you can create placeholder JSON files with the structure above, but the learning features won't work until you add actual audio content.

### 5. Set Up the Database

Run Prisma migrations:

```bash
npx prisma migrate deploy
npx prisma generate
```

Optionally, seed the database:

```bash
npx prisma db seed
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000/) in your browser.

## 🐳 Docker Deployment

### Prerequisites for Docker Deployment

1. **Audio Files:** Ensure your `public/audio_files` directory is populated with the required audio files and index JSON files (see step 4 above).
2. **Environment Variables:** Create a `.env` file with all required variables.

### Quick Start with Docker Compose

1. **Ensure audio files are in place:**
   ```bash
   ls -la public/audio_files/
   ```
2. **Create your `.env` file** with all required variables (see [Environment Variables](https://claude.ai/chat/131bcf9f-9b2a-4d55-b9fb-6bfee1db0891#-environment-variables))
3. **Build and run the container:**
   ```bash
   docker-compose up -d --build
   ```

The application will be available at `http://localhost:3000`

### Manual Docker Build

Build the Docker image:

```bash
docker build -t hear-and-spell \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  .
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

### Important Notes for Docker Deployment

* **Audio Files:** The Docker image will include whatever is in your `public/audio_files` directory at build time. Make sure these files are present before building.
* **File Size:** If you have large audio files, the Docker image size will increase accordingly. Consider using `.dockerignore` to exclude unnecessary files.
* **Updates:** If you add or modify audio files, you need to rebuild the Docker image for changes to take effect.

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

# Application
APP_URL="http://localhost:3000"             # Your application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000" # Public application URL

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

#### Resend Setup

1. Sign up at [resend.com](https://resend.com/)
2. Verify your domain
3. Generate an API key from the dashboard

## 📁 Project Structure

```
silent-letter/
├── public/                    # Static files
│   ├── audio_files/          # Language audio files (REQUIRED)
│   │   ├── en-us/           # English audio
│   │   │   ├── index/       # JSON index files
│   │   │   └── A1/          # Level-specific audio
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

## 🎨 Customization

### Adding New Languages

1. Add audio files to `public/audio_files/[language-code]/`
2. Create index JSON files following the structure above
3. Update `LANGUAGE_CONFIG` in `src/store/words.store.ts`
4. Add language option to `src/metadata.ts`
5. Update Prisma enum in `prisma/schema.prisma`

## 🧪 Testing Database Connection

Run the test script to verify your database setup:

```bash
node src/test-db.mjs
```

## 🔧 Troubleshooting

### Common Issues

**Database Connection Failed**

* Verify your `DATABASE_URL` is correct
* Check if your IP is whitelisted in Supabase
* Ensure database migrations are up to date

**Docker Build Fails**

* Check that all environment variables are set
* Ensure Docker has enough memory (4GB+ recommended)
* Try clearing Docker cache: `docker system prune -a`

**Audio Files Not Loading**

* Verify files exist in `public/audio_files/`
* Check file paths in index JSON files
* Ensure JSON structure matches the expected format
* For Docker: Rebuild the image after adding files

**Google OAuth Not Working**

* Verify redirect URIs in Google Cloud Console
* Check that both client ID and secret are correct
* Ensure cookies are enabled in browser

## License

This project is licensed under the MIT License.

## 📧 Contact

For questions or support, please open an issue or feel free to contact me on [LinkedIn](https://www.linkedin.com/in/youssef-abdelrahim-de/).

---

**Youssef Abdelrahim**
