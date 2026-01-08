-- =====================================================
-- ROOTED & RISING - Database Schema
-- Christian Homeschool Curriculum Platform
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE USER & FAMILY TABLES
-- =====================================================

-- Families (the account holder)
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- "The Smith Family"
    email VARCHAR(255) UNIQUE NOT NULL,
    subscription_status VARCHAR(50) DEFAULT 'trial', -- trial, active, cancelled, expired
    subscription_plan VARCHAR(50) DEFAULT 'free', -- free, basic, premium
    trial_ends_at TIMESTAMPTZ,
    school_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 1=Mon, 5=Fri
    school_start_time TIME DEFAULT '08:00:00',
    timezone VARCHAR(100) DEFAULT 'America/Chicago',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (parents and students)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255), -- NULL for students (they use PIN)
    role VARCHAR(20) NOT NULL CHECK (role IN ('parent', 'student')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    avatar_url TEXT,
    pin VARCHAR(6), -- For student login (simple PIN)
    is_primary_parent BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student profiles (extended info for students)
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    birth_date DATE,
    current_grade_id UUID, -- References grades table
    learning_style VARCHAR(50), -- visual, auditory, kinesthetic
    notes TEXT, -- Parent notes about the child
    points_total INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_lesson_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CURRICULUM STRUCTURE TABLES
-- =====================================================

-- Grade levels
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL, -- "1st Grade", "2nd Grade"
    slug VARCHAR(20) UNIQUE NOT NULL, -- "1st", "2nd"
    order_index INTEGER NOT NULL, -- For sorting
    age_range VARCHAR(20), -- "6-7"
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- "Bible", "Math", "Language Arts"
    slug VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(50), -- Icon name for UI
    color VARCHAR(20), -- Hex color for UI
    description TEXT,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses (Grade + Subject combination)
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade_id UUID REFERENCES grades(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- "1st Grade Bible"
    description TEXT,
    total_weeks INTEGER DEFAULT 36,
    lessons_per_week INTEGER DEFAULT 4,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(grade_id, subject_id)
);

-- Units (Chapters/Modules within a course)
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- "Creation and Early Earth"
    description TEXT,
    order_index INTEGER NOT NULL,
    week_start INTEGER, -- Which week this unit starts
    week_end INTEGER, -- Which week this unit ends
    memory_verse TEXT, -- Unit memory verse
    memory_verse_reference VARCHAR(100), -- "Genesis 1:1"
    character_trait VARCHAR(100), -- "Obedience", "Faith"
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- "Day 1: God Creates Light"
    slug VARCHAR(255),
    description TEXT,
    order_index INTEGER NOT NULL,
    day_number INTEGER, -- Day within the unit
    week_number INTEGER, -- Week within the course
    
    -- Lesson objectives
    objectives TEXT[], -- Array of learning objectives
    
    -- Time estimates
    estimated_minutes INTEGER DEFAULT 30,
    
    -- Teacher script
    teacher_intro TEXT, -- What to say at the start
    teacher_script TEXT, -- Main teaching content
    discussion_questions TEXT[], -- Questions to ask
    teacher_closing TEXT, -- How to wrap up
    
    -- Materials needed
    materials_needed TEXT[],
    
    -- Biblical integration
    bible_connection TEXT,
    prayer_prompt TEXT,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lesson content blocks (modular content within a lesson)
CREATE TABLE lesson_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, 
    -- Types: reading, instruction, scripture, story, vocabulary, example, note, media
    order_index INTEGER NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL, -- Main content (can be markdown)
    content_meta JSONB, -- Additional metadata (audio_url, image_url, etc.)
    is_read_aloud BOOLEAN DEFAULT FALSE, -- Should this be read with TTS?
    for_student BOOLEAN DEFAULT TRUE, -- Show to student?
    for_teacher BOOLEAN DEFAULT TRUE, -- Show to teacher?
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities (interactive elements within lessons)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    -- Types: multiple_choice, fill_blank, matching, drag_drop, 
    --        true_false, short_answer, drawing, memory_verse, ordering
    order_index INTEGER NOT NULL,
    title VARCHAR(255),
    instructions TEXT,
    question_text TEXT,
    
    -- Activity data stored as JSON for flexibility
    activity_data JSONB NOT NULL,
    /*
    Examples:
    multiple_choice: { "options": ["A", "B", "C", "D"], "correct": 0 }
    fill_blank: { "text": "God created the ___ on day one.", "answers": ["light"] }
    matching: { "pairs": [{"left": "Day 1", "right": "Light"}, ...] }
    ordering: { "items": ["Adam", "Eve", "Cain"], "correct_order": [0, 1, 2] }
    memory_verse: { "verse": "In the beginning...", "reference": "Genesis 1:1" }
    */
    
    points INTEGER DEFAULT 10,
    hint TEXT, -- Optional hint
    explanation TEXT, -- Shown after answering
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SCHEDULING TABLES
-- =====================================================

-- Family schedule settings
CREATE TABLE schedule_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID UNIQUE REFERENCES families(id) ON DELETE CASCADE,
    school_year_start DATE,
    school_year_end DATE,
    break_dates JSONB, -- Array of date ranges for breaks
    -- [{"start": "2025-12-20", "end": "2026-01-03", "name": "Christmas Break"}]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student course enrollment
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, paused
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    current_lesson_id UUID REFERENCES lessons(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- Scheduled lessons (the daily plan)
CREATE TABLE scheduled_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    order_index INTEGER DEFAULT 0, -- Order within the day
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, skipped
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, lesson_id, scheduled_date)
);

-- =====================================================
-- PROGRESS TRACKING TABLES
-- =====================================================

