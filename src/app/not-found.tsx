import React from 'react';

export default function NotFound() {
  return (
    <main className="min-h-screen d-flex align-items-center justify-content-center bg-slate-50 py-16 px-4">
      <div className="container max-w-md mx-auto text-center bg-white p-8 rounded-2xl shadow-lg border">
        <div className="mb-6">
          <h1 className="text-8xl font-black text-gray-800 tracking-tight" style={{ color: '#F7931E' }}>404</h1>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Page Not Found</h2>
          <p className="text-gray-500 mt-3 leading-relaxed">
            Oops! The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="rs-banner-btn d-flex justify-content-center mt-6">
          <a 
            href="/" 
            className="rs-btn has-theme-orange has-icon has-bg py-3 px-6 text-white font-bold rounded-lg text-sm transition-all inline-flex items-center gap-2"
            style={{ background: '#F7931E', textDecoration: 'none' }}
          >
            Back to Home
            <span className="icon-box">
              <svg className="icon-first w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">
                <path d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z"></path>
              </svg>
            </span>
          </a>
        </div>
      </div>
    </main>
  );
}
