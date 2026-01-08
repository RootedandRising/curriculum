import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LessonContent } from '@/components/lessons/lesson-content'
import { ActivityList } from '@/components/lessons/activity-list'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string; lessonId: string }
}

export default async function LessonDetailPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const adminClient = createAdminClient()

  // Get the student
  const { data: student } = await adminClient
    .from('users')
    .select('*')
    .eq('id', params.id)
    .eq('role', 'student')
    .single()

  if (!student) {
    redirect('/parent')
  }

  // Get the lesson with all related data
  const { data: lesson } = await adminClient
    .from('lessons')
    .select(`
      *,
      unit:units(*),
      course:courses(*, subject:subjects(*))
    `)
    .eq('id', params.lessonId)
    .single()

  if (!lesson) {
    redirect(`/parent/children/${params.id}/lessons`)
  }

  // Get lesson content
  const { data: content } = await adminClient
    .from('lesson_content')
    .select('*')
    .eq('lesson_id', params.lessonId)
    .eq('for_student', true)
    .order('order_index', { ascending: true })

  // Get activities
  const { data: activities } = await adminClient
    .from('activities')
    .select('*')
    .eq('lesson_id', params.lessonId)
    .order('order_index', { ascending: true })

  // Get student's progress on this lesson
  const { data: progress } = await adminClient
    .from('lesson_progress')
    .select('*')
    .eq('student_id', params.id)
    .eq('lesson_id', params.lessonId)
    .single()

  // Get activity responses
  const { data: responses } = await adminClient
    .from('activity_responses')
    .select('*')
    .eq('student_id', params.id)
    .in('activity_id', activities?.map(a => a.id) || [])

  const responsesMap = new Map(responses?.map(r => [r.activity_id, r]) || [])

  const subject = lesson.course?.subject
  const isCompleted = progress?.status === 'completed'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/parent/children/${params.id}/lessons`}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Lessons
        </Link>
      </div>

      {/* Lesson Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0"
            style={{ backgroundColor: subject?.color || '#6366f1' }}
          >
            {subject?.name?.[0] || 'L'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
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
              {isCompleted && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                  Completed
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{lesson.name}</h1>
            <p className="text-gray-600 mt-1">{lesson.description}</p>
          </div>
        </div>

        {/* Objectives */}
        {lesson.objectives && lesson.objectives.length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">What You&apos;ll Learn</h3>
            <ul className="space-y-1">
              {lesson.objectives.map((obj: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Lesson Content */}
      {content && content.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Lesson Content</h2>
          <LessonContent content={content} />
        </div>
      )}

      {/* Teacher Script (for parent view) */}
      {lesson.teacher_script && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h2 className="text-lg font-semibold text-amber-800">Teacher Script</h2>
          </div>
          <div className="prose prose-sm max-w-none text-amber-900">
            <div className="whitespace-pre-wrap">{lesson.teacher_script}</div>
          </div>
        </div>
      )}

      {/* Discussion Questions */}
      {lesson.discussion_questions && lesson.discussion_questions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">Discussion Questions</h2>
          <ul className="space-y-2">
            {lesson.discussion_questions.map((q: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-blue-900">{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Activities */}
      {activities && activities.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Activities</h2>
          <ActivityList
            activities={activities}
            responses={responsesMap}
            studentId={params.id}
            lessonId={params.lessonId}
          />
        </div>
      )}

      {/* Prayer */}
      {lesson.prayer_prompt && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🙏</span>
            <h2 className="text-lg font-semibold text-purple-800">Closing Prayer</h2>
          </div>
          <p className="text-purple-900 italic">{lesson.prayer_prompt}</p>
        </div>
      )}

      {/* Complete Lesson Button */}
      <div className="flex justify-center mt-8 mb-8">
        {isCompleted ? (
          <div className="flex items-center gap-3 bg-green-100 text-green-700 px-6 py-3 rounded-xl">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Lesson Complete!</span>
          </div>
        ) : (
          <form action={`/api/lessons/${params.lessonId}/complete`} method="POST">
            <input type="hidden" name="studentId" value={params.id} />
            <button
              type="submit"
              className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition flex items-center gap-2"
            >
              <span>Mark Lesson Complete</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
