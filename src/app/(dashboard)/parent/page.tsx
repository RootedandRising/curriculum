import { getUser, getChildren } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AddChildButton } from '@/components/dashboard/add-child-button'

export default async function ParentDashboard() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const children = await getChildren()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user.first_name}!
        </h1>
        <p className="text-gray-600 mt-1">
          {user.family?.name} Dashboard
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Your Children</h2>
          <AddChildButton />
        </div>

        {children.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No children added yet</h3>
            <p className="text-gray-500 mb-4">Add your first child to get started with their curriculum.</p>
            <AddChildButton variant="primary" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child: any) => (
              <Link
                key={child.id}
                href={`/parent/children/${child.id}`}
                className="block p-6 bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-xl hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {child.first_name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {child.first_name} {child.last_name}
                    </h3>
                    {child.student_profile?.[0]?.current_grade_id && (
                      <p className="text-sm text-gray-500">Grade enrolled</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Active
                  </span>
                  <span>
                    {child.student_profile?.[0]?.current_streak || 0} day streak
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
