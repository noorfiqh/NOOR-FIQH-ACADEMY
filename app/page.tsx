'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  HelpCircle, 
  Award, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight,
  ShieldCheck, 
  Video, 
  GraduationCap, 
  Users, 
  Library, 
  PhoneCall, 
  Search,
  MessageSquare,
  FileCheck,
  Compass,
  Play
} from 'lucide-react';
import { 
  AppStore, 
  DEFAULT_SETTINGS, 
  INITIAL_COURSES, 
  INITIAL_BOOKS, 
  INITIAL_FATWAS, 
  INITIAL_REVIEWS, 
  INITIAL_FACULTY, 
  INITIAL_LIVE_CLASSES 
} from '@/lib/store';
import { Course, Book, FatwaQuestion, FacultyMember, SiteSettings, LiveClass } from '@/lib/types';
import { CourseCard } from '@/components/CourseCard';
import { BookCard } from '@/components/BookCard';
import { LiveClassCard } from '@/components/LiveClassCard';
import { PaymentModal } from '@/components/PaymentModal';
import { TeacherContactButtons } from '@/components/TeacherContactButtons';

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [fatwas, setFatwas] = useState<FatwaQuestion[]>(() => INITIAL_FATWAS.slice(0, 3));
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [faculty, setFaculty] = useState<FacultyMember[]>(INITIAL_FACULTY);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>(INITIAL_LIVE_CLASSES);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<Course | null>(null);
  const [selectedLiveClassForPayment, setSelectedLiveClassForPayment] = useState<LiveClass | null>(null);

  useEffect(() => {
    const syncWithStore = () => {
      setCourses(AppStore.getCourses());
      setBooks(AppStore.getBooks());
      setFatwas(AppStore.getFatwas().slice(0, 3));
      setReviews(AppStore.getReviews());
      setSiteSettings(AppStore.getSettings());
      setFaculty(AppStore.getFaculty());
      setLiveClasses(AppStore.getLiveClasses());
    };

    syncWithStore();

    window.addEventListener('storage', syncWithStore);
    window.addEventListener('noorfiqh_settings_updated', syncWithStore);
    return () => {
      window.removeEventListener('storage', syncWithStore);
      window.removeEventListener('noorfiqh_settings_updated', syncWithStore);
    };
  }, []);


  const heroCard = siteSettings.heroCard || {
    enabled: true,
    arabicSymbol: 'ن',
    badgeText: 'ভর্তি চলছে • নতুন ব্যাচ',
    title: 'উচ্চতর ফিকহ ও ফতোয়া ডিপ্লোমা কোর্স',
    subtitle: 'মুফতীগণের প্রত্যক্ষ তত্ত্বাবধানে কিতাবুল বুয়ু, ফারায়েজ ও সমকালীন আধুনিক চিকিৎসার ফিকহি গবেষণার সুযোগ।',
    features: [
      'সরাসরি লাইভ ক্লাস ও নোটপত্র',
      'ভেরিফায়েড প্রফেশনাল সনদপত্র',
      '২৪/৭ ওস্তাদ সাপোর্ট হেল্পডেস্ক'
    ],
    buttonText: 'কোর্সে যুক্ত হোন',
    buttonLink: '/courses'
  };

  return (
    <div className="min-h-screen bg-[#fdfcf9] font-sans text-[#2c3e50] overflow-x-hidden">
      {/* 1. ACADEMY HERO SECTION (Natural Tones with Islamic Arched Card) */}
      <section className="relative academy-gradient overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 px-4 sm:px-8 lg:px-16 text-white">
        {/* Optional Custom Background Image from Admin */}
        {siteSettings.heroBgImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-700 mix-blend-overlay"
            style={{ 
              backgroundImage: `url(${siteSettings.heroBgImage})`,
              opacity: (siteSettings.heroBgOpacity ?? 25) / 100
            }}
          />
        )}

        {/* Ambient Subtle Radial Glow & Patterns */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[radial-gradient(circle_at_center,_#fff_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#17A2B8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Hero Copy & Actions */}
          <div className={`${heroCard.enabled !== false ? 'lg:col-span-7' : 'lg:col-span-12 max-w-3xl mx-auto text-center'} space-y-6 text-center lg:text-left`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#17A2B8]/20 text-[#17A2B8] text-xs font-bold rounded-full uppercase tracking-widest border border-[#17A2B8]/30">
              <Sparkles size={14} className="text-[#17A2B8]" />
              <span>{siteSettings.siteNameBn}তে স্বাগতম • {siteSettings.siteName.toUpperCase()}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.15] tracking-tight">
              {siteSettings.heroTitleBn || 'নির্ভরযোগ্য ফিকহ চর্চায় এক অনন্য আধুনিক বিদ্যাপীঠ'}
            </h1>

            <p className="text-base sm:text-lg text-emerald-50/90 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              {siteSettings.heroSubtitleBn || 'কোরআন ও সহিহ সুন্নাহর আলোকে দৈনন্দিন ইবাদত, ব্যবসা-বাণিজ্য, পারিবারিক আইন ও সমকালীন আধুনিক মাসআলা-মাসায়েল শিখুন অভিজ্ঞ মুফতী ও ফিকহ গবেষকদের নিবিড় তত্ত্বাবধানে।'}
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center ${heroCard.enabled !== false ? 'lg:justify-start' : 'justify-center'} pt-2`}>
              <Link
                href="/courses"
                className="font-tiro px-8 py-4 bg-[#17A2B8] hover:bg-[#17A2B8]/20 text-[#112734] font-black text-sm rounded-2xl shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>কোর্সসমূহে ভর্তি হোন</span>
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/fatwa"
                className="font-tiro px-8 py-4 border border-emerald-400/50 hover:border-amber-300 text-white font-bold text-sm rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <HelpCircle size={18} className="text-[#17A2B8]" />
                <span>ফ্রি মাসআলা জিজ্ঞাসা করুন</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#23626F]/80 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
              <div>
                <span className="text-2xl font-black text-[#17A2B8] block">৩,৫০০+</span>
                <span className="text-[11px] text-[#17A2B8]/80 uppercase font-medium">সন্তুষ্ট শিক্ষার্থী</span>
              </div>
              <div>
                <span className="text-2xl font-black text-[#17A2B8] block">১,২০০+</span>
                <span className="text-[11px] text-[#17A2B8]/80 uppercase font-medium">প্রদত্ত ফতোয়া</span>
              </div>
              <div>
                <span className="text-2xl font-black text-[#17A2B8] block">১০০%</span>
                <span className="text-[11px] text-[#17A2B8]/80 uppercase font-medium">প্রামাণ্য রেফারেন্স</span>
              </div>
            </div>
          </div>

          {/* Right Column: Natural Tones Islamic Arch Spotlight Card (Admin-Managed) */}
          {heroCard.enabled !== false && (
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm bg-white/5 rounded-t-[100px] border-t-2 border-x-2 border-white/20 backdrop-blur-md p-3.5 shadow-2xl">
                <div className="w-full rounded-t-[85px] bg-white overflow-hidden flex flex-col p-6 text-center text-[#2c3e50] shadow-md border border-[#ece8e0]">
                  {/* Badge Icon / Image */}
                  <div className="w-16 h-16 bg-[#112734] rounded-full mx-auto mb-4 flex items-center justify-center text-[#17A2B8] shadow-md border-2 border-[#17A2B8]/40 overflow-hidden">
                    {heroCard.iconImage ? (
                      <img
                        src={heroCard.iconImage}
                        alt={heroCard.title || 'Icon'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-arabic text-3xl font-black">{heroCard.arabicSymbol || 'ن'}</span>
                    )}
                  </div>

                  {heroCard.badgeText && (
                    <span className="text-[10px] font-extrabold tracking-widest text-[#0f8293] bg-amber-50 px-3 py-1 rounded-full uppercase inline-block mx-auto mb-2">
                      {heroCard.badgeText}
                    </span>
                  )}

                  <h3 className="text-xl font-black text-[#112734] mb-2 leading-tight">
                    {heroCard.title || 'উচ্চতর ফিকহ ও ফতোয়া ডিপ্লোমা কোর্স'}
                  </h3>

                  {heroCard.subtitle && (
                    <p className="text-xs text-[#5a524d] leading-relaxed mb-5">
                      {heroCard.subtitle}
                    </p>
                  )}

                  {heroCard.features && heroCard.features.length > 0 && (
                    <div className="space-y-2 mb-6 text-left text-xs text-[#2c3e50] bg-[#fdfcf9] p-3.5 rounded-2xl border border-[#ece8e0]">
                      {heroCard.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-[#17A2B8] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    href={heroCard.buttonLink || '/courses'}
                    className="font-tiro w-full py-3 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <span>{heroCard.buttonText || 'কোর্সে যুক্ত হোন'}</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 2. THREE PILLARS / KEY FEATURES (Natural Tones Card Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          <div className="card-natural-shadow bg-white p-7 rounded-3xl flex flex-col gap-4 border border-[#ece8e0] hover:border-[#17A2B8]/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-black text-base shadow-sm group-hover:scale-105 transition-transform">
              ০১
            </div>
            <h4 className="text-xl font-bold text-[#2c3e50] group-hover:text-[#112734] transition-colors">
              অনলাইন লাইভ ও রেকর্ডেড ক্লাস
            </h4>
            <p className="text-sm text-[#5a524d] leading-relaxed">
              যেকোনো স্থান থেকে যেকোনো সময়ে মোবাইল বা ল্যাপটপে ক্লাস করুন এবং ওস্তাদগণের সাথে সরাসরি প্রশ্নোত্তর সেশনে অংশ নিন।
            </p>
            <Link href="/courses" className="font-tiro mt-auto text-[#112734] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pt-2 hover:underline">
              <span>সকল কোর্স দেখুন</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card-natural-shadow bg-white p-7 rounded-3xl flex flex-col gap-4 border border-[#ece8e0] hover:border-[#17A2B8]/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#17A2B8]/10 border border-[#17A2B8]/30 flex items-center justify-center text-[#23626F] font-black text-base shadow-sm group-hover:scale-105 transition-transform">
              ০২
            </div>
            <h4 className="text-xl font-bold text-[#2c3e50] group-hover:text-[#112734] transition-colors">
              অভিজ্ঞ মুফতী ও ফিকহ বোর্ড
            </h4>
            <p className="text-sm text-[#5a524d] leading-relaxed">
              দারুল উলুম দেওবন্দ, আল-আজহার ও আন্তর্জাতিক মানের স্কলারদের সমন্বয়ে গঠিত নির্ভরযোগ্য গবেষণা পরিষদ।
            </p>
            <Link href="/about" className="font-tiro mt-auto text-[#112734] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pt-2 hover:underline">
              <span>মুফতী প্যানেল পরিচিতি</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card-natural-shadow bg-white p-7 rounded-3xl flex flex-col gap-4 border border-[#ece8e0] hover:border-[#17A2B8]/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-black text-base shadow-sm group-hover:scale-105 transition-transform">
              ০৩
            </div>
            <h4 className="text-xl font-bold text-[#2c3e50] group-hover:text-[#112734] transition-colors">
              অনলাইন সার্টিফিকেট ভেরিফিকেশন
            </h4>
            <p className="text-sm text-[#5a524d] leading-relaxed">
              কোর্স সম্পন্নকারী শিক্ষার্থীদের জন্য ইউনিক ট্র্যাকিং নম্বরসহ ডাউনলোডযোগ্য প্রামাণ্য সনদপত্র ও ভেরিফিকেশন সিস্টেম।
            </p>
            <Link href="/verify-certificate" className="font-tiro mt-auto text-[#112734] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pt-2 hover:underline">
              <span>সনদপত্র যাচাই করুন</span>
              <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </section>

      {/* 3. FEATURED COURSES SECTION */}
      <section className="py-16 bg-[#f8faf7] border-y border-[#ece8e0] px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f8293] uppercase tracking-wider mb-2">
                <BookOpen size={14} /> বিশেষায়িত পাঠ্যক্রম
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112734] tracking-tight">
                জনপ্রিয় ফিকহ কোর্সসমূহ
              </h2>
            </div>
            <Link
              href="/courses"
              className="font-tiro inline-flex items-center gap-1.5 text-sm font-bold text-[#112734] hover:text-[#23626F] transition-colors group"
            >
              <span>সকল কোর্স ক্যাটালগ ({courses.length}টি)</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.slice(0, 4).map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={(c) => setSelectedCourseForEnroll(c)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3.5. LIVE CLASSES & WEBINARS SECTION */}
      {liveClasses.length > 0 && (
        <section className="py-16 bg-white border-t border-[#ece8e0] px-4 sm:px-8">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
                  <Video size={14} className="animate-pulse" /> সরাসরি অনলাইন ক্লাস ও ওয়েবিনাশ
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112734] tracking-tight font-anek">
                  আসন্ন লাইভ ক্লাস ও ওয়েবিনারের সিডিউল
                </h2>
              </div>
              <p className="text-xs text-[#8a817c] max-w-md">
                জুম, গুগল মিট বা ইউটিউব লাইভের মাধ্যমে মুফতী ও গবেষকদের সাথে সরাসরি দ্বীনি প্রশ্নোত্তরে অংশ নিন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {liveClasses.map((cls) => (
                <LiveClassCard
                  key={cls.id}
                  liveClass={cls}
                  onSelectPayment={(c) => setSelectedLiveClassForPayment(c)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. FATWA & MAS'ALA CONSULTATION SPOTLIGHT */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="bg-[#112734] rounded-[36px] p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl border border-[#17A2B8]/30">
          {/* Subtle Islamic Texture */}
          <div className="absolute inset-0 islamic-pattern opacity-30 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#17A2B8] text-slate-950 rounded-full text-xs font-black uppercase">
                <HelpCircle size={14} /> ফ্রি অনলাইন ইফতা ও ফতোয়া সেবা
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                আপনার যেকোনো দ্বীনি ও <br className="hidden sm:inline" />
                ফিকহি জিজ্ঞাসা সরাসরি মুফতীকে পাঠান
              </h2>

              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-xl">
                দৈনন্দিন নামাজ, রোজা, ব্যবসা-বাণিজ্য, ব্যাংক লেনদেন কিংবা পারিবারিক দাম্পত্য জীবনের যেকোনো মাসআলা দলীলসহ জানতে আমাদের ইফতা বিভাগে প্রশ্ন করুন। সম্পূর্ণ গোপনীয়তা বজায় রাখা হয়।
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/fatwa#ask"
                  className="font-tiro px-8 py-3.5 bg-[#17A2B8] hover:bg-[#17A2B8]/20 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2"
                >
                  <MessageSquare size={16} />
                  <span>এখনই মাসআলা জিজ্ঞাসা করুন</span>
                </Link>

                <Link
                  href="/fatwa"
                  className="font-tiro px-6 py-3.5 bg-[#112734]/80 hover:bg-[#23626F] text-white font-bold text-sm rounded-2xl border border-[#23626F] transition-all flex items-center gap-2"
                >
                  <Search size={16} />
                  <span>ফতোয়া আর্কাইভ দেখুন</span>
                </Link>
              </div>
            </div>

            {/* Right: Recent Answered Fatwa Samples */}
            <div className="lg:col-span-5 space-y-3.5">
              <span className="text-xs font-bold text-[#17A2B8] uppercase tracking-widest block">
                সাম্প্রতিক ফতোয়া ও উত্তরসমূহ:
              </span>

              {fatwas.map((f) => (
                <Link
                  key={f.id}
                  href={`/fatwa?q=${encodeURIComponent(f.questionTitle)}`}
                  className="block bg-white/10 hover:bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/10 transition-all group"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#17A2B8] font-bold mb-1">
                    <span>{f.categoryBn}</span>
                    <span className="text-[#17A2B8]">{f.trackingCode}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#17A2B8] transition-colors line-clamp-2">
                    {f.questionTitle}
                  </h4>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 5. DIGITAL BOOKSTORE & PUBLICATIONS */}
      <section className="py-16 bg-[#fdfcf9] px-4 sm:px-8 border-t border-[#ece8e0]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f8293] uppercase tracking-wider mb-2">
                <Library size={14} /> নূর ফিকহ প্রকাশনা
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112734] tracking-tight">
                ফিকহ কিতাব ও গবেষণাপত্র
              </h2>
            </div>
            <Link
              href="/books"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#112734] hover:text-[#23626F] transition-colors group"
            >
              <span>সকল কিতাব ও PDF ডাউনলোড</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. SCHOLAR FACULTY & BOARD OF IFTA */}
      <section className="py-20 bg-white border-t border-[#ece8e0] px-4 sm:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-[#0f8293] uppercase tracking-widest font-tiro">
              গবেষণা পরিষদ ও শিক্ষকবৃন্দ
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#112734] tracking-tight font-anek">
              দেশবরেণ্য ওলামায়ে কেরাম ও ফিকহ গবেষকগণ
            </h2>
            <p className="text-sm text-[#5a524d] leading-relaxed font-tiro">
              যাদের সান্নিধ্যে আপনি সরাসরি ইসলামিক আইনি শাস্ত্র ও সমকালীন গবেষণায় যুক্ত থাকবেন।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {faculty.slice(0, 6).map((member) => (
              <div 
                key={member.id} 
                className="bg-[#fdfcf9] border border-[#ece8e0] p-6 rounded-3xl card-natural-shadow flex flex-col justify-between group hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-50">
                    <img
                      src={member.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                      alt={member.nameBn || member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-[#2c3e50] font-anek">
                      {member.nameBn || member.name}
                    </h3>
                    <p className="text-xs text-[#0f8293] font-bold font-tiro mt-0.5">
                      {member.designation}
                    </p>
                    {member.qualifications && (
                      <p className="text-[11px] text-[#8a817c] mt-0.5">
                        {member.qualifications}
                      </p>
                    )}
                  </div>
                  {member.bio && (
                    <p className="text-xs text-[#5a524d] leading-relaxed font-tiro line-clamp-3">
                      {member.bio}
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 space-y-2.5">
                  <TeacherContactButtons
                    name={member.nameBn || member.name}
                    phone={member.phone}
                    email={member.email}
                  />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[10px] font-bold text-[#112734] bg-[#17A2B8]/10 px-2.5 py-0.5 rounded-md">
                      {member.category === 'council' ? 'গবেষণা পরিষদ' : member.category === 'advisor' ? 'উপদেষ্টা পরিষদ' : 'উস্তায'}
                    </span>
                    <Link
                      href="/about"
                      className="text-[#112734] hover:text-[#112734] font-bold flex items-center gap-1 font-tiro text-xs"
                    >
                      <span>পরিচিতি ও বায়ো</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#112734] hover:bg-[#23626F] text-white font-bold text-xs font-tiro rounded-2xl shadow-md transition-all"
            >
              <span>সকল শিক্ষক ও গবেষকবৃন্দের তালিকা দেখুন</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>


      {/* 7. STUDENT TESTIMONIALS (Natural Theme Review Carousel) */}
      <section className="py-16 bg-[#f8faf7] border-t border-[#ece8e0] px-4 sm:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#0f8293] uppercase tracking-wider">
              শিক্ষার্থীদের অভিজ্ঞতা
            </span>
            <h2 className="text-3xl font-extrabold text-[#112734]">
              নূর ফিকহ একাডেমি নিয়ে শিক্ষার্থীদের মূল্যায়ন
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-500 mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-[#17A2B8]" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#5a524d] leading-relaxed italic mb-6">
                    &ldquo;{rev.content}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-[#ece8e0]">
                  <img
                    src={rev.avatar}
                    alt={rev.nameBn || rev.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#17A2B8]/40"
                  />
                  <div>
                    <h4 className="text-xs font-extrabold text-[#2c3e50]">{rev.nameBn || rev.name}</h4>
                    <p className="text-[10px] text-[#8a817c]">{rev.role} • {rev.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment / Checkout Modal */}
      {selectedCourseForEnroll && (
        <PaymentModal
          isOpen={!!selectedCourseForEnroll}
          onClose={() => setSelectedCourseForEnroll(null)}
          item={{
            id: selectedCourseForEnroll.id,
            title: selectedCourseForEnroll.title,
            titleBn: selectedCourseForEnroll.titleBn,
            price: selectedCourseForEnroll.price,
            type: 'course'
          }}
        />
      )}

      {selectedLiveClassForPayment && (
        <PaymentModal
          isOpen={!!selectedLiveClassForPayment}
          onClose={() => setSelectedLiveClassForPayment(null)}
          item={{
            id: selectedLiveClassForPayment.id,
            title: selectedLiveClassForPayment.title,
            titleBn: selectedLiveClassForPayment.titleBn,
            price: selectedLiveClassForPayment.price,
            type: 'live_class',
            purchaseType: 'full_access'
          }}
          onSuccess={() => {
            AppStore.registerForLiveClass(selectedLiveClassForPayment.id, 'guest-user-1');
          }}
        />
      )}
    </div>
  );
}
