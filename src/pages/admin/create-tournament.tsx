import React, { useState } from 'react';
import Head from 'next/head';

const CreateTournamentPage: React.FC = () => {
  const [name, setName] = useState('');
  const [format, setFormat] = useState('');
  const [status, setStatus] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [entryCurrency, setEntryCurrency] = useState('');
  const [liquidityPoolName, setLiquidityPoolName] = useState('');
  const [isPolymarketTournament, setIsPolymarketTournament] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/v1/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          format,
          status,
          entryFee: entryFee || undefined,
          entryCurrency: entryCurrency || undefined,
          liquidityPoolName: liquidityPoolName || undefined,
          isPolymarketTournament,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Tournament created successfully!');
        // Clear form
        setName('');
        setFormat('');
        setStatus('');
        setEntryFee('');
        setEntryCurrency('');
        setLiquidityPoolName('');
        setIsPolymarketTournament(false);
      } else {
        setError(data.error || 'Failed to create tournament.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div>
      <Head>
        <title>Create Tournament</title>
      </Head>
      <main>
        <h1>Create New Tournament</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Tournament Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="format">Format:</label>
            <input
              type="text"
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="status">Status:</label>
            <input
              type="text"
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="entryFee">Entry Fee:</label>
            <input
              type="text"
              id="entryFee"
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="entryCurrency">Entry Currency:</label>
            <input
              type="text"
              id="entryCurrency"
              value={entryCurrency}
              onChange={(e) => setEntryCurrency(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="liquidityPoolName">Liquidity Pool Name:</label>
            <input
              type="text"
              id="liquidityPoolName"
              value={liquidityPoolName}
              onChange={(e) => setLiquidityPoolName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="isPolymarketTournament">Is Polymarket Tournament:</label>
            <input
              type="checkbox"
              id="isPolymarketTournament"
              checked={isPolymarketTournament}
              onChange={(e) => setIsPolymarketTournament(e.target.checked)}
            />
          </div>
          <button type="submit">Create Tournament</button>
        </form>

        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </main>
    </div>
  );
};

export default CreateTournamentPage;