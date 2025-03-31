import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function History() {
  const [urls, setUrls] = useState([]);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://18.231.208.120/';
  useEffect(() => {
    async function fetchUrls() {
      const res = await fetch('/api/history');
      const data = await res.json();
      setUrls(data);
    }
    fetchUrls();
  }, []);

  const handleDelete = async (shortId) => {
    if (!confirm('Are you sure you want to delete this URL?')) return;
  
    try {
      const res = await fetch(`/api/delete/${shortId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
  
      setUrls(urls.filter((url) => url.short_id !== shortId));
    } catch (err) {
      console.error(err);
      alert('Error deleting URL.');
    }
  };
  
  if (!urls) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Loading history...
      </div>
    );
  }
  

  return (
    <div className="min-h-screen bg-white px-6 py-10 text-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">📜 URL History</h1>
        <div className="overflow-auto rounded border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Short URL</th>
                <th className="px-4 py-2">Original URL</th>
                <th className="px-4 py-2">Created At</th>
                <th className="px-4 py-2">Stats</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((url) => (
                <tr key={url.short_id} className="border-t">
                  <td className="px-4 py-2">
                    <a
                      href={`${baseUrl}/api/${url.short_id}`}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      {url.short_id}
                    </a>
                  </td>
                  <td className="px-4 py-2 break-all">{url.original_url}</td>
                  <td className="px-4 py-2">
                    {new Date(url.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/stats/${url.short_id}`}>
                      <span className="text-blue-500 hover:underline cursor-pointer">View</span>
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <button
                        onClick={() => handleDelete(url.short_id)}
                        className="text-red-500 hover:underline"
                    >
                        🗑️Delete
                    </button>
                    </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
