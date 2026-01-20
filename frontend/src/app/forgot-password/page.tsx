'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setResetToken('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('A reset token has been generated.');
        setResetToken(data.resetToken);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 border border-border rounded-lg shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Forgot Password</h1>
          <p className="mt-2 text-muted-foreground">Enter your email to reset your password</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 text-sm bg-green-500/10 text-green-500 border border-green-500/20 rounded">
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:ring-ring focus:border-ring sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 transition-colors"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {resetToken && (
          <div className="mt-6 p-4 bg-muted rounded-md border border-border">
            <p className="text-sm font-medium mb-2">Development Reset Link (Token):</p>
            <p className="text-xs text-muted-foreground mb-2">In development, we display the token here. Click to go to reset page.</p>
            <Link
              prefetch={false}
              href={`/reset-password/${resetToken}`}
              className="text-sm text-primary underline break-all"
            >
              /reset-password/{resetToken}
            </Link>
          </div>
        )}

        <div className="text-center">
          <Link prefetch={false} href="/login" className="text-sm font-medium text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
