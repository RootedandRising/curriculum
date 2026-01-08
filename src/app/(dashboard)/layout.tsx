import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  // Get user profile for display
  const { data: profile } = await supabase
    .from('users')
    .select(`
      *,
      family:families(*)
    `)
    .eq('id', authUser.id)
    .single()

  const user = profile || {
    first_name: authUser.email?.split('@')[0] || 'User',
    last_name: null,
    family: null,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
