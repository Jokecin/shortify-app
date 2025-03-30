import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          ShortifyApp
        </Link>
        <div className="space-x-4">
          <Link href="/" className="hover:text-blue-300">
            Shorten URL
          </Link>
          <Link href="/stats" className="hover:text-blue-300">
            Statistics
          </Link>
          <Link href="/history" className="hover:text-blue-300">
            History
          </Link>

        </div>
      </div>
    </nav>
  );
}
