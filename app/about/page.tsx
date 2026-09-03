'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  Award, 
  Users, 
  CheckCircle2, 
  GraduationCap,
  ArrowRight,
  Mail,
  Phone
} from 'lucide-react';
import { AppStore, DEFAULT_SETTINGS, INITIAL_FACULTY } from '@/lib/store';
import { FacultyMember, SiteSettings } from '@/lib/types';
import { TeacherContactButtons } from '@/components/TeacherContactButtons';
import { formatImageUrl, handleImageError } from '@/lib/utils';

export default function AboutPage() {
  const [faculty, setFaculty] = useState<FacultyMember[]>(INITIAL_FACULTY);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setFaculty(AppStore.getFaculty());
    setSettings(AppStore.getSettings());

    const handleUpdate = () => {
      setFaculty(AppStore.getFaculty());
      setSettings(AppStore.getSettings());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('noorfiqh_settings_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('noorfiqh_settings_updated', handleUpdate);
    };
  }, []);

  const councilMembers = faculty.filter(f => f.category === 'council');
  const teachingFaculty = faculty.filter(f => f.category === 'faculty');
  const advisoryBoard = faculty.filter(f => f.category === 'advisor');

  const aboutData = settings.aboutPage || {
    titleBn: 'সহিহ সুন্নাহ ও নির্ভরযোগ্য ফিকহের আলোকবর্তিকা',
    subtitleBn: 'আধুনিক জীবনের নানাবিধ জটিলতায় কুরআন, সহিহ হাদিস ও নির্ভরযোগ্য ফিকহি উসূলের সমন্বয়ে পথনির্দেশনা দেওয়ার প্রত্যয়ে প্রতিষ্ঠিত একটি পূর্ণাঙ্গ অনলাইন শিক্ষা ও গবেষণা প্ল্যাটফর্ম।',
    cards: [
      {
        id: 'card-1',
        title: 'আমাদের লক্ষ্য ও উদ্দেশ্য',
        description: 'মুসলিম উম্মাহর সর্বস্তরের মানুষের কাছে সহজ, দলীলভিত্তিক ও বাস্তবসম্মত ফিকহি জ্ঞান পৌঁছে দেওয়া। বিশেষ করে আধুনিক যুগে ব্যবসা-বাণিজ্য, ব্যাংক ব্যবস্থা, ডিজিটাল কারেন্সি, আধুনিক চিকিৎসাবিজ্ঞান এবং পারিবারিক জীবনের উদ্ভূত নতুন নতুন মাসআলা-মাসায়েলের বিশুদ্ধ শরয়ী সমাধান উপস্থাপন করা।',
        iconName: 'BookOpen'
      },
      {
        id: 'card-2',
        title: 'আমাদের মূল দৃষ্টিভঙ্গি',
        description: 'চরমপন্থা ও শৈথিল্যবাদ মুক্ত মধ্যমপন্থা (ওয়াসাত্বিয়্যাহ)-এর আলোকে বিশুদ্ধ ফিকহ চর্চা। দারুল উলুম দেওবন্দ, আল-আজহার এবং আন্তর্জাতিক ফিকহ একাডেমির নির্ভরযোগ্য গবেষণাকে ধারণ করে সমকালীন প্রেক্ষাপটে প্রয়োগ করা।',
        iconName: 'Award'
      }
    ]
  };

  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck size={24} />;
      case 'Sparkles': return <Sparkles size={24} />;
      case 'Users': return <Users size={24} />;
      case 'GraduationCap': return <GraduationCap size={24} />;
      case 'Award': return <Award size={24} />;
      case 'BookOpen':
      default:
        return <BookOpen size={24} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcf9] font-sans text-[#2c3e50] pb-20">
      {/* 1. EDGE-TO-EDGE HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-[#112734] text-white py-12 sm:py-16 lg:py-20 border-b border-[#23626F]">
        {/* Full Background Image */}
        {aboutData.heroImagePosition === 'background' && aboutData.showHeroImage !== false && aboutData.heroImage && (
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            <img
              src={formatImageUrl(aboutData.heroImage)}
              alt="About Hero Background"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => handleImageError(e, aboutData.heroImage)}
              style={{ opacity: (aboutData.heroImageOpacity ?? 35) / 100 }}
              className="w-full h-full object-cover object-center scale-105 transition-all duration-700"
            />
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#112734] via-[#112734]/85 to-[#112734]/70 transition-opacity" 
              style={{ opacity: (aboutData.heroOverlayOpacity ?? 80) / 100 }}
            />
            <div 
              className="absolute inset-0 bg-gradient-to-t from-[#112734] via-transparent to-[#112734]/40 transition-opacity" 
              style={{ opacity: (aboutData.heroOverlayOpacity ?? 80) / 100 }}
            />
          </div>
        )}

        {/* Ambient Glows & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#112734] via-[#112734]/90 to-[#112734]/95 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#17A2B8]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {aboutData.heroImagePosition === 'background' && aboutData.showHeroImage !== false && aboutData.heroImage ? (
            /* Full Background Hero Layout */
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#17A2B8]/20 text-[#17A2B8] text-xs font-bold uppercase tracking-wider border border-[#17A2B8]/30">
                <Sparkles size={14} className="text-amber-400" />
                <span>{aboutData.badgeText || 'নূর ফিকহ একাডেমি পরিচিতি • NOOR FIQH ACADEMY'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight font-anek">
                {aboutData.titleBn}
              </h1>

              <div className="max-w-2xl mx-auto space-y-3 pt-1">
                {(aboutData.subtitleBn || '').split(/\r?\n\s*\r?\n/).filter(Boolean).map((para, idx) => (
                  <p key={idx} className="text-sm sm:text-base text-slate-200 leading-relaxed font-tiro">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ) : aboutData.showHeroImage !== false && aboutData.heroImage ? (
            /* Split Grid Hero with Image */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className={`space-y-4 ${aboutData.heroImagePosition === 'left' ? 'lg:col-span-7 lg:order-2' : 'lg:col-span-7'}`}>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#17A2B8]/20 text-[#17A2B8] text-xs font-bold uppercase tracking-wider border border-[#17A2B8]/30">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>{aboutData.badgeText || 'নূর ফিকহ একাডেমি পরিচিতি • NOOR FIQH ACADEMY'}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.2] font-anek">
                  {aboutData.titleBn}
                </h1>

                <div className="space-y-3 pt-1">
                  {(aboutData.subtitleBn || '').split(/\r?\n\s*\r?\n/).filter(Boolean).map((para, idx) => (
                    <p key={idx} className="text-sm sm:text-base text-slate-200 leading-relaxed font-tiro max-w-2xl">
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              <div className={`${aboutData.heroImagePosition === 'left' ? 'lg:col-span-5 lg:order-1' : 'lg:col-span-5'} flex justify-center`}>
                <div className="w-full max-w-lg relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl group bg-[#0b1b24]">
                  <div className="aspect-[16/10] w-full relative">
                    <img
                      src={formatImageUrl(aboutData.heroImage)}
                      alt={aboutData.titleBn}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => handleImageError(e, aboutData.heroImage)}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold rounded-xl border border-white/20 font-tiro">
                      🏛️ নূর ফিকহ একাডেমি
                    </span>
                    <span className="px-3 py-1 bg-teal-500 text-[#0b1b24] text-[11px] font-black rounded-xl shadow font-tiro">
                      পরিচিতি ও লক্ষ্য
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 max-w-4xl mx-auto py-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#17A2B8]/20 text-[#17A2B8] text-xs font-bold uppercase tracking-wider border border-[#17A2B8]/30">
                <Sparkles size={14} className="text-amber-400" />
                <span>{aboutData.badgeText || 'নূর ফিকহ একাডেমি পরিচিতি • NOOR FIQH ACADEMY'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-anek">
                {aboutData.titleBn}
              </h1>

              <div className="max-w-2xl mx-auto space-y-3">
                {(aboutData.subtitleBn || '').split(/\r?\n\s*\r?\n/).filter(Boolean).map((para, idx) => (
                  <p key={idx} className="text-sm sm:text-base text-slate-200 leading-relaxed font-tiro">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. MAIN CONTENT (CARDS & FACULTY) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
        
        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {aboutData.cards.map((card, idx) => (
            <div key={card.id || idx} className="bg-white p-8 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#17A2B8]/10 text-[#112734] flex items-center justify-center font-normal">
                {getIconComponent(card.iconName)}
              </div>
              <h3 className="text-2xl font-normal text-[#112734] font-anek">{card.title}</h3>
              <p className="text-sm text-[#5a524d] leading-relaxed font-tiro whitespace-pre-line">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* Research Council Section */}
        {councilMembers.length > 0 && (
          <div className="space-y-8 text-center">
            <div className="max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold text-[#0f8293] uppercase tracking-widest font-tiro">
                ফিকহ গবেষণা প্যানেল
              </span>
              <h2 className="text-3xl font-extrabold text-[#112734] font-anek">
                গবেষণা পরিষদ (Research Council)
              </h2>
              <p className="text-xs text-[#5a524d] font-tiro">
                সমকালীন জটিল মাসআলাসমূহের দলীলভিত্তিক বিশ্লেষণ ও ফতোয়া প্রণয়নে দায়িত্বরত গবেষকমণ্ডলী
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {councilMembers.map((member) => (
                <div key={member.id} className="bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4 flex flex-col justify-between group hover:border-[#112734]/30 transition-all">
                  <div className="space-y-4">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#17A2B8] mx-auto shadow-inner bg-slate-50">
                      <img
                        src={formatImageUrl(member.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80')}
                        alt={member.nameBn || member.name}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => handleImageError(e, member.avatar)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <h4 className="font-extrabold text-lg text-[#2c3e50] font-anek">{member.nameBn || member.name}</h4>
                      <p className="text-xs text-[#112734] font-bold font-tiro">{member.designation}</p>
                      {member.qualifications && (
                        <p className="text-[11px] text-[#8a817c]">{member.qualifications}</p>
                      )}
                    </div>
                    {member.bio && (
                      <p className="text-xs text-[#5a524d] leading-relaxed text-center font-tiro">
                        {member.bio}
                      </p>
                    )}
                  </div>
                  
                  {/* Contact Buttons: WhatsApp & Email */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <TeacherContactButtons
                      name={member.nameBn || member.name}
                      phone={member.phone}
                      email={member.email}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teaching Faculty Section */}
        {teachingFaculty.length > 0 && (
          <div className="space-y-8 text-center">
            <div className="max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold text-[#0f8293] uppercase tracking-widest font-tiro">
                অ্যাকাডেমিক বিভাগ
              </span>
              <h2 className="text-3xl font-extrabold text-[#112734] font-anek">
                উস্তায ও শিক্ষকবৃন্দ (Academic Faculty)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {teachingFaculty.map((member) => (
                <div key={member.id} className="bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4 flex flex-col justify-between group hover:border-[#112734]/30 transition-all">
                  <div className="space-y-4">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500 mx-auto shadow-inner bg-slate-50">
                      <img
                        src={formatImageUrl(member.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80')}
                        alt={member.nameBn || member.name}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => handleImageError(e, member.avatar)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <h4 className="font-extrabold text-lg text-[#2c3e50] font-anek">{member.nameBn || member.name}</h4>
                      <p className="text-xs text-[#112734] font-bold font-tiro">{member.designation}</p>
                      {member.qualifications && (
                        <p className="text-[11px] text-[#8a817c]">{member.qualifications}</p>
                      )}
                    </div>
                    {member.bio && (
                      <p className="text-xs text-[#5a524d] leading-relaxed text-center font-tiro">
                        {member.bio}
                      </p>
                    )}
                  </div>
                  
                  {/* Contact Buttons: WhatsApp & Email */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <TeacherContactButtons
                      name={member.nameBn || member.name}
                      phone={member.phone}
                      email={member.email}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shariah Advisory Board Section */}
        {advisoryBoard.length > 0 && (
          <div className="space-y-8 text-center">
            <div className="max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-widest font-tiro">
                সার্বিক দিকনির্দেশনা
              </span>
              <h2 className="text-3xl font-extrabold text-[#112734] font-anek">
                শরীয়াহ উপদেষ্টা পরিষদ (Shariah Advisory Board)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {advisoryBoard.map((member) => (
                <div key={member.id} className="bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4 flex flex-col justify-between group hover:border-[#112734]/30 transition-all">
                  <div className="space-y-4">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-purple-400 mx-auto shadow-inner bg-slate-50">
                      <img
                        src={formatImageUrl(member.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80')}
                        alt={member.nameBn || member.name}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => handleImageError(e, member.avatar)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <h4 className="font-extrabold text-lg text-[#2c3e50] font-anek">{member.nameBn || member.name}</h4>
                      <p className="text-xs text-purple-900 font-bold font-tiro">{member.designation}</p>
                      {member.qualifications && (
                        <p className="text-[11px] text-[#8a817c]">{member.qualifications}</p>
                      )}
                    </div>
                    {member.bio && (
                      <p className="text-xs text-[#5a524d] leading-relaxed text-center font-tiro">
                        {member.bio}
                      </p>
                    )}
                  </div>
                  
                  {/* Contact Buttons: WhatsApp & Email */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <TeacherContactButtons
                      name={member.nameBn || member.name}
                      phone={member.phone}
                      email={member.email}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact / Location Section */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#ece8e0] card-natural-shadow grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-[#0f8293] uppercase tracking-wider font-tiro">
              যোগাযোগ ও ইফতা বিভাগ
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#112734] font-anek">
              আমাদের সাথে যোগাযোগ করুন
            </h3>
            <p className="text-sm text-[#5a524d] leading-relaxed font-tiro">
              কোর্স সংক্রান্ত তথ্য, বিশেষ পরামর্শ বা কিতাব সংগ্রহের যেকোনো প্রয়োজনে আমাদের অফিশিয়াল নাম্বারে সরাসরি কল বা হোয়াটসঅ্যাপে মেসেজ দিন।
            </p>
            <div className="space-y-2 text-xs text-[#2c3e50] font-medium pt-2 font-tiro">
              <p>📍 <strong>ঠিকানা:</strong> {settings.address || 'নূর ফিকহ একাডেমি কমপ্লেক্স, হাউজ #১২, রোড #৪, ধানমন্ডি, ঢাকা-১২০৫'}</p>
              <p>📞 <strong>হটলাইন:</strong> {settings.phone || '+880 1855-905185'}</p>
              <p>✉️ <strong>ইমেইল:</strong> {settings.email || 'noorfiqhaca@gmail.com'}</p>
            </div>
          </div>

          <div className="bg-[#fdfcf9] p-6 rounded-2xl border border-[#ece8e0] space-y-4 text-center">
            <h4 className="font-bold text-base text-[#112734] font-anek">সরাসরি পরামর্শের জন্য বুকিং</h4>
            <p className="text-xs text-[#5a524d] font-tiro">
              মুফতী সাহেবের সাথে ব্যক্তিগত বা পারিবারিক বিষয়ে অনলাইন কনসাল্টেশন সেশনের অ্যাপয়েন্টমেন্ট নিন।
            </p>
            <Link
              href="/fatwa#ask"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#112734] text-white font-bold text-xs rounded-xl shadow hover:bg-[#23626F] transition-colors font-tiro"
            >
              <span>অনলাইন অ্যাপয়েন্টমেন্ট / মাসআলা পাঠান</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

