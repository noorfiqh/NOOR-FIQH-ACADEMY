'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppStore, INITIAL_FATWAS, DEFAULT_SETTINGS } from '@/lib/store';
import { FatwaQuestion, SiteSettings } from '@/lib/types';
import { db, collection, onSnapshot, handleFirestoreError, OperationType, doc } from '@/lib/firebase';
import { formatImageUrl, handleImageError } from '@/lib/utils';
import { 
  HelpCircle, 
  Search, 
  Send, 
  CheckCircle, 
  CheckCircle2,
  ShieldCheck, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Lock
} from 'lucide-react';

function FatwaContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [fatwas, setFatwas] = useState<FatwaQuestion[]>(INITIAL_FATWAS);
  const [search, setSearch] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setSiteSettings(AppStore.getSettings());
    setFatwas(AppStore.getFatwas());
    const handleUpdate = () => {
      setSiteSettings(AppStore.getSettings());
      setFatwas(AppStore.getFatwas());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('noorfiqh_settings_updated', handleUpdate);

    // Sync site settings from Firestore
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteSettings;
        setSiteSettings(data);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/general');
    });

    // Sync fatwas live from Firestore
    const unsubscribe = onSnapshot(collection(db, 'fatwas'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreFatwas: FatwaQuestion[] = [];
        snapshot.forEach((doc) => {
          firestoreFatwas.push({ id: doc.id, ...doc.data() } as FatwaQuestion);
        });
        setFatwas(prev => {
          const merged = [...firestoreFatwas];
          prev.forEach(p => {
            if (!merged.some(m => m.id === p.id)) merged.push(p);
          });
          return merged;
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'fatwas');
    });

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('noorfiqh_settings_updated', handleUpdate);
      unsubSettings();
      unsubscribe();
    };
  }, []);

  // Form State
  const [askName, setAskName] = useState('');
  const [askEmail, setAskEmail] = useState('');
  const [askPhone, setAskPhone] = useState('');
  const [askCategory, setAskCategory] = useState('ibadat');
  const [askTitle, setAskTitle] = useState('');
  const [askDetail, setAskDetail] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [trackCodeInput, setTrackCodeInput] = useState('');
  const [trackedResult, setTrackedResult] = useState<FatwaQuestion | null>(null);
  const [trackError, setTrackError] = useState('');

  const categories = [
    { id: 'all', label: 'সকল ফতোয়া' },
    { id: 'ibadat', label: 'নামাজ ও তাহরাত' },
    { id: 'muamalat', label: 'ব্যবসা ও আর্থিক লেনদেন' },
    { id: 'family', label: 'বিবাহ, তালাক ও পরিবার' },
    { id: 'contemporary', label: 'সমকালীন আধুনিক বিষয়' }
  ];

  const filteredFatwas = fatwas.filter((f) => {
    if (f.status !== 'answered') return false;
    const qDetail = f.questionDetail || f.questionBody || '';
    const ans = f.answer || f.answerText || '';
    const matchSearch =
      f.questionTitle.toLowerCase().includes(search.toLowerCase()) ||
      qDetail.toLowerCase().includes(search.toLowerCase()) ||
      ans.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || f.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askTitle || !askDetail) return;

    const newFatwa = AppStore.createFatwa({
      askerName: askName || 'সচেতন শিক্ষার্থী',
      askerEmail: askEmail || undefined,
      askerPhone: askPhone || undefined,
      questionTitle: askTitle,
      questionDetail: askDetail,
      questionBody: askDetail,
      category: askCategory,
      categoryBn: categories.find(c => c.id === askCategory)?.label || 'সাধারণ ফিকহ',
      isPrivate
    });

    setSubmittedCode(newFatwa.trackingCode);
    setAskTitle('');
    setAskDetail('');
    setAskName('');
    setAskEmail('');
    setAskPhone('');
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    setTrackedResult(null);

    if (!trackCodeInput.trim()) return;

    const found = AppStore.getFatwaByTrackingCode(trackCodeInput.trim().toUpperCase());
    if (found) {
      setTrackedResult(found);
    } else {
      setTrackError('প্রদত্ত ট্র্যাকিং কোড দিয়ে কোনো প্রশ্ন পাওয়া যায়নি।');
    }
  };

  const renderReferences = (refs?: string | string[]) => {
    if (!refs) return null;
    if (Array.isArray(refs)) {
      return refs.join(', ');
    }
    return refs;
  };

  const fp = siteSettings.fatwaPage || {
    badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
    titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
    subtitleBn: 'দৈনন্দিন আমল, সমকালীন আধুনিক চিকিৎসাবিজ্ঞান, লেনদেন ও পারিবারিক যেকোনো জটিল মাসআলার সমাধান নির্ভরযোগ্য ও প্রামাণ্য দলীলসহ জেনে নিন।',
    heroImage: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80',
    showHeroImage: true,
    heroImagePosition: 'right',
    highlight1: 'প্রামাণ্য ফিকহী কিতাব ও দলীলভিত্তিক সমাধান',
    highlight2: 'অভিজ্ঞ মুফতী বোর্ডের সরাসরি তত্ত্বাবধান',
    highlight3: 'ব্যক্তিগত ও গোপনীয় প্রশ্ন ট্র্যাকিং সেবা',
    askCardTitle: 'সরাসরি ফতোয়া বিভাগে প্রশ্ন পাঠান',
    askCardSubtitle: 'মুফতী প্যানেল কর্তৃক ব্যক্তিগতভাবে যাচাই ও সমাধান করা হবে',
    trackCardTitle: 'প্রশ্নের স্ট্যাটাস দেখুন',
    trackCardSubtitle: 'ট্র্যাকিং কোড দিয়ে উত্তর জানুন',
    archiveTitle: 'উন্মুক্ত ফতোয়া ও গবেষণা আর্কাইভ',
    archiveSubtitle: 'মুফতীগণের স্বাক্ষরিত ও প্রামাণ্য গ্রন্থাবলি থেকে সংকলিত উত্তরসমূহ'
  };

  return (
    <div className="min-h-screen bg-[#fdfcf9] font-sans text-[#2c3e50] space-y-0 pb-16">
      
      {/* 1. EDGE-TO-EDGE HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-[#112734] text-white py-12 sm:py-16 lg:py-20 border-b border-[#23626F]">
        {/* Background image if set as background */}
        {fp.heroImagePosition === 'background' && fp.showHeroImage !== false && fp.heroImage && (
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            <img
              src={formatImageUrl(fp.heroImage)}
              alt="Fatwa Background Hero"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => handleImageError(e, fp.heroImage)}
              style={{ opacity: (fp.heroImageOpacity ?? 35) / 100 }}
              className="w-full h-full object-cover object-center scale-105 transition-all duration-700"
            />
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#112734] via-[#112734]/85 to-[#112734]/70 transition-opacity" 
              style={{ opacity: (fp.heroOverlayOpacity ?? 80) / 100 }}
            />
            <div 
              className="absolute inset-0 bg-gradient-to-t from-[#112734] via-transparent to-[#112734]/40 transition-opacity" 
              style={{ opacity: (fp.heroOverlayOpacity ?? 80) / 100 }}
            />
          </div>
        )}

        {/* Ambient Dark Gradient & Glows */}
        {fp.heroImagePosition !== 'background' && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#112734] via-[#112734]/90 to-[#112734]/95 pointer-events-none" />
        )}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#17A2B8]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {fp.heroImagePosition === 'background' && fp.showHeroImage !== false && fp.heroImage ? (
            /* Full Background Hero Layout */
            <div className="max-w-3xl space-y-4 text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-200 text-xs font-bold uppercase tracking-wider border border-teal-400/40 backdrop-blur-sm">
                <Sparkles size={14} className="text-amber-400" />
                <span>{fp.badgeText || 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight font-anek">
                {fp.titleBn || 'অনলাইন ইফতা ও ফতোয়া সেবা'}
              </h1>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-tiro max-w-2xl">
                {fp.subtitleBn || 'দৈনন্দিন আমল, সমকালীন আধুনিক চিকিৎসাবিজ্ঞান, লেনদেন ও পারিবারিক যেকোনো জটিল মাসআলার সমাধান নির্ভরযোগ্য ও প্রামাণ্য দলীলসহ জেনে নিন।'}
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2.5 pt-3">
                {fp.highlight1 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-teal-100 text-xs font-semibold backdrop-blur-sm border border-white/15">
                    <CheckCircle2 size={14} className="text-teal-400" />
                    <span>{fp.highlight1}</span>
                  </span>
                )}
                {fp.highlight2 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-teal-100 text-xs font-semibold backdrop-blur-sm border border-white/15">
                    <ShieldCheck size={14} className="text-amber-400" />
                    <span>{fp.highlight2}</span>
                  </span>
                )}
                {fp.highlight3 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-teal-100 text-xs font-semibold backdrop-blur-sm border border-white/15">
                    <Lock size={14} className="text-emerald-400" />
                    <span>{fp.highlight3}</span>
                  </span>
                )}
              </div>
            </div>
          ) : fp.showHeroImage !== false && fp.heroImage ? (
            /* Split Grid Hero with Image */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Text Area */}
              <div className={`space-y-4 ${fp.heroImagePosition === 'left' ? 'lg:col-span-7 lg:order-2' : 'lg:col-span-7'}`}>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#17A2B8]/20 text-[#17A2B8] text-xs font-bold uppercase tracking-wider border border-[#17A2B8]/30">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>{fp.badgeText || 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY'}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.2] font-anek">
                  {fp.titleBn || 'অনলাইন ইফতা ও ফতোয়া সেবা'}
                </h1>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-tiro max-w-2xl">
                  {fp.subtitleBn || 'দৈনন্দিন আমল, সমকালীন আধুনিক চিকিৎসাবিজ্ঞান, লেনদেন ও পারিবারিক যেকোনো জটিল মাসআলার সমাধান নির্ভরযোগ্য ও প্রামাণ্য দলীলসহ জেনে নিন।'}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2.5 pt-3">
                  {fp.highlight1 && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15 backdrop-blur-xs">
                      <CheckCircle2 size={14} className="text-teal-400" />
                      <span>{fp.highlight1}</span>
                    </span>
                  )}
                  {fp.highlight2 && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15 backdrop-blur-xs">
                      <ShieldCheck size={14} className="text-amber-400" />
                      <span>{fp.highlight2}</span>
                    </span>
                  )}
                  {fp.highlight3 && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15 backdrop-blur-xs">
                      <Lock size={14} className="text-emerald-400" />
                      <span>{fp.highlight3}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Hero Image */}
              <div className={`${fp.heroImagePosition === 'left' ? 'lg:col-span-5 lg:order-1' : 'lg:col-span-5'} flex justify-center`}>
                <div className="w-full max-w-lg relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl group bg-[#0b1b24]">
                  <div className="aspect-[16/10] w-full relative">
                    <img
                      src={formatImageUrl(fp.heroImage)}
                      alt={fp.titleBn || 'Fatwa Page Hero Banner'}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => handleImageError(e, fp.heroImage)}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold rounded-xl border border-white/20 font-tiro">
                      📜 নূর ফিকহ দারুল ইফতা
                    </span>
                    <span className="px-3 py-1 bg-teal-500 text-[#0b1b24] text-[11px] font-black rounded-xl shadow font-tiro">
                      প্রশ্ন গ্রহণ চলছে
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center space-y-4 max-w-3xl mx-auto py-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#17A2B8]/20 text-[#17A2B8] text-xs font-bold uppercase tracking-wider border border-[#17A2B8]/30">
                <Sparkles size={14} className="text-amber-400" />
                <span>{fp.badgeText || 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-anek">
                {fp.titleBn || 'অনলাইন ইফতা ও ফতোয়া সেবা'}
              </h1>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-tiro max-w-2xl mx-auto">
                {fp.subtitleBn || 'দৈনন্দিন আমল, সমকালীন আধুনিক চিকিৎসাবিজ্ঞান, লেনদেন ও পারিবারিক যেকোনো জটিল মাসআলার সমাধান নির্ভরযোগ্য ও প্রামাণ্য দলীলসহ জেনে নিন।'}
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {fp.highlight1 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15">
                    <CheckCircle2 size={14} className="text-teal-400" />
                    <span>{fp.highlight1}</span>
                  </span>
                )}
                {fp.highlight2 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15">
                    <ShieldCheck size={14} className="text-amber-400" />
                    <span>{fp.highlight2}</span>
                  </span>
                )}
                {fp.highlight3 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15">
                    <Lock size={14} className="text-emerald-400" />
                    <span>{fp.highlight3}</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. MAIN FATWA ACTIONS & ARCHIVE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 space-y-12">

        {/* Section 1: Ask Mas'ala & Track Question side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="ask">
          
          {/* Ask Question Form */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#17A2B8]/10 text-[#112734] flex items-center justify-center">
                <HelpCircle size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#112734]">
                  {fp.askCardTitle || 'সরাসরি ফতোয়া বিভাগে প্রশ্ন পাঠান'}
                </h2>
                <p className="text-xs text-[#8a817c]">{fp.askCardSubtitle || 'মুফতী প্যানেল কর্তৃক ব্যক্তিগতভাবে যাচাই ও সমাধান করা হবে'}</p>
              </div>
            </div>

            {submittedCode ? (
              <div className="bg-[#17A2B8]/10/80 border border-[#17A2B8]/30 p-6 rounded-2xl text-center space-y-3">
                <CheckCircle size={40} className="text-[#17A2B8] mx-auto" />
                <h3 className="text-lg font-bold text-[#112734]">আপনার প্রশ্নটি সফলভাবে জমা হয়েছে!</h3>
                <p className="text-xs text-[#5a524d]">
                  আপনার ফতোয়া ট্র্যাকিং কোড:
                </p>
                <div className="font-mono text-xl font-black text-slate-900 bg-white p-3 rounded-xl border border-[#17A2B8]/30 max-w-xs mx-auto">
                  {submittedCode}
                </div>
                <p className="text-[11px] text-[#8a817c]">
                  এই কোডটি সংরক্ষণ করে রাখুন। মুফতী সাহেব উত্তর প্রদান করার পর আপনি ডানপাশের বক্সে কোড দিয়ে উত্তর দেখতে পারবেন।
                </p>
                <button
                  onClick={() => setSubmittedCode(null)}
                  className="text-xs font-bold text-[#112734] underline pt-2"
                >
                  আরেকটি প্রশ্ন পাঠান
                </button>
              </div>
            ) : (
              <form onSubmit={handleAskSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2c3e50] mb-1">আপনার নাম (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      placeholder="নাম লিখুন"
                      value={askName}
                      onChange={(e) => setAskName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] text-xs focus:outline-none focus:border-[#112734]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2c3e50] mb-1">ইমেইল (বিজ্ঞপ্তির জন্য)</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={askEmail}
                      onChange={(e) => setAskEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] text-xs focus:outline-none focus:border-[#112734]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2c3e50] mb-1">বিষয় / ক্যাটাগরি</label>
                    <select
                      value={askCategory}
                      onChange={(e) => setAskCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] text-xs focus:outline-none focus:border-[#112734] font-medium"
                    >
                      <option value="ibadat">নামাজ, রোজা ও তাহরাত</option>
                      <option value="muamalat">ব্যবসা ও আর্থিক লেনদেন</option>
                      <option value="family">বিবাহ, মোহর ও পরিবার</option>
                      <option value="contemporary">চিকিৎসা ও আধুনিক মাসআলা</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2c3e50] mb-1">
                    প্রশ্নের শিরোনাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মোবাইল ব্যাংকিং ক্যাশআউট চার্জ নেওয়ার বিধান কি?"
                    value={askTitle}
                    onChange={(e) => setAskTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] text-xs focus:outline-none focus:border-[#112734] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2c3e50] mb-1">
                    প্রশ্নের বিস্তারিত বিবরণ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="পরিস্থিতি ও প্রাসঙ্গিক তথ্য স্পষ্টভাবে লিখুন..."
                    value={askDetail}
                    onChange={(e) => setAskDetail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] text-xs focus:outline-none focus:border-[#112734]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPriv"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded text-[#112734] focus:ring-[#112734]"
                  />
                  <label htmlFor="isPriv" className="text-xs text-[#5a524d] cursor-pointer">
                    প্রশ্নটি ব্যক্তিগত রাখতে চাই (পাবলিক আর্কাইভে প্রকাশ হবে না)
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  <Send size={15} />
                  <span>প্রশ্ন জমা দিন (Submit Fatwa Query)</span>
                </button>
              </form>
            )}
          </div>

          {/* Track Question Status Card */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-6 flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <Search size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#2c3e50]">{fp.trackCardTitle || 'প্রশ্নের স্ট্যাটাস দেখুন'}</h3>
                <p className="text-xs text-[#8a817c]">{fp.trackCardSubtitle || 'ট্র্যাকিং কোড দিয়ে উত্তর জানুন'}</p>
              </div>
            </div>

            <form onSubmit={handleTrack} className="space-y-3">
              <input
                type="text"
                placeholder="যেমন: NFA-2026-101"
                value={trackCodeInput}
                onChange={(e) => setTrackCodeInput(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#ece8e0] font-mono font-bold uppercase text-xs focus:outline-none focus:border-[#112734]"
              />
              <button
                type="submit"
                className="w-full py-3 bg-[#fdfcf9] hover:bg-[#17A2B8]/10 text-[#112734] font-bold rounded-2xl border border-emerald-300 text-xs transition-colors"
              >
                খুঁজুন
              </button>
            </form>

            {trackError && (
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{trackError}</p>
            )}

            {trackedResult && (
              <div className="p-4 rounded-2xl bg-[#17A2B8]/10/80 border border-[#17A2B8]/30 text-xs space-y-3 mt-auto">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#112734]">{trackedResult.trackingCode}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    trackedResult.status === 'answered' ? 'bg-emerald-200 text-[#112734]' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {trackedResult.status === 'answered' ? 'উত্তর সম্পন্ন' : 'পর্যালোচনায় আছে'}
                  </span>
                </div>

                <h4 className="font-bold text-[#2c3e50]">{trackedResult.questionTitle}</h4>

                {trackedResult.status === 'answered' && (trackedResult.answer || trackedResult.answerText) ? (
                  <div className="bg-white p-3 rounded-xl border border-[#17A2B8]/30 space-y-2">
                    <p className="font-medium text-[#2c3e50]">{trackedResult.answer || trackedResult.answerText}</p>
                    {trackedResult.references && (
                      <p className="text-[10px] text-[#8a817c] italic border-t pt-1">
                        রেফারেন্স: {renderReferences(trackedResult.references)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[#8a817c]">মুফতী সাহেব বর্তমানে এটি পর্যালোচনা করছেন। শীঘ্রই উত্তর প্রদান করা হবে।</p>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Section 2: Public Answered Fatwa Archive */}
        <div className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#112734]">
                {fp.archiveTitle || 'উন্মুক্ত ফতোয়া ও গবেষণা আর্কাইভ'}
              </h2>
              <p className="text-xs text-[#8a817c]">{fp.archiveSubtitle || 'মুফতীগণের স্বাক্ষরিত ও প্রামাণ্য গ্রন্থাবলি থেকে সংকলিত উত্তরসমূহ'}</p>
            </div>

            {/* Archive Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a817c]" size={16} />
              <input
                type="text"
                placeholder="ফতোয়া অনুসন্ধান..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#ece8e0] text-xs focus:outline-none focus:border-[#112734]"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#112734] text-white shadow-sm'
                    : 'bg-white text-[#5a524d] hover:bg-slate-50 border border-[#ece8e0]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Fatwa Accordion List */}
          <div className="space-y-4">
            {filteredFatwas.map((fatwa) => {
              const isExpanded = expandedId === fatwa.id;
              const qText = fatwa.questionDetail || fatwa.questionBody || '';
              const ansText = fatwa.answer || fatwa.answerText || '';
              const scholarName = fatwa.answeredBy || fatwa.answeredByScholar?.name;

              return (
                <div
                  key={fatwa.id}
                  className="bg-white rounded-3xl border border-[#ece8e0] card-natural-shadow overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : fatwa.id)}
                    className="w-full p-6 text-left flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#17A2B8]/10 text-[#112734] text-[10px] font-bold border border-[#17A2B8]/30">
                          {fatwa.categoryBn}
                        </span>
                        <span className="text-[10px] font-mono text-[#8a817c]">
                          আইডি: {fatwa.trackingCode}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base sm:text-lg text-[#2c3e50]">
                        {fatwa.questionTitle}
                      </h3>
                      <p className="text-xs text-[#8a817c] line-clamp-1">
                        {qText}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-100 text-[#112734] shrink-0 mt-1">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-6 pt-0 border-t border-[#ece8e0] bg-[#fdfcf9] space-y-4 text-xs">
                      {/* Full Question Details */}
                      <div className="bg-white p-4 rounded-2xl border border-[#ece8e0] space-y-1">
                        <span className="font-bold text-[#0f8293] block uppercase text-[10px]">
                          জিজ্ঞাসা:
                        </span>
                        <p className="text-[#5a524d] leading-relaxed">
                          {qText}
                        </p>
                      </div>

                      {/* Official Fatwa Answer */}
                      <div className="bg-[#17A2B8]/10/60 p-5 rounded-2xl border border-[#17A2B8]/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-[#112734] text-sm uppercase flex items-center gap-1.5">
                            <ShieldCheck size={16} className="text-[#17A2B8]" />
                            আল-জাওয়াব (শরয়ী ফতোয়া)
                          </span>
                          <span className="text-[10px] text-[#8a817c]">
                            তারিখ: {fatwa.createdAt}
                          </span>
                        </div>

                        <p className="text-sm font-medium text-[#2c3e50] leading-relaxed whitespace-pre-line">
                          {ansText}
                        </p>

                        {fatwa.references && (
                          <div className="pt-3 border-t border-[#17A2B8]/30/60 text-[#5a524d]">
                            <strong className="text-[#112734]">প্রামাণ্য দলীল ও রেফারেন্স:</strong>
                            <p className="text-xs mt-1 text-[#2c3e50] font-semibold">{renderReferences(fatwa.references)}</p>
                          </div>
                        )}

                        {scholarName && (
                          <div className="text-right pt-2 text-[11px] text-[#8a817c]">
                            — ফতোয়া প্রদানকারী: <strong className="text-[#112734]">{scholarName}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function FatwaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fdfcf9] flex items-center justify-center p-8 text-[#112734] font-bold">লোড হচ্ছে...</div>}>
      <FatwaContent />
    </Suspense>
  );
}
