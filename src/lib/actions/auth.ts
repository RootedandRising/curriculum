'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const familyName = formData.get('familyName') as string

  // 1. Create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Failed to create user' }
  }

  // Use admin client for database operations (bypasses RLS)
  // This is needed because the session isn't fully established after signUp
  const adminClient = createAdminClient()

  // 2. Create the family record
  const { data: familyData, error: familyError } = await adminClient
    .from('families')
    .insert({
      name: familyName,
      email: email,
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
    })
    .select()
    .single()

  if (familyError) {
    console.error('Family creation error:', familyError)
    return { error: 'Failed to create family account' }
  }

  // 3. Create the user record linked to the family
  const { error: userError } = await adminClient
    .from('users')
    .insert({
      id: authData.user.id,
      family_id: familyData.id,
      email: email,
      role: 'parent',
      first_name: firstName,
      last_name: lastName,
      is_primary_parent: true,
    })

  if (userError) {
    console.error('User creation error:', userError)
    return { error: 'Failed to create user profile' }
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return { success: true }
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get the full user profile with family info
  const { data: profile } = await supabase
    .from('users')
    .select(`
      *,
      family:families(*)
    `)
    .eq('id', user.id)
    .single()

  return profile
}

export async function getChildren() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // First get the user's family_id
  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single()

  if (!profile?.family_id) return []

  // Get all students in this family
  const { data: children } = await supabase
    .from('users')
    .select(`
      *,
      student_profile:student_profiles(*)
    `)
    .eq('family_id', profile.family_id)
    .eq('role', 'student')
    .order('created_at', { ascending: true })

  return children || []
}

export async function addChild(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const birthDate = formData.get('birthDate') as string
  const gradeId = formData.get('gradeId') as string

  // Use admin client to bypass RLS for queries and inserts
  const adminClient = createAdminClient()

  // Get the parent's family_id
  const { data: parent } = await adminClient
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single()

  if (!parent?.family_id) {
    return { error: 'Family not found. Please try logging out and back in.' }
  }

  // Create the student user record
  const { data: studentUser, error: userError } = await adminClient
    .from('users')
    .insert({
      family_id: parent.family_id,
      role: 'student',
      first_name: firstName,
      last_name: lastName,
    })
    .select()
    .single()

  if (userError) {
    console.error('Student user creation error:', userError)
    return { error: 'Failed to add child' }
  }

  // Create the student profile
  const { error: profileError } = await adminClient
    .from('student_profiles')
    .insert({
      user_id: studentUser.id,
      family_id: parent.family_id,
      birth_date: birthDate || null,
      current_grade_id: gradeId || null,
    })

  if (profileError) {
    console.error('Student profile creation error:', profileError)
    return { error: 'Failed to create student profile' }
  }

  return { success: true }
}

export async function getGrades() {
  const supabase = await createClient()

  const { data: grades } = await supabase
    .from('grades')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  return grades || []
}
