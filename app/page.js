'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import useAuthStore from '@/store/authStore';

console.log(
  "%cPAGE RENDER:",
  "color: yellow; font-size:20px;",
  typeof window === "undefined" ? "SERVER" : "CLIENT"
);

const IntroAnimation = dynamic(() => import('@/components/IntroAnimation'), {
  ssr: false,
});

export default function Home() {
  const router = useRouter();
  const { setUser, setLoading } = useAuthStore();
  const [showIntro, setShowIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    // Check if intro was already shown in this session
    const introShown = sessionStorage.getItem('intro_shown');
    if (introShown) {
      setShowIntro(false);
      setIntroComplete(true);
    }
  }, []);

  useEffect(() => {
    if (!introComplete) return;

    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          const response = await fetch('/api/auth/verify-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            router.push('/dashboard');
          } else {
            localStorage.removeItem('auth_token');
            router.push('/auth/login');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          router.push('/auth/login');
        }
      } else {
        router.push('/auth/login');
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [router, setUser, setLoading, introComplete]);

  const handleIntroComplete = () => {
    sessionStorage.setItem('intro_shown', 'true');
    setShowIntro(false);
    setIntroComplete(true);
  };

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1117] via-[#1a1d29] to-[#0f1117]">
      <div className="animate-pulse text-purple-400 text-2xl">
        Loading...
      </div>
    </div>
  );
}
