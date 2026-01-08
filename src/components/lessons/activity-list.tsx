'use client'

import { useState } from 'react'

interface Activity {
  id: string
  activity_type: string
  title: string
  instructions: string
  question_text: string
  activity_data: any
  points: number
  hint: string | null
  explanation: string
}

interface Response {
  id: string
  activity_id: string
  response_data: any
  is_correct: boolean
  points_earned: number
}

interface ActivityListProps {
  activities: Activity[]
  responses: Map<string, Response>
  studentId: string
  lessonId: string
}

export function ActivityList({ activities, responses, studentId, lessonId }: ActivityListProps) {
  return (
    <div className="space-y-6">
      {activities.map((activity, index) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          response={responses.get(activity.id)}
          index={index}
          studentId={studentId}
        />
      ))}
    </div>
  )
}

interface ActivityItemProps {
  activity: Activity
  response?: Response
  index: number
  studentId: string
}

function ActivityItem({ activity, response, index, studentId }: ActivityItemProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<any>(response?.response_data?.answer ?? null)
  const [submitted, setSubmitted] = useState(!!response)
  const [isCorrect, setIsCorrect] = useState(response?.is_correct ?? null)
  const [showExplanation, setShowExplanation] = useState(!!response)

  const handleSubmit = async () => {
    if (selectedAnswer === null) return

    let correct = false

    // Check answer based on activity type
    switch (activity.activity_type) {
      case 'multiple_choice':
        correct = selectedAnswer === activity.activity_data.correct
        break
      case 'true_false':
        correct = selectedAnswer === activity.activity_data.correct
        break
      case 'fill_blank':
        const answers = activity.activity_data.answers.map((a: string) => a.toLowerCase().trim())
        correct = answers.includes(String(selectedAnswer).toLowerCase().trim())
        break
      default:
        correct = true
    }

    setIsCorrect(correct)
    setSubmitted(true)
    setShowExplanation(true)

    // Save response to database (we'll implement the API later)
    try {
      await fetch('/api/activities/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: activity.id,
          studentId,
          response: { answer: selectedAnswer },
          isCorrect: correct,
          pointsEarned: correct ? activity.points : 0
        })
      })
    } catch (error) {
      console.error('Failed to save response:', error)
    }
  }

  const renderActivity = () => {
    switch (activity.activity_type) {
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {activity.activity_data.options.map((option: string, i: number) => (
              <button
                key={i}
                onClick={() => !submitted && setSelectedAnswer(i)}
                disabled={submitted}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  submitted
                    ? i === activity.activity_data.correct
                      ? 'border-green-500 bg-green-50'
                      : selectedAnswer === i
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                    : selectedAnswer === i
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    submitted
                      ? i === activity.activity_data.correct
                        ? 'bg-green-500 text-white'
                        : selectedAnswer === i
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                      : selectedAnswer === i
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {submitted && i === activity.activity_data.correct && (
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        )

      case 'true_false':
        return (
          <div className="flex gap-4">
            {[true, false].map((value) => (
              <button
                key={String(value)}
                onClick={() => !submitted && setSelectedAnswer(value)}
                disabled={submitted}
                className={`flex-1 p-4 rounded-lg border-2 font-semibold transition ${
                  submitted
                    ? value === activity.activity_data.correct
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : selectedAnswer === value
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-600'
                    : selectedAnswer === value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300 text-gray-600'
                }`}
              >
                {value ? 'TRUE' : 'FALSE'}
              </button>
            ))}
          </div>
        )

      case 'fill_blank':
        return (
          <div>
            <p className="text-gray-700 mb-3">{activity.activity_data.display}</p>
            <input
              type="text"
              value={selectedAnswer || ''}
              onChange={(e) => !submitted && setSelectedAnswer(e.target.value)}
              disabled={submitted}
              placeholder="Type your answer..."
              className={`w-full p-3 rounded-lg border-2 outline-none transition ${
                submitted
                  ? isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : 'border-gray-200 focus:border-primary-500'
              }`}
            />
            {submitted && !isCorrect && (
              <p className="mt-2 text-sm text-gray-600">
                Correct answer: <span className="font-semibold">{activity.activity_data.answers[0]}</span>
              </p>
            )}
          </div>
        )

      case 'memory_verse':
        return (
          <div className="bg-primary-50 p-4 rounded-lg">
            <p className="text-primary-800 italic text-lg mb-2">
              &ldquo;{activity.activity_data.verse}&rdquo;
            </p>
            <p className="text-primary-600 text-sm">&mdash; {activity.activity_data.reference}</p>
            <button
              onClick={() => {
                setSubmitted(true)
                setIsCorrect(true)
                setShowExplanation(true)
              }}
              disabled={submitted}
              className={`mt-4 px-4 py-2 rounded-lg font-medium transition ${
                submitted
                  ? 'bg-green-500 text-white'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {submitted ? 'Practiced!' : 'I practiced this verse!'}
            </button>
          </div>
        )

      default:
        return (
          <p className="text-gray-500">Activity type not supported: {activity.activity_type}</p>
        )
    }
  }

  return (
    <div className={`rounded-xl border-2 p-5 ${
      submitted
        ? isCorrect
          ? 'border-green-200 bg-green-50/50'
          : 'border-red-200 bg-red-50/50'
        : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
            {index + 1}
          </span>
          <h3 className="font-semibold text-gray-800">{activity.title}</h3>
        </div>
        <span className="text-sm text-gray-500">{activity.points} pts</span>
      </div>

      <p className="text-sm text-gray-600 mb-3">{activity.instructions}</p>
      <p className="font-medium text-gray-800 mb-4">{activity.question_text}</p>

      {renderActivity()}

      {/* Submit Button */}
      {!submitted && activity.activity_type !== 'memory_verse' && (
        <button
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
          className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check Answer
        </button>
      )}

      {/* Explanation */}
      {showExplanation && activity.explanation && (
        <div className={`mt-4 p-4 rounded-lg ${
          isCorrect ? 'bg-green-100' : 'bg-amber-100'
        }`}>
          <div className="flex items-start gap-2">
            {isCorrect ? (
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <div>
              <p className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-amber-700'}`}>
                {isCorrect ? 'Great job!' : 'Not quite!'}
              </p>
              <p className={`text-sm ${isCorrect ? 'text-green-600' : 'text-amber-600'}`}>
                {activity.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
