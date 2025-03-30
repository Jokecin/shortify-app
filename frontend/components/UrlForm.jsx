import { useState } from 'react';

export default function UrlForm() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customShortId, setCustomShortId] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(3);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        original_url: originalUrl,
        custom_short_id: customShortId || undefined,
        expires_in_days: expiresInDays
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Something went wrong!');
      return;
    }

    setResult(data);
  };

  return (
    <div className="max-w-xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Shortify URL</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          required
          placeholder="Original URL"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="text"
          placeholder="Custom short URL (optional)"
          value={customShortId}
          onChange={(e) => setCustomShortId(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="number"
          min="1"
          max="30"
          value={expiresInDays}
          onChange={(e) => setExpiresInDays(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          Shorten URL
        </button>
      </form>
      {error && <p className="text-red-500 mt-3">{error}</p>}
      {result && (
        <p className="mt-3">
        Short URL:{' '}
        <a
          href={`http://localhost:5000/api/${result.short_id}`}
          target="_blank"
          className="text-blue-500 underline"
        >
          http://localhost:5000/api/{result.short_id}
        </a>
      </p>
      )}
    </div>
  );
}
