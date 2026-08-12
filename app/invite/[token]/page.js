'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from 'next-auth/react';
import { Lock, Eye, EyeSlash, CheckCircle } from '@phosphor-icons/react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      <div className="flex min-h-screen bg-canvas">
        <div className="hidden md:flex md:w-[45%] lg:w-[40%] p-4">
          <div className="relative flex flex-col justify-between w-full h-full p-12 overflow-hidden rounded-3xl bg-gradient-to-b from-[#0e0f26] via-[#030835] to-[#01020f] shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary-hover/10 blur-3xl" />
          </div>
        </div>

        <div className="flex flex-col justify-center flex-1 px-6 py-12 lg:px-20 xl:px-24 bg-canvas">
          <div className="mx-auto w-full max-w-md">
            <p className="text-muted-foreground">Validating invite link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="flex min-h-screen bg-canvas">
        <div className="hidden md:flex md:w-[45%] lg:w-[40%] p-4">
          <div className="relative flex flex-col justify-between w-full h-full p-12 overflow-hidden rounded-3xl bg-gradient-to-b from-[#0e0f26] via-[#030835] to-[#01020f] shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary-hover/10 blur-3xl" />
          </div>
        </div>

        <div className="flex flex-col justify-center flex-1 px-6 py-12 lg:px-20 xl:px-24 bg-canvas">
          <div className="mx-auto w-full max-w-md space-y-8">
            <div className="flex flex-col space-y-2 md:hidden">
              <div className="flex items-center gap-2">
                <Image src="/pictures/dcaa-logo-transparent.png" alt="DCAA Logo" width={32} height={32} className="shrink-0 w-auto h-8" style={{ width: 'auto' }} />
                <span className="font-bold text-xl tracking-tight text-primary">DCAA Applications</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-ink font-heading">Invite Link Invalid</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button
                onClick={() => router.push('/login')}
                className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-soft-lift"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Left panel: Gradient Sidebar (desktop only) */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] p-4">
        <div className="relative flex flex-col justify-between w-full h-full p-12 overflow-hidden rounded-3xl bg-gradient-to-b from-[#0e0f26] via-[#030835] to-[#01020f] shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary-hover/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 text-white">
              <Image src="/pictures/dcaa-logo-transparent.png" alt="DCAA Logo" width={32} height={32} className="shrink-0 w-auto h-8" style={{ width: 'auto' }} />
              <span className="font-semibold text-xs tracking-wider uppercase text-canvas-subtle/80">DCAA Applications</span>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight font-heading">
              Welcome to the <br />
              <span className="text-[#30A7D8]">
                DCAA application
              </span>
              <span className="text-white"> portal.</span>
            </h1>
            <p className="text-base text-white/70 max-w-sm leading-relaxed">
              Set up your account to start reviewing applications.
            </p>
          </div>

          <div className="relative z-10 text-xs text-white/40 font-mono">
            © 2026 DIGITAL CREATOR AFRICA ACADEMY
          </div>
        </div>
      </div>

      {/* Right panel: Setup Form */}
      <div className="flex flex-col justify-center flex-1 px-6 py-12 lg:px-20 xl:px-24 bg-canvas">
        <div className="mx-auto w-full max-w-md space-y-8">
          {/* Mobile Logo Header */}
          <div className="flex flex-col space-y-2 md:hidden">
            <div className="flex items-center gap-2">
              <Image src="/pictures/dcaa-logo-transparent.png" alt="DCAA Logo" width={32} height={32} className="shrink-0 w-auto h-8" style={{ width: 'auto' }} />
              <span className="font-bold text-xl tracking-tight text-primary">DCAA Applications</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-ink font-heading">Set Your Password</h2>
            <p className="text-sm text-muted-foreground">
              Create a secure password to activate your account
            </p>
          </div>

          <form onSubmit={handleSetPassword} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-12 bg-canvas-subtle border-hairline hover:border-hairline-strong focus:bg-canvas transition-colors duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={emailFromInvite || loading}
                required={!emailFromInvite}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                Password
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <Lock className="size-4" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 bg-canvas-subtle border-hairline hover:border-hairline-strong focus:bg-canvas transition-colors duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-ink transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">At least 8 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                Confirm Password
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <Lock className="size-4" />
                </div>
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 bg-canvas-subtle border-hairline hover:border-hairline-strong focus:bg-canvas transition-colors duration-200"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-ink transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-error/20 bg-error-tint p-4 text-error text-xs font-medium leading-relaxed">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer shadow-soft-lift"
            >
              {loading ? 'Activating account...' : 'Activate Account'}
              {!loading && <CheckCircle className="size-4 transition-transform group-hover:scale-110" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
