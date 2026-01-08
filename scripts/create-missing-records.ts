// Run with: npx tsx scripts/create-missing-records.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hnuifsbihrzqiaipczuj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudWlmc2JpaHJ6cWlhaXBjenVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgzMTEzNCwiZXhwIjoyMDgzNDA3MTM0fQ.7qyiPeICY-gEKwOPvOYTYH6-_FJnjkwTMrWcTOE13Ns'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createMissingRecords() {
  const email = 'rooted.rising.learn@gmail.com'

  // 1. Get the auth user
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('Error listing users:', listError)
    return
  }

  const authUser = users.find(u => u.email === email)

  if (!authUser) {
    console.error('Auth user not found for email:', email)
    return
  }

  console.log('Found auth user:', authUser.id)

  // 2. Check if family exists
  const { data: existingFamily } = await supabase
    .from('families')
    .select('*')
    .eq('email', email)
    .single()

  let familyId: string

  if (existingFamily) {
    console.log('Family already exists:', existingFamily.id)
    familyId = existingFamily.id
  } else {
    // Create family
    const { data: newFamily, error: familyError } = await supabase
      .from('families')
      .insert({
        name: 'Cole Family',
        email: email,
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (familyError) {
      console.error('Error creating family:', familyError)
      return
    }

    console.log('Created family:', newFamily.id)
    familyId = newFamily.id
  }

  // 3. Check if user record exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (existingUser) {
    console.log('User record already exists:', existingUser.id)
  } else {
    // Create user record
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        family_id: familyId,
        email: email,
        role: 'parent',
        first_name: 'Robert',
        last_name: 'Cole',
        is_primary_parent: true,
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creating user:', userError)
      return
    }

    console.log('Created user record:', newUser.id)
  }

  console.log('Done! Family ID:', familyId)
}

createMissingRecords()
