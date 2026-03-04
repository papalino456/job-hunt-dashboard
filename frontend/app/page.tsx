'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    api.checkAuth()
      .then(({ authenticated }) => {
        if (authenticated) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-steel-400 font-mono">Loading...</div>
    </div>
  );
}
