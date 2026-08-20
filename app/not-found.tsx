import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-3xl font-black text-[#112734] mb-4">৪0৪ - পৃষ্ঠাটি পাওয়া যায়নি</h2>
      <p className="text-slate-600 mb-8">আপনি যে পৃষ্ঠাটি খুঁজছেন তা মুছে ফেলা হয়েছে বা তার নাম পরিবর্তন করা হয়েছে।</p>
      <Link href="/" className="px-6 py-3 bg-[#112734] text-white rounded-xl font-bold hover:bg-[#23626F] transition-colors">
        হোমপেজে ফিরে যান
      </Link>
    </div>
  );
}
