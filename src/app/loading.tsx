import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col align-items-center justify-content-center bg-slate-50 py-16 px-4">
      <div className="flex flex-col align-items-center max-w-sm text-center">
        {/* Animated Double Ring Spinner */}
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
          <div 
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin"
            style={{ borderTopColor: '#F7931E' }}
          ></div>
        </div>
        <h3 className="text-lg font-bold text-gray-800 animate-pulse">Loading content...</h3>
        <p className="text-gray-500 text-xs mt-1">
          Fetching specifications and files, please wait.
        </p>
      </div>
    </div>
  );
}
