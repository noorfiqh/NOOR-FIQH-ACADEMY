'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppStore } from '@/lib/store';
import { Course } from '@/lib/types';
import { CourseCard } from '@/components/CourseCard';
import { PaymentModal } from '@/components/PaymentModal';
import { TeacherContactButtons } from '@/components/TeacherContactButtons';
import { 
  Clock, 
  BookOpen, 
  Award, 
  Star, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  ArrowLeft, 
  ArrowRight,
  PlayCircle,
  Sparkles,
  X,
  RotateCcw,
  HelpCircle
} from 'lucide-react';

function getEmbedInfo(url?: string, autoPlay: boolean = true) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // YouTube match
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? '1' : '0'}&mute=1&playsinline=1&loop=1&playlist=${videoId}&rel=0&modestbranding=1&enablejsapi=1`
    };
  }

  // Vimeo match
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=${autoPlay ? '1' : '0'}&muted=1&playsinline=1&loop=1`
    };
  }

  // Direct video
  if (trimmed.endsWith('.mp4') || trimmed.endsWith('.webm') || trimmed.endsWith('.ogg') || trimmed.includes('.mp4?')) {
    return {
      type: 'video',
      embedUrl: trimmed
    };
  }

  return {
    type: 'iframe',
    embedUrl: trimmed
  };
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  
  const course = AppStore.getCourseById(courseId);
  const allCourses = AppStore.getCourses();
  const otherCourses = allCourses.filter(c => c.id !== courseId);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<Course | null>(null);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    const settings = AppStore.getSettings();
    if (settings.faqs) {
      setFaqs(settings.faqs);
    }
  }, []);
  
  // Auto-play video on load if video URL is present
  const [isPlayingHeroVideo, setIsPlayingHeroVideo] = useState(true);
  const [activeVideoModalUrl, setActiveVideoModalUrl] = useState<string | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);

  const handleScrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-[#fdfcf9] flex flex-col items-center justify-center p-6 text-center font-noto">
        <h2 className="text-2xl font-bold text-[#2c3e50] mb-2 font-anek">কোর্সটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-sm text-[#8a817c] mb-6 font-noto">কোর্সটি হয়ত সরিয়ে ফেলা হয়েছে অথবা লিংকটি ভুল।</p>
        <Link href="/courses" className="px-6 py-2.5 bg-[#112734] text-white rounded-xl font-bold text-sm font-tiro">
          সকল কোর্সে ফিরে যান
        </Link>
      </div>
    );
  }

  // Resolve video URL from previewVideoUrl or first available lesson videoUrl
  const effectiveVideoUrl = course.previewVideoUrl || course.lessons.find(l => l.videoUrl)?.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const heroEmbed = getEmbedInfo(effectiveVideoUrl, true);
  const modalEmbed = activeVideoModalUrl ? getEmbedInfo(activeVideoModalUrl, true) : null;

  return (
    <div className="min-h-screen bg-[#fdfcf9] font-noto text-[#2c3e50] pb-24">
      {/* Top Breadcrumb Header */}
      <div className="bg-[#112734] text-white py-12 px-4 sm:px-8 border-b border-[#23626F]">
        <div className="max-w-7xl mx-auto space-y-6">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#17A2B8]/80 hover:text-[#17A2B8] transition-colors font-tiro"
          >
            <ArrowLeft size={14} />
            <span>সকল কোর্সে ফিরে যান</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-[#17A2B8] text-slate-950 text-[11px] font-extrabold rounded-full font-tiro">
                  {course.badge || 'প্রামাণ্য কোর্স'}
                </span>
                <span className="px-3 py-1 bg-[#112734] text-[#17A2B8]/80 text-[11px] font-bold rounded-lg border border-[#23626F] font-tiro">
                  {course.categoryLabelBn}
                </span>
                <span className="text-xs text-[#17A2B8]/80 font-noto">• স্তর: {course.levelBn}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight font-anek">
                {course.titleBn || course.title}
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-3xl font-noto">
                {course.shortDescription}
              </p>

              {/* Rating & Stats */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#17A2B8]/80 font-semibold font-noto">
                <div className="flex items-center gap-1.5 text-[#17A2B8] font-bold">
                  <Star size={16} className="fill-amber-400 text-[#17A2B8]" />
                  <span>{course.rating} (১,৪০০+ রিভিউ)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={15} />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen size={15} />
                  <span>{course.totalLessons} টি বিস্তারিত লেকচার</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award size={15} className="text-[#17A2B8]" />
                  <span>সার্টিফিকেট অন্তর্ভুক্ত</span>
                </div>
              </div>
            </div>

            {/* Price & Immediate Action Block (With Hero Video Player - Autoplay enabled) */}
            <div className="lg:col-span-4 bg-white text-[#2c3e50] p-6 rounded-3xl shadow-2xl border border-[#ece8e0] space-y-4">
              
              {/* HERO VIDEO / THUMBNAIL CONTAINER WITH AUTOPLAY */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-md border border-slate-800 group">
                {isPlayingHeroVideo && heroEmbed ? (
                  <div className="w-full h-full relative bg-black">
                    {heroEmbed.type === 'video' ? (
                      <video
                        src={heroEmbed.embedUrl}
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <iframe
                        src={heroEmbed.embedUrl}
                        title={course.titleBn}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    )}
                    <button
                      onClick={() => setIsPlayingHeroVideo(false)}
                      className="absolute top-2 right-2 p-1.5 bg-black/75 hover:bg-black text-white rounded-lg text-xs flex items-center gap-1 z-10 transition-colors shadow-md"
                      title="থাম্বনেইল ছবিতে ফিরে যান"
                    >
                      <RotateCcw size={13} />
                      <span className="text-[10px] font-tiro">ছবি দেখুন</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <img
                      src={course.thumbnail}
                      alt={course.titleBn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-between p-3.5">
                      <div className="flex justify-between items-start">
                        <span className="bg-[#112734]/90 text-[#17A2B8] border border-emerald-500/40 text-[10px] font-bold font-tiro px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                          ভিডিও ট্রেলার
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setIsPlayingHeroVideo(true)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white/95 hover:bg-white text-[#112734] font-bold rounded-xl shadow-lg transition-all transform group-hover:scale-[1.02] font-tiro text-xs"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#112734] text-[#17A2B8] flex items-center justify-center shadow">
                          <PlayCircle size={18} className="fill-amber-300 text-[#112734]" />
                        </div>
                        <span>ভিডিও প্লে করুন (Autoplay Video)</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-[10px] text-[#8a817c] uppercase font-bold block font-noto">এককালীন কোর্স ফি</span>
                  <span className="text-3xl font-black text-[#112734] font-anek">৳{course.price}</span>
                </div>
                {course.originalPrice && (
                  <span className="text-sm text-[#8a817c] line-through font-noto">৳{course.originalPrice}</span>
                )}
              </div>

              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full py-4 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm font-tiro"
              >
                <Sparkles size={16} className="text-[#17A2B8]" />
                <span>এখনই ভর্তি হোন (Enroll Now)</span>
              </button>

              <p className="text-[11px] text-center text-[#8a817c] font-noto">
                লাইফটাইম অ্যাক্সেস • লাইভ প্রশ্নোত্তর • মানি-ব্যাক গ্যারান্টি
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details & Syllabus */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Description, Objectives, Syllabus */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Objectives */}
          <div className="bg-white p-7 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4">
            <h3 className="text-xl font-extrabold text-[#112734] flex items-center gap-2 font-anek">
              <CheckCircle2 size={20} className="text-amber-600" />
              এই কোর্সে যা যা শিখবেন
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-[#5a524d] font-noto">
              {course.objectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#17A2B8]/10 text-[#112734] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-anek">
                    ✓
                  </span>
                  <span className="leading-relaxed font-noto">{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full Course Description */}
          <div className="bg-white p-7 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4">
            <h3 className="text-xl font-extrabold text-[#112734] font-anek">
              কোর্স পরিচিতি ও বিস্তারিত বিষয়াবলি
            </h3>
            <div className="text-sm sm:text-base text-[#5a524d] leading-relaxed whitespace-pre-line font-noto">
              {course.description}
            </div>
          </div>

          {/* Curriculum / Lessons */}
          <div className="bg-white p-7 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#112734] flex items-center gap-2 font-anek">
                <BookOpen size={20} className="text-amber-600" />
                কোর্স কারিকুলাম ও লেকচার তালিকা
              </h3>
              <span className="text-xs text-[#8a817c] font-bold font-noto">
                {course.lessons.length} টি পাঠ
              </span>
            </div>

            <div className="divide-y divide-[#ece8e0]">
              {course.lessons.map((lesson, idx) => (
                <div key={lesson.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#112734] font-bold text-xs flex items-center justify-center shrink-0 font-anek">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#2c3e50] font-noto">{lesson.title}</h4>
                      <span className="text-[11px] text-[#8a817c] font-noto">{lesson.duration}</span>
                    </div>
                  </div>

                  <div>
                    {lesson.isFreePreview ? (
                      <button
                        onClick={() => {
                          if (lesson.videoUrl) {
                            setActiveVideoModalUrl(lesson.videoUrl);
                          } else {
                            setIsPlayingHeroVideo(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className="text-xs font-bold text-[#23626F] hover:text-[#112734] bg-[#17A2B8]/10 hover:bg-[#17A2B8]/15 px-3 py-1 rounded-lg border border-[#17A2B8]/30 flex items-center gap-1 font-tiro transition-colors"
                      >
                        <PlayCircle size={14} />
                        <span>ফ্রি প্রিভিউ</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-tiro flex items-center gap-1">
                        লকড পাঠ
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Instructor Profile & Guarantee */}
        <div className="lg:col-span-4 space-y-6">
          {/* Instructor Box */}
          <div className="bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4">
            <h4 className="text-xs font-extrabold uppercase text-[#0f8293] tracking-wider font-tiro">
              কোর্স ইন্সট্রাক্টর
            </h4>
            <div className="flex items-center gap-4">
              <img
                src={course.instructor.avatar}
                alt={course.instructor.nameBn}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#17A2B8]"
              />
              <div>
                <h5 className="font-extrabold text-base text-[#2c3e50] font-anek">{course.instructor.nameBn}</h5>
                <p className="text-xs text-[#112734] font-bold font-noto">{course.instructor.title}</p>
                <p className="text-[11px] text-[#8a817c] mt-0.5 font-noto">{course.instructor.roleBn}</p>
              </div>
            </div>
            <p className="text-xs text-[#5a524d] leading-relaxed pt-2 border-t border-[#ece8e0] font-noto">
              {course.instructor.bio}
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] text-[#8a817c] font-tiro block">ইন্সট্রাক্টরের সাথে সরাসরি যোগাযোগ:</span>
              <TeacherContactButtons
                name={course.instructor.nameBn}
                phone="+8801855905185"
                email="noorfiqhaca@gmail.com"
              />
            </div>
          </div>

          {/* Certificate Badge Card */}
          <div className="bg-[#17A2B8]/10/70 border border-[#17A2B8]/30/80 p-6 rounded-3xl space-y-3 text-center">
            <Award size={36} className="text-amber-600 mx-auto" />
            <h4 className="font-bold text-sm text-[#112734] font-anek">অফিসিয়াল সার্টিফিকেট</h4>
            <p className="text-xs text-[#5a524d] leading-relaxed font-noto">
              কোর্সটি সফলভাবে শেষ করার পর নূর ফিকহ একাডেমি কর্তৃক ভেরিফায়েড প্রফেশনাল সনদপত্র প্রদান করা হবে।
            </p>
          </div>

          {/* FAQ Widget in Sidebar */}
          <div className="bg-white border border-[#ece8e0] p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-3">
              <HelpCircle size={18} className="text-[#17A2B8]" />
              <h4 className="font-extrabold text-sm text-[#112734] font-anek">সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)</h4>
            </div>
            <div className="space-y-3">
              {faqs.slice(0, 4).map((faq, idx) => (
                <details key={faq.id || idx} className="group bg-[#fdfcf9] rounded-xl p-3 border border-[#ece8e0] text-xs">
                  <summary className="font-bold text-[#2c3e50] cursor-pointer flex items-center justify-between gap-2 font-anek">
                    <span>{faq.q}</span>
                    <ChevronDown size={14} className="group-open:rotate-180 transition-transform shrink-0" />
                  </summary>
                  <p className="mt-2 text-[#5a524d] leading-relaxed font-tiro pt-2 border-t border-slate-100">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
            <div className="text-center pt-2">
              <a href="/faq" className="text-xs font-bold text-[#17A2B8] hover:underline font-tiro">
                সবগুলো প্রশ্ন ও উত্তর দেখুন →
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section: অন্যান্য প্রোগ্রাম / আমাদের আরও কিছু বিশেষায়িত কোর্স (With Slider & Navigation Arrows) */}
      {otherCourses.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 mt-6">
          <div className="border-t border-[#ece8e0] pt-10">
            {/* Header with Title & Arrow Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-[#112734] uppercase tracking-wider block font-tiro mb-1">
                  অন্যান্য প্রোগ্রাম
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#112734] font-anek tracking-tight">
                  আমাদের আরও কিছু বিশেষায়িত কোর্স
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#112734] text-[#112734] hover:bg-[#112734] hover:text-white transition-all text-xs sm:text-sm font-bold font-tiro shadow-xs group"
                >
                  <span>সকল কোর্স দেখুন</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {/* Left & Right Scroll Buttons (< and >) */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleScrollLeft}
                    className="w-9 h-9 rounded-full bg-white hover:bg-[#17A2B8]/10 border border-slate-200 hover:border-[#17A2B8] text-slate-700 hover:text-[#112734] shadow-sm flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-[#17A2B8]/500/20 active:scale-95 cursor-pointer"
                    aria-label="Previous courses"
                    title="আগের কোর্সগুলো দেখুন"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleScrollRight}
                    className="w-9 h-9 rounded-full bg-white hover:bg-[#17A2B8]/10 border border-slate-200 hover:border-[#17A2B8] text-slate-700 hover:text-[#112734] shadow-sm flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-[#17A2B8]/500/20 active:scale-95 cursor-pointer"
                    aria-label="Next courses"
                    title="পরের কোর্সগুলো দেখুন"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal Course Slider Track */}
            <div
              ref={sliderRef}
              className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-3 px-1"
            >
              {otherCourses.map((c) => (
                <div
                  key={c.id}
                  className="w-[280px] sm:w-[330px] md:w-[360px] shrink-0 snap-start flex flex-col"
                >
                  <CourseCard
                    course={c}
                    onEnroll={(item) => setSelectedCourseForEnroll(item)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Video Modal if Opened from Curriculum */}
      {activeVideoModalUrl && modalEmbed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-950 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="p-4 bg-[#112734] text-white flex items-center justify-between">
              <h4 className="text-sm font-bold font-anek flex items-center gap-2">
                <PlayCircle size={16} className="text-[#17A2B8]" />
                <span>ভিডিও প্রিভিউ প্লেয়ার</span>
              </h4>
              <button
                onClick={() => setActiveVideoModalUrl(null)}
                className="p-1 rounded-lg bg-[#23626F] hover:bg-[#23626F] text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="relative aspect-video bg-black">
              {modalEmbed.type === 'video' ? (
                <video
                  src={modalEmbed.embedUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <iframe
                  src={modalEmbed.embedUrl}
                  title="Video Player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal for Main Course */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          item={{
            id: course.id,
            title: course.title,
            titleBn: course.titleBn,
            price: course.price,
            type: 'course'
          }}
        />
      )}

      {/* Payment Modal for Other Selected Course from Slider */}
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
    </div>
  );
}
