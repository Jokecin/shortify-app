import { useRouter } from 'next/router';
import { useState } from 'react';

export default function StatsSearch() {
  const [shortId, setShortId] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (shortId.trim()) {
      router.push(`/stats/${shortId.trim()}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-10 p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Search URL Statistics</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Short URL ID"
          className="w-full p-2 border rounded mb-3"
          value={shortId}
          onChange={(e) => setShortId(e.target.value)}
          required
        />
        <button className="w-full bg-green-500 text-white py-2 rounded">
          View Stats
        </button>
      </form>
    </div>
  );
}
