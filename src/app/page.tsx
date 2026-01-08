import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-primary-50 to-white">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-primary-700 mb-4">
          Rooted & Rising
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Christian Homeschool Curriculum
        </p>
        <p className="text-gray-500 mb-8">
          Rooted in faith, rising in knowledge. A complete curriculum platform that makes teaching easy for parents and learning engaging for kids.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  )
}
