import React, { useState } from 'react'

function Authentication({ setStep }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      setError('Please enter your username and email.');
      return;
    }
    if (password !== 'admin') {
      setError('Incorrect password.');
      return;
    }
    setError('');
    setStep(2);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-transparent">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-black/70 rounded-2xl shadow-xl px-8 py-10 flex flex-col gap-6 border border-neutral-800"
        autoComplete="off"
      >
        <h2 className="text-center text-3xl font-semibold mb-2 tracking-tight text-white">
          Sign in
        </h2>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            required
            placeholder="Username"
            className="bg-neutral-900/80 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
          />
        </div>
        <div className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
            placeholder="Email"
            className="bg-neutral-900/80 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
          />
        </div>
        <div className="flex flex-col gap-2">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="bg-neutral-900/80 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm text-center -mt-2">{error}</div>
        )}
        <button
          type="submit"
          className="mt-2 bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white font-bold py-3 rounded-lg transition shadow-md focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          Authenticate
        </button>
      </form>
    </div>
  );
}

export default Authentication