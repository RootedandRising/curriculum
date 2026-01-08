import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

export default async function ChildDetailPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const adminClient = createAdminClient()

  // Get the student with profile
  const { data: student } = await adminClient
    .from('users')
    .select(`
      *,
      student_profile:student_profiles(*)
    `)
    .eq('id', params.id)
    .eq('role', 'student')
    .single()

  if (!student) {
    redirect('/parent')
  }

  // Get grade info
  const gradeId = student.student_profile?.current_grade_id
  let currentGrade = null
  if (gradeId) {
    const { data } = await adminClient.from('grades').select('*').eq('id', gradeId).single()
    currentGrade = data
  }

  // Get all grades for the dropdown
  const { data: grades } = await adminClient
    .from('grades')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  // Get courses for this grade
  const { data: courses } = await adminClient
    .from('courses')
    .select(`
      *,
      subject:subjects(*)
    `)
    .eq('grade_id', gradeId)
    .eq('is_active', true)

  // Get lesson progress stats
  const { data: progressData } = await adminClient
    .from('lesson_progress')
    .select('*')
    .eq('student_id', params.id)

  const completedLessons = progressData?.filter(p => p.status === 'completed').length || 0
  const totalPoints = progressData?.reduce((sum, p) => sum + (p.points_earned || 0), 0) || 0

  // Get achievements
  const { data: achievements } = await adminClient
    .from('student_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('student_id', params.id)
    .order('earned_at', { ascending: false })
    .limit(5)

  const profile = student.student_profile

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/parent"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-4xl">
            {student.first_name[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {student.first_name} {student.last_name}
            </h1>
            <p className="text-gray-600 mt-1">
              {currentGrade?.name || 'No grade assigned'}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <Link
                href={`/parent/children/${params.id}/lessons`}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
              >
                Start Today&apos;s Lessons
              </Link>
              <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Lessons Completed</p>
          <p className="text-2xl font-bold text-gray-900">{completedLessons}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Current Streak</p>
          <p className="text-2xl font-bold text-gray-900">{profile?.current_streak || 0} days</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Points</p>
          <p className="text-2xl font-bold text-gray-900">{profile?.points_total || totalPoints}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Longest Streak</p>
          <p className="text-2xl font-bold text-gray-900">{profile?.longest_streak || 0} days</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Enrolled Courses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Enrolled Courses</h2>
          {courses && courses.length > 0 ? (
            <div className="space-y-3">
              {courses.map((course: any) => (
                <div
                  key={course.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: course.subject?.color || '#6366f1' }}
                  >
                    {course.subject?.name?.[0] || 'C'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{course.name}</p>
                    <p className="text-sm text-gray-500">{course.total_weeks} weeks</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No courses available for this grade level.
            </p>
          )}
        </div>

        {/* Recent Achievements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Achievements</h2>
          {achievements && achievements.length > 0 ? (
            <div className="space-y-3">
              {achievements.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-amber-50"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-2xl">
                    {item.achievement?.icon || '🏆'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.achievement?.name}</p>
                    <p className="text-sm text-gray-500">{item.achievement?.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-gray-500">No achievements yet.</p>
              <p className="text-sm text-gray-400">Complete lessons to earn badges!</p>
            </div>
          )}
        </div>
      </div>

      {/* Student Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Student Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
            <p className="text-gray-900">{student.first_name} {student.last_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Grade Level</label>
            <p className="text-gray-900">{currentGrade?.name || 'Not assigned'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Birth Date</label>
            <p className="text-gray-900">
              {profile?.birth_date
                ? new Date(profile.birth_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Not set'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
            <p className="text-gray-900">
              {new Date(student.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {profile?.notes && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
            <p className="text-gray-900">{profile.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