-- Lesson progress
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_started', 
    -- not_started, in_progress, completed
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    time_spent_seconds INTEGER DEFAULT 0,
    score_percent DECIMAL(5,2), -- If graded
    notes TEXT, -- Parent notes on performance
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, lesson_id)
);

-- Activity responses (individual answers)
CREATE TABLE activity_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    lesson_progress_id UUID REFERENCES lesson_progress(id) ON DELETE CASCADE,
    response_data JSONB NOT NULL, -- The student's answer
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 1,
    time_spent_seconds INTEGER,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily summaries (for quick dashboard queries)
CREATE TABLE daily_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    lessons_scheduled INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    total_points_earned INTEGER DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date)
);

-- =====================================================
-- ACHIEVEMENT SYSTEM TABLES
-- =====================================================

-- Achievement definitions
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    badge_image_url TEXT,
    category VARCHAR(50), -- streak, completion, mastery, special
    requirement_type VARCHAR(50) NOT NULL,
    -- Types: streak_days, lessons_completed, subject_completed, 
    --        perfect_score, memory_verse, course_completed
    requirement_value INTEGER, -- e.g., 5 for 5-day streak
    requirement_meta JSONB, -- Additional requirements
    points_reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student earned achievements
CREATE TABLE student_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, achievement_id)
);

-- Certificates
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    certificate_type VARCHAR(50) NOT NULL, 
    -- unit_completion, course_completion, grade_completion, memory_verse, special
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reference_id UUID, -- ID of unit/course/etc
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    pdf_url TEXT, -- Generated PDF
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AI TUTOR TABLES
-- =====================================================

-- AI tutor conversation logs
CREATE TABLE ai_tutor_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id),
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    context JSONB, -- What lesson/activity they were on
    flagged_for_review BOOLEAN DEFAULT FALSE,
    parent_reviewed BOOLEAN DEFAULT FALSE,
    parent_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CONTENT MANAGEMENT TABLES (for AI generation)
-- =====================================================

-- Generated content queue (for review)
CREATE TABLE content_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(50) NOT NULL, -- lesson, activity, unit
    target_id UUID, -- Which lesson/unit this is for
    generated_content JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, edited
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_family ON users(family_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_student_profiles_family ON student_profiles(family_id);
CREATE INDEX idx_lessons_unit ON lessons(unit_id);
CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lesson_content_lesson ON lesson_content(lesson_id);
CREATE INDEX idx_activities_lesson ON activities(lesson_id);
CREATE INDEX idx_scheduled_lessons_date ON scheduled_lessons(scheduled_date);
CREATE INDEX idx_scheduled_lessons_student ON scheduled_lessons(student_id);
CREATE INDEX idx_lesson_progress_student ON lesson_progress(student_id);
CREATE INDEX idx_activity_responses_student ON activity_responses(student_id);
CREATE INDEX idx_daily_progress_student_date ON daily_progress(student_id, date);
CREATE INDEX idx_student_achievements_student ON student_achievements(student_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tutor_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own family's data
CREATE POLICY "Users can view own family" ON families
    FOR SELECT USING (
        id IN (SELECT family_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can view family members" ON users
    FOR SELECT USING (
        family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can view family students" ON student_profiles
    FOR SELECT USING (
        family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
    );

-- Add more policies as needed...

-- =====================================================
-- SEED DATA: Grades and Subjects
-- =====================================================

INSERT INTO grades (name, slug, order_index, age_range, description) VALUES
('Kindergarten', 'k', 0, '5-6', 'Foundation year focusing on readiness skills'),
('1st Grade', '1st', 1, '6-7', 'Building blocks of reading, writing, and math'),
('2nd Grade', '2nd', 2, '7-8', 'Strengthening core skills and independence'),
('3rd Grade', '3rd', 3, '8-9', 'Expanding knowledge and critical thinking'),
('4th Grade', '4th', 4, '9-10', 'Deeper exploration of subjects'),
('5th Grade', '5th', 5, '10-11', 'Preparing for middle school transition'),
('6th Grade', '6th', 6, '11-12', 'Introduction to middle school concepts');

INSERT INTO subjects (name, slug, icon, color, order_index, description) VALUES
('Bible', 'bible', 'book-open', '#8B5CF6', 1, 'Scripture study, character development, and faith formation'),
('Language Arts', 'language-arts', 'pencil', '#3B82F6', 2, 'Reading, writing, grammar, spelling, and vocabulary'),
('Math', 'math', 'calculator', '#10B981', 3, 'Number sense, operations, and mathematical thinking'),
('Science', 'science', 'flask', '#F59E0B', 4, 'Creation-based exploration of God''s world'),
('History', 'history', 'globe', '#EF4444', 5, 'Biblical and American history from a Christian worldview');

-- =====================================================
-- SEED DATA: Sample Achievements
-- =====================================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points_reward) VALUES
('First Step', 'Complete your first lesson', 'footprints', 'completion', 'lessons_completed', 1, 10),
('Week Warrior', 'Complete 5 days of school in a row', 'calendar', 'streak', 'streak_days', 5, 50),
('Faithful Student', 'Complete 10 days of school in a row', 'flame', 'streak', 'streak_days', 10, 100),
('Scripture Scholar', 'Memorize your first memory verse', 'book', 'mastery', 'memory_verse', 1, 25),
('Math Master', 'Get a perfect score on a math lesson', 'star', 'mastery', 'perfect_score', 1, 25),
('Bookworm', 'Complete 10 Language Arts lessons', 'book-open', 'completion', 'lessons_completed', 10, 75),
('Unit Champion', 'Complete your first unit', 'trophy', 'completion', 'subject_completed', 1, 100),
('Monthly Marvel', 'Complete 30 days of school', 'medal', 'streak', 'streak_days', 30, 200);
