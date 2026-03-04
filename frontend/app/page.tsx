'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api';

export default function Home() {
  useEffect(() => {
    api.checkAuth()
      .then(({ authenticated }) => {
        if (authenticated) {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/login';
        }
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-steel-950">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75" />
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150" />
        <span className="text-steel-400 font-mono text-sm ml-2">Loading...</span>
      </div>
    </div>
  );
}
