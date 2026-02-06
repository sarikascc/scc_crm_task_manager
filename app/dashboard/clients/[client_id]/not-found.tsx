import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-[#1E1B4B] mb-2">Client Not Found</h2>
        <p className="text-gray-600 mb-6">The client you're looking for doesn't exist or has been deleted.</p>
        <Link
          href="/dashboard/clients"
          className="btn-gradient-smooth rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#06B6D4]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#06B6D4]/30"
        >
          Back to Clients
        </Link>
      </div>
    </div>
  )
}
