'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppStore, INITIAL_COURSES } from '@/lib/store';
import { Course } from '@/lib/types';
import { CourseCard } from '@/components/CourseCard';
import { PaymentModal } from '@/components/PaymentModal';
import { Search, Filter, BookOpen, Sparkles } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    setCourses(AppStore.getCourses());
    const handleUpdate = () => setCourses(AppStore.getCourses());
    window.addEventListener('storage', handleUpdate);
    return () => window.removeEventListener('storage', handleUpdate);
  }, []);

  const categories = [
    { id: 'all', label: 'সকল কোর্স' },
    { id: 'ibadat', label: 'ইবাদত ও তাহরাত' },
    { id: 'muamalat', label: 'মুয়ামালাত ও ফাইন্যান্স' },
    { id: 'family', label: 'পারিবারিক ও নিকাহ' },
    { id: 'usul', label: 'উসূলে ফিকহ' }
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
    <div className="min-h-screen bg-[#fdfcf9] py-12 px-4 sm:px-8 font-sans text-[#2c3e50]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Page Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17A2B8]/10 text-[#112734] text-xs font-bold uppercase tracking-wider border border-[#17A2B8]/30">
            <Sparkles size={14} className="text-amber-500" />
            <span>প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#112734] tracking-tight">
            নূর ফিকহ একাডেমি কোর্সসমূহ
          </h1>
          <p className="text-sm sm:text-base text-[#5a524d] leading-relaxed">
            দৈনন্দিন ইবাদত থেকে শুরু করে সমকালীন আধুনিক আর্থিক ও পারিবারিক সমস্যার দলীলভিত্তিক সহজ সমাধান।
          </p>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a817c]" size={18} />
              <input
                type="text"
                placeholder="কোর্সের নাম বা বিষয় খুঁজুন..."
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
            {categories.map((cat) => (
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
