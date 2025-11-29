'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setUser } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call MongoDB login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);

      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-effect rounded-2xl p-8 neon-border border-neon-blue">
          <h1 className="text-4xl font-bold text-center mb-2 glow-text text-neon-blue">
            Airer 1.0
          </h1>
          <p className="text-center text-gray-400 mb-8">
            Enter the Metaverse of AI Characters
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-neon-blue">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-neon-blue/30 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition"
                placeholder="your@email.com"
                required
                suppressHydrationWarning
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neon-blue">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-neon-blue/30 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition pr-12"
                  placeholder="••••••••"
                  required
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
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-neon-blue text-black font-semibold hover:bg-neon-blue/80 transition disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
              suppressHydrationWarning
            >
              {loading ? 'Logging in...' : 'Enter the Metaverse'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/signup"
              className="text-neon-blue hover:text-neon-purple transition"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
