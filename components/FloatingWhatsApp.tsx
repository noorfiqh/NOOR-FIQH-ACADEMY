'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { AppStore } from '@/lib/store';

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('8801855905185');

  useEffect(() => {
    const syncPhone = () => {
      const settings = AppStore.getSettings();
      if (settings?.whatsappNumber) {
        const cleanNum = settings.whatsappNumber.replace(/[^0-9]/g, '');
        if (cleanNum) setPhoneNumber(cleanNum);
      }
    };
    syncPhone();
    window.addEventListener('storage', syncPhone);
    window.addEventListener('noorfiqh_settings_updated', syncPhone);
    return () => {
      window.removeEventListener('storage', syncPhone);
      window.removeEventListener('noorfiqh_settings_updated', syncPhone);
    };
  }, []);

  const defaultMessage = encodeURIComponent('আসসালামু আলাইকুম, নূর ফিকহ একাডেমি (Noor Fiqh Academy) এর কোর্স বা ফতোয়া সম্পর্কে জানতে চাই।');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 font-sans">
      {isOpen && (
        <div className="w-76 sm:w-80 bg-white rounded-3xl shadow-2xl border border-[#17A2B8]/20 overflow-hidden text-slate-900 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#112734] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#17A2B8] text-slate-950 flex items-center justify-center font-bold text-lg shadow-sm">
                ن
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">নূর ফিকহ সাপোর্ট হেল্পডেস্ক</h4>
                <p className="text-[11px] text-[#17A2B8]/80 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  অনলাইন আছেন
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 bg-slate-50 text-xs text-slate-600 space-y-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm text-slate-800">
              <p className="font-medium leading-relaxed font-tiro">
                আসসালামু আলাইকুম! কোনো কোর্স ভর্তি, ফতোয়া অথবা কিতাব অর্ডার সংক্রান্ত সহায়তার জন্য সরাসরি আমাদের সাথে হোয়াটসঅ্যাপে যুক্ত হোন।
              </p>
              <span className="text-[10px] text-slate-400 block text-right mt-1.5">নূর ফিকহ একাডেমি</span>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl transition-all shadow-md text-sm active:scale-95"
            >
              <MessageCircle size={18} />
              <span>হোয়াটসঅ্যাপে চ্যাট শুরু করুন</span>
            </a>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-full shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/60"
        aria-label="WhatsApp Support"
      >
        <MessageCircle size={22} className="fill-white text-[#25D366] shrink-0" />
        <span className="text-xs font-extrabold hidden sm:inline tracking-wide font-tiro">হোয়াটসঅ্যাপ ফিকহ হেল্প</span>
      </button>
    </div>
  );
}
