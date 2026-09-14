'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  HelpCircle, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight,
  Video, 
  Library, 
  Search,
  MessageSquare,
  MapPin,
  GraduationCap,
  Users,
  ShieldCheck,
  X
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
import { formatImageUrl, handleImageError } from '@/lib/utils';

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
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState<boolean>(false);
  const [facultyFilter, setFacultyFilter] = useState<'all' | 'council' | 'advisor' | 'faculty'>('all');
  const [facultySearch, setFacultySearch] = useState<string>('');

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
    window.addEventListener('noorfiqh_faculty_updated', syncWithStore);
    return () => {
      window.removeEventListener('storage', syncWithStore);
      window.removeEventListener('noorfiqh_settings_updated', syncWithStore);
      window.removeEventListener('noorfiqh_faculty_updated', syncWithStore);
    };
  }, []);

  // Founder and Rector Profile (Priority for Director / Founder)
  const founder = faculty.find((m) => 
    (m.designation && (
      m.designation.toLowerCase().includes('founder') || 
      m.designation.toLowerCase().includes('rector') || 
      m.designation.includes('প্রতিষ্ঠাতা') || 
      m.designation.includes('পরিচালক')
    )) ||
    (m.nameBn && m.nameBn.includes('আম্মার')) ||
    (m.name && m.name.toLowerCase().includes('ammar'))
  ) || faculty[0] || {
    id: 'fac-1',
    name: 'Mufti Ammar Bin Noor',
    nameBn: 'মুফতী আম্মার বিন নূর',
    designation: 'Founder and Rector',
    category: 'council',
    categoryLabelBn: 'প্রতিষ্ঠাতা ও পরিচালক',
    qualifications: 'পোস্ট গ্র্যাজুয়েট ইন ইসলামিক ল, জামিয়া শারঈয়্যাহ মালিবাগ।',
    bio: 'নূর ফিকহ একাডেমির প্রতিষ্ঠাতা ও পরিচালক। সমকালীন ফিকহি গবেষণা, আধুনিক অর্থনৈতিক লেনদেন, চিকিৎসা ফিকহ ও যুগোপযোগী ইসলামিক আইনের প্রামাণ্য বিশ্লেষণে নিবেদিতপ্রাণ গবেষক ও প্রশিক্ষক।',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    email: 'noorfiqhaca@gmail.com',
    phone: '+8801855905185',
    order: 1
  };

  // Filtered faculty for the Teachers Modal
  const filteredFaculty = faculty.filter((m) => {
    const matchesCategory = facultyFilter === 'all' || m.category === facultyFilter;
    const q = facultySearch.toLowerCase().trim();
    const matchesSearch = !q || 
      (m.nameBn && m.nameBn.toLowerCase().includes(q)) ||
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.designation && m.designation.toLowerCase().includes(q)) ||
      (m.bio && m.bio.toLowerCase().includes(q)) ||
      (m.qualifications && m.qualifications.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const heroCard = siteSettings.heroCard || {
    enabled: true,
    arabicSymbol: 'ن',
    badgeText: 'ভর্তি চলছে • নতুন ব্যাচ',
    title: 'উচ্চতর ফিকহ ও ফতোয়া ডিপ্লোমা কোর্স',
    subtitle: 'মুফতীগণের প্রত্যক্ষ তত্ত্বাবধানে কিতাবুল বুয়ু, ফারায়েজ ও সমকালীন আধুনিক চিকিৎসার ফিকহি গবেষণার সুযোগ।',
    features: [
      'সরাসরি লাইভ ক্লাস ও প্রশ্নোত্তর',
      'প্রামাণ্য ফিকহি সমাধান ও রেফারেন্স',
      'অনলাইন কিতাব ও স্টাডি মেটেরিয়াল'
    ],
    buttonText: 'কোর্সে যুক্ত হোন',
    buttonLink: '/courses'
  };

  return (
    <div className="space-y-0 overflow-x-hidden w-full">
      {/* 1. ACADEMY HERO SECTION (Edge-to-Edge Full-Width Background with Centered Max-Width Container) */}
      <section className="relative w-full academy-gradient overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28 text-white">
        {/* Optional Custom Background Image from Admin - Edge to Edge cover */}
        {siteSettings.heroBgImage && (
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none transition-opacity duration-700 mix-blend-overlay"
            style={{ 
              backgroundImage: `url(${siteSettings.heroBgImage})`,
              opacity: (siteSettings.heroBgOpacity ?? 25) / 100
            }}
          />
        )}

        {/* Ambient Subtle Radial Glow & Atmospheric Overlays */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[radial-gradient(circle_at_center,_#fff_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#17A2B8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Hero Copy & Actions */}
            <div className={`${heroCard.enabled !== false ? 'lg:col-span-7' : 'lg:col-span-12 max-w-3xl mx-auto text-center'} space-y-6 text-center lg:text-left`}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#17A2B8]/20 text-[#17A2B8] text-xs font-bold rounded-full uppercase tracking-wider border border-[#17A2B8]/30 shadow-xs">
                <Sparkles size={14} className="text-[#17A2B8]" />
                <span className="font-tiro">{siteSettings.siteNameBn}তে স্বাগতম • {siteSettings.siteName.toUpperCase()}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black text-white leading-[1.2] tracking-tight font-anek">
                {siteSettings.heroTitleBn || 'নির্ভরযোগ্য ফিকহ চর্চায় এক অনন্য আধুনিক বিদ্যাপীঠ'}
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-emerald-50/90 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal font-tiro">
                {siteSettings.heroSubtitleBn || 'কোরআন ও সহিহ সুন্নাহর আলোকে দৈনন্দিন ইবাদত, ব্যবসা-বাণিজ্য, পারিবারিক আইন ও সমকালীন আধুনিক মাসআলা-মাসায়েল শিখুন অভিজ্ঞ মুফতী ও ফিকহ গবেষকদের নিবিড় তত্ত্বাবধানে।'}
              </p>

              {/* CTA Buttons */}
              <div className={`flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center ${heroCard.enabled !== false ? 'lg:justify-start' : 'justify-center'} pt-2`}>
                <Link
                  href="/courses"
                  className="font-tiro px-7 py-3.5 sm:px-8 sm:py-4 bg-[#17A2B8] hover:bg-[#20c9d9] text-[#0b1b24] font-black text-sm rounded-2xl shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 border border-transparent"
                >
                  <span>কোর্সসমূহে ভর্তি হোন</span>
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/fatwa"
                  className="font-tiro px-7 py-3.5 sm:px-8 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/25 hover:border-white/50 backdrop-blur-sm transition-all flex items-center justify-center gap-2"
                >
                  <HelpCircle size={18} className="text-[#17A2B8]" />
                  <span>ফ্রি মাসআলা জিজ্ঞাসা করুন</span>
                </Link>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/15 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-[#17A2B8] block font-anek">৩,৫০০+</span>
                  <span className="text-[11px] sm:text-xs text-white/80 uppercase font-medium font-tiro">সন্তুষ্ট শিক্ষার্থী</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-[#17A2B8] block font-anek">১,২০০+</span>
                  <span className="text-[11px] sm:text-xs text-white/80 uppercase font-medium font-tiro">প্রদত্ত ফতোয়া</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-[#17A2B8] block font-anek">১০০%</span>
                  <span className="text-[11px] sm:text-xs text-white/80 uppercase font-medium font-tiro">প্রামাণ্য রেফারেন্স</span>
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
                          src={formatImageUrl(heroCard.iconImage)}
                          alt={heroCard.title || 'Icon'}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={(e) => handleImageError(e, heroCard.iconImage)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-arabic text-3xl font-black">{heroCard.arabicSymbol || 'ن'}</span>
                      )}
                    </div>

                    {heroCard.badgeText && (
                      <span className="text-[10px] font-extrabold tracking-widest text-[#0f8293] bg-amber-50 px-3 py-1 rounded-full uppercase inline-block mx-auto mb-2 font-tiro">
                        {heroCard.badgeText}
                      </span>
                    )}

                    <h3 className="text-xl font-black text-[#112734] mb-2 leading-tight font-anek">
                      {heroCard.title || 'উচ্চতর ফিকহ ও ফতোয়া ডিপ্লোমা কোর্স'}
                    </h3>

                    {heroCard.subtitle && (
                      <p className="text-xs text-[#5a524d] leading-relaxed mb-5 font-tiro">
                        {heroCard.subtitle}
                      </p>
                    )}

                    {heroCard.features && heroCard.features.length > 0 && (
                      <div className="space-y-2 mb-6 text-left text-xs text-[#2c3e50] bg-[#fdfcf9] p-3.5 rounded-2xl border border-[#ece8e0] font-tiro">
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
        </div>
      </section>

      {/* 2. THREE PILLARS / KEY FEATURES (Natural Tones Card Style) */}
      <section className="py-14 sm:py-16 lg:py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            <div className="card-natural-shadow card-natural-shadow-hover bg-white p-7 sm:p-8 rounded-3xl flex flex-col justify-between h-full border border-[#ece8e0] hover:border-[#17A2B8]/40 transition-all duration-300 group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-black text-base shadow-sm group-hover:scale-105 transition-transform font-anek">
                  ০১
                </div>
                <h4 className="text-xl font-bold text-[#2c3e50] group-hover:text-[#112734] transition-colors font-anek">
                  অনলাইন লাইভ ও রেকর্ডেড ক্লাস
                </h4>
                <p className="text-sm text-[#5a524d] leading-relaxed font-tiro">
                  যেকোনো স্থান থেকে যেকোনো সময়ে মোবাইল বা ল্যাপটপে ক্লাস করুন এবং ওস্তাদগণের সাথে সরাসরি প্রশ্নোত্তর সেশনে অংশ নিন।
                </p>
              </div>
              <Link href="/courses" className="font-tiro mt-6 text-[#112734] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:text-[#23626F] transition-colors">
                <span>সকল কোর্স দেখুন</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="card-natural-shadow card-natural-shadow-hover bg-white p-7 sm:p-8 rounded-3xl flex flex-col justify-between h-full border border-[#ece8e0] hover:border-[#17A2B8]/40 transition-all duration-300 group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#17A2B8]/10 border border-[#17A2B8]/30 flex items-center justify-center text-[#23626F] font-black text-base shadow-sm group-hover:scale-105 transition-transform font-anek">
                  ০২
                </div>
                <h4 className="text-xl font-bold text-[#2c3e50] group-hover:text-[#112734] transition-colors font-anek">
                  অভিজ্ঞ মুফতী ও ফিকহ বোর্ড
                </h4>
                <p className="text-sm text-[#5a524d] leading-relaxed font-tiro">
                  দারুল উলুম দেওবন্দ, আল-আজহার ও আন্তর্জাতিক মানের স্কলারদের সমন্বয়ে গঠিত নির্ভরযোগ্য গবেষণা পরিষদ।
                </p>
              </div>
              <Link href="/about" className="font-tiro mt-6 text-[#112734] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:text-[#23626F] transition-colors">
                <span>মুফতী প্যানেল পরিচিতি</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="card-natural-shadow card-natural-shadow-hover bg-white p-7 sm:p-8 rounded-3xl flex flex-col justify-between h-full border border-[#ece8e0] hover:border-[#17A2B8]/40 transition-all duration-300 group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-black text-base shadow-sm group-hover:scale-105 transition-transform font-anek">
                  ০৩
                </div>
                <h4 className="text-xl font-bold text-[#2c3e50] group-hover:text-[#112734] transition-colors font-anek">
                  অনলাইন সার্টিফিকেট ভেরিফিকেশন
                </h4>
                <p className="text-sm text-[#5a524d] leading-relaxed font-tiro">
                  কোর্স সম্পন্নকারী শিক্ষার্থীদের জন্য ইউনিক ট্র্যাকিং নম্বরসহ ডাউনলোডযোগ্য প্রামাণ্য সনদপত্র ও ভেরিফিকেশন সিস্টেম।
                </p>
              </div>
              <Link href="/verify-certificate" className="font-tiro mt-6 text-[#112734] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:text-[#23626F] transition-colors">
                <span>সনদপত্র যাচাই করুন</span>
                <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FEATURED COURSES SECTION */}
      <section className="py-14 sm:py-16 lg:py-20 bg-[#f8faf7] border-y border-[#ece8e0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f8293] uppercase tracking-wider mb-2 font-tiro">
                <BookOpen size={14} /> বিশেষায়িত পাঠ্যক্রম
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112734] tracking-tight font-anek">
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

          {courses.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#ece8e0] text-center space-y-3 card-natural-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#17A2B8]/10 text-[#0f8293] flex items-center justify-center mx-auto">
                <BookOpen size={28} />
              </div>
              <h3 className="text-xl font-black text-[#112734] font-anek">নতুন কোর্স শীঘ্রই উন্মুক্ত করা হবে</h3>
              <p className="text-xs sm:text-sm text-[#5a524d] font-tiro max-w-lg mx-auto leading-relaxed">
                বর্তমানে নতুন সেশনের বিশেষায়িত ফিকহ পাঠ্যক্রম প্রণয়ন প্রক্রিয়াধীন রয়েছে। যেকোনো কোর্স বা ভর্তির তথ্যের জন্য আমাদের সাথে সরাসরি যোগাযোগ করতে পারেন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.slice(0, 4).map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEnroll={(c) => setSelectedCourseForEnroll(c)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3.5. LIVE CLASSES & WEBINARS SECTION */}
      {liveClasses.length > 0 && (
        <section className="py-14 sm:py-16 lg:py-20 bg-white border-b border-[#ece8e0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider mb-2 font-tiro">
                  <Video size={14} className="animate-pulse" /> সরাসরি অনলাইন ক্লাস ও ওয়েবিনার
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112734] tracking-tight font-anek">
                  আসন্ন লাইভ ক্লাস ও ওয়েবিনারের সিডিউল
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#8a817c] max-w-md font-tiro">
                জুম, গুগল মিট বা ইউটিউব লাইভের মাধ্যমে মুফতী ও গবেষকদের সাথে সরাসরি দ্বীনি প্রশ্নোত্তরে অংশ নিন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#112734] rounded-3xl sm:rounded-[36px] p-7 sm:p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl border border-[#17A2B8]/30">
            {/* Subtle Islamic Texture */}
            <div className="absolute inset-0 islamic-pattern opacity-30 pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#17A2B8] text-slate-950 rounded-full text-xs font-black uppercase font-tiro">
                  <HelpCircle size={14} /> ফ্রি অনলাইন ইফতা ও ফতোয়া সেবা
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight font-anek">
                  আপনার যেকোনো দ্বীনি ও <br className="hidden sm:inline" />
                  ফিকহি জিজ্ঞাসা সরাসরি মুফতীকে পাঠান
                </h2>

                <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-xl font-tiro">
                  দৈনন্দিন নামাজ, রোজা, ব্যবসা-বাণিজ্য, ব্যাংক লেনদেন কিংবা পারিবারিক দাম্পত্য জীবনের যেকোনো মাসআলা দলীলসহ জানতে আমাদের ইফতা বিভাগে প্রশ্ন করুন। সম্পূর্ণ গোপনীয়তা বজায় রাখা হয়।
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Link
                    href="/fatwa#ask"
                    className="font-tiro px-7 py-3.5 sm:px-8 sm:py-4 bg-[#17A2B8] hover:bg-[#20c9d9] text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2"
                  >
                    <MessageSquare size={16} />
                    <span>এখনই মাসআলা জিজ্ঞাসা করুন</span>
                  </Link>

                  <Link
                    href="/fatwa"
                    className="font-tiro px-6 py-3.5 sm:px-7 sm:py-4 bg-[#112734]/80 hover:bg-[#23626F] text-white font-bold text-sm rounded-2xl border border-[#23626F] transition-all flex items-center gap-2"
                  >
                    <Search size={16} />
                    <span>ফতোয়া আর্কাইভ দেখুন</span>
                  </Link>
                </div>
              </div>

              {/* Right: Recent Answered Fatwa Samples */}
              <div className="lg:col-span-5 space-y-3.5">
                <span className="text-xs font-bold text-[#17A2B8] uppercase tracking-widest block font-tiro">
                  সাম্প্রতিক ফতোয়া ও উত্তরসমূহ:
                </span>

                {fatwas.length === 0 ? (
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center space-y-3">
                    <MessageSquare size={26} className="text-[#17A2B8] mx-auto opacity-80" />
                    <p className="text-xs sm:text-sm text-slate-200 font-tiro leading-relaxed">
                      বর্তমানে কোনো পাবলিক ফতোয়া উন্মুক্ত নেই। আপনার যেকোনো দ্বীনি মাসআলা বা প্রশ্ন সরাসরি জমা দিন, মুফতী প্যানেল দ্রুত উত্তর প্রদান করবেন।
                    </p>
                  </div>
                ) : (
                  fatwas.map((f) => (
                    <Link
                      key={f.id}
                      href={`/fatwa?q=${encodeURIComponent(f.questionTitle)}`}
                      className="block bg-white/10 hover:bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/10 transition-all group"
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#17A2B8] font-bold mb-1 font-tiro">
                        <span>{f.categoryBn}</span>
                        <span className="text-[#17A2B8]">{f.trackingCode}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#17A2B8] transition-colors line-clamp-2 font-anek">
                        {f.questionTitle}
                      </h4>
                    </Link>
                  ))
                )}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 5. DIGITAL BOOKSTORE & PUBLICATIONS */}
      <section className="py-14 sm:py-16 lg:py-20 bg-[#fdfcf9] border-t border-[#ece8e0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f8293] uppercase tracking-wider mb-2 font-tiro">
                <Library size={14} /> নূর ফিকহ প্রকাশনা
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112734] tracking-tight font-anek">
                ফিকহ কিতাব ও গবেষণাপত্র
              </h2>
            </div>
            <Link
              href="/books"
              className="font-tiro inline-flex items-center gap-1.5 text-sm font-bold text-[#112734] hover:text-[#23626F] transition-colors group"
            >
              <span>সকল কিতাব ও PDF ডাউনলোড</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {books.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#ece8e0] text-center space-y-3 card-natural-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#17A2B8]/10 text-[#0f8293] flex items-center justify-center mx-auto">
                <Library size={28} />
              </div>
              <h3 className="text-xl font-black text-[#112734] font-anek">নতুন কিতাব ও প্রকাশনা শীঘ্রই আসছে</h3>
              <p className="text-xs sm:text-sm text-[#5a524d] font-tiro max-w-lg mx-auto leading-relaxed">
                ফিকহি গবেষণাপত্র ও প্রামাণ্য কিতাবসমূহের মুদ্রণ ও প্রকাশনা কার্যক্রম প্রক্রিয়াধীন। খুব দ্রুত নতুন কিতাব ও গবেষণা সংকলন যুক্ত করা হবে ইনশাআল্লাহ।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {books.slice(0, 3).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. FOUNDER & DIRECTOR SHOWCASE + FACULTY MODAL TRIGGER */}
      <section className="py-14 sm:py-16 lg:py-20 bg-white border-t border-[#ece8e0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-[#0f8293] uppercase tracking-widest font-tiro">
              পরিচালক ও প্রতিষ্ঠাতা পরিচিতি
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#112734] tracking-tight font-anek">
              ফাউন্ডার ও ডিরেক্টরের পরিচিতি
            </h2>
            <p className="text-sm text-[#5a524d] leading-relaxed font-tiro">
              নূর ফিকহ একাডেমির প্রতিষ্ঠাতা ও পরিচালকের পূর্ণাঙ্গ পরিচিতি ও গবেষণা ক্ষেত্রসমূহ
            </p>
          </div>

          {/* Master Founder Profile: Split 2-Column Showcase (Image on one side, Details on other side) */}
          <div className="bg-[#fcfbf9] border-2 border-[#ece8e0] rounded-3xl p-6 sm:p-8 lg:p-10 card-natural-shadow relative overflow-hidden group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* One Side: Photo & Direct Contact */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="relative w-full max-w-xs sm:max-w-sm">
                  {/* Photo Frame */}
                  <div className="aspect-[4/5] rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-100 relative group/img">
                    <img
                      src={formatImageUrl(founder.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80')}
                      alt={founder.nameBn || founder.name}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => handleImageError(e, founder.avatar)}
                      className="w-full h-full object-cover group-hover/img:scale-103 transition-transform duration-500"
                    />
                    {/* Badge on Photo */}
                    <div className="absolute top-3 left-3 bg-[#112734]/90 backdrop-blur-sm text-white px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-md font-anek">
                      <ShieldCheck size={14} className="text-[#17A2B8]" />
                      <span>Founder & Director</span>
                    </div>
                  </div>

                  {/* Contact Buttons underneath photo */}
                  <div className="mt-4 space-y-2 w-full">
                    <TeacherContactButtons
                      name={founder.nameBn || founder.name}
                      phone={founder.phone}
                      email={founder.email}
                    />
                    <div className="text-center pt-1">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8a817c] font-tiro">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                        সরাসরি তত্ত্বাবধান ও গবেষণা পরিচালনা
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Side: Full Details */}
              <div className="lg:col-span-7 space-y-5 text-left">
                {/* Designation Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17A2B8]/10 text-[#0f8293] text-xs font-extrabold font-tiro">
                  <GraduationCap size={15} />
                  <span>{founder.designation || 'Founder & Director • প্রতিষ্ঠাতা ও পরিচালক'}</span>
                </div>

                {/* Name */}
                <div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#112734] font-anek tracking-tight">
                    {founder.nameBn || founder.name || 'মুফতী আম্মার বিন নূর'}
                  </h3>
                  <p className="text-sm font-bold text-[#0f8293] font-tiro mt-1">
                    {founder.name || 'Mufti Ammar Bin Noor'}
                  </p>
                </div>

                {/* Institutional Qualifications */}
                <div className="p-4 rounded-2xl bg-white border border-[#ece8e0] shadow-xs space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8a817c] block">
                    প্রাতিষ্ঠানিক পরিচয় ও ডিগ্রি
                  </span>
                  <p className="text-sm font-bold text-[#2c3e50] font-tiro flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-[#17A2B8] shrink-0 mt-0.5" />
                    <span>{founder.qualifications || 'পোস্ট গ্র্যাজুয়েট ইন ইসলামিক ল, জামিয়া শারঈয়্যাহ মালিবাগ।'}</span>
                  </p>
                </div>

                {/* Full Bio / Vision Statement */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8a817c] block">
                    সংক্ষিপ্ত পরিচিতি ও মিশন
                  </span>
                  <p className="text-xs sm:text-sm text-[#5a524d] leading-relaxed font-tiro">
                    {founder.bio || 'নূর ফিকহ একাডেমি আধুনিক বিশ্বের যুগোপযোগী চ্যালেঞ্জসমূহকে ইসলামের প্রামাণ্য শাস্ত্রীয় কাঠামোর মধ্যে সমাধানের এক অনন্য প্ল্যাটফর্ম। এখানে কুরআন, সুন্নাহ ও নির্ভরযোগ্য ফিকহি উসূলের ভিত্তিতে ব্যক্তি, সমাজ ও অর্থনৈতিক পরিমণ্ডলের সমকালীন জিজ্ঞাসাগুলোর নিরপেক্ষ, দলীলভিত্তিক ও প্রামাণ্য গবেষণা উপস্থাপন করা হয়।'}
                  </p>
                </div>

                {/* Key Research Areas / Specialties */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8a817c] block">
                    গবেষণা ও পাঠদানের বিশেষ ক্ষেত্রসমূহ
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-tiro text-[#2c3e50]">
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#ece8e0]/80">
                      <span className="w-2 h-2 rounded-full bg-[#17A2B8]"></span>
                      <span className="font-semibold">সমকালীন আধুনিক ফিকহ ও ফতোয়া</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#ece8e0]/80">
                      <span className="w-2 h-2 rounded-full bg-[#17A2B8]"></span>
                      <span className="font-semibold">ইসলামিক ফাইন্যান্স ও কর্পোরেট শরীয়াহ</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#ece8e0]/80">
                      <span className="w-2 h-2 rounded-full bg-[#17A2B8]"></span>
                      <span className="font-semibold">উত্তরাধিকার (ফারায়েজ) আইন ও বণ্টন</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#ece8e0]/80">
                      <span className="w-2 h-2 rounded-full bg-[#17A2B8]"></span>
                      <span className="font-semibold">আধুনিক চিকিৎসা বিজ্ঞানের ফিকহি মাসআলা</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="pt-4 border-t border-[#ece8e0] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFacultyModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold text-xs font-tiro rounded-2xl shadow-lg transition-all cursor-pointer group"
                  >
                    <Users size={16} className="text-[#17A2B8] group-hover:scale-110 transition-transform" />
                    <span>সকল শিক্ষক ও গবেষকবৃন্দের তালিকা দেখুন</span>
                    <ArrowRight size={15} />
                  </button>

                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-[#112734] border border-[#ece8e0] font-bold text-xs font-tiro rounded-2xl transition-colors"
                  >
                    <span>একাডেমির সার্বিক পরিচিতি</span>
                    <ChevronRight size={15} />
                  </Link>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6.1 FACULTY MODAL: Teachers & Researchers Directory ("ভিতরে ক্লিক করলে শিক্ষকদের পরিচিতি") */}
      {isFacultyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#ece8e0] bg-[#faf8f5] flex items-center justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0f8293] uppercase tracking-wider font-tiro">
                  <GraduationCap size={15} />
                  <span>নূর ফিকহ একাডেমি শিক্ষক ও গবেষক পরিষদ</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#112734] font-anek">
                  সকল শিক্ষক ও গবেষকবৃন্দের তালিকা
                </h3>
                <p className="text-xs text-[#5a524d] font-tiro">
                  যাঁদের সান্নিধ্যে ও দিকনির্দেশনায় পরিচালিত হচ্ছে একাডেমির সকল একাডেমিক ও ফিকহি কোর্স
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFacultyModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-[#ece8e0] flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shadow-xs"
                title="বন্ধ করুন"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 sm:px-6 border-b border-[#ece8e0] bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: 'সকল (All)' },
                  { id: 'council', label: 'গবেষণা পরিষদ' },
                  { id: 'advisor', label: 'উপদেষ্টা পরিষদ' },
                  { id: 'faculty', label: 'শিক্ষকবৃন্দ' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFacultyFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-tiro whitespace-nowrap transition-all cursor-pointer ${
                      facultyFilter === tab.id
                        ? 'bg-[#112734] text-white shadow-xs'
                        : 'bg-[#faf8f5] text-[#5a524d] hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="শিক্ষকের নাম বা বিষয়ে খুঁজুন..."
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#ece8e0] focus:ring-2 focus:ring-[#17A2B8] outline-none font-tiro"
                />
              </div>
            </div>

            {/* Modal Body: Cards Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#faf8f5] space-y-4">
              {filteredFaculty.length === 0 ? (
                <div className="text-center py-12 text-[#8a817c] font-tiro">
                  <Users size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">কোনো শিক্ষক পাওয়া যায়নি।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {filteredFaculty.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white border border-[#ece8e0] p-5 rounded-2xl card-natural-shadow flex flex-col justify-between hover:border-[#17A2B8]/40 transition-all space-y-3"
                    >
                      <div className="flex gap-4 items-start">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#17A2B8]/30 shrink-0 bg-slate-100">
                          <img
                            src={formatImageUrl(member.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80')}
                            alt={member.nameBn || member.name}
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            onError={(e) => handleImageError(e, member.avatar)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-[#0f8293] bg-[#17A2B8]/10 px-2 py-0.5 rounded-md font-tiro">
                              {member.category === 'council' ? 'গবেষণা পরিষদ' : member.category === 'advisor' ? 'উপদেষ্টা পরিষদ' : 'শিক্ষকবৃন্দ'}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-base text-[#112734] font-anek truncate">
                            {member.nameBn || member.name}
                          </h4>
                          <p className="text-xs text-[#0f8293] font-bold font-tiro">
                            {member.designation}
                          </p>
                          {member.qualifications && (
                            <p className="text-[11px] text-[#8a817c] font-tiro line-clamp-1">
                              {member.qualifications}
                            </p>
                          )}
                        </div>
                      </div>

                      {member.bio && (
                        <p className="text-xs text-[#5a524d] leading-relaxed font-tiro line-clamp-3 bg-[#faf8f5] p-2.5 rounded-xl border border-[#ece8e0]/60">
                          {member.bio}
                        </p>
                      )}

                      <div className="pt-2 border-t border-[#ece8e0]">
                        <TeacherContactButtons
                          name={member.nameBn || member.name}
                          phone={member.phone}
                          email={member.email}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#ece8e0] bg-white flex items-center justify-between">
              <Link
                href="/about"
                onClick={() => setIsFacultyModalOpen(false)}
                className="text-xs font-bold text-[#0f8293] hover:underline flex items-center gap-1 font-tiro"
              >
                <span>একাডেমির সার্বিক পরিচিতি ও লক্ষ্য পড়ুন</span>
                <ChevronRight size={14} />
              </Link>
              <button
                type="button"
                onClick={() => setIsFacultyModalOpen(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-[#112734] font-bold text-xs rounded-xl font-tiro transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 7. STUDENT TESTIMONIALS (Natural Theme Review Carousel) */}
      {reviews.length > 0 && (
        <section className="py-14 sm:py-16 lg:py-20 bg-[#f8faf7] border-t border-[#ece8e0] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#0f8293] uppercase tracking-wider font-tiro">
                শিক্ষার্থীদের অভিজ্ঞতা
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112734] font-anek">
                নূর ফিকহ একাডেমি নিয়ে শিক্ষার্থীদের মূল্যায়ন
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-6 sm:p-7 rounded-3xl border border-[#ece8e0] card-natural-shadow card-natural-shadow-hover flex flex-col justify-between h-full transition-all duration-300">
                  <div>
                    <div className="flex gap-1 text-amber-500 mb-3">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={14} className="fill-amber-400 text-[#17A2B8]" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-[#5a524d] leading-relaxed italic mb-6 font-tiro">
                      &ldquo;{rev.content}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-[#ece8e0]">
                    <img
                      src={formatImageUrl(rev.avatar)}
                      alt={rev.nameBn || rev.name}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => handleImageError(e, rev.avatar)}
                      className="w-10 h-10 rounded-full object-cover border border-[#17A2B8]/40"
                    />
                    <div>
                      <h4 className="text-xs font-extrabold text-[#2c3e50] font-anek">{rev.nameBn || rev.name}</h4>
                      <p className="text-[10px] text-[#8a817c] font-tiro flex items-center gap-1 flex-wrap mt-0.5">
                        {rev.role && <span>{rev.role}</span>}
                        {rev.role && rev.location && <span className="text-slate-300">•</span>}
                        {rev.location && (
                          <span className="inline-flex items-center gap-0.5 text-[#0f8293] font-semibold">
                            <MapPin size={10} />
                            {rev.location}
                          </span>
                        )}
                        {!rev.role && !rev.location && <span>কোর্স শিক্ষার্থী</span>}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
