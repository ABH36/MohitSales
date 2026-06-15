'use client';

import React, { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Next.js Layout Error Boundary caught:', error);
  }, [error]);

  return (
    <main className="min-h-screen d-flex align-align-items-center justify-content-center bg-slate-50 py-16 px-4">
      <div className="container max-w-md mx-auto text-center bg-white p-8 rounded-2xl shadow-lg border">
        <div className="mb-6">
          <div className="inline-flex p-4 bg-red-50 text-red-500 rounded-full mb-4">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Something went wrong!</h2>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            An unexpected error occurred while loading this page. Please try again.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded text-left text-xs font-mono text-red-700 overflow-auto max-h-40">
              {error.message || 'Unknown error'}
            </div>
          )}
        </div>
        <div className="d-flex justify-content-center gap-4">
          <button 
            onClick={() => reset()} 
            className="rs-btn has-theme-orange py-2.5 px-6 text-white font-bold rounded-lg text-sm border-0 cursor-pointer"
            style={{ background: '#F7931E' }}
          >
            Try Again
          </button>
          <a 
            href="/"
            className="py-2.5 px-6 bg-slate-200 hover:bg-slate-300 text-gray-700 font-bold rounded-lg text-sm transition-all"
            style={{ textDecoration: 'none' }}
          >
            Go Home
          </a>
        </div>
      </div>
    </main>
  );
}
