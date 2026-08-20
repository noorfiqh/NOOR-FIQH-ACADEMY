'use client';

import React from 'react';
import Link from 'next/link';
import { Book } from '@/lib/types';
import { BookOpen, Download, ShoppingBag, Star, FileText } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onBuy?: (book: Book, type: 'pdf' | 'hardcover') => void;
}

export function BookCard({ book, onBuy }: BookCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#ece8e0] overflow-hidden card-natural-shadow card-natural-shadow-hover transition-all duration-300 flex flex-col group h-full">
      {/* Book Cover */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 p-4 flex items-center justify-center">
        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-500">
          <img
            src={book.coverImage}
            alt={book.titleBn || book.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-[#112734] text-[#17A2B8] text-[10px] font-bold rounded-full shadow-sm">
          {book.categoryBn || book.category}
        </span>
      </div>

      {/* Book Info */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-1.5">
          <Star size={13} className="fill-amber-400 text-[#17A2B8]" />
          <span>{book.rating || 4.9}</span>
          <span className="text-[#8a817c] font-normal">• {book.pages} পৃষ্ঠা</span>
        </div>

        <Link href={`/books/${book.id}`} className="group-hover:text-[#112734] transition-colors">
          <h3 className="font-extrabold text-base text-[#2c3e50] leading-snug line-clamp-2 mb-1">
            {book.titleBn || book.title}
          </h3>
        </Link>

        <p className="text-xs font-medium text-[#8a817c] mb-3">
          লেখক: <span className="text-[#5a524d] font-semibold">{book.authorBn || book.author}</span>
        </p>

        <p className="text-xs text-[#5a524d] line-clamp-2 leading-relaxed mb-4 flex-grow">
          {book.description}
        </p>

        {/* Pricing Options */}
        <div className="space-y-2 pt-3 border-t border-[#ece8e0]">
          <div className="flex items-center justify-between gap-2">
            {book.hasPdf && (
              <div className="flex-1 bg-[#fdfcf9] border border-[#ece8e0] rounded-xl p-2 text-center">
                <span className="text-[10px] text-[#8a817c] uppercase font-bold block">পিডিএফ ই-বুক</span>
                <span className="text-sm font-extrabold text-[#112734]">৳{book.pdfPrice}</span>
              </div>
            )}

            {book.hasHardcover && (
              <div className="flex-1 bg-[#fdfcf9] border border-[#ece8e0] rounded-xl p-2 text-center">
                <span className="text-[10px] text-[#8a817c] uppercase font-bold block">হার্ডকভার প্রিন্ট</span>
                <span className="text-sm font-extrabold text-amber-700">৳{book.hardcoverPrice}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Link
              href={`/books/${book.id}`}
              className="font-tiro flex-1 py-2 text-center text-xs font-bold text-[#112734] bg-[#17A2B8]/10 hover:bg-[#17A2B8]/15 rounded-xl transition-colors border border-[#17A2B8]/30"
            >
              বিস্তারিত দেখুন
            </Link>

            {onBuy && (
              <button
                onClick={() => onBuy(book, book.hasPdf ? 'pdf' : 'hardcover')}
                className="font-tiro flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold bg-[#112734] hover:bg-[#23626F] text-white rounded-xl shadow transition-colors"
              >
                <ShoppingBag size={14} />
                <span>অর্ডার</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
