'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Envelope, Lock, Eye, EyeSlash, ArrowRight } from '@phosphor-icons/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      if (result.error === 'PENDING_APPROVAL') {
        setError('Your access is pending approval. Please contact the administrator.');
      } else {
        setError('Invalid email or password');
      }
      return;
    }

    if (result?.ok) {
      router.push('/dashboard');
    }
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Left panel: Gradient Sidebar (desktop only) */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] p-4">
        <div className="relative flex flex-col justify-between w-full h-full p-12 overflow-hidden rounded-3xl bg-gradient-to-b from-[#0e0f26] via-[#030835] to-[#01020f] shadow-2xl">
          {/* Subtle decorative glows */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary-hover/10 blur-3xl" />
          
          <div className="relative z-10">
            {/* Project Branding */}
            <div className="flex items-center gap-2.5 text-white">
              <Image src="/pictures/dcaa-logo-transparent.png" alt="DCAA Logo" width={32} height={32} className="shrink-0 w-auto h-8" style={{ width: 'auto', height: 'auto' }} />
              <span className="font-semibold text-xs tracking-wider uppercase text-canvas-subtle/80">DCAA Applications</span>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight font-heading">
              <span className="text-white">Welcome to the</span> <br />
              <span className="text-[#30A7D8]">
                DCAA application
              </span>
              <span className="text-white"> portal.</span>
            </h1>
            <p className="text-base text-white/70 max-w-sm leading-relaxed">
              Login to track how your application form is performing.
            </p>
          </div>

          <div className="relative z-10 text-xs text-white/40 font-mono">
            © 2026 DIGITAL CREATOR AFRICA ACADEMY
          </div>
        </div>
      </div>

      {/* Right panel: Login Form */}
      <div className="flex flex-col justify-center flex-1 px-6 py-12 lg:px-20 xl:px-24 bg-canvas">
        <div className="mx-auto w-full max-w-md space-y-8">
          {/* Mobile Logo Header */}
          <div className="flex flex-col space-y-2 md:hidden">
            <div className="flex items-center gap-2">
              <Image src="/pictures/dcaa-logo-transparent.png" alt="DCAA Logo" width={32} height={32} className="shrink-0 w-auto h-8" style={{ width: 'auto', height: 'auto' }} />
              <span className="font-bold text-xl tracking-tight text-primary">DCAA Applications</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-ink font-heading">Sign In</h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the platform.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                Email Address
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <Envelope className="size-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 h-12 bg-canvas-subtle border-hairline hover:border-hairline-strong focus:bg-canvas transition-colors duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-[11px] font-bold tracking-widest text-muted-foreground hover:text-primary transition-colors uppercase cursor-pointer"
                  onClick={() => alert("Please contact your administrator to reset password.")}
                >
                  Forgot?
                </button>
              </div>
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
              {loading ? 'Signing in...' : 'Login'}
              {!loading && <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
