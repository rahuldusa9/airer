'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (username.length < 3 || username.length > 30) {
      setError('Username must be between 3 and 30 characters');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Call MongoDB signup API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Store token and user data
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-effect rounded-2xl p-8 neon-border border-neon-purple">
          <h1 className="text-4xl font-bold text-center mb-2 glow-text text-neon-purple">
            Join Airer 1.0
          </h1>
          <p className="text-center text-gray-400 mb-8">
            Create your AI character universe
          </p>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-neon-purple">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-neon-purple/30 focus:border-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-purple/50 transition"
                placeholder="Choose a username"
                required
                minLength={3}
                maxLength={30}
                suppressHydrationWarning
              />
              <p className="text-xs text-gray-500 mt-1">
                3-30 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neon-purple">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-neon-purple/30 focus:border-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-purple/50 transition"
                placeholder="your@email.com"
                required
                suppressHydrationWarning
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neon-purple">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-neon-purple/30 focus:border-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-purple/50 transition pr-12"
                  placeholder="Create a password"
                  required
                  minLength={6}
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                At least 6 characters
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-400 text-sm">
                Account created! Redirecting...
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-neon-purple text-white font-semibold hover:bg-neon-purple/80 transition disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
              suppressHydrationWarning
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-neon-purple hover:text-neon-pink transition"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
