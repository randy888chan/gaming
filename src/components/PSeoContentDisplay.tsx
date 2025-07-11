// src/components/PSeoContentDisplay.tsx
import React, { useEffect, useState } from "react";

interface PSeoContent {
  title: string;
  description: string;
  keywords: string[];
  content: string;
}

const PSeoContentDisplay: React.FC = () => {
  const [pSeoData, setPSeoData] = useState<PSeoContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPSeoContent = async () => {
      try {
        // In a real application, this would fetch from a dedicated pSEO content API endpoint
        // For now, we'll simulate fetching some content.
        const response = await fetch("/api/pSeo/latest"); // Assuming an API endpoint for latest pSEO content
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: PSeoContent = await response.json();
        setPSeoData(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPSeoContent();
  }, []);

  if (loading) {
    return <div>Loading pSEO content...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  if (!pSeoData) {
    return <div>No pSEO content available.</div>;
  }

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-2">{pSeoData.title}</h1>
      <p className="text-gray-400 mb-4">{pSeoData.description}</p>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-1">Keywords:</h2>
        <ul className="list-disc list-inside">
          {pSeoData.keywords.map((keyword, index) => (
            <li key={index}>{keyword}</li>
          ))}
        </ul>
      </div>
      <div className="prose prose-invert">
        <p>{pSeoData.content}</p>
      </div>
    </div>
  );
};

export default PSeoContentDisplay;
