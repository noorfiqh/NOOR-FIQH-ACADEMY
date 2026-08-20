'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Facebook, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Award, 
  ShieldCheck, 
  CheckCircle2,
  Heart
} from 'lucide-react';
import { AppStore, DEFAULT_SETTINGS } from '@/lib/store';
import { SiteSettings } from '@/lib/types';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSiteSettings(AppStore.getSettings());
    const checkSettings = () => {
      setSiteSettings(AppStore.getSettings());
    };
    window.addEventListener('storage', checkSettings);
    window.addEventListener('noorfiqh_settings_updated', checkSettings);
    return () => {
      window.removeEventListener('storage', checkSettings);
      window.removeEventListener('noorfiqh_settings_updated', checkSettings);
    };
  }, []);

  return (
    <footer className="bg-[#112734] text-slate-300 border-t border-[#23626F]/60 pt-16 pb-28 sm:pb-24 font-sans relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#23626F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-12 border-b border-emerald-900/80">
          
          {/* Col 1 & 2: Brand Identity */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-3.5 group shrink-0">
              {siteSettings.logoType === 'image' && siteSettings.logoImageUrl ? (
                <div className="h-14 flex items-center py-1 group-hover:opacity-90 transition-opacity">
                  <img
                    src={siteSettings.logoImageUrl}
                    alt={siteSettings.siteNameBn || 'নূর ফিকহ একাডেমি'}
                    className="max-h-13 w-auto max-w-[240px] object-contain drop-shadow-sm"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-md border-2 border-white/20 shrink-0">
                    <span className="text-arabic text-3xl pb-1">{siteSettings.logoSymbol || 'ن'}</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-2xl text-white tracking-tight font-anek">
                      {siteSettings.siteNameBn || 'নূর ফিকহ একাডেমি'}
                    </span>
                    <p className="text-xs text-[#17A2B8] font-semibold tracking-widest flex items-center gap-1 mt-0.5">
                      <Sparkles size={11} /> {siteSettings.logoSubtitle || siteSettings.siteName || 'NOOR FIQH ACADEMY'}
                    </p>
                  </div>
                </div>
              )}
            </Link>

            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              {siteSettings.heroSubtitleBn || 'কোরআন ও সুন্নাহর মৌলিক দলীলের ভিত্তিতে ফিকহ চর্চা, আধুনিক সমকালীন মাসআলার শরয়ী সমাধান ও প্রামাণ্য দ্বীনি শিক্ষার বিশ্বস্ত অনলাইন প্রতিষ্ঠান।'}
            </p>

            {/* Social & Contact Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {siteSettings.facebookUrl && (
                <a
                  href={siteSettings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  <Facebook size={16} />
                  <span>অফিসিয়াল ফেসবুক পেজ</span>
                </a>
              )}

              {siteSettings.whatsappNumber && (
                <a
                  href={`https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#17A2B8] hover:bg-[#17A2B8]/100 text-white text-xs font-bold transition-all shadow-md"
                >
                  <Phone size={16} />
                  <span>হোয়াটসঅ্যাপ পরামর্শ</span>
                </a>
              )}
            </div>
          </div>

          {/* Col 3: Courses & Tracks */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-[#23626F]/60 pb-2">
              <BookOpen size={15} className="text-[#17A2B8]" />
              কোর্স ও বিভাগ
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/courses" className="hover:text-[#17A2B8] transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span> তাহারা ও সালাত ফিকহ
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#17A2B8] transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span> ইসলামিক ফাইন্যান্স ও ব্যবসা
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#17A2B8] transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span> পারিবারিক আইন ও ফারায়েজ
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#17A2B8] transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span> উসূলে ফিকহ ও ফতোয়া পদ্ধতি
                </Link>
              </li>
              <li>
                <Link href="/courses?type=live" className="hover:text-[#17A2B8] transition-colors flex items-center gap-1.5 text-[#17A2B8] font-semibold">
                  <span className="text-amber-500">★</span> লাইভ সেমিনার ও ওয়ার্কশপ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Services & Verification */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-[#23626F]/60 pb-2">
              <HelpCircle size={15} className="text-[#17A2B8]" />
              সেবাসমূহ
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/fatwa" className="hover:text-[#17A2B8] transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span> ফ্রি ফতোয়া ও মাসআলা জিজ্ঞাসা
                </Link>
              </li>
              <li>
                <Link href="/books" className="hover:text-[#17A2B8] transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span> ইসলামিক কিতাব ও PDF ডাউনলোড
                </Link>
              </li>
              <li>
                <Link href="/verify-certificate" className="hover:text-[#17A2B8] transition-colors flex items-center gap-1.5 text-[#17A2B8] font-semibold">
                  <Award size={13} className="text-[#17A2B8]" /> সার্টিফিকেট ভেরিফিকেশন
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#17A2B8] transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span> সাধারণ প্রশ্নোত্তর (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#17A2B8] transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span> গবেষণা পরিষদ ও ওলামায়ে কেরাম
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Office */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-[#23626F]/60 pb-2">
              <ShieldCheck size={15} className="text-[#17A2B8]" />
              যোগাযোগ
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#17A2B8] shrink-0 mt-0.5" />
                <span>নূর ফিকহ একাডেমি রিসার্চ সেন্টার, ঢাকা, বাংলাদেশ</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-[#17A2B8] shrink-0" />
                <span className="text-slate-200">noorfiqhaca@gmail.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-[#17A2B8] shrink-0" />
                <span>+8801855905185 (হোয়াটসঅ্যাপ/কল)</span>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#112734] border border-[#23626F] text-[11px] text-[#17A2B8] font-medium">
                  <CheckCircle2 size={12} className="text-[#17A2B8]" /> ২৪/৭ অনলাইন ক্লাস ও সেবা
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & SEO tags */}
        <div className="pt-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 lg:pr-36">
          <p className="text-center md:text-left">© {currentYear} নূর ফিকহ একাডেমি (Noor Fiqh Academy). সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link href="/privacy" className="hover:text-slate-200 transition-colors">প্রাইভেসি পলিসি</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-200 transition-colors">শর্তাবলী</Link>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              Made with <Heart size={12} className="text-rose-500 fill-rose-500" /> for the Ummah
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
