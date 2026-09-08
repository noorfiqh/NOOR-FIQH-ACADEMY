'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Gracefully handle or log error
    if (error) {
      console.warn('App error intercepted by boundary:', error?.message || error);
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">একটি সাময়িক সমস্যা দেখা দিয়েছে</h2>
          <p className="text-sm text-slate-600 mt-2">
            পৃষ্ঠাটি পুনরায় লোড করতে নিচের বাটনে ক্লিক করুন।
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#17A2B8] text-white font-medium rounded-xl hover:bg-[#138496] transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>পুনরায় চেষ্টা করুন</span>
        </button>
      </div>
    </div>
  );
}
