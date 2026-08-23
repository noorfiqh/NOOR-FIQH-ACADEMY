'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppStore, INITIAL_BOOKS, DEFAULT_SETTINGS } from '@/lib/store';
import { Book, SiteSettings } from '@/lib/types';
import { BookCard } from '@/components/BookCard';
import { PaymentModal } from '@/components/PaymentModal';
import { db, collection, onSnapshot, handleFirestoreError, OperationType, doc } from '@/lib/firebase';
import { 
  Search, 
  Library, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen, 
  Truck,
  Download
} from 'lucide-react';

export default function BooksPage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBookForBuy, setSelectedBookForBuy] = useState<{
    book: Book;
    type: 'pdf' | 'hardcover';
  } | null>(null);

  useEffect(() => {
    setSiteSettings(AppStore.getSettings());
    setBooks(AppStore.getBooks());
    const handleUpdate = () => {
      setSiteSettings(AppStore.getSettings());
      setBooks(AppStore.getBooks());
    };
    window.addEventListener('storage', handleUpdate);

    // Sync site settings from Firestore
    const unsubSettings = onSnapshot(doc(db, 'settings', 'site_config'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteSettings;
        setSiteSettings(data);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings');
    });

    // Sync books live from Firestore
    const unsubBooks = onSnapshot(collection(db, 'books'), (snapshot) => {
      if (!snapshot.empty) {
        const fbBooks: Book[] = [];
        snapshot.forEach((docSnap) => {
          fbBooks.push({ id: docSnap.id, ...docSnap.data() } as Book);
        });
        setBooks(fbBooks);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'books');
    });

    return () => {
      window.removeEventListener('storage', handleUpdate);
      unsubSettings();
      unsubBooks();
    };
  }, []);

  const bp = siteSettings.booksPage || {
    badgeText: 'নূর ফিকহ একাডেমি প্রকাশনা ও লাইব্রেরি',
    titleBn: 'ফিকহ কিতাব ও গবেষণাপত্র',
    subtitleBn: 'দারুল ইফতা ও ফিকহ বোর্ড কর্তৃক রচিত প্রামাণ্য কিতাবের পিডিএফ ও হোম ডেলিভারি হার্ডকভার কপি সংগ্রহ করুন।',
    heroImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    showHeroImage: true,
    heroImagePosition: 'right',
    searchPlaceholder: 'কিতাবের নাম বা লেখক দিয়ে খুঁজুন...',
    highlight1: 'দারুল ইফতা অনুমোদিত নির্ভরযোগ্য পাণ্ডুলিপি',
    highlight2: 'সারাদেশে হোম ডেলিভারি ও দ্রুত পিডিএফ ডাউনলোড',
    highlight3: 'প্রামাণ্য দলীল ও আরবী এবারতসহ সহজ তরজমা',
    featuredTitle: 'সকল ফিকহ কিতাব ও প্রকাশনা তালিকা',
    featuredSubtitle: 'বিষয়ভিত্তিক বাছাইকৃত কিতাবসমূহ এবং গবেষণাপত্র'
  };

  const categories = [
    { id: 'all', label: 'সকল কিতাব' },
    { id: 'taharat', label: 'তাহরাত ও ইবাদত' },
    { id: 'muamalat', label: 'মুয়ামালাত ও বাণিজ্য' },
    { id: 'family', label: 'পারিবারিক আইন' },
    { id: 'general', label: 'সাধারণ ফিকহ' }
  ];

  const filteredBooks = books.filter((b) => {
    const matchSearch =
      b.titleBn.toLowerCase().includes(search.toLowerCase()) ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.authorBn.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'all' || b.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-[#fdfcf9] py-12 px-4 sm:px-8 font-sans text-[#2c3e50]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Page Hero Banner */}
        {bp.heroImagePosition === 'background' && bp.showHeroImage !== false && bp.heroImage ? (
          <div className="relative rounded-3xl overflow-hidden min-h-[280px] sm:min-h-[340px] p-8 sm:p-14 flex items-center justify-center text-center shadow-xl border border-amber-900/30">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${bp.heroImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#112734]/95 via-[#112734]/80 to-[#112734]/85" />
            
            <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-200 text-xs font-bold uppercase tracking-wider border border-amber-400/40 backdrop-blur-sm">
                <Sparkles size={14} className="text-amber-400" />
                <span>{bp.badgeText || 'নূর ফিকহ একাডেমি প্রকাশনা ও লাইব্রেরি'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {bp.titleBn || 'ফিকহ কিতাব ও গবেষণাপত্র'}
              </h1>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-tiro max-w-2xl mx-auto">
                {bp.subtitleBn || 'দারুল ইফতা ও ফিকহ বোর্ড কর্তৃক রচিত প্রামাণ্য কিতাবের পিডিএফ ও হোম ডেলিভারি হার্ডকভার কপি সংগ্রহ করুন।'}
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {bp.highlight1 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-100 text-xs font-semibold backdrop-blur-sm border border-white/15">
                    <CheckCircle2 size={13} className="text-amber-400" />
                    <span>{bp.highlight1}</span>
                  </span>
                )}
                {bp.highlight2 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-100 text-xs font-semibold backdrop-blur-sm border border-white/15">
                    <Truck size={13} className="text-teal-400" />
                    <span>{bp.highlight2}</span>
                  </span>
                )}
                {bp.highlight3 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-100 text-xs font-semibold backdrop-blur-sm border border-white/15">
                    <BookOpen size={13} className="text-emerald-400" />
                    <span>{bp.highlight3}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : bp.showHeroImage !== false && bp.heroImage ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ece8e0] shadow-sm">
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${bp.heroImagePosition === 'left' ? 'lg:flex-row-reverse' : ''}`}>
              
              {/* Text Area */}
              <div className={`space-y-4 ${bp.heroImagePosition === 'left' ? 'lg:col-span-7 lg:order-2' : 'lg:col-span-7'}`}>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-200">
                  <Library size={14} className="text-amber-600" />
                  <span>{bp.badgeText || 'নূর ফিকহ একাডেমি প্রকাশনা ও লাইব্রেরি'}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#112734] tracking-tight leading-tight">
                  {bp.titleBn || 'ফিকহ কিতাব ও গবেষণাপত্র'}
                </h1>

                <p className="text-sm sm:text-base text-[#5a524d] leading-relaxed font-tiro">
                  {bp.subtitleBn || 'দারুল ইফতা ও ফিকহ বোর্ড কর্তৃক রচিত প্রামাণ্য কিতাবের পিডিএফ ও হোম ডেলিভারি হার্ডকভার কপি সংগ্রহ করুন।'}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {bp.highlight1 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-100">
                      <CheckCircle2 size={13} className="text-amber-600" />
                      <span>{bp.highlight1}</span>
                    </span>
                  )}
                  {bp.highlight2 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-100">
                      <Truck size={13} className="text-teal-600" />
                      <span>{bp.highlight2}</span>
                    </span>
                  )}
                  {bp.highlight3 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-100">
                      <BookOpen size={13} className="text-emerald-600" />
                      <span>{bp.highlight3}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Hero Image */}
              <div className={`${bp.heroImagePosition === 'left' ? 'lg:col-span-5 lg:order-1' : 'lg:col-span-5'}`}>
                <div className="relative rounded-2xl overflow-hidden border border-[#ece8e0] shadow-md aspect-[16/10] bg-slate-100 group">
                  <img
                    src={bp.heroImage}
                    alt={bp.titleBn || 'Books Hero Banner'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-200">
              <Library size={14} className="text-amber-600" />
              <span>{bp.badgeText || 'নূর ফিকহ একাডেমি প্রকাশনা ও লাইব্রেরি'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#112734] tracking-tight">
              {bp.titleBn || 'ফিকহ কিতাব ও গবেষণাপত্র'}
            </h1>

            <p className="text-sm sm:text-base text-[#5a524d] leading-relaxed font-tiro">
              {bp.subtitleBn || 'দারুল ইফতা ও ফিকহ বোর্ড কর্তৃক রচিত প্রামাণ্য কিতাবের পিডিএফ ও হোম ডেলিভারি হার্ডকভার কপি সংগ্রহ করুন।'}
            </p>

            {/* Highlights */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {bp.highlight1 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-100">
                  <CheckCircle2 size={13} className="text-amber-600" />
                  <span>{bp.highlight1}</span>
                </span>
              )}
              {bp.highlight2 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-100">
                  <Truck size={13} className="text-teal-600" />
                  <span>{bp.highlight2}</span>
                </span>
              )}
              {bp.highlight3 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-100">
                  <BookOpen size={13} className="text-emerald-600" />
                  <span>{bp.highlight3}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Search & Category Filter */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#ece8e0] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a817c]" size={18} />
              <input
                type="text"
                placeholder={bp.searchPlaceholder || 'কিতাবের নাম বা লেখক দিয়ে খুঁজুন...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#ece8e0] bg-[#fdfcf9] text-sm focus:outline-none focus:border-[#112734]"
              />
            </div>
            <div className="text-xs font-bold text-[#5a524d]">
              মোট কিতাব: <span className="text-[#112734] text-sm font-extrabold">{filteredBooks.length}টি</span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#112734] text-white shadow-md'
                    : 'bg-[#fdfcf9] text-[#5a524d] hover:bg-[#17A2B8]/10 border border-[#ece8e0]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section Heading & Grid */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#ece8e0] pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#112734]">
                {bp.featuredSectionTitle || bp.featuredTitle || 'সকল ফিকহ কিতাব ও প্রকাশনা তালিকা'}
              </h2>
              <p className="text-xs text-[#8a817c] mt-0.5">
                {bp.featuredSectionSubtitle || bp.featuredSubtitle || 'বিষয়ভিত্তিক বাছাইকৃত কিতাবসমূহ এবং গবেষণাপত্র'}
              </p>
            </div>
          </div>

          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onBuy={(b, type) => setSelectedBookForBuy({ book: b, type })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-[#ece8e0] space-y-3">
              <Library size={44} className="mx-auto text-slate-300" />
              <h3 className="text-lg font-bold text-[#2c3e50]">কোনো কিতাব পাওয়া যায়নি</h3>
              <p className="text-xs text-[#8a817c]">ভিন্ন কোনো নাম বা ক্যাটাগরি দিয়ে অনুসন্ধান করে দেখুন।</p>
            </div>
          )}
        </div>

      </div>

      {/* Payment Checkout Modal */}
      {selectedBookForBuy && (
        <PaymentModal
          isOpen={!!selectedBookForBuy}
          onClose={() => setSelectedBookForBuy(null)}
          item={{
            id: selectedBookForBuy.book.id,
            title: selectedBookForBuy.book.title,
            titleBn: selectedBookForBuy.book.titleBn,
            price: selectedBookForBuy.type === 'pdf' 
              ? (selectedBookForBuy.book.pdfPrice || 0) 
              : (selectedBookForBuy.book.hardcoverPrice || 0),
            type: 'book',
            purchaseType: selectedBookForBuy.type
          }}
        />
      )}
    </div>
  );
}

