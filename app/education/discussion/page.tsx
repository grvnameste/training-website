'use client'

export default function DiscussionPage() {
  const handleRedirect = () => {
    window.open("http://localhost:3001", "_blank") // 🔥 apna project link daal
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-6">
      
      <h1 className="text-3xl font-bold mb-4">Discussion Forum</h1>

      <p className="text-slate-600 mb-6 max-w-md">
        Join our community discussion platform to ask doubts and collaborate with others.
      </p>

      <button
        onClick={handleRedirect}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
      >
        Go to Discussion →
      </button>

    </div>
  )
}