'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppStore } from '@/lib/store';
import { Course, SiteReview } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { CourseCard } from '@/components/CourseCard';
import { PaymentModal } from '@/components/PaymentModal';
import { TeacherContactButtons } from '@/components/TeacherContactButtons';
import { formatImageUrl, handleImageError, isValidImageUrl } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
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
  HelpCircle,
  Send,
  UserCheck,
  Edit3,
  MapPin
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

interface CourseDetailClientProps {
  id?: string;
}

export default function CourseDetailClient({ id }: CourseDetailClientProps) {
  const { user, isAdmin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const rawId = id || (params?.id as string);
  
  const [activeCourseId, setActiveCourseId] = useState<string>(() => {
    if (rawId && rawId !== '[id]' && rawId !== '%5Bid%5D' && rawId !== 'detail') return rawId;
    if (typeof window !== 'undefined') {
      const sId = new URLSearchParams(window.location.search).get('id');
      if (sId) return sId;
      const pId = window.location.pathname.replace(/\/+$/, '').split('/').pop() || '';
      if (pId && pId !== 'detail' && pId !== 'courses') return pId;
    }
    return '';
  });

  useEffect(() => {
    if (!activeCourseId && typeof window !== 'undefined') {
      const sId = new URLSearchParams(window.location.search).get('id');
      const pId = window.location.pathname.replace(/\/+$/, '').split('/').pop() || '';
      const fallbackId = sId || (pId && pId !== 'detail' && pId !== 'courses' ? pId : '');
      if (fallbackId) {
        setActiveCourseId(fallbackId);
      }
    }
  }, [activeCourseId]);

  const courseId = activeCourseId;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [otherCourses, setOtherCourses] = useState<Course[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<Course | null>(null);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    let isSubscribed = true;

    // 1. Initial local lookup
    const currentCourse = AppStore.getCourseById(courseId) || null;
    const all = AppStore.getCourses();
    setCourse(currentCourse);
    setOtherCourses(all.filter(c => c.id !== courseId));

    const settings = AppStore.getSettings();
    if (settings.faqs) {
      setFaqs(settings.faqs);
    }

    // 2. Direct Firestore fallback if not in local store yet
    if (!currentCourse && courseId) {
      setIsLoaded(false);
      getDoc(doc(db, 'courses', courseId)).then(docSnap => {
        if (docSnap.exists() && isSubscribed) {
          const fetched = { id: docSnap.id, ...docSnap.data() } as Course;
          setCourse(fetched);
          AppStore.saveCourse(fetched);
        }
      }).catch(err => {
        console.warn('Direct firestore course fetch error:', err);
      }).finally(() => {
        if (isSubscribed) {
          setIsLoaded(true);
        }
      });
    } else {
      setIsLoaded(true);
    }

    // 3. Realtime snapshot listener for this course
    let unsubSnapshot: (() => void) | null = null;
    if (courseId) {
      try {
        unsubSnapshot = onSnapshot(doc(db, 'courses', courseId), (docSnap) => {
          if (docSnap.exists() && isSubscribed) {
            const liveCourse = { id: docSnap.id, ...docSnap.data() } as Course;
            setCourse(liveCourse);
            AppStore.saveCourse(liveCourse);
          }
        }, (err) => {
          console.warn('Course snapshot listener error:', err);
        });
      } catch (e) {
        console.warn('Failed to attach course snapshot listener:', e);
      }
    }

    const handleUpdate = () => {
      if (!isSubscribed) return;
      const updatedCourse = AppStore.getCourseById(courseId) || null;
      const allUpdated = AppStore.getCourses();
      setCourse(updatedCourse);
      setOtherCourses(allUpdated.filter(c => c.id !== courseId));
      const s = AppStore.getSettings();
      if (s.faqs) setFaqs(s.faqs);
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('noorfiqh_courses_updated', handleUpdate);
    return () => {
      isSubscribed = false;
      if (unsubSnapshot) unsubSnapshot();
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('noorfiqh_courses_updated', handleUpdate);
    };
  }, [courseId]);

  // Reviews & Feedback State
  const [reviews, setReviews] = useState<SiteReview[]>(() => AppStore.getReviews());
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userReview, setUserReview] = useState<SiteReview | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRole, setReviewRole] = useState('কোর্স শিক্ষার্থী');
  const [reviewLocation, setReviewLocation] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  // Bengali number converter helper
  const toBengaliNumber = (num: number | string) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
  };

  // Instructor Edit State (For Admin)
  const [showInstructorEditModal, setShowInstructorEditModal] = useState(false);
  const [instructorEditData, setInstructorEditData] = useState({
    nameBn: '',
    title: '',
    roleBn: '',
    avatar: '',
    bio: ''
  });
  const [isSavingInstructor, setIsSavingInstructor] = useState(false);

  const handleSaveInstructor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!course) return;
    setIsSavingInstructor(true);
    try {
      const updatedInstructor = {
        id: course.instructor?.id || 'inst-1',
        name: instructorEditData.nameBn.trim() || course.instructor?.name || 'মুফতী আম্মার বিন নূর',
        nameBn: instructorEditData.nameBn.trim() || 'মুফতী আম্মার বিন নূর',
        title: instructorEditData.title.trim() || 'মুহাদ্দিস ও ফকিহ',
        roleBn: instructorEditData.roleBn.trim() || 'দারুল উলুম দেওবন্দ',
        avatar: instructorEditData.avatar.trim() || course.instructor?.avatar || '',
        bio: instructorEditData.bio.trim() || course.instructor?.bio || 'নূর ফিকহ একাডেমির সিনিয়র ফ্যাকাল্টি সদস্য।'
      };
      const updatedCourse: Course = {
        ...course,
        instructor: updatedInstructor
      };
      AppStore.saveCourse(updatedCourse);
      setCourse(updatedCourse);
      setShowInstructorEditModal(false);
    } catch (err) {
      console.error('Failed to save instructor:', err);
      alert('ইন্সট্রাক্টরের তথ্য সংরক্ষণে ত্রুটি হয়েছে।');
    } finally {
      setIsSavingInstructor(false);
    }
  };

  // Sync reviews with store & events
  useEffect(() => {
    const handleReviewsUpdate = () => {
      setReviews(AppStore.getReviews());
    };
    window.addEventListener('noorfiqh_reviews_updated', handleReviewsUpdate);
    window.addEventListener('storage', handleReviewsUpdate);
    return () => {
      window.removeEventListener('noorfiqh_reviews_updated', handleReviewsUpdate);
      window.removeEventListener('storage', handleReviewsUpdate);
    };
  }, []);

  // Determine enrollment & user review
  useEffect(() => {
    if (!user || !course) {
      setIsEnrolled(false);
      setUserReview(null);
      return;
    }
    const allOrders = AppStore.getOrders();
    const enrolled = allOrders.some(o => 
      (o.userId === user.uid || (o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase())) &&
      o.status === 'approved' &&
      o.itemType === 'course' &&
      o.itemId === course.id
    );
    setIsEnrolled(enrolled || Boolean(isAdmin));

    const existingReview = reviews.find(r => 
      (r.userId === user.uid || (r.userEmail && r.userEmail.toLowerCase() === user.email.toLowerCase())) &&
      (r.courseId === course.id || (r.courseTitle && course.titleBn && r.courseTitle.toLowerCase().includes(course.titleBn.toLowerCase())))
    );
    setUserReview(existingReview || null);
    if (existingReview) {
      setReviewRating(existingReview.rating || 5);
      setReviewContent(existingReview.content || '');
      setReviewRole(existingReview.role || 'কোর্স শিক্ষার্থী');
      setReviewLocation(existingReview.location || '');
    }
  }, [user, course, reviews, isAdmin]);

  const handleSubmitReview = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      alert('অনুগ্রহ করে প্রথমে লগইন করুন');
      return;
    }
    if (!reviewContent.trim()) {
      alert('অনুগ্রহ করে আপনার মূল্যবান রিভিউ বা অভিজ্ঞতা লিখুন');
      return;
    }
    if (!course) return;

    setIsSubmittingReview(true);
    try {
      const existing = reviews.find(r => 
        (r.userId === user.uid || (r.userEmail && r.userEmail.toLowerCase() === user.email.toLowerCase())) &&
        (r.courseId === course.id || (r.courseTitle && course.titleBn && r.courseTitle.toLowerCase().includes(course.titleBn.toLowerCase())))
      );

      const revId = existing ? existing.id : `rev-${Date.now()}`;
      const newReview: SiteReview = {
        id: revId,
        name: user.name || 'শিক্ষার্থী',
        nameBn: user.name || 'শিক্ষার্থী',
        role: reviewRole.trim() || 'কোর্স শিক্ষার্থী',
        location: reviewLocation.trim(),
        rating: reviewRating,
        content: reviewContent.trim(),
        courseId: course.id,
        courseTitle: course.titleBn,
        userId: user.uid,
        userEmail: user.email,
        avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'Student')}`,
        createdAt: new Date().toLocaleDateString('bn-BD')
      };

      AppStore.saveReview(newReview);
      const allUpdatedReviews = AppStore.getReviews();
      setReviews(allUpdatedReviews);

      // Dynamically recalculate and update the course rating based on student reviews
      const updatedCourseReviews = allUpdatedReviews.filter(r => 
        (r.courseId && r.courseId === course.id) ||
        (r.courseTitle && course.titleBn && (r.courseTitle.trim().toLowerCase() === course.titleBn.trim().toLowerCase() || r.courseTitle.toLowerCase().includes(course.titleBn.toLowerCase())))
      );
      if (updatedCourseReviews.length > 0) {
        const newAvg = Number((updatedCourseReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / updatedCourseReviews.length).toFixed(1));
        const updatedCourse = { ...course, rating: newAvg };
        AppStore.saveCourse(updatedCourse);
        setCourse(updatedCourse);
      }

      setReviewSuccessMsg('মাশাআল্লাহ! আপনার কোর্স রিভিউ সফলভাবে জমা হয়েছে।');
      setTimeout(() => {
        setReviewSuccessMsg(null);
        setShowReviewModal(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('রিভিউ জমা দিতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5: return '৫/৫ - অসাধারণ ও সেরা অভিজ্ঞতা';
      case 4: return '৪/৫ - খুব ভালো ও ফলপ্রসূ';
      case 3: return '৩/৫ - ভালো ও সন্তোষজনক';
      case 2: return '২/৫ - মোটামুটি মানের';
      case 1: return '১/৫ - প্রত্যাশা অনুযায়ী নয়';
      default: return `${stars}/৫`;
    }
  };
  
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
    if (!isLoaded) {
      return (
        <div className="min-h-screen bg-[#fdfcf9] flex flex-col items-center justify-center p-6 text-center font-noto">
          <div className="w-10 h-10 border-4 border-[#17A2B8] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-bold text-[#112734]">কোর্স লোড হচ্ছে...</p>
        </div>
      );
    }
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
  const effectiveVideoUrl = course.previewVideoUrl || (course.lessons || []).find(l => l.videoUrl)?.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const heroEmbed = getEmbedInfo(effectiveVideoUrl, true);
  const modalEmbed = activeVideoModalUrl ? getEmbedInfo(activeVideoModalUrl, true) : null;

  // Filter reviews for this course
  const courseReviews = reviews.filter(r => {
    if (!course) return false;
    if (r.courseId && r.courseId === course.id) return true;
    if (r.courseTitle && course.titleBn && (r.courseTitle.trim().toLowerCase() === course.titleBn.trim().toLowerCase() || r.courseTitle.toLowerCase().includes(course.titleBn.toLowerCase()) || course.titleBn.toLowerCase().includes(r.courseTitle.toLowerCase()))) return true;
    if (r.courseTitle && course.title && (r.courseTitle.trim().toLowerCase() === course.title.trim().toLowerCase() || r.courseTitle.toLowerCase().includes(course.title.toLowerCase()) || course.title.toLowerCase().includes(r.courseTitle.toLowerCase()))) return true;
    return false;
  });

  const totalReviewsCount = courseReviews.length;
  const avgRatingNumber = totalReviewsCount > 0
    ? (courseReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / totalReviewsCount)
    : (Number(course?.rating) || 5.0);
  const avgRating = avgRatingNumber.toFixed(1);

  return (
    <div className="min-h-screen bg-[#fdfcf9] font-noto text-[#2c3e50] pb-24">
      {/* Top Breadcrumb Header */}
      <div className="bg-[#112734] text-white py-10 sm:py-14 px-4 sm:px-8 border-b border-[#23626F]">
        <div className="max-w-7xl mx-auto space-y-6">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#17A2B8]/80 hover:text-[#17A2B8] transition-colors font-tiro"
          >
            <ArrowLeft size={14} />
            <span>সকল কোর্সে ফিরে যান</span>
          </Link>

          {/* Responsive Layout Grid:
              - On Mobile (< lg): Course Preview Video Card is ORDER 1 (at the top), Course Title & Details are ORDER 2 (under the card)
              - On Desktop (lg): Left Col-6, Right Col-6 for an expanded, wider preview card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Course Information Block (Desktop: Left Col-6 / Mobile: Below Video Card) */}
            <div className="order-2 lg:order-1 lg:col-span-6 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1 bg-[#17A2B8] text-slate-950 text-xs font-extrabold rounded-full font-tiro shadow-xs">
                  {course.badge || 'প্রামাণ্য কোর্স'}
                </span>
                <span className="px-3 py-1 bg-[#112734] text-[#17A2B8] text-xs font-bold rounded-lg border border-[#23626F] font-tiro">
                  {course.categoryLabelBn}
                </span>
                <span className="text-xs text-[#17A2B8]/90 font-noto">• স্তর: {course.levelBn}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight font-anek">
                {course.titleBn || course.title}
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-3xl font-noto">
                {course.shortDescription}
              </p>

              {/* Rating & Stats - Dynamically Counted from Student Reviews */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 text-xs sm:text-sm text-[#17A2B8]/90 font-semibold font-noto">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <span>
                    {toBengaliNumber(avgRating)} ({totalReviewsCount > 0 ? `${toBengaliNumber(totalReviewsCount)} টি ছাত্র রিভিউ` : '০ টি রিভিউ • নতুন কোর্স'})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#23626F]/40 px-3 py-1.5 rounded-xl border border-[#23626F]/60">
                  <Clock size={15} />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#23626F]/40 px-3 py-1.5 rounded-xl border border-[#23626F]/60">
                  <BookOpen size={15} />
                  <span>{toBengaliNumber(course.totalLessons)} টি বিস্তারিত লেকচার</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#23626F]/40 px-3 py-1.5 rounded-xl border border-[#23626F]/60">
                  <Award size={15} className="text-[#17A2B8]" />
                  <span>সার্টিফিকেট অন্তর্ভুক্ত</span>
                </div>
              </div>
            </div>

            {/* Sleek, Wider & Compact Course Preview Card (Desktop: Right Col-6 / Mobile: Top Order-1) */}
            <div className="order-1 lg:order-2 lg:col-span-6 w-full bg-white text-[#2c3e50] p-2.5 sm:p-3 rounded-2xl shadow-2xl border border-[#17A2B8]/20 lg:sticky lg:top-24 space-y-2.5">
              
              {/* High-Impact Video Player / Thumbnail (Directly attached to card with minimal padding) */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 shadow-md border border-slate-800 group">
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
                      type="button"
                      onClick={() => setIsPlayingHeroVideo(false)}
                      className="absolute top-2.5 right-2.5 px-2.5 py-1.5 bg-black/80 hover:bg-black text-white rounded-lg text-xs flex items-center gap-1.5 z-10 transition-colors shadow-md border border-white/20 cursor-pointer"
                      title="থাম্বনেইল ছবিতে ফিরে যান"
                    >
                      <RotateCcw size={13} />
                      <span className="text-[11px] font-tiro">ছবি দেখুন</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {formatImageUrl(course.thumbnail) ? (
                      <img
                        src={formatImageUrl(course.thumbnail) || null}
                        alt={course.titleBn}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => handleImageError(e, course.thumbnail)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#112734] via-[#1a3848] to-[#23626F] flex items-center justify-center text-amber-300">
                        <span className="text-arabic text-5xl font-black">ن</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-3.5">
                      <div className="flex justify-between items-start">
                        <span className="bg-[#112734]/90 text-[#17A2B8] border border-[#17A2B8]/40 text-xs font-bold font-tiro px-3 py-0.5 rounded-full backdrop-blur-md shadow">
                          ভিডিও ট্রেলার
                        </span>
                        {course.originalPrice && course.originalPrice > course.price && (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-600/90 text-white text-xs font-bold font-noto shadow">
                            {toBengaliNumber(Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100))}% ছাড়
                          </span>
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setIsPlayingHeroVideo(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white/95 hover:bg-white text-[#112734] font-black rounded-xl shadow-lg transition-all transform group-hover:scale-[1.01] font-tiro text-xs sm:text-sm cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#112734] text-[#17A2B8] flex items-center justify-center shadow">
                          <PlayCircle size={18} className="fill-amber-300 text-[#112734]" />
                        </div>
                        <span>ভিডিও প্লে করুন</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Price & Savings Row (Snug right below video) */}
              <div className="flex items-center justify-between px-1 pt-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#112734] font-anek">৳{toBengaliNumber(course.price)}</span>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <span className="text-sm text-[#8a817c] line-through font-noto">৳{toBengaliNumber(course.originalPrice)}</span>
                  )}
                </div>
                {course.originalPrice && course.originalPrice > course.price && (
                  <span className="text-xs text-emerald-700 font-bold font-noto bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    ৳{toBengaliNumber(course.originalPrice - course.price)} সাশ্রয়
                  </span>
                )}
              </div>

              {/* Enrollment Action Button - Only "এখনই এনরোল করুন।" as requested */}
              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-[#112734] via-[#1b3d52] to-[#23626F] hover:brightness-110 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm sm:text-base font-tiro active:scale-[0.99] cursor-pointer"
              >
                <Sparkles size={17} className="text-[#17A2B8]" />
                <span>এখনই এনরোল করুন।</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details & Syllabus */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Description, Objectives, Syllabus */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Objectives (এই কোর্সে যা যা শিখবেন) */}
          {(course.objectives && course.objectives.length > 0) && (
            <div className="bg-white p-7 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-[#112734] flex items-center gap-2 font-anek">
                  <CheckCircle2 size={20} className="text-amber-600" />
                  এই কোর্সে যা যা শিখবেন
                </h3>
              </div>
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
          )}

          {/* Full Course Description */}
          <div className="bg-white p-7 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4">
            <h3 className="text-xl font-extrabold text-[#112734] font-anek">
              কোর্স পরিচিতি ও বিস্তারিত বিষয়াবলি
            </h3>
            <div className="text-sm sm:text-base text-[#5a524d] leading-relaxed whitespace-pre-line font-noto">
              {course.description || course.shortDescription || 'কোর্সের বিস্তারিত তথ্য শীঘ্রই যুক্ত করা হচ্ছে।'}
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
                {(course.lessons || []).length} টি পাঠ
              </span>
            </div>

            <div className="divide-y divide-[#ece8e0]">
              {(course.lessons && course.lessons.length > 0) ? (
                course.lessons.map((lesson, idx) => (
                  <div key={lesson.id || idx} className="py-4 flex items-center justify-between gap-4">
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
                ))
              ) : (
                <div className="py-6 text-center text-xs text-[#8a817c]">
                  শীঘ্রই পাঠ্যসূচি ও লেকচার তালিকা উন্মুক্ত করা হবে।
                </div>
              )}
            </div>
          </div>

          {/* Student Reviews Section (শিক্ষার্থীদের মূল্যায়ন ও রিভিউ) */}
          <div className="bg-white p-7 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ece8e0] pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star size={20} className="text-amber-500 fill-amber-500" />
                  <h3 className="text-xl font-extrabold text-[#112734] font-anek">
                    শিক্ষার্থীদের মূল্যায়ন ও রিভিউ
                  </h3>
                </div>
                <p className="text-xs text-[#8a817c] font-noto">
                  এই কোর্সে অংশগ্রহণকারী শিক্ষার্থীদের বাস্তব অভিজ্ঞতা ও পর্যালোচনা
                </p>
              </div>

              {/* Action Button for Enrolled Students */}
              {isEnrolled ? (
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl text-xs transition-colors shadow-2xs shrink-0 font-anek cursor-pointer"
                >
                  <Star size={15} className="fill-amber-500 text-amber-500" />
                  <span>{userReview ? 'আপনার রিভিউ সম্পাদনা করুন' : 'কোর্সের রিভিউ লিখুন ⭐'}</span>
                </button>
              ) : (
                <Link
                  href={user ? "/dashboard?tab=courses" : "/login"}
                  className="inline-flex items-center gap-1.5 text-xs text-[#23626F] hover:text-[#112734] font-bold font-noto"
                >
                  <span>ড্যাশবোর্ড থেকে রিভিউ দিন</span>
                  <ChevronRight size={14} />
                </Link>
              )}
            </div>

            {/* Overall Rating Stats Header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 sm:p-6 rounded-2xl bg-[#faf8f5] border border-[#ece8e0] items-center">
              {/* Evaluated Students Count (বড় করে) */}
              <div className="text-center sm:border-r border-[#ece8e0] sm:pr-4 space-y-1">
                <span className="text-[11px] font-bold text-[#0f8293] uppercase tracking-wider font-tiro block">
                  মোট শিক্ষার্থী মূল্যায়ন
                </span>
                <div className="text-4xl sm:text-5xl font-black text-[#112734] font-anek tracking-tight">
                  {toBengaliNumber(totalReviewsCount)} <span className="text-lg font-bold text-[#5a524d]">জন</span>
                </div>
                <p className="text-xs text-[#8a817c] font-noto">
                  {totalReviewsCount > 0 ? 'সরাসরি মতামত প্রদান করেছেন' : 'কোর্স সম্পন্ন করে মূল্যায়ন দিন'}
                </p>
              </div>

              {/* Average Rating Score */}
              <div className="text-center sm:border-r border-[#ece8e0] sm:px-4 space-y-1">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider font-tiro block">
                  গড় মূল্যায়ন স্কোর
                </span>
                <div className="text-3xl sm:text-4xl font-black text-amber-500 font-anek tracking-tight">
                  {toBengaliNumber(avgRating)} <span className="text-sm font-bold text-slate-400">/ ৫.০</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      className={s <= Math.round(Number(avgRating)) ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-2 sm:pl-4">
                <div className="flex items-center justify-between text-xs font-bold text-[#5a524d] font-noto">
                  <span>কোর্স সন্তুষ্টির হার</span>
                  <span className="text-emerald-700 font-bold">
                    {totalReviewsCount > 0 
                      ? `${toBengaliNumber(Math.round((courseReviews.filter(r => (r.rating || 5) >= 4).length / totalReviewsCount) * 100))}% ইতিবাচক অভিজ্ঞতা`
                      : '১০০% প্রামাণ্য পাঠ্যক্রম'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: totalReviewsCount > 0 
                        ? `${Math.max(10, Math.round((courseReviews.filter(r => (r.rating || 5) >= 4).length / totalReviewsCount) * 100))}%` 
                        : '100%' 
                    }} 
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#8a817c] font-noto">
                  <span>দলীলভিত্তিক পাঠ</span>
                  <span>সহজ উপস্থাপনা</span>
                  <span>সার্টিফিকেট সুবিধা</span>
                </div>
              </div>
            </div>

            {/* If enrolled, show a helpful highlight */}
            {isEnrolled && !userReview && (
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-amber-950 font-anek">আপনি এই কোর্সের একজন নিবন্ধিত শিক্ষার্থী</h5>
                    <p className="text-[11px] text-amber-800 font-noto">আপনার মূল্যবান অভিজ্ঞতা শেয়ার করুন যাতে অন্যরা উপকৃত হতে পারে।</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="px-3 py-1.5 bg-[#112734] hover:bg-[#23626F] text-white text-xs font-bold rounded-lg shrink-0 transition-colors font-anek cursor-pointer"
                >
                  রিভিউ দিন
                </button>
              </div>
            )}

            {/* Review Cards List */}
            {courseReviews.length > 0 ? (
              <div className="space-y-4">
                {courseReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-white border border-[#ece8e0] hover:border-[#17A2B8]/40 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#ece8e0] shrink-0 bg-slate-100 flex items-center justify-center">
                          {rev.avatar && isValidImageUrl(rev.avatar) && formatImageUrl(rev.avatar) ? (
                            <img
                              src={formatImageUrl(rev.avatar) || null}
                              alt={rev.nameBn || rev.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#112734] text-amber-300 font-bold text-sm flex items-center justify-center font-anek">
                              {(rev.nameBn || rev.name || 'র').charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-extrabold text-sm text-[#112734] font-anek">
                              {rev.nameBn || rev.name}
                            </h5>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-noto">
                              <CheckCircle2 size={10} />
                              <span>ভেরিফাইড শিক্ষার্থী</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-[#8a817c] font-noto flex items-center gap-1.5 flex-wrap">
                            {rev.role && <span>{rev.role}</span>}
                            {rev.role && rev.location && <span className="text-slate-300">•</span>}
                            {rev.location && (
                              <span className="inline-flex items-center gap-0.5 text-[#0f8293] font-semibold">
                                <MapPin size={11} />
                                {rev.location}
                              </span>
                            )}
                            {!rev.role && !rev.location && <span>কোর্স শিক্ষার্থী</span>}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-0.5 text-amber-500 justify-end">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={13}
                              className={star <= (rev.rating || 5) ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}
                            />
                          ))}
                        </div>
                        {rev.createdAt && (
                          <span className="text-[10px] text-[#8a817c] block mt-0.5 font-noto">
                            {rev.createdAt}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#5a524d] leading-relaxed font-noto bg-[#faf8f5]/60 p-3.5 rounded-xl border border-[#ece8e0]/60">
                      &ldquo;{rev.content}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center bg-[#faf8f5] rounded-2xl border border-dashed border-[#ece8e0] p-6 space-y-3">
                <Star size={32} className="mx-auto text-amber-400/80" />
                <div className="space-y-1">
                  <h5 className="font-bold text-sm text-[#2c3e50] font-anek">এখনও কোনো রিভিউ যুক্ত হয়নি</h5>
                  <p className="text-xs text-[#8a817c] font-noto max-w-md mx-auto">
                    {isEnrolled 
                      ? 'আপনি এই কোর্সে ভর্তি হয়েছেন। আপনার মূল্যবান অনুভূতি প্রকাশ করতে প্রথম রিভিউটি লিখুন!' 
                      : 'কোর্সটিতে যারা ভর্তি হয়েছেন তারা তাদের শিক্ষার্থী ড্যাশবোর্ড থেকে কোর্স রিভিউ প্রদান করতে পারেন।'}
                  </p>
                </div>
                {isEnrolled ? (
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#112734] hover:bg-[#23626F] text-white text-xs font-bold rounded-xl shadow-xs transition-colors font-anek cursor-pointer"
                  >
                    <Star size={14} className="text-amber-400" />
                    <span>প্রথম রিভিউ লিখুন</span>
                  </button>
                ) : (
                  <Link
                    href={user ? "/dashboard?tab=courses" : "/login"}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-[#112734] border border-[#ece8e0] text-xs font-bold rounded-xl shadow-2xs transition-colors font-noto"
                  >
                    <span>ড্যাশবোর্ডে যান</span>
                    <ChevronRight size={13} />
                  </Link>
                )}
              </div>
            )}
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
              {course.instructor?.avatar && isValidImageUrl(course.instructor.avatar) && formatImageUrl(course.instructor.avatar) ? (
                <img
                  src={formatImageUrl(course.instructor.avatar) || null}
                  alt={course.instructor?.nameBn || 'মুফতী আম্মার বিন নূর'}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => handleImageError(e, course.instructor?.avatar)}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#17A2B8] shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#112734] to-[#23626F] text-amber-300 flex items-center justify-center font-bold text-2xl font-anek border-2 border-[#17A2B8] shrink-0 shadow-sm">
                  {(course.instructor?.nameBn || 'মু').charAt(0)}
                </div>
              )}
              <div className="space-y-0.5">
                <h5 className="font-extrabold text-base text-[#2c3e50] font-anek">{course.instructor?.nameBn || 'মুফতী আম্মার বিন নূর'}</h5>
                <p className="text-xs text-[#112734] font-bold font-noto">{course.instructor?.title || 'মুহাদ্দিস ও ফকিহ'}</p>
                <div className="pt-0.5">
                  <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-md text-[11px] font-bold font-noto">
                    {course.instructor?.roleBn || 'দারুল উলুম দেওবন্দ'}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#5a524d] leading-relaxed pt-2 border-t border-[#ece8e0] font-noto">
              {course.instructor?.bio || 'নূর ফিকহ একাডেমির সিনিয়র ফ্যাকাল্টি সদস্য।'}
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] text-[#8a817c] font-tiro block">ইন্সট্রাক্টরের সাথে সরাসরি যোগাযোগ:</span>
              <TeacherContactButtons
                name={course.instructor?.nameBn || 'মুফতী আম্মার বিন নূর'}
                phone={course.instructor?.phone || "+8801348161517"}
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

      {/* Course Review Modal */}
      {showReviewModal && course && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 border border-[#ece8e0] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#ece8e0] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Star size={18} className="fill-amber-600 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-[#112734] font-anek">
                    {userReview ? 'রিভিউ সম্পাদনা করুন' : 'কোর্স রিভিউ প্রদান করুন'}
                  </h4>
                  <p className="text-[11px] text-[#8a817c] font-noto truncate max-w-[260px]">{course.titleBn}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-[#8a817c] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {reviewSuccessMsg ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h5 className="font-bold text-sm text-emerald-950 font-anek">{reviewSuccessMsg}</h5>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Interactive Star Picker */}
                <div className="space-y-1.5 text-center py-3 px-4 bg-[#faf8f5] rounded-2xl border border-[#ece8e0]">
                  <label className="text-xs font-bold text-[#5a524d] font-noto block">
                    আপনার সার্বিক রেটিং নির্বাচন করুন
                  </label>
                  <div className="flex items-center justify-center gap-2 py-1.5">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const active = (reviewHoverRating || reviewRating) >= s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onMouseEnter={() => setReviewHoverRating(s)}
                          onMouseLeave={() => setReviewHoverRating(0)}
                          onClick={() => setReviewRating(s)}
                          className="p-1 rounded-lg hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            size={30}
                            className={active ? 'fill-amber-500 text-amber-500 drop-shadow-xs' : 'text-slate-300'}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-extrabold text-amber-700 font-anek block">
                    {getRatingLabel(reviewHoverRating || reviewRating)}
                  </span>
                </div>

                {/* Review Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2c3e50] font-noto flex items-center justify-between">
                    <span>আপনার মূল্যবান রিভিউ বা অভিজ্ঞতা *</span>
                    <span className="text-[10px] text-[#8a817c]">বাংলায় লিখুন</span>
                  </label>
                  <textarea
                    rows={4}
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="কোর্সের পাঠদান, ফিক্বহী বিশ্লেষণ ও শিক্ষকের উপস্থাপন পদ্ধতি কেমন লেগেছে বিস্তারিত লিখুন..."
                    className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-[#ece8e0] focus:ring-2 focus:ring-[#17A2B8] focus:border-transparent outline-none font-noto resize-none"
                    required
                  />
                </div>

                {/* Student Designation / Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2c3e50] font-noto">
                      আপনার পদবি বা পরিচিতি (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      value={reviewRole}
                      onChange={(e) => setReviewRole(e.target.value)}
                      placeholder="যেমন: শিক্ষার্থী / শিক্ষক / আলেম"
                      className="w-full text-xs p-2.5 rounded-xl border border-[#ece8e0] focus:ring-2 focus:ring-[#17A2B8] outline-none font-noto"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#112734] font-noto flex items-center gap-1">
                      <MapPin size={12} className="text-[#0f8293]" />
                      <span>আপনার জেলা বা অবস্থান (ঐচ্ছিক)</span>
                    </label>
                    <input
                      type="text"
                      value={reviewLocation}
                      onChange={(e) => setReviewLocation(e.target.value)}
                      placeholder="যেমন: ঢাকা, চট্টগ্রাম, সিলেট, কুমিল্লা"
                      className="w-full text-xs p-2.5 rounded-xl border border-[#ece8e0] focus:ring-2 focus:ring-[#17A2B8] outline-none font-noto"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2.5 border border-[#ece8e0] text-[#5a524d] font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors font-noto cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !reviewContent.trim()}
                    className="px-5 py-2.5 bg-[#112734] hover:bg-[#23626F] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5 font-anek cursor-pointer"
                  >
                    <Send size={13} />
                    <span>{isSubmittingReview ? 'জমা হচ্ছে...' : (userReview ? 'রিভিউ আপডেট করুন' : 'রিভিউ জমা দিন')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Instructor Edit Modal (Admin Only) */}
      {showInstructorEditModal && course && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 border border-[#ece8e0] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#ece8e0] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-[#112734] font-anek">
                    ইন্সট্রাক্টরের তথ্য ও প্রতিষ্ঠান এডিট
                  </h4>
                  <p className="text-[11px] text-[#8a817c] font-noto">দারুল উলুম দেওবন্দ / বিশেষ পরিচিতি আপডেট করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstructorEditModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-[#8a817c] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveInstructor} className="space-y-4">
              {/* Institution / RoleBn (e.g., Darul Uloom Deoband) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#112734] font-noto block">
                  শিক্ষা প্রতিষ্ঠান / বিশেষ পরিচিতি *
                </label>
                <input
                  type="text"
                  value={instructorEditData.roleBn}
                  onChange={(e) => setInstructorEditData({ ...instructorEditData, roleBn: e.target.value })}
                  placeholder="যেমন: দারুল উলুম দেওবন্দ, আল-আজহার"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#ece8e0] focus:ring-2 focus:ring-[#17A2B8] outline-none font-noto font-bold text-amber-900 bg-amber-50/50"
                  required
                />
                <p className="text-[10px] text-[#8a817c] font-noto">এটি ইন্সট্রাক্টরের নামের নিচে হাইলাইট ব্যাজ হিসেবে প্রদর্শিত হবে।</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2c3e50] font-noto block">
                    ইন্সট্রাক্টরের নাম *
                  </label>
                  <input
                    type="text"
                    value={instructorEditData.nameBn}
                    onChange={(e) => setInstructorEditData({ ...instructorEditData, nameBn: e.target.value })}
                    placeholder="যেমন: মুফতী আম্মার বিন নূর"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#ece8e0] focus:ring-2 focus:ring-[#17A2B8] outline-none font-noto"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2c3e50] font-noto block">
                    পদবী / ডিগ্রি
                  </label>
                  <input
                    type="text"
                    value={instructorEditData.title}
                    onChange={(e) => setInstructorEditData({ ...instructorEditData, title: e.target.value })}
                    placeholder="যেমন: মুহাদ্দিস ও ফকিহ"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#ece8e0] focus:ring-2 focus:ring-[#17A2B8] outline-none font-noto"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2c3e50] font-noto block">
                  প্রোফাইল ছবির URL
                </label>
                <input
                  type="text"
                  value={instructorEditData.avatar}
                  onChange={(e) => setInstructorEditData({ ...instructorEditData, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#ece8e0] focus:ring-2 focus:ring-[#17A2B8] outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2c3e50] font-noto block">
                  সংক্ষিপ্ত পরিচিতি (Bio)
                </label>
                <textarea
                  rows={3}
                  value={instructorEditData.bio}
                  onChange={(e) => setInstructorEditData({ ...instructorEditData, bio: e.target.value })}
                  placeholder="ইন্সট্রাক্টরের সংক্ষিপ্ত পরিচিতি ও যোগ্যতা..."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#ece8e0] focus:ring-2 focus:ring-[#17A2B8] outline-none font-noto resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInstructorEditModal(false)}
                  className="px-4 py-2.5 border border-[#ece8e0] text-[#5a524d] font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors font-noto cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSavingInstructor}
                  className="px-5 py-2.5 bg-[#112734] hover:bg-[#23626F] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5 font-anek cursor-pointer"
                >
                  <CheckCircle2 size={13} />
                  <span>{isSavingInstructor ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
