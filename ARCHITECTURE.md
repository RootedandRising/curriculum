# Rooted & Rising - Christian Homeschool Curriculum Platform

## Vision
A complete Christian homeschool curriculum platform that makes teaching easy for parents and learning engaging for kids. Rooted in faith, rising in knowledge.

---

## Core Users

### 1. Parent/Teacher (Rielle)
- Sees daily dashboard with "Today's Lessons"
- Gets step-by-step teacher scripts
- Tracks all children's progress
- Manages schedule and school days
- Reviews/approves AI-generated content

### 2. Student (Kids)
- Age-appropriate interactive interface
- Completes lessons with various activity types
- Earns badges and achievements
- Can ask AI tutor questions
- Sees their own progress and streaks

---

## Core Features

### Daily Dashboard (Parent View)
- "Good morning, Rielle! Here's today's plan:"
- Lists each child and their lessons for the day
- One-click "Start School Day" button
- Shows schedule status (on track, behind, ahead)
- Quick stats: lessons completed this week, streaks

### Lesson Delivery (Teacher Scripts)
Each lesson includes:
- **Objective**: What the student will learn
- **Materials**: What you need (if anything)
- **Script**: Exactly what to say/read aloud
- **Discussion Questions**: Pre-written questions to ask
- **Activity**: What the student does
- **Assessment**: How to know they understood

### Student Mode (Kid View)
- Fun, colorful interface
- Current lesson with clear instructions
- Interactive elements:
  - Multiple choice questions
  - Drag-and-drop matching
  - Fill-in-the-blank
  - Read-aloud with text-to-speech
  - Drawing/writing prompts (upload photo of work)
  - Memory verses with practice mode
- Immediate feedback (correct/incorrect)
- Celebration animations for completion

### Auto-Scheduling
- Parent sets: school days (M-F, M-Th, etc.)
- Parent sets: start date, breaks, vacation weeks
- System generates full year schedule
- Automatically adjusts if lessons are missed
- Shows projected completion date

### Progress Tracking
- Visual progress bars per subject
- Calendar view of completed days
- "Behind/On Track/Ahead" indicator
- Detailed reports (daily, weekly, monthly)
- Exportable for record-keeping

### Achievement System
- Badges for:
  - Completing lessons
  - Streaks (5 days, 10 days, 30 days)
  - Mastering subjects
  - Memory verses
  - Perfect scores
- Certificates (printable PDF):
  - Unit completion
  - Grade level completion
  - Subject mastery
- Points system with rewards (parent-defined)

### AI Tutor
- Student can ask questions during lessons
- Age-appropriate, Christian-aligned responses
- Explains concepts in simple terms
- Encourages without giving direct answers
- Logs questions for parent review

### AI Content Generation (Admin)
- Generate lesson content from curriculum outline
- Review/edit/approve workflow
- Maintains consistent biblical worldview
- Creates varied activity types automatically

---

## Subjects (Starting with 1st-2nd Grade)

### Bible
- Daily devotional/Bible story
- Memory verse (weekly)
- Character trait focus
- Prayer journal prompts

### Language Arts
- Phonics & Reading
- Handwriting
- Spelling
- Grammar basics
- Read-alouds (book recommendations)

### Math
- Number sense
- Addition/Subtraction
- Place value
- Measurement
- Word problems
- Skip counting

### Science
- Creation-based worldview
- Animals & habitats
- Plants & life cycles
- Weather & seasons
- Human body basics
- Simple experiments

### History & Social Studies
- Bible history timeline
- American history (age-appropriate)
- Community helpers
- Geography basics
- Character/citizenship

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI**: OpenAI API (GPT-4 for tutor, content generation)
- **Text-to-Speech**: Web Speech API or ElevenLabs
- **PDF Generation**: React-PDF for certificates
- **Hosting**: Vercel
- **Payments** (future): Stripe

---

## Database Overview

