import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const adminClient = createAdminClient()

  // Get user profile
  const { data: user } = await adminClient
    .from('users')
    .select('*, family:families(*)')
    .eq('id', authUser.id)
    .single()

  // Get children with profiles
  const { data: children } = await adminClient
    .from('users')
    .select('*, student_profile:student_profiles(*)')
    .eq('family_id', user?.family_id)
    .eq('role', 'student')
    .order('created_at', { ascending: true })

  // Get grades
  const { data: grades } = await adminClient.from('grades').select('*')
  const gradesMap = new Map(grades?.map(g => [g.id, g]) || [])

  // Get subjects
  const { data: subjects } = await adminClient
    .from('subjects')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  // Build progress data for each child
  const childrenProgress = await Promise.all(
    (children || []).map(async (child) => {
      const gradeId = child.student_profile?.current_grade_id
      const grade = gradeId ? gradesMap.get(gradeId) : null

      // Get courses for this grade
      const { data: courses } = await adminClient
        .from('courses')
        .select('*, subject:subjects(*)')
        .eq('grade_id', gradeId)

      // Get lesson count per course
      const courseProgress = await Promise.all(
        (courses || []).map(async (course) => {
          // Total lessons
          const { count: totalLessons } = await adminClient
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)
            .eq('is_active', true)

          // Completed lessons
          const { data: progress } = await adminClient
            .from('lesson_progress')
            .select('lesson_id')
            .eq('student_id', child.id)
            .eq('status', 'completed')

          const { count: completedLessons } = await adminClient
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)
            .in('id', progress?.map(p => p.lesson_id) || ['none'])

          return {
            ...course,
            totalLessons: totalLessons || 0,
            completedLessons: completedLessons || 0,
            percentComplete: totalLessons ? Math.round((completedLessons || 0) / totalLessons * 100) : 0
          }
        })
      )

      // Get total stats
      const { data: allProgress } = await adminClient
        .from('lesson_progress')
        .select('*')
        .eq('student_id', child.id)

      const completedTotal = allProgress?.filter(p => p.status === 'completed').length || 0
      const pointsTotal = allProgress?.reduce((sum, p) => sum + (p.points_earned || 0), 0) || 0

      // Get activity stats
      const { data: activityResponses } = await adminClient
        .from('activity_responses')
        .select('*')
        .eq('student_id', child.id)

      const correctAnswers = activityResponses?.filter(r => r.is_correct).length || 0
      const totalAnswers = activityResponses?.length || 0
      const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0

      return {
        ...child,
        grade,
        courses: courseProgress,
        stats: {
          completedLessons: completedTotal,
          pointsTotal,
          correctAnswers,
          totalAnswers,
          accuracy,
          streak: child.student_profile?.current_streak || 0,
          longestStreak: child.student_profile?.longest_streak || 0
        }
      }
    })
  )

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Progress Reports</h1>
        <p className="text-gray-600 mt-1">Track your children&apos;s learning journey</p>
      </div>

      {childrenProgress.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No children enrolled yet.</p>
          <Link
            href="/parent"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm mt-2 inline-block"
          >
            Add a child to get started
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {childrenProgress.map((child) => (
            <div key={child.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Child Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                    {child.first_name[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{child.first_name} {child.last_name}</h2>
                    <p className="opacity-90">{child.grade?.name || 'No grade assigned'}</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-600">{child.stats.completedLessons}</p>
                  <p className="text-sm text-gray-500">Lessons Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{child.stats.pointsTotal}</p>
                  <p className="text-sm text-gray-500">Points Earned</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-600">{child.stats.accuracy}%</p>
                  <p className="text-sm text-gray-500">Activity Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{child.stats.streak}</p>
                  <p className="text-sm text-gray-500">Day Streak</p>
                </div>
              </div>

              {/* Subject Progress */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress by Subject</h3>
                {child.courses.length > 0 ? (
                  <div className="space-y-4">
                    {child.courses.map((course: any) => (
                      <div key={course.id}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: course.subject?.color || '#6366f1' }}
                            >
                              {course.subject?.name?.[0] || 'S'}
                            </div>
                            <span className="font-medium text-gray-800">{course.subject?.name}</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {course.completedLessons} / {course.totalLessons} lessons ({course.percentComplete}%)
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${course.percentComplete}%`,
                              backgroundColor: course.subject?.color || '#6366f1'
                            }}
                          />
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

              {/* Actions */}
              <div className="px-6 pb-6">
                <div className="flex gap-3">
                  <Link
                    href={`/parent/children/${child.id}/lessons`}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition text-center"
                  >
                    Continue Learning
                  </Link>
                  <Link
                    href={`/parent/children/${child.id}`}
                    className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Export Options */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Reports</h3>
        <p className="text-gray-600 mb-4">
          Download progress reports for record-keeping or portfolio documentation.
        </p>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export as PDF
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export as CSV
          </button>
        </div>
      </div>
    </div>
  )
}
