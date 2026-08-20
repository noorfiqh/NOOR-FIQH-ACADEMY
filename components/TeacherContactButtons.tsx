'use client';

import React from 'react';
import { MessageCircle, Mail } from 'lucide-react';

interface TeacherContactButtonsProps {
  phone?: string;
  email?: string;
  name?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function TeacherContactButtons({
  phone = '+8801855905185',
  email = 'noorfiqhaca@gmail.com',
  name,
  className = '',
  size = 'sm'
}: TeacherContactButtonsProps) {
  // Format phone for WhatsApp link
  const rawNum = phone || '+8801855905185';
  let digits = rawNum.replace(/[^0-9]/g, '');
  if (!digits.startsWith('88') && digits.startsWith('01')) {
    digits = '88' + digits;
  } else if (!digits) {
    digits = '8801855905185';
  }

  const defaultMsg = encodeURIComponent(
    `আসসালামু আলাইকুম, ${name ? name + ' হুজুর/উস্তাযের' : 'নূর ফিকহ একাডেমি'} সাথে ব্যক্তিগতভাবে যোগাযোগ করতে চাচ্ছি।`
  );
  const waUrl = `https://wa.me/${digits}?text=${defaultMsg}`;
  
  const targetEmail = email || 'noorfiqhaca@gmail.com';
  const emailSubject = encodeURIComponent(`নূর ফিকহ একাডেমি - ${name ? name + ' মহোদয়ের সাথে যোগাযোগ' : 'যোগাযোগ ও তথ্য'}`);
  const mailtoUrl = `mailto:${targetEmail}?subject=${emailSubject}`;

  const isSmall = size === 'sm';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* WhatsApp Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`flex-1 flex items-center justify-center gap-1.5 font-bold font-tiro text-[#112734] bg-[#e8f8f2] hover:bg-[#25d366] hover:text-white border border-[#17A2B8]/30 hover:border-[#25d366] transition-all rounded-xl shadow-xs group ${
          isSmall ? 'py-1.5 px-2.5 text-[11px]' : 'py-2 px-3 text-xs'
        }`}
        title={`হোয়াটসঅ্যাপে মেসেজ পাঠান (${phone || '+8801855905185'})`}
      >
        <MessageCircle size={isSmall ? 13 : 15} className="text-[#128c7e] group-hover:text-white fill-[#128c7e]/20 group-hover:fill-white/30 transition-colors shrink-0" />
        <span className="truncate font-semibold">হোয়াটসঅ্যাপ</span>
      </a>

      {/* Email Button */}
      <a
        href={mailtoUrl}
        onClick={(e) => e.stopPropagation()}
        className={`flex-1 flex items-center justify-center gap-1.5 font-bold font-tiro text-slate-700 bg-slate-50 hover:bg-[#112734] hover:text-white border border-slate-200 hover:border-[#112734] transition-all rounded-xl shadow-xs group ${
          isSmall ? 'py-1.5 px-2.5 text-[11px]' : 'py-2 px-3 text-xs'
        }`}
        title={`ইমেইল পাঠান (${targetEmail})`}
      >
        <Mail size={isSmall ? 13 : 15} className="text-slate-500 group-hover:text-white transition-colors shrink-0" />
        <span className="truncate font-semibold">ইমেইল</span>
      </a>
    </div>
  );
}