### Core Tables
- `families` - Family accounts
- `users` - Parents and students (with roles)
- `students` - Student profiles linked to family
- `grades` - Grade levels (K, 1st, 2nd, etc.)
- `subjects` - Bible, Math, Language Arts, etc.
- `courses` - Grade + Subject combination
- `units` - Chapters within a course
- `lessons` - Individual lessons
- `lesson_content` - Content blocks within lessons
- `activities` - Interactive activities/questions
- `schedules` - Family school schedule settings
- `scheduled_lessons` - Planned lessons by date
- `progress` - Student lesson completion
- `achievements` - Available badges/achievements
- `student_achievements` - Earned achievements
- `ai_tutor_logs` - Questions asked to AI tutor

---

## Folder Structure

```
rooted-rising/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── parent/
│   │   │   ├── page.tsx (daily dashboard)
│   │   │   ├── children/
│   │   │   ├── schedule/
│   │   │   ├── progress/
│   │   │   └── settings/
│   │   ├── student/
│   │   │   ├── page.tsx (student dashboard)
│   │   │   ├── lesson/[id]/
│   │   │   ├── achievements/
│   │   │   └── ask-tutor/
│   │   └── layout.tsx
│   ├── (marketing)/
│   │   ├── page.tsx (landing page)
│   │   ├── pricing/
│   │   └── about/
│   ├── api/
│   │   ├── ai-tutor/
│   │   ├── generate-content/
│   │   └── webhooks/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/ (shadcn components)
│   ├── dashboard/
│   ├── lessons/
│   ├── activities/
│   ├── achievements/
│   └── shared/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── openai/
│   ├── utils/
│   └── constants/
├── types/
│   └── database.ts
├── hooks/
├── public/
│   ├── images/
│   ├── icons/
│   └── sounds/
├── supabase/
│   ├── migrations/
│   └── seed.sql
└── config files...
```

---

## MVP Scope (Phase 1)

### Must Have
- [ ] User auth (parent + student accounts)
- [ ] Family setup (add children)
- [ ] Parent daily dashboard
- [ ] Student lesson view
- [ ] Basic lesson content display
- [ ] Text-to-speech for readings
- [ ] Simple activities (multiple choice, fill-blank)
- [ ] Progress tracking (complete/incomplete)
- [ ] 1st Grade - Bible (4 weeks of content)
- [ ] 1st Grade - Language Arts (4 weeks)
- [ ] 1st Grade - Math (4 weeks)

### Phase 2
- [ ] Full 1st grade curriculum (36 weeks)
- [ ] Achievement system
- [ ] AI Tutor
- [ ] Auto-scheduling
- [ ] Certificate generation

### Phase 3
- [ ] 2nd grade curriculum
- [ ] AI content generation tools
- [ ] Multi-family support (for selling)
- [ ] Payment integration

---

## Sample Daily Flow

### Rielle's Morning (Parent)
1. Opens app, sees: "Wednesday, January 8 - 3 lessons scheduled"
2. Clicks "Start School Day"
3. First lesson loads: "1st Grade Bible - The Creation Story (Day 3)"
4. Sees teacher script: "Read Genesis 1:9-13 aloud, then ask: What did God create on Day 3?"
5. Student section shows activity for child to complete
6. Marks lesson complete, moves to next

### Student Experience
1. Logs in, sees fun dashboard with their avatar
2. "3 lessons today! Let's learn!"
3. Opens Bible lesson
4. Hears story read aloud (or reads along)
5. Answers questions by tapping/dragging
6. Sees "Great job!" animation
7. Earns 10 points, progress bar moves
8. Next lesson unlocks

---

## Biblical Integration Principles

Every subject connects back to faith:
- **Math**: "God is a God of order. Numbers help us see His patterns."
- **Science**: "Let's discover how God designed this amazing world."
- **History**: "See how God has worked through people and nations."
- **Language Arts**: "Words are powerful - God spoke the world into existence."

Memory verses tie into weekly themes across subjects.

---

## Next Steps

1. Review this architecture
2. Review database schema
3. Set up GitHub repo
4. Initialize Next.js project
5. Set up Supabase project
6. Build auth flow
7. Build parent dashboard
8. Build student lesson view
9. Create first week of content
10. Test with family
