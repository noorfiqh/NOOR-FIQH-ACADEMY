'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AppStore, INITIAL_COURSES, DEFAULT_COURSE_CATEGORIES, DEFAULT_SETTINGS } from '@/lib/store';
import { Course, CourseCategory, SiteSettings, CoursesPageSettings } from '@/lib/types';
import { CourseCard } from '@/components/CourseCard';
import { PaymentModal } from '@/components/PaymentModal';
import { formatImageUrl, handleImageError } from '@/lib/utils';
import { db, collection, onSnapshot, handleFirestoreError, OperationType, doc } from '@/lib/firebase';
import { Search, Filter, BookOpen, Sparkles, CheckCircle2, ShieldCheck, GraduationCap, Award, Compass } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [categories, setCategories] = useState<CourseCategory[]>(DEFAULT_COURSE_CATEGORIES);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    setCourses(AppStore.getCourses());
    setCategories(AppStore.getCourseCategories());
    setSettings(AppStore.getSettings());

    const handleUpdate = () => {
      setCourses(AppStore.getCourses());
      setCategories(AppStore.getCourseCategories());
      setSettings(AppStore.getSettings());
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('noorfiqh_settings_updated', handleUpdate);

    // Sync site settings live from Firestore
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteSettings;
        setSettings(data);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/general');
    });

    // Sync courses live from Firestore
    const unsubCourses = onSnapshot(collection(db, 'courses'), (snapshot) => {
      if (!snapshot.empty) {
        const fbCourses: Course[] = [];
        snapshot.forEach((docSnap) => {
          fbCourses.push({ id: docSnap.id, ...docSnap.data() } as Course);
        });
        setCourses(fbCourses);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'courses');
    });

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('noorfiqh_settings_updated', handleUpdate);
      unsubSettings();
      unsubCourses();
    };
  }, []);

  const coursesPageSettings: CoursesPageSettings = settings.coursesPage || {
    badgeText: 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ',
    titleBn: 'নূর ফিকহ একাডেমি কোর্সসমূহ',
    subtitleBn: 'দৈনন্দিন ইবাদত থেকে শুরু করে সমকালীন আধুনিক আর্থিক ও পারিবারিক সমস্যার দলীলভিত্তিক সহজ সমাধান। অভিজ্ঞ মুফতীগণের তত্ত্বাবধানে সহিহ ইলম অর্জন করুন।',
    heroImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    showHeroImage: true,
    heroImagePosition: 'right',
    searchPlaceholder: 'কোর্সের নাম বা বিষয় খুঁজুন...',
    highlight1: 'সহিহ সুন্নাহ ও দলীলভিত্তিক পাঠ্যক্রম',
    highlight2: 'অভিজ্ঞ মুফতী ও স্কলারদের সরাসরি তত্ত্বাবধান',
    highlight3: 'ভেরিফায়েড প্রফেশনাল সনদপত্র'
  };

  const badgeText = coursesPageSettings.badgeText || 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ';
  const titleBn = coursesPageSettings.titleBn || 'নূর ফিকহ একাডেমি কোর্সসমূহ';
  const subtitleBn = coursesPageSettings.subtitleBn || 'দৈনন্দিন ইবাদত থেকে শুরু করে সমকালীন আধুনিক আর্থিক ও পারিবারিক সমস্যার দলীলভিত্তিক সহজ সমাধান।';
  const heroImage = coursesPageSettings.heroImage || '';
  const showHeroImage = coursesPageSettings.showHeroImage !== false && !!heroImage;
  const heroImagePosition = coursesPageSettings.heroImagePosition || 'right';
  const heroImageOpacity = coursesPageSettings.heroImageOpacity ?? 35;
  const heroOverlayOpacity = coursesPageSettings.heroOverlayOpacity ?? 80;
  const searchPlaceholder = coursesPageSettings.searchPlaceholder || 'কোর্সের নাম বা বিষয় খুঁজুন...';
  const highlight1 = coursesPageSettings.highlight1 || 'সহিহ সুন্নাহ ও দলীলভিত্তিক পাঠ্যক্রম';
  const highlight2 = coursesPageSettings.highlight2 || 'অভিজ্ঞ মুফতী ও স্কলারদের সরাসরি তত্ত্বাবধান';
  const highlight3 = coursesPageSettings.highlight3 || 'ভেরিফায়েড প্রফেশনাল সনদপত্র';

  const allCategories = [
    { id: 'all', label: 'সকল কোর্স' },
    ...categories
  ];

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = 
      c.titleBn.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#fdfcf9] font-sans text-[#2c3e50] space-y-0 pb-16">
      
      {/* 1. EDGE-TO-EDGE HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-[#112734] text-white py-12 sm:py-16 lg:py-20 border-b border-[#23626F]">
        {/* Full Viewport Background Image (if background position or ambient) */}
        {heroImagePosition === 'background' && showHeroImage && (
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            <img
              src={formatImageUrl(heroImage)}
              alt="Background Hero"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => handleImageError(e, heroImage)}
              style={{ opacity: heroImageOpacity / 100 }}
              className="w-full h-full object-cover object-center scale-105 transition-all duration-700"
            />
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#112734] via-[#112734]/85 to-[#112734]/70 transition-opacity" 
              style={{ opacity: heroOverlayOpacity / 100 }}
            />
            <div 
              className="absolute inset-0 bg-gradient-to-t from-[#112734] via-transparent to-[#112734]/40 transition-opacity" 
              style={{ opacity: heroOverlayOpacity / 100 }}
            />
          </div>
        )}

        {/* Ambient Glow / Islamic Pattern */}
        {heroImagePosition !== 'background' && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#112734] via-[#112734]/90 to-[#112734]/95 pointer-events-none" />
        )}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#17A2B8]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {heroImagePosition === 'background' && showHeroImage ? (
            /* Background Overlay Hero (Centered content within max-width) */
            <div className="max-w-3xl space-y-4 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17A2B8]/20 text-[#17A2B8] text-xs font-bold uppercase tracking-wider border border-[#17A2B8]/40">
                <Sparkles size={14} className="text-amber-400" />
                <span>{badgeText}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black font-anek tracking-tight leading-tight text-white">
                {titleBn}
              </h1>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-tiro">
                {subtitleBn}
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2.5 pt-3">
                {highlight1 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-sm border border-white/15">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>{highlight1}</span>
                  </span>
                )}
                {highlight2 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-sm border border-white/15">
                    <GraduationCap size={14} className="text-amber-400" />
                    <span>{highlight2}</span>
                  </span>
                )}
                {highlight3 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-sm border border-white/15">
                    <Award size={14} className="text-[#17A2B8]" />
                    <span>{highlight3}</span>
                  </span>
                )}
              </div>
            </div>
          ) : showHeroImage ? (
            /* Split Grid Hero with Image */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Text Side */}
              <div className={`space-y-4 ${heroImagePosition === 'left' ? 'lg:col-span-7 lg:order-2' : 'lg:col-span-7'}`}>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#17A2B8]/20 text-[#17A2B8] text-xs font-bold uppercase tracking-wider border border-[#17A2B8]/30">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>{badgeText}</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.2] font-anek">
                  {titleBn}
                </h1>
                
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-tiro max-w-2xl">
                  {subtitleBn}
                </p>

                {/* Highlights Pills */}
                <div className="flex flex-wrap gap-2.5 pt-3">
                  {highlight1 && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15 backdrop-blur-xs">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>{highlight1}</span>
                    </span>
                  )}
                  {highlight2 && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15 backdrop-blur-xs">
                      <GraduationCap size={14} className="text-[#17A2B8]" />
                      <span>{highlight2}</span>
                    </span>
                  )}
                  {highlight3 && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15 backdrop-blur-xs">
                      <Award size={14} className="text-amber-400" />
                      <span>{highlight3}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Image Side */}
              <div className={`${heroImagePosition === 'left' ? 'lg:col-span-5 lg:order-1' : 'lg:col-span-5'} flex justify-center`}>
                <div className="w-full max-w-lg relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl group bg-[#0b1b24]">
                  <div className="aspect-[16/10] w-full relative">
                    <img
                      src={formatImageUrl(heroImage)}
                      alt={titleBn}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => handleImageError(e, heroImage)}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  </div>
                  
                  {/* Image Badge overlay */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold rounded-xl border border-white/20 font-tiro">
                      🎓 নূর ফিকহ একাডেমি
                    </span>
                    <span className="px-3 py-1 bg-emerald-500 text-[#0b1b24] text-[11px] font-black rounded-xl shadow-md font-tiro">
                      ভর্তি চলছে
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Centered Typography Hero (No Image) */
            <div className="text-center space-y-4 max-w-3xl mx-auto py-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#17A2B8]/20 text-[#17A2B8] text-xs font-bold uppercase tracking-wider border border-[#17A2B8]/30">
                <Sparkles size={14} className="text-amber-400" />
                <span>{badgeText}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight font-anek">
                {titleBn}
              </h1>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-tiro max-w-2xl mx-auto">
                {subtitleBn}
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {highlight1 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>{highlight1}</span>
                  </span>
                )}
                {highlight2 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15">
                    <GraduationCap size={14} className="text-[#17A2B8]" />
                    <span>{highlight2}</span>
                  </span>
                )}
                {highlight3 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15">
                    <Award size={14} className="text-amber-400" />
                    <span>{highlight3}</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. COURSES CATALOG & FILTER SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 space-y-10">

        {/* Filter & Search Toolbar */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a817c]" size={18} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#ece8e0] bg-[#fdfcf9] text-sm focus:outline-none focus:border-[#112734] font-medium"
              />
            </div>

            {/* Total Count */}
            <div className="text-xs font-bold text-[#5a524d]">
              মোট কোর্স পাওয়া গেছে: <span className="text-[#112734] text-sm font-extrabold">{filteredCourses.length}টি</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
            {allCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#112734] text-white shadow-md'
                    : 'bg-[#fdfcf9] text-[#5a524d] hover:bg-[#17A2B8]/10 border border-[#ece8e0]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={(c) => setSelectedCourse(c)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-[#ece8e0] space-y-3">
            <BookOpen size={44} className="mx-auto text-slate-300" />
            <h3 className="text-lg font-bold text-[#2c3e50]">কোনো কোর্স পাওয়া যায়নি</h3>
            <p className="text-xs text-[#8a817c]">অনুগ্রহ করে ভিন্ন কোনো শব্দ বা ক্যাটাগরি দিয়ে চেষ্টা করুন।</p>
          </div>
        )}

      </div>

      {/* Payment Modal */}
      {selectedCourse && (
        <PaymentModal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          item={{
            id: selectedCourse.id,
            title: selectedCourse.title,
            titleBn: selectedCourse.titleBn,
            price: selectedCourse.price,
            type: 'course'
          }}
        />
      )}
    </div>
  );
}
