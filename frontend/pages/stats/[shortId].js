import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function UrlStats() {
  const router = useRouter();
  const { shortId } = router.query;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shortId) return;

    async function fetchStats() {
      try {
        const res = await fetch(`/api/stats/${shortId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Error fetching stats.');
        }

        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [shortId]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-xl mx-auto my-10 p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Short URL Statistics</h2>
      <p><strong>Short ID:</strong> {stats.short_id}</p>
      <p><strong>Original URL:</strong> <a href={stats.original_url} className="text-blue-500 underline">{stats.original_url}</a></p>
      <p><strong>Clicks:</strong> {stats.clicks}</p>
      <p><strong>Created at:</strong> {new Date(stats.created_at).toLocaleString()}</p>
      <p><strong>Expires at:</strong> {new Date(stats.expires_at).toLocaleString()}</p>
    </div>
  );
}

