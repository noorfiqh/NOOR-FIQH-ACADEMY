'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { AppStore } from '@/lib/store';
import { FaqItem } from '@/lib/types';

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  useEffect(() => {
    const settings = AppStore.getSettings();
    if (settings.faqs) {
      setFaqs(settings.faqs);
    }

    const handleSettingsUpdate = (e: any) => {
      if (e.detail?.faqs) {
        setFaqs(e.detail.faqs);
      }
    };
    window.addEventListener('noorfiqh_settings_updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('noorfiqh_settings_updated', handleSettingsUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfcf9] font-sans text-[#2c3e50] py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17A2B8]/10 text-[#112734] text-xs font-bold uppercase tracking-wider border border-[#17A2B8]/30 font-tiro">
            <HelpCircle size={14} className="text-amber-500" />
            <span>সচরাচর জিজ্ঞাসিত প্রশ্নোত্তর</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#112734] tracking-tight font-anek">
            প্রশ্নোত্তর ও সাধারণ জিজ্ঞাসা (FAQ)
          </h1>
          <p className="text-sm text-[#5a524d] font-tiro">
            কোর্স ভর্তি, পেমেন্ট, সার্টিফিকেট ও ফতোয়া সেবা সম্পর্কিত সাধারণ তথ্য
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.id || idx}
                className="bg-white rounded-3xl border border-[#ece8e0] card-natural-shadow overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <span className="font-extrabold text-base text-[#2c3e50] font-anek">{faq.q}</span>
                  <div className="p-2 rounded-xl bg-slate-100 text-[#112734] shrink-0">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="p-6 pt-0 text-sm text-[#5a524d] leading-relaxed border-t border-[#ece8e0] bg-[#fdfcf9] font-tiro">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-[#17A2B8]/10 p-8 rounded-3xl border border-[#17A2B8]/30 text-center space-y-3">
          <h3 className="font-extrabold text-base text-[#112734] font-anek">অন্য কোনো বিষয়ে জানার আছে?</h3>
          <p className="text-xs text-[#5a524d] font-tiro">আমাদের হেল্পলাইন ও হোয়াটসঅ্যাপে সরাসরি প্রশ্ন করুন</p>
          <a
            href="https://wa.me/8801855905185"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#112734] text-white rounded-xl font-bold text-xs shadow hover:bg-[#23626F] transition-colors font-tiro"
          >
            <span>হোয়াটসঅ্যাপে মেসেজ পাঠান</span>
          </a>
        </div>
      </div>
    </div>
  );
}
