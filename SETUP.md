# Rooted & Rising - Setup Guide

## Quick Start (Do This First!)

### Step 1: Create GitHub Repository
1. Go to github.com and create a new repo called `rooted-rising`
2. Make it private (for now)
3. Don't initialize with README (we'll push our files)

### Step 2: Clone & Setup Locally
```bash
# Navigate to your projects folder
cd C:\Users\Work\Projects  # or wherever you keep projects

# Clone the empty repo
git clone https://github.com/YOUR_USERNAME/rooted-rising.git
cd rooted-rising
```

### Step 3: Copy These Files
Copy all the files I created into your local repo folder:
- `ARCHITECTURE.md`
- `package.json`
- `supabase/schema.sql`
- `supabase/seed-sample-curriculum.sql`
- `SETUP.md` (this file)

### Step 4: Create Supabase Project
1. Go to https://supabase.com
2. Create new project called "rooted-rising"
3. Choose region closest to you
4. Save your password!
5. Wait for project to spin up (~2 min)

### Step 5: Run Database Schema
1. In Supabase dashboard, go to SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Run it
4. Then copy `supabase/seed-sample-curriculum.sql` and run it

### Step 6: Get Supabase Credentials
1. Go to Project Settings > API
2. Copy these values (you'll need them):
   - Project URL
   - anon/public key
   - service_role key (keep secret!)

### Step 7: Initialize Next.js with Claude Code
Open Claude Code in your project folder and say:

```
Initialize this as a Next.js 14 project with TypeScript, Tailwind CSS, and App Router. 
Set up Supabase auth with these credentials:
- URL: [your project url]
- Anon Key: [your anon key]

Then create the basic folder structure from ARCHITECTURE.md
```

---

## Environment Variables

Create `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## Deploying to Vercel

1. Push your code to GitHub
2. Go to vercel.com
3. Import your GitHub repo
4. Add environment variables
5. Deploy!

---

## What Claude Code Can Help You Build

Once you're set up, ask Claude Code to help you:

1. "Set up the auth flow with parent registration and student PIN login"
2. "Build the parent dashboard showing today's lessons"
3. "Create the student lesson view with activities"
4. "Add the achievement system"
5. "Build the AI tutor feature"

Work through it step by step - don't try to build everything at once!

---

## Questions?

Bring them back to our chat and we'll figure it out together.
