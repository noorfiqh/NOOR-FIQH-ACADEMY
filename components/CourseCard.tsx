'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Course } from '@/lib/types';
import { Clock, BookOpen, Star, PlayCircle } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onEnroll?: (course: Course) => void;
}

export function CourseCard({ course, onEnroll }: CourseCardProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Check if preview video is YouTube, Vimeo, or direct
  const ytMatch = course.previewVideoUrl ? course.previewVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i) : null;
  const isDirectVideo = course.previewVideoUrl ? (course.previewVideoUrl.endsWith('.mp4') || course.previewVideoUrl.endsWith('.webm')) : false;

  return (
    <div className="bg-white rounded-3xl border border-[#ece8e0] overflow-hidden card-natural-shadow card-natural-shadow-hover transition-all duration-300 flex flex-col group h-full">
      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        {isVideoPlaying && ytMatch ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${ytMatch[1]}&rel=0&controls=0`}
            title={course.titleBn || course.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="w-full h-full border-0 pointer-events-none"
          />
        ) : isVideoPlaying && isDirectVideo ? (
          <video
            src={course.previewVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={course.thumbnail}
            alt={course.titleBn || course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 pointer-events-none" />
        
        {course.badge && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-[#23626F]/90 text-emerald-100 text-[10px] font-bold rounded-lg border border-[#17A2B8]/40 shadow-sm font-tiro pointer-events-none">
            {course.badge}
          </span>
        )}

        {course.previewVideoUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsVideoPlaying(!isVideoPlaying);
            }}
            className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black text-[#17A2B8] rounded-lg text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm transition-all"
            title="ভিডিও প্রিভিউ"
          >
            <PlayCircle size={14} className="fill-amber-400 text-slate-950" />
            <span className="font-tiro">{isVideoPlaying ? 'ছবি দেখুন' : 'ভিডিও'}</span>
          </button>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-medium pointer-events-none">
          <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md font-tiro">
            <Clock size={12} className="text-[#17A2B8]" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md font-tiro">
            <BookOpen size={12} className="text-[#17A2B8]" />
            {course.totalLessons} টি পাঠ
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex flex-col flex-grow">
        <Link href={`/courses/${course.id}`} className="group-hover:text-[#112734] transition-colors">
          <h3 className="font-extrabold text-base sm:text-lg text-[#112734] leading-snug line-clamp-2 mb-1.5 font-anek">
            {course.titleBn || course.title}
          </h3>
        </Link>

        <p className="text-xs text-[#6b7280] line-clamp-1 leading-relaxed mb-3 font-tiro">
          {course.duration} বিশেষায়িত কোর্স
        </p>

        {/* Rating & Students */}
        <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold mb-3 font-tiro">
          <Star size={13} className="fill-amber-400 text-[#17A2B8]" />
          <span>{course.rating}</span>
          <span className="text-[#8a817c] font-normal">({course.totalStudents}+ শিক্ষার্থী)</span>
        </div>

        {/* Price display */}
        <div className="mt-auto pt-2 border-t border-slate-100 mb-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#112734] font-anek">৳{course.price}</span>
            {course.originalPrice && (
              <span className="text-xs text-[#8a817c] line-through font-tiro">৳{course.originalPrice}</span>
            )}
          </div>
        </div>

        {/* Action Buttons: বিস্তারিত & আবেদন করুন */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href={`/courses/${course.id}`}
            className="w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-[#112734] bg-[#e6f7f2] hover:bg-[#d2f3e7] text-center border border-[#17A2B8]/30/80 transition-all font-tiro shadow-xs flex items-center justify-center"
          >
            বিস্তারিত
          </Link>

          {onEnroll ? (
            <button
              type="button"
              onClick={() => onEnroll(course)}
              className="w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#112734] hover:bg-[#23626F] text-center shadow-md transition-all font-tiro flex items-center justify-center"
            >
              আবেদন করুন
            </button>
          ) : (
            <Link
              href={`/courses/${course.id}`}
              className="w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#112734] hover:bg-[#23626F] text-center shadow-md transition-all font-tiro flex items-center justify-center"
            >
              আবেদন করুন
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
