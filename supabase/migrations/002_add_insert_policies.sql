-- =====================================================
-- Additional RLS Policies for INSERT/UPDATE/DELETE
-- Run this after the initial schema
-- =====================================================

-- Allow authenticated users to create a family (for registration)
CREATE POLICY "Authenticated users can create family" ON families
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own family
CREATE POLICY "Users can update own family" ON families
    FOR UPDATE USING (
        id IN (SELECT family_id FROM users WHERE id = auth.uid())
    );

-- Allow authenticated users to create their own user record
CREATE POLICY "Users can create own user record" ON users
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND (id = auth.uid() OR role = 'student')
    );

-- Allow users to update their own record
CREATE POLICY "Users can update own record" ON users
    FOR UPDATE USING (id = auth.uid());

-- Allow parents to update family members (students)
CREATE POLICY "Parents can update family members" ON users
    FOR UPDATE USING (
        family_id IN (SELECT family_id FROM users WHERE id = auth.uid() AND role = 'parent')
    );

-- Allow parents to create student profiles for their family
CREATE POLICY "Parents can create student profiles" ON student_profiles
    FOR INSERT WITH CHECK (
        family_id IN (SELECT family_id FROM users WHERE id = auth.uid() AND role = 'parent')
    );

-- Allow parents to update student profiles in their family
CREATE POLICY "Parents can update student profiles" ON student_profiles
    FOR UPDATE USING (
        family_id IN (SELECT family_id FROM users WHERE id = auth.uid() AND role = 'parent')
    );

-- Enrollments policies
CREATE POLICY "Parents can manage enrollments" ON enrollments
    FOR ALL USING (
        student_id IN (
            SELECT sp.id FROM student_profiles sp
            WHERE sp.family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
        )
    );

-- Scheduled lessons policies
CREATE POLICY "Family can manage scheduled lessons" ON scheduled_lessons
    FOR ALL USING (
        family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
    );

-- Lesson progress policies
CREATE POLICY "Family can manage lesson progress" ON lesson_progress
    FOR ALL USING (
        student_id IN (
            SELECT sp.id FROM student_profiles sp
            WHERE sp.family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
        )
    );

-- Activity responses policies
CREATE POLICY "Family can manage activity responses" ON activity_responses
    FOR ALL USING (
        student_id IN (
            SELECT sp.id FROM student_profiles sp
            WHERE sp.family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
        )
    );

-- Daily progress policies
CREATE POLICY "Family can manage daily progress" ON daily_progress
    FOR ALL USING (
        student_id IN (
            SELECT sp.id FROM student_profiles sp
            WHERE sp.family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
        )
    );

-- Student achievements policies
CREATE POLICY "Family can view student achievements" ON student_achievements
    FOR SELECT USING (
        student_id IN (
            SELECT sp.id FROM student_profiles sp
            WHERE sp.family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
        )
    );

-- Certificates policies
CREATE POLICY "Family can view certificates" ON certificates
    FOR SELECT USING (
        student_id IN (
            SELECT sp.id FROM student_profiles sp
            WHERE sp.family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
        )
    );

-- AI tutor logs policies
CREATE POLICY "Family can manage AI tutor logs" ON ai_tutor_logs
    FOR ALL USING (
        student_id IN (
            SELECT sp.id FROM student_profiles sp
            WHERE sp.family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
        )
    );
