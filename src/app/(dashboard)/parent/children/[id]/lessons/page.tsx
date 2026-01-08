import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

export default async function StudentLessonsPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const adminClient = createAdminClient()

  // Get the student
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

  // Get student's grade
  const gradeId = student.student_profile?.current_grade_id

  // Get all grades for lookup
  const { data: grades } = await adminClient.from('grades').select('*')
  const gradesMap = new Map(grades?.map(g => [g.id, g]) || [])
  const currentGrade = gradeId ? gradesMap.get(gradeId) : null

  // Get courses for this grade
  const { data: courses } = await adminClient
    .from('courses')
    .select(`
      *,
      subject:subjects(*)
    `)
    .eq('grade_id', gradeId)
    .eq('is_active', true)

  // Get lessons for week 1, day 1 (simulating "today's lessons")
  const { data: lessons } = await adminClient
    .from('lessons')
    .select(`
      *,
      unit:units(*),
      course:courses(*, subject:subjects(*))
    `)
    .in('course_id', courses?.map(c => c.id) || [])
    .eq('week_number', 1)
    .eq('day_number', 1)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  // Get progress for these lessons
  const { data: progress } = await adminClient
    .from('lesson_progress')
    .select('*')
    .eq('student_id', params.id)
    .in('lesson_id', lessons?.map(l => l.id) || [])

  const progressMap = new Map(progress?.map(p => [p.lesson_id, p]) || [])

  // Format today's date
  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Calculate completion stats
  const completedCount = progress?.filter(p => p.status === 'completed').length || 0
  const totalLessons = lessons?.length || 0

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/parent"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4 inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-4 mt-4">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {student.first_name[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {student.first_name}&apos;s Lessons
            </h1>
            <p className="text-gray-600">
              {currentGrade?.name || 'No grade assigned'} &bull; {formattedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold opacity-90">Today&apos;s Progress</h2>
            <p className="text-3xl font-bold mt-1">
              {completedCount} of {totalLessons} lessons complete
            </p>
          </div>
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-2xl font-bold">
              {totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0}%
            </span>
          </div>
        </div>
        {completedCount === totalLessons && totalLessons > 0 && (
          <div className="mt-4 bg-white/20 rounded-lg p-3 text-center">
            All done for today! Great job, {student.first_name}!
          </div>
        )}
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Today&apos;s Lessons</h2>

        {(!lessons || lessons.length === 0) ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons scheduled</h3>
            <p className="text-gray-500">
              {currentGrade ?
                "There are no lessons available for this grade yet." :
                "Please assign a grade level to see available lessons."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson: any) => {
              const lessonProgress = progressMap.get(lesson.id)
              const isCompleted = lessonProgress?.status === 'completed'
              const isInProgress = lessonProgress?.status === 'in_progress'
              const subject = lesson.course?.subject

              return (
                <Link
                  key={lesson.id}
                  href={`/parent/children/${params.id}/lessons/${lesson.id}`}
                  className={`block bg-white rounded-xl shadow-sm border-2 p-5 transition hover:shadow-md ${
                    isCompleted
                      ? 'border-green-200 bg-green-50'
                      : isInProgress
                      ? 'border-primary-200 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Subject Icon */}
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: subject?.color || '#6366f1' }}
                    >
                      {subject?.name?.[0] || 'L'}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: `${subject?.color}20` || '#6366f120',
                            color: subject?.color || '#6366f1'
                          }}
                        >
                          {subject?.name || 'Lesson'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {lesson.estimated_minutes} min
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mt-1">
                        {lesson.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                        {lesson.description}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">Complete</span>
                        </div>
                      ) : isInProgress ? (
                        <div className="flex items-center gap-2 text-primary-600">
                          <div className="w-6 h-6 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
                          <span className="text-sm font-medium">Continue</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="text-sm font-medium">Start</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Unit Info */}
      {lessons && lessons.length > 0 && lessons[0].unit && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            This Week: {lessons[0].unit.name}
          </h3>
          <p className="text-gray-600 mb-4">{lessons[0].unit.description}</p>

          {lessons[0].unit.memory_verse && (
            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-sm font-medium text-primary-600 mb-1">Memory Verse</p>
              <p className="text-gray-800 italic">&ldquo;{lessons[0].unit.memory_verse}&rdquo;</p>
              <p className="text-sm text-gray-600 mt-1">&mdash; {lessons[0].unit.memory_verse_reference}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
