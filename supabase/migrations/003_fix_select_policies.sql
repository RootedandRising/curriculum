-- =====================================================
-- Fix circular SELECT policies
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop the old circular policy
DROP POLICY IF EXISTS "Users can view family members" ON users;

-- Create a fixed policy that allows users to see their own record
CREATE POLICY "Users can view own and family records" ON users
    FOR SELECT USING (
        id = auth.uid()
        OR family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
    );
