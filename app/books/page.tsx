'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppStore, INITIAL_BOOKS, DEFAULT_SETTINGS } from '@/lib/store';
import { Book, SiteSettings } from '@/lib/types';
import { BookCard } from '@/components/BookCard';
import { PaymentModal } from '@/components/PaymentModal';
import { formatImageUrl, handleImageError } from '@/lib/utils';
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
      handleFirestoreError(error, OperationType.LIST, 'books');
    });

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('noorfiqh_settings_updated', handleUpdate);
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
    <div className="min-h-screen bg-[#fdfcf9] font-sans text-[#2c3e50] space-y-0 pb-16">
      
      {/* 1. EDGE-TO-EDGE HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-[#112734] text-white py-12 sm:py-16 lg:py-20 border-b border-[#23626F]">
        {/* Background image if set as background */}
        {bp.heroImagePosition === 'background' && bp.showHeroImage !== false && bp.heroImage && (
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            <img
              src={formatImageUrl(bp.heroImage)}
              alt="Books Background Hero"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => handleImageError(e, bp.heroImage)}
              style={{ opacity: (bp.heroImageOpacity ?? 35) / 100 }}
              className="w-full h-full object-cover object-center scale-105 transition-all duration-700"
            />
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#112734] via-[#112734]/85 to-[#112734]/70 transition-opacity" 
              style={{ opacity: (bp.heroOverlayOpacity ?? 80) / 100 }}
            />
            <div 
              className="absolute inset-0 bg-gradient-to-t from-[#112734] via-transparent to-[#112734]/40 transition-opacity" 
              style={{ opacity: (bp.heroOverlayOpacity ?? 80) / 100 }}
            />
          </div>
        )}

        {/* Ambient Dark Gradient & Glows */}
        {bp.heroImagePosition !== 'background' && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#112734] via-[#112734]/90 to-[#112734]/95 pointer-events-none" />
        )}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {bp.heroImagePosition === 'background' && bp.showHeroImage !== false && bp.heroImage ? (
            /* Full Background Hero Layout */
            <div className="max-w-3xl space-y-4 text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-200 text-xs font-bold uppercase tracking-wider border border-amber-400/40 backdrop-blur-sm">
                <Sparkles size={14} className="text-amber-400" />
                <span>{bp.badgeText || 'নূর ফিকহ একাডেমি প্রকাশনা ও লাইব্রেরি'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight font-anek">
                {bp.titleBn || 'ফিকহ কিতাব ও গবেষণাপত্র'}
              </h1>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-tiro max-w-2xl">
                {bp.subtitleBn || 'দারুল ইফতা ও ফিকহ বোর্ড কর্তৃক রচিত প্রামাণ্য কিতাবের পিডিএফ ও হোম ডেলিভারি হার্ডকভার কপি সংগ্রহ করুন।'}
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2.5 pt-3">
                {bp.highlight1 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-amber-100 text-xs font-semibold backdrop-blur-sm border border-white/15">
                    <CheckCircle2 size={14} className="text-amber-400" />
                    <span>{bp.highlight1}</span>
                  </span>
                )}
                {bp.highlight2 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-amber-100 text-xs font-semibold backdrop-blur-sm border border-white/15">
                    <Truck size={14} className="text-teal-400" />
                    <span>{bp.highlight2}</span>
                  </span>
                )}
                {bp.highlight3 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-amber-100 text-xs font-semibold backdrop-blur-sm border border-white/15">
                    <BookOpen size={14} className="text-emerald-400" />
                    <span>{bp.highlight3}</span>
                  </span>
                )}
              </div>
            </div>
          ) : bp.showHeroImage !== false && bp.heroImage ? (
            /* Split Grid Hero with Image */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Text Area */}
              <div className={`space-y-4 ${bp.heroImagePosition === 'left' ? 'lg:col-span-7 lg:order-2' : 'lg:col-span-7'}`}>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
                  <Library size={14} className="text-amber-400" />
                  <span>{bp.badgeText || 'নূর ফিকহ একাডেমি প্রকাশনা ও লাইব্রেরি'}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.2] font-anek">
                  {bp.titleBn || 'ফিকহ কিতাব ও গবেষণাপত্র'}
                </h1>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-tiro max-w-2xl">
                  {bp.subtitleBn || 'দারুল ইফতা ও ফিকহ বোর্ড কর্তৃক রচিত প্রামাণ্য কিতাবের পিডিএফ ও হোম ডেলিভারি হার্ডকভার কপি সংগ্রহ করুন।'}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2.5 pt-3">
                  {bp.highlight1 && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15 backdrop-blur-xs">
                      <CheckCircle2 size={14} className="text-amber-400" />
                      <span>{bp.highlight1}</span>
                    </span>
                  )}
                  {bp.highlight2 && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15 backdrop-blur-xs">
                      <Truck size={14} className="text-teal-400" />
                      <span>{bp.highlight2}</span>
                    </span>
                  )}
                  {bp.highlight3 && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15 backdrop-blur-xs">
                      <BookOpen size={14} className="text-emerald-400" />
                      <span>{bp.highlight3}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Hero Image */}
              <div className={`${bp.heroImagePosition === 'left' ? 'lg:col-span-5 lg:order-1' : 'lg:col-span-5'} flex justify-center`}>
                <div className="w-full max-w-lg relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl group bg-[#0b1b24]">
                  <div className="aspect-[16/10] w-full relative">
                    <img
                      src={formatImageUrl(bp.heroImage)}
                      alt={bp.titleBn || 'Books Hero Banner'}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => handleImageError(e, bp.heroImage)}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold rounded-xl border border-white/20 font-tiro">
                      📚 নূর ফিকহ কুতুবখানা
                    </span>
                    <span className="px-3 py-1 bg-amber-500 text-[#0b1b24] text-[11px] font-black rounded-xl shadow font-tiro">
                      অর্ডার গ্রহণ চলছে
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center space-y-4 max-w-3xl mx-auto py-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
                <Library size={14} className="text-amber-400" />
                <span>{bp.badgeText || 'নূর ফিকহ একাডেমি প্রকাশনা ও লাইব্রেরি'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-anek">
                {bp.titleBn || 'ফিকহ কিতাব ও গবেষণাপত্র'}
              </h1>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-tiro max-w-2xl mx-auto">
                {bp.subtitleBn || 'দারুল ইফতা ও ফিকহ বোর্ড কর্তৃক রচিত প্রামাণ্য কিতাবের পিডিএফ ও হোম ডেলিভারি হার্ডকভার কপি সংগ্রহ করুন।'}
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {bp.highlight1 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15">
                    <CheckCircle2 size={14} className="text-amber-400" />
                    <span>{bp.highlight1}</span>
                  </span>
                )}
                {bp.highlight2 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15">
                    <Truck size={14} className="text-teal-400" />
                    <span>{bp.highlight2}</span>
                  </span>
                )}
                {bp.highlight3 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15">
                    <BookOpen size={14} className="text-emerald-400" />
                    <span>{bp.highlight3}</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. CATALOG & FILTERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 space-y-12">
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

