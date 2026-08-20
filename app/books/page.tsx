'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppStore, INITIAL_BOOKS } from '@/lib/store';
import { Book } from '@/lib/types';
import { BookCard } from '@/components/BookCard';
import { PaymentModal } from '@/components/PaymentModal';
import { Search, Library, Sparkles } from 'lucide-react';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBookForBuy, setSelectedBookForBuy] = useState<{
    book: Book;
    type: 'pdf' | 'hardcover';
  } | null>(null);

  useEffect(() => {
    setBooks(AppStore.getBooks());
    const handleUpdate = () => setBooks(AppStore.getBooks());
    window.addEventListener('storage', handleUpdate);
    return () => window.removeEventListener('storage', handleUpdate);
  }, []);

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
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Page Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Library size={14} className="text-amber-600" />
            <span>নূর ফিকহ একাডেমি প্রকাশনা ও লাইব্রেরি</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#112734] tracking-tight">
            ফিকহ কিতাব ও গবেষণাপত্র
          </h1>
          <p className="text-sm sm:text-base text-[#5a524d] leading-relaxed">
            দারুল ইফতা ও ফিকহ বোর্ড কর্তৃক রচিত প্রামাণ্য কিতাবের পিডিএফ ও হোম ডেলিভারি হার্ডকভার কপি সংগ্রহ করুন।
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a817c]" size={18} />
              <input
                type="text"
                placeholder="কিতাবের নাম বা লেখক দিয়ে খুঁজুন..."
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

        {/* Books Grid */}
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
          </div>
        )}

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
