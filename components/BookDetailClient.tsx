'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppStore } from '@/lib/store';
import { PaymentModal } from '@/components/PaymentModal';
import { 
  BookOpen, 
  Download, 
  ShoppingBag, 
  Star, 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  Truck, 
  Eye,
  ShieldCheck
} from 'lucide-react';

interface BookDetailClientProps {
  id?: string;
}

export default function BookDetailClient({ id }: BookDetailClientProps) {
  const params = useParams();
  const bookId = id || (params?.id as string);
  const book = AppStore.getBookById(bookId);

  const [buyType, setBuyType] = useState<'pdf' | 'hardcover' | null>(null);
  const [showPdfReader, setShowPdfReader] = useState(false);

  if (!book) {
    return (
      <div className="min-h-screen bg-[#fdfcf9] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-[#2c3e50] mb-2">কিতাবটি খুঁজে পাওয়া যায়নি</h2>
        <Link href="/books" className="px-6 py-2.5 bg-[#112734] text-white rounded-xl font-bold text-sm">
          সকল কিতাবে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf9] font-sans text-[#2c3e50] pb-20">
      {/* Top Banner */}
      <div className="bg-[#112734] text-white py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            href="/books"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#17A2B8]/80 hover:text-[#17A2B8] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>সকল কিতাবে ফিরে যান</span>
          </Link>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            {book.titleBn || book.title}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100">
            লেখক: {book.authorBn || book.author} • প্রকাশক: {book.publisher}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Book Preview Image & Quick Buy */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow flex flex-col items-center text-center">
            <div className="w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-xl mb-6">
              <img
                src={book.coverImage}
                alt={book.titleBn}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full space-y-3">
              {book.hasPdf && (
                <button
                  onClick={() => setBuyType('pdf')}
                  className="w-full py-3 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Download size={16} />
                  <span>ই-বুক (PDF) কিনুন • ৳{book.pdfPrice}</span>
                </button>
              )}

              {book.hasHardcover && (
                <button
                  onClick={() => setBuyType('hardcover')}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingBag size={16} />
                  <span>প্রিন্ট কপি অর্ডার • ৳{book.hardcoverPrice}</span>
                </button>
              )}

              {book.previewPdfUrl && (
                <button
                  onClick={() => setShowPdfReader(true)}
                  className="w-full py-2.5 bg-[#17A2B8]/10 hover:bg-[#17A2B8]/15 text-[#112734] font-bold rounded-2xl border border-[#17A2B8]/30 transition-colors flex items-center justify-center gap-2 text-xs"
                >
                  <Eye size={15} />
                  <span>ফ্রি নমুনা অধ্যায় পড়ুন</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-3 text-xs text-[#5a524d]">
            <h4 className="font-extrabold text-[#2c3e50] text-sm uppercase">ডেলিভারি ও নিশ্চয়তা</h4>
            <div className="flex items-start gap-2">
              <Truck size={16} className="text-[#23626F] shrink-0 mt-0.5" />
              <span>হার্ডকভার কপি সারা দেশে ২-৩ দিনে সুন্দরবন/রেডেক্স কুরিয়ারে ক্যাশ অন ডেলিভারি।</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck size={16} className="text-[#23626F] shrink-0 mt-0.5" />
              <span>পিডিএফ সংস্করণ পেমেন্টের সাথে সাথেই আজীবনের জন্য আনলক হবে।</span>
            </div>
          </div>
        </div>

        {/* Right Column: Book Details, Table of Contents, Synopsis */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-[#112734] mb-2">কিতাবের পরিচিতি ও মূল বক্তব্য</h2>
              <p className="text-sm text-[#5a524d] leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </div>

            {book.tableOfContents && (
              <div className="pt-6 border-t border-[#ece8e0]">
                <h3 className="text-lg font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-amber-600" />
                  সূচিপত্র ও আলোচিত অধ্যায়সমূহ
                </h3>
                <div className="space-y-2">
                  {book.tableOfContents.map((ch, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#fdfcf9] border border-[#ece8e0] text-xs font-semibold">
                      <span className="text-[#2c3e50]">{ch.chapter}</span>
                      <span className="text-[#8a817c]">পৃষ্ঠা {ch.page}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Free Sample PDF Preview Modal */}
      {showPdfReader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-[#112734] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm truncate">{book.titleBn} (নমুনা পাঠ)</h3>
              <button onClick={() => setShowPdfReader(false)} className="text-[#17A2B8]/80 hover:text-white">
                বন্ধ করুন
              </button>
            </div>
            <div className="flex-1 bg-slate-100 p-4 overflow-y-auto flex items-center justify-center">
              <iframe
                src={book.previewPdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}
                className="w-full h-full rounded-xl border"
                title="Book Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {buyType && (
        <PaymentModal
          isOpen={!!buyType}
          onClose={() => setBuyType(null)}
          item={{
            id: book.id,
            title: book.title,
            titleBn: book.titleBn,
            price: buyType === 'pdf' ? (book.pdfPrice || 0) : (book.hardcoverPrice || 0),
            type: 'book',
            purchaseType: buyType
          }}
        />
      )}
    </div>
  );
}
