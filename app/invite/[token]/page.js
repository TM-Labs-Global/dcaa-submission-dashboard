'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { signIn } from 'next-auth/react';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const [token] = useState(params.token);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [emailFromInvite, setEmailFromInvite] = useState(false);

  useEffect(() => {
    async function validateToken() {
      try {
        const res = await fetch(`/api/invites?token=${token}`);
        const data = await res.json();

        if (data.valid) {
          if (data.email) {
            setEmail(data.email);
            setEmailFromInvite(true);
          }
          setIsValid(true);
        } else {
          setError(data.message || 'This invite link has expired or already been used.');
        }
      } catch (err) {
        setError('Failed to validate invite link.');
      } finally {
        setValidating(false);
      }
    }

    if (token) {
      validateToken();
    }
  }, [token]);

  async function handleSetPassword(e) {
    e.preventDefault();
    setError('');

    if (!emailFromInvite && !email) {
      setError('Email is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          email: emailFromInvite ? undefined : email,
          action: 'accept',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to set password');
        return;
      }

      // Auto sign in the user
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas-subtle">
        <Card className="w-full max-w-md p-xxl border border-hairline rounded-md">
          <p className="text-body text-muted">Validating invite link...</p>
        </Card>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas-subtle">
        <Card className="w-full max-w-md p-xxl border border-hairline rounded-md">
          <h1 className="text-section-heading font-bold text-ink mb-lg">Invite Link Invalid</h1>
          <p className="text-body text-muted mb-lg">{error}</p>
          <Button
            onClick={() => router.push('/login')}
            className="w-full bg-primary text-canvas hover:bg-primary-hover font-button"
          >
            Back to Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-subtle">
      <Card className="w-full max-w-md p-xxl border border-hairline rounded-md">
        <div className="mb-xxl">
          <h1 className="text-page-title font-bold text-ink mb-xs">Set Your Password</h1>
          <p className="text-body text-muted">Create a password to activate your account</p>
        </div>

        <form onSubmit={handleSetPassword} className="space-y-lg">
          <div>
            <label className="block text-metric-label text-body mb-xs font-medium">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailFromInvite || loading}
              className={emailFromInvite ? 'bg-canvas-subtle' : ''}
              required={!emailFromInvite}
            />
          </div>

          <div>
            <label className="block text-metric-label text-body mb-xs font-medium">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-caption text-muted mt-xs">At least 8 characters</p>
          </div>

          <div>
            <label className="block text-metric-label text-body mb-xs font-medium">
              Confirm Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="p-md rounded-sm bg-error-tint border border-error text-error text-body">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-canvas hover:bg-primary-hover font-button"
          >
            {loading ? 'Activating account...' : 'Activate Account'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
