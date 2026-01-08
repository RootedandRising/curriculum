'use client'

interface ContentBlock {
  id: string
  content_type: string
  title: string
  content: string
  is_read_aloud: boolean
}

interface LessonContentProps {
  content: ContentBlock[]
}

export function LessonContent({ content }: LessonContentProps) {
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'scripture':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      case 'story':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        )
      case 'vocabulary':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        )
      case 'note':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  const getContentStyle = (type: string) => {
    switch (type) {
      case 'scripture':
        return 'bg-purple-50 border-purple-200 text-purple-900'
      case 'story':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      case 'vocabulary':
        return 'bg-green-50 border-green-200 text-green-900'
      case 'note':
        return 'bg-amber-50 border-amber-200 text-amber-900'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900'
    }
  }

  const getIconStyle = (type: string) => {
    switch (type) {
      case 'scripture':
        return 'text-purple-600'
      case 'story':
        return 'text-blue-600'
      case 'vocabulary':
        return 'text-green-600'
      case 'note':
        return 'text-amber-600'
      default:
        return 'text-gray-600'
    }
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="space-y-4">
      {content.map((block) => (
        <div
          key={block.id}
          className={`rounded-lg border p-4 ${getContentStyle(block.content_type)}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={getIconStyle(block.content_type)}>
                {getContentIcon(block.content_type)}
              </span>
              <h3 className="font-semibold">{block.title}</h3>
            </div>
            {block.is_read_aloud && (
              <button
                onClick={() => speakText(block.content)}
                className="p-2 rounded-full hover:bg-white/50 transition"
                title="Read aloud"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            )}
          </div>
          <div className="whitespace-pre-wrap leading-relaxed">
            {block.content}
          </div>
        </div>
      ))}
    </div>
  )
}
