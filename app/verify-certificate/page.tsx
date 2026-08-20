'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppStore, DEFAULT_SETTINGS } from '@/lib/store';
import { Certificate, SiteSettings } from '@/lib/types';
import { CertificateView } from '@/components/CertificateView';
import { Search, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

function VerifyCertificateContent() {
  const searchParams = useSearchParams();
  const certIdFromQuery = searchParams?.get('id') || '';

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [certInput, setCertInput] = useState(certIdFromQuery);
  const [searchedCert, setSearchedCert] = useState<Certificate | null>(null);
  const [hasSearched, setHasSearched] = useState(!!certIdFromQuery);

  useEffect(() => {
    setSiteSettings(AppStore.getSettings());
    if (certIdFromQuery) {
      const found = AppStore.getCertificateByNumber(certIdFromQuery);
      if (found) {
        setSearchedCert(found);
      }
    }
  }, [certIdFromQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certInput.trim()) return;

    setHasSearched(true);
    const found = AppStore.getCertificateByNumber(certInput.trim());
    setSearchedCert(found || null);
  };

  return (
    <div className="min-h-screen bg-[#fdfcf9] font-sans text-[#2c3e50] py-10 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Main Site Branding & Header (Hidden on Print) */}
        <div className="text-center space-y-4 max-w-2xl mx-auto print:hidden">
          
          {/* Main Academy Logo */}
          <div className="flex flex-col items-center justify-center pt-2">
            {siteSettings.logoType === 'image' && siteSettings.logoImageUrl ? (
              <img
                src={siteSettings.logoImageUrl}
                alt={siteSettings.siteNameBn || 'নূর ফিকহ একাডেমি'}
                className="h-16 sm:h-20 w-auto max-w-[300px] object-contain drop-shadow-sm mb-2"
              />
            ) : (
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-md border-2 border-white/20">
                  <span className="text-arabic text-3xl pb-1">{siteSettings.logoSymbol || 'ن'}</span>
                </div>
                <div className="text-left">
                  <span className="font-extrabold text-2xl text-[#112734] font-anek block leading-none">
                    {siteSettings.siteNameBn || 'নূর ফিকহ একাডেমি'}
                  </span>
                  <span className="text-[11px] text-[#17A2B8] font-bold tracking-widest uppercase block mt-1">
                    {siteSettings.logoSubtitle || siteSettings.siteName || 'NOOR FIQH ACADEMY'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#17A2B8]/10 text-[#112734] text-xs font-bold uppercase tracking-wider border border-[#17A2B8]/30">
            <ShieldCheck size={14} className="text-amber-500" />
            <span>অফিসিয়াল সার্টিফিকেট ভেরিফিকেশন সিস্টেম</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#112734] tracking-tight">
            সনদপত্র অনলাইন অনলাইন যাচাই ও তথ্য কেন্দ্র
          </h1>

          <p className="text-xs sm:text-sm text-[#5a524d] leading-relaxed">
            নূর ফিকহ একাডেমি কর্তৃক ইস্যুকৃত সকল কোর্স ও ডিপ্লোমা সনদের বৈধতা অনলাইনে তাৎক্ষণিকভাবে যাচাই করুন।
          </p>
        </div>

        {/* Search Box (Hidden on Print) */}
        <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4 print:hidden">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2c3e50] mb-2 uppercase">
                সার্টিফিকেট / সনদ নম্বর লিখুন
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="যেমন: NFA-2025-0891"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-[#ece8e0] font-mono font-extrabold text-sm focus:outline-none focus:border-[#112734] uppercase tracking-wider"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
            >
              <Search size={16} />
              <span>যাচাই করুন (Verify Certificate)</span>
            </button>
          </form>

          <div className="text-[11px] text-[#8a817c] text-center">
            * সার্টিফিকেটের নিচে উল্লিখিত ইউনিক সিরিয়াল নম্বরটি ইংরেজি বড় অক্ষরে লিখুন।
          </div>
        </div>

        {/* Verification Result */}
        {hasSearched && (
          <div>
            {searchedCert ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-[#17A2B8]/10 border border-[#17A2B8]/30 p-4 rounded-2xl flex items-center justify-between text-xs text-[#112734] font-bold max-w-xl mx-auto print:hidden">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-[#17A2B8]" />
                    <span>বৈধ ও ভেরিফায়েড সনদপত্র পাওয়া গেছে!</span>
                  </div>
                  <span className="font-mono text-slate-800">{searchedCert.certificateNumber}</span>
                </div>

                {/* Render the printable certificate view */}
                <CertificateView
                  userName={searchedCert.userName}
                  courseTitle={searchedCert.courseTitle}
                  issueDate={searchedCert.issueDate}
                  certificateNumber={searchedCert.certificateNumber}
                  grade={searchedCert.grade}
                  certificateCopyUrl={searchedCert.certificateCopyUrl || searchedCert.customPdfUrl}
                />
              </div>
            ) : (
              <div className="max-w-md mx-auto bg-red-50 border border-red-200 p-6 rounded-3xl text-center space-y-3 print:hidden">
                <AlertCircle size={36} className="text-red-500 mx-auto" />
                <h3 className="text-base font-bold text-red-900">কোনো সনদপত্র পাওয়া যায়নি</h3>
                <p className="text-xs text-red-700 leading-relaxed">
                  প্রদত্ত নম্বর &ldquo;{certInput}&rdquo; অনুযায়ী আমাদের ডাটাবেজে কোনো রেকর্ড মেলেনি। অনুগ্রহ করে সঠিক সিরিয়াল নম্বর দিয়ে পুনরায় চেষ্টা করুন।
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fdfcf9] flex items-center justify-center p-8 text-[#112734] font-bold">লোড হচ্ছে...</div>}>
      <VerifyCertificateContent />
    </Suspense>
  );
}
