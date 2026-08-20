'use client';

import React, { useState, useEffect } from 'react';
import { Video, Users, CheckCircle, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import { LiveClass } from '@/lib/types';
import { AppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';

interface LiveClassCardProps {
  liveClass: LiveClass;
  onSelectPayment?: (cls: LiveClass) => void;
}

export function LiveClassCard({ liveClass, onSelectPayment }: LiveClassCardProps) {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false });
  const [registered, setRegistered] = useState(false);
  const [hasPendingOrder, setHasPendingOrder] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const userId = user?.uid || 'guest-user-1';
    const regIds = liveClass.registeredUserIds || [];
    
    const userOrders = user ? AppStore.getUserOrders(user.uid) : [];
    const pendingOrd = userOrders.some(o => o.itemType === 'live_class' && o.itemId === liveClass.id && o.status === 'pending');
    const approvedOrd = userOrders.some(o => o.itemType === 'live_class' && o.itemId === liveClass.id && o.status === 'approved');

    setHasPendingOrder(pendingOrd);
    setRegistered(regIds.includes(userId) || approvedOrd);

    const calculateTime = () => {
      const target = new Date(liveClass.startTime).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isLive: false });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [liveClass, user]);

  const handleRegister = () => {
    if (!user) {
      alert('দয়া করে প্রথমে স্টুডেন্ট পোর্টালে লগইন করুন।');
      return;
    }
    if (liveClass.price > 0 && !registered) {
      if (onSelectPayment) {
        onSelectPayment(liveClass);
      }
      return;
    }

    const success = AppStore.registerForLiveClass(liveClass.id, user.uid);
    if (success || registered) {
      setRegistered(true);
      alert('আলহামদুলিল্লাহ! আপনার লাইভ ক্লাসের আবেদন ও রেজিস্ট্রেশন সফল হয়েছে। লাইভ শুরুর আগে আপনার ড্যাশবোর্ডে ও নম্বরে রিমাইন্ডার পাঠানো হবে।');
    }
  };

  const target = liveClass.targetCapacity || 500;
  const currentCount = liveClass.enrolledStudentsCount || 0;
  const progressPercent = Math.min(100, Math.round((currentCount / target) * 100));

  return (
    <div className="bg-[#fdfcf9] rounded-[28px] border border-[#ece8e0] overflow-hidden shadow-md hover:shadow-xl transition-all flex flex-col group">
      {/* Thumbnail & Badges */}
      {liveClass.thumbnail && (
        <div className="relative h-52 w-full overflow-hidden bg-slate-100">
          <img 
            src={liveClass.thumbnail} 
            alt={liveClass.titleBn} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          
          <div className="absolute top-3 left-3 bg-red-600 text-white px-3.5 py-1 rounded-full text-xs font-black flex items-center gap-2 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            {liveClass.platform}
          </div>

          <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 px-3.5 py-1 rounded-full text-xs font-black shadow-lg">
            {liveClass.price === 0 ? 'সম্পূর্ণ ফ্রি' : `মূল্য: ৳ ${liveClass.price}`}
          </div>

          <div className="absolute bottom-3 left-4 right-4 text-white flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
              <Clock size={13} className="text-amber-400" />
              {liveClass.duration}
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
              <Users size={13} className="text-[#17A2B8]" />
              {currentCount} / {target} জন রেজিস্টার্ড
            </span>
          </div>
        </div>
      )}

      {/* Content Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#17A2B8]">
            প্রশিক্ষক: {liveClass.instructor}
          </div>
          <h3 className="font-extrabold text-xl text-[#112734] font-anek leading-snug line-clamp-2">
            {liveClass.titleBn}
          </h3>
          <p className="text-xs text-[#8a817c] line-clamp-2 leading-relaxed">
            {liveClass.description}
          </p>
        </div>

        {/* PROMINENT LARGE COUNTDOWN TIMER */}
        {isClient && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center space-y-2">
            <div className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              {timeLeft.isLive ? '🔴 লাইভ ক্লাস শুরু হয়ে গেছে!' : 'লাইভ শুরু হতে বাকি রয়েছে:'}
            </div>

            {!timeLeft.isLive ? (
              <div className="grid grid-cols-4 gap-2 pt-1">
                <div className="bg-red-600 text-white rounded-xl py-2 px-1 shadow-md">
                  <div className="text-lg sm:text-xl font-black font-mono">{String(timeLeft.days).padStart(2, '0')}</div>
                  <div className="text-[10px] uppercase font-bold opacity-90">দিন</div>
                </div>
                <div className="bg-red-600 text-white rounded-xl py-2 px-1 shadow-md">
                  <div className="text-lg sm:text-xl font-black font-mono">{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className="text-[10px] uppercase font-bold opacity-90">ঘণ্টা</div>
                </div>
                <div className="bg-red-600 text-white rounded-xl py-2 px-1 shadow-md">
                  <div className="text-lg sm:text-xl font-black font-mono">{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className="text-[10px] uppercase font-bold opacity-90">মিনিট</div>
                </div>
                <div className="bg-red-600 text-white rounded-xl py-2 px-1 shadow-md">
                  <div className="text-lg sm:text-xl font-black font-mono">{String(timeLeft.seconds).padStart(2, '0')}</div>
                  <div className="text-[10px] uppercase font-bold opacity-90">সেকেন্ড</div>
                </div>
              </div>
            ) : (
              <div className="py-2">
                <a
                  href={liveClass.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg transition-all animate-bounce"
                >
                  <Video size={16} />
                  <span>এখনই লাইভ ক্লাসে প্রবেশ করুন</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Capacity Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-[#2c3e50]">
            <span>সিট পূর্ণতা (Target: {target})</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#17A2B8] rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Button: Registration or Join */}
        <div className="pt-2">
          {hasPendingOrder ? (
            <div className="w-full py-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
              <Clock size={16} className="text-amber-600 animate-spin" />
              <span>পেমেন্ট যাচাইাধীন রয়েছে (এডমিন অনুমোদন অপেক্ষায়)</span>
            </div>
          ) : !registered ? (
            <button
              onClick={handleRegister}
              className="w-full py-3.5 bg-[#112734] hover:bg-[#23626F] text-white font-black text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Users size={16} />
              <span>
                {liveClass.price === 0 ? 'ফ্রি ক্লাসে আবেদন/রেজিস্ট্রেশন করুন' : `৳ ${liveClass.price} দিয়ে এনরোল করুন`}
              </span>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="w-full py-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                <CheckCircle size={15} className="text-emerald-600" />
                <span>আপনার রেজিস্ট্রেশন অনুমোদিত (Reminder Set)</span>
              </div>
              <a
                href={liveClass.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-[#17A2B8] hover:bg-[#138496] text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Video size={15} />
                <span>ক্লাসের মিটিং লিংক ({liveClass.platform})</span>
                <ExternalLink size={13} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
