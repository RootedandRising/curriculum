'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/actions/auth'

interface DashboardNavProps {
  user: {
    first_name: string
    last_name: string | null
    family?: {
      name: string
    }
  }
}

export function DashboardNav({ user }: DashboardNavProps) {
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/parent" className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary-600">Rooted & Rising</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              <Link
                href="/parent"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                Dashboard
              </Link>
              <Link
                href="/parent/schedule"
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-primary-600"
              >
                Schedule
              </Link>
              <Link
                href="/parent/progress"
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-primary-600"
              >
                Progress
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-700">{user.first_name} {user.last_name}</p>
              <p className="text-xs text-gray-500">{user.family?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
