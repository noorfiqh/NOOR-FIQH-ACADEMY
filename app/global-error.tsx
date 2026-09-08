'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="bn">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center font-sans">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">একটি সাময়িক সমস্যা দেখা দিয়েছে</h2>
            <p className="text-sm text-slate-600 mt-2">
              অ্যাপ্লিকেশনটি পুনরায় লোড করতে নিচের বাটনে ক্লিক করুন।
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
      </body>
    </html>
  );
}
