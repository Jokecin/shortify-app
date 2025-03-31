import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export default function UrlStats() {
  const router = useRouter();
  const { shortId } = router.query;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://18.231.208.120/';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shortId) return;

    async function fetchStats() {
      try {
        const res = await fetch(`/api/stats/${shortId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Error fetching stats.');
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [shortId]);

  if (loading) return <div className="text-center text-gray-500 py-10">Loading statistics...</div>;
  if (error) return <div className="text-center text-red-600 py-10">{error}</div>;

  const chartData = {
    labels: ['Clicks'],
    datasets: [
      {
        label: 'Number of Clicks',
        data: [stats.clicks],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 14 },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          stepSize: 1,
          font: { size: 14 },
        },
      },
      x: {
        ticks: {
          font: { size: 14 },
        },
      },
    },
  };

  return (
<div className="min-h-screen bg-white py-10 px-4 text-gray-800">
<div className="max-w-2xl mx-auto border border-gray-200 rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">📊 Short URL Statistics</h1>

        <div className="space-y-4 text-gray-800 text-base">
  <div className="flex items-center space-x-2">
    <span>🔗</span>
    <p>
      <strong>Short URL:</strong>{' '}
      <a
        href={`${baseUrl}/api/${stats.short_id}`}
        className="text-blue-600 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {baseUrl}/api/{stats.short_id}
      </a>
    </p>
  </div>

  <div className="flex items-center space-x-2">
    <span>🌐</span>
    <p>
      <strong>Redirects to:</strong>{' '}
      <a
        href={stats.original_url}
        className="text-blue-600 underline break-all"
        target="_blank"
        rel="noopener noreferrer"
      >
        {stats.original_url}
      </a>
    </p>
  </div>

  <div className="flex items-center space-x-2">
    <span>🕒</span>
    <p><strong>Created at:</strong> {new Date(stats.created_at).toLocaleString()}</p>
  </div>

  <div className="flex items-center space-x-2">
    <span>⏳</span>
    <p><strong>Expires at:</strong> {new Date(stats.expires_at).toLocaleString()}</p>
  </div>
</div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-center mb-4">Total Clicks</h2>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
