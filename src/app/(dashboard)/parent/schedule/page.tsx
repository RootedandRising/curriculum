import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const adminClient = createAdminClient()

  // Get user profile with family
  const { data: user } = await adminClient
    .from('users')
    .select(`
      *,
      family:families(*)
    `)
    .eq('id', authUser.id)
    .single()

  // Get children
  const { data: children } = await adminClient
    .from('users')
    .select(`
      *,
      student_profile:student_profiles(*)
    `)
    .eq('family_id', user?.family_id)
    .eq('role', 'student')
    .order('created_at', { ascending: true })

  // Get grades for lookup
  const { data: grades } = await adminClient.from('grades').select('*')
  const gradesMap = new Map(grades?.map(g => [g.id, g]) || [])

  // Get all lessons for each child's grade
  const childrenWithLessons = await Promise.all(
    (children || []).map(async (child) => {
      const gradeId = child.student_profile?.current_grade_id
      const grade = gradeId ? gradesMap.get(gradeId) : null

      // Get courses for this grade
      const { data: courses } = await adminClient
        .from('courses')
        .select('id, subject:subjects(name, color)')
        .eq('grade_id', gradeId)

      // Get week 1 lessons
      const { data: lessons } = await adminClient
        .from('lessons')
        .select('*, course:courses(subject:subjects(name, color))')
        .in('course_id', courses?.map(c => c.id) || [])
        .eq('week_number', 1)
        .order('day_number', { ascending: true })
        .order('order_index', { ascending: true })

      return {
        ...child,
        grade,
        lessons: lessons || []
      }
    })
  )

  // Group lessons by day
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const schoolDays = user?.family?.school_days || [1, 2, 3, 4, 5]

  // Get current week dates
  const today = new Date()
  const currentDay = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1))

  const weekDates = daysOfWeek.map((day, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return {
      name: day,
      date: date,
      dayNumber: index + 1,
      isToday: date.toDateString() === today.toDateString(),
      isSchoolDay: schoolDays.includes(index + 1)
    }
  })

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Weekly Schedule</h1>
        <p className="text-gray-600 mt-1">
          Week of {monday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Schedule Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">School Days:</span>
            <div className="flex gap-1">
              {daysOfWeek.map((day, i) => (
                <span
                  key={day}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    schoolDays.includes(i + 1)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {day[0]}
                </span>
              ))}
            </div>
          </div>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Edit Settings
          </button>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-5 border-b border-gray-200">
          {weekDates.map((day) => (
            <div
              key={day.name}
              className={`p-4 text-center border-r last:border-r-0 border-gray-200 ${
                day.isToday ? 'bg-primary-50' : ''
              } ${!day.isSchoolDay ? 'bg-gray-50' : ''}`}
            >
              <p className={`text-sm font-medium ${day.isToday ? 'text-primary-600' : 'text-gray-500'}`}>
                {day.name}
              </p>
              <p className={`text-lg font-bold ${day.isToday ? 'text-primary-700' : 'text-gray-900'}`}>
                {day.date.getDate()}
              </p>
              {day.isToday && (
                <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Lessons by child and day */}
        {childrenWithLessons.map((child) => (
          <div key={child.id} className="border-b last:border-b-0 border-gray-200">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {child.first_name[0]}
                </div>
                <span className="font-semibold text-gray-800">{child.first_name}</span>
                <span className="text-sm text-gray-500">
                  {child.grade?.name || 'No grade'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-5">
              {weekDates.map((day) => {
                const dayLessons = child.lessons.filter(
                  (l: any) => l.day_number === day.dayNumber
                )
                return (
                  <div
                    key={day.name}
                    className={`p-3 min-h-[120px] border-r last:border-r-0 border-gray-200 ${
                      day.isToday ? 'bg-primary-50/50' : ''
                    } ${!day.isSchoolDay ? 'bg-gray-50' : ''}`}
                  >
                    {day.isSchoolDay ? (
                      <div className="space-y-2">
                        {dayLessons.length > 0 ? (
                          dayLessons.map((lesson: any) => (
                            <Link
                              key={lesson.id}
                              href={`/parent/children/${child.id}/lessons/${lesson.id}`}
                              className="block p-2 rounded-lg text-xs hover:shadow-sm transition"
                              style={{
                                backgroundColor: `${lesson.course?.subject?.color}15` || '#f3f4f6',
                                borderLeft: `3px solid ${lesson.course?.subject?.color || '#6366f1'}`
                              }}
                            >
                              <p className="font-medium text-gray-800 truncate">
                                {lesson.name}
                              </p>
                              <p className="text-gray-500 truncate">
                                {lesson.course?.subject?.name}
                              </p>
                            </Link>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 italic">No lessons</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No school</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {(!childrenWithLessons || childrenWithLessons.length === 0) && (
          <div className="p-8 text-center">
            <p className="text-gray-500">No children enrolled yet.</p>
            <Link
              href="/parent"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm mt-2 inline-block"
            >
              Add a child to get started
            </Link>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary-50 rounded border border-primary-200"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 rounded border border-gray-200"></div>
          <span>Non-school day</span>
        </div>
      </div>
    </div>
  )
}
