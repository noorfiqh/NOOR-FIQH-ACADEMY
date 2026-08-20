'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  HelpCircle, 
  Library, 
  User, 
  ShieldCheck, 
  GraduationCap,
  Sparkles,
  PhoneCall,
  LogIn,
  LogOut,
  Award,
  ChevronRight,
  Home
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { LoginModal } from '@/components/LoginModal';
import { AppStore, DEFAULT_SETTINGS } from '@/lib/store';
import { SiteSettings } from '@/lib/types';

export function Navbar() {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    setSiteSettings(AppStore.getSettings());
  }, []);

  useEffect(() => {
    if (!mounted || siteSettings.notificationTimerEnabled === false) return;

    const endTime = siteSettings.notificationTimerEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const targetTime = new Date(endTime).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [mounted, siteSettings.notificationTimerEnd, siteSettings.notificationTimerEnabled]);

  useEffect(() => {
    const checkSettings = () => {
      setSiteSettings(AppStore.getSettings());
    };
    window.addEventListener('storage', checkSettings);
    window.addEventListener('noorfiqh_settings_updated', checkSettings);
    return () => {
      window.removeEventListener('storage', checkSettings);
      window.removeEventListener('noorfiqh_settings_updated', checkSettings);
    };
  }, []);

  const navLinks = [
    { name: 'হোম', href: '/', icon: Home },
    { name: 'কোর্সসমূহ', href: '/courses', icon: BookOpen, badge: 'জনপ্রিয়' },
    { name: 'ফতোয়া ও মাসআলা', href: '/fatwa', icon: HelpCircle, badge: 'ফ্রি' },
    { name: 'কিতাব ও প্রকাশনা', href: '/books', icon: Library },
    { name: 'পরিচিতি', href: '/about', icon: GraduationCap },
  ];

  const bottomNavItems = [
    { name: 'হোম', href: '/', icon: Home },
    { name: 'কোর্সসমূহ', href: '/courses', icon: BookOpen, badge: 'ভর্তি' },
    { name: 'ফতোয়া', href: '/fatwa', icon: HelpCircle },
    { name: 'কিতাব', href: '/books', icon: Library },
    { name: user ? 'ড্যাশবোর্ড' : 'অ্যাকাউন্ট', href: user ? '/dashboard' : '#account', icon: User, onClick: !user ? () => setLoginModalOpen(true) : undefined },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('#')) return false;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Top Notification Bar */}
      {siteSettings.notificationEnabled !== false && siteSettings.notificationText?.trim() && (
        <div className="bg-[#022c22] text-[#17A2B8] text-xs py-2 px-4 border-b border-amber-500/20 font-medium">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              {siteSettings.notificationBadgeText && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                  {siteSettings.notificationBadgeText}
                </span>
              )}
              <span className="text-slate-200">
                {siteSettings.notificationText}
              </span>
              {siteSettings.notificationTimerEnabled !== false && (
                <div className="inline-flex items-center gap-1.5 ml-2 font-mono text-xs">
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded font-bold shadow-sm">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="text-red-400 font-bold">:</span>
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded font-bold shadow-sm">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-red-400 font-bold">:</span>
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded font-bold shadow-sm">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-red-400 font-bold">:</span>
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded font-bold shadow-sm">{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-300">
              <a 
                href={siteSettings.facebookUrl || "https://www.facebook.com/profile.php?id=61591404045439"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#17A2B8] transition-colors flex items-center gap-1 font-semibold"
              >
                <span>অফিসিয়াল ফেসবুক পেজ</span>
              </a>
              <span className="text-slate-600">|</span>
              <a 
                href={`https://wa.me/${siteSettings.whatsappNumber || '8801855905185'}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-[#17A2B8] text-[#17A2B8] transition-colors font-semibold flex items-center gap-1"
              >
                <PhoneCall size={12} /> {siteSettings.whatsappNumber || '+8801855905185'}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-[#112734]/95 backdrop-blur-md border-b border-[#23626F]/80 shadow-lg shadow-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3.5 group focus:outline-none shrink-0">
            {siteSettings.logoType === 'image' && siteSettings.logoImageUrl ? (
              <div className="h-12 sm:h-14 flex items-center py-1 group-hover:opacity-90 transition-opacity">
                <img
                  src={siteSettings.logoImageUrl}
                  alt={siteSettings.siteNameBn || 'নূর ফিকহ একাডেমি'}
                  className="max-h-11 sm:max-h-13 w-auto max-w-[190px] sm:max-w-[260px] object-contain drop-shadow-sm"
                />
              </div>
            ) : (
              <>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300 border-2 border-white/20 shrink-0">
                  <span className="text-arabic text-3xl pb-1">{siteSettings.logoSymbol || 'ن'}</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xl sm:text-2xl text-white tracking-tight leading-none group-hover:text-[#17A2B8] transition-colors font-anek">
                      {siteSettings.siteNameBn || 'নূর ফিকহ একাডেমি'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#17A2B8]/80/90 font-medium tracking-wide leading-tight mt-1 flex items-center gap-1">
                    <Sparkles size={11} className="text-[#17A2B8]" />
                    {siteSettings.logoSubtitle || siteSettings.siteName || 'NOOR FIQH ACADEMY'}
                  </span>
                </div>
              </>
            )}
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2.5">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2.5 rounded-xl text-[17px] xl:text-[18px] font-bold transition-all duration-200 flex items-center gap-1.5 font-tiro ${
                    active 
                      ? 'bg-[#23626F]/90 text-[#17A2B8] shadow-inner ring-1 ring-[#17A2B8]/20' 
                      : 'text-slate-100 hover:text-[#20c9d9] hover:bg-[#23626F]/60'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded-md font-sans">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

            {/* Right Action & User Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 sm:p-1.5 sm:pr-3 rounded-full bg-[#112734]/80 border border-[#23626F]/80 hover:border-[#17A2B8]/70 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-[#17A2B8]/40"
                    aria-label="User profile menu"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#17A2B8] text-slate-950 font-bold text-sm flex items-center justify-center border-2 border-amber-300/80 shrink-0 overflow-hidden shadow-sm">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name || 'User Profile'}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="font-extrabold text-sm text-slate-950 uppercase">
                          {(user.name || user.email || 'U').charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs font-bold text-white line-clamp-1 leading-none">{user.name.split(' ')[0]}</p>
                      <p className="text-[10px] text-[#17A2B8]/80 font-medium capitalize mt-0.5">{user.role}</p>
                    </div>
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <>
                        {/* Backdrop to close dropdown on tap/click outside */}
                        <div 
                          className="fixed inset-0 z-40 bg-black/20" 
                          onClick={() => setUserDropdownOpen(false)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 text-slate-800 font-tiro"
                        >
                          {/* User Header Profile Card */}
                          <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-br from-emerald-50/70 to-slate-50 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#17A2B8] text-slate-950 font-bold text-base flex items-center justify-center border-2 border-[#17A2B8]/30 shrink-0 overflow-hidden shadow-sm">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name || 'User Profile'}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span className="font-bold text-slate-950">
                                  {(user.name || user.email || 'U').charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm text-slate-900 truncate leading-tight">{user.name}</p>
                              <p className="text-[11px] text-slate-500 truncate font-sans">{user.email}</p>
                              <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#17A2B8]/15 text-[#112734] capitalize">
                                {user.role === 'admin' ? 'অ্যাডমিনিস্ট্রেটর' : user.role === 'scholar' ? 'মুফতি / গবেষক' : 'শিক্ষার্থী'}
                              </span>
                            </div>
                          </div>

                          <div className="py-1.5 text-sm">
                            <Link
                              href="/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 font-medium hover:bg-[#17A2B8]/10 hover:text-[#112734] transition-colors"
                            >
                              <User size={16} className="text-[#17A2B8] shrink-0" />
                              <span>আমার ড্যাশবোর্ড (Portal)</span>
                            </Link>

                            <Link
                              href="/about"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 font-medium hover:bg-[#17A2B8]/10 hover:text-[#112734] transition-colors"
                            >
                              <GraduationCap size={16} className="text-amber-600 shrink-0" />
                              <span>একাডেমি পরিচিতি ও লক্ষ্য</span>
                            </Link>
                            
                            <Link
                              href="/fatwa"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 font-medium hover:bg-[#17A2B8]/10 hover:text-[#112734] transition-colors"
                            >
                              <HelpCircle size={16} className="text-[#17A2B8] shrink-0" />
                              <span>মাসআলা জিজ্ঞাসা করুন</span>
                            </Link>

                            <Link
                              href="/verify-certificate"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 font-medium hover:bg-[#17A2B8]/10 hover:text-[#112734] transition-colors"
                            >
                              <Award size={16} className="text-amber-600 shrink-0" />
                              <span>সার্টিফিকেট ভেরিফিকেশন</span>
                            </Link>

                            {isAdmin && (
                              <Link
                                href="/admin"
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors border-y border-amber-200/60 my-1"
                              >
                                <ShieldCheck size={16} className="text-amber-600 shrink-0" />
                                <span>অ্যাডমিন প্যানেল (Admin)</span>
                              </Link>
                            )}

                            <a
                              href="https://wa.me/8801855905185"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-[#17A2B8]/10 hover:text-[#112734] transition-colors"
                            >
                              <PhoneCall size={14} className="text-[#17A2B8] shrink-0" />
                              <span>সরাসরি সাপোর্ট ও পরামর্শ</span>
                            </a>
                          </div>

                          <div className="border-t border-slate-100 pt-1">
                            <button
                              onClick={() => {
                                logout();
                                setUserDropdownOpen(false);
                              }}
                              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 font-semibold hover:bg-red-50 transition-colors"
                            >
                              <LogOut size={16} className="shrink-0" />
                              <span>লগআউট (Logout)</span>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-[#17A2B8] text-slate-950 transition-all shadow-md flex items-center gap-1.5 font-tiro"
                  >
                    <LogIn size={14} />
                    <span className="hidden sm:inline">লগইন / যুক্ত হোন</span>
                    <span className="sm:hidden">লগইন</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

      {/* Facebook-style Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#112734]/95 backdrop-blur-lg text-white border-t border-[#23626F]/90 shadow-[0_-4px_25px_rgba(0,0,0,0.3)] pb-safe-area">
        <div className="grid grid-cols-5 h-15 max-w-md mx-auto items-center px-1">
          {bottomNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            if (item.onClick) {
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={item.onClick}
                  className="flex flex-col items-center justify-center py-1 relative text-[#17A2B8]/80/80 hover:text-white transition-all active:scale-95"
                >
                  <div className="relative">
                    <Icon size={20} className="stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-tiro mt-0.5 tracking-tight font-medium">
                    {item.name}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 relative transition-all active:scale-95 ${
                  active ? 'text-[#17A2B8]' : 'text-[#17A2B8]/80/80 hover:text-white'
                }`}
              >
                {active && (
                  <div className="absolute top-0 w-8 h-1 bg-[#17A2B8] rounded-b-full shadow-[0_0_8px_#17A2B8]" />
                )}
                <div className="relative">
                  <Icon size={20} className={active ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2.5 px-1 py-0 text-[8px] font-black bg-[#17A2B8] text-slate-950 rounded-full shadow-sm leading-tight">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] font-tiro mt-0.5 tracking-tight ${active ? 'font-black text-[#17A2B8]' : 'font-medium'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
}
