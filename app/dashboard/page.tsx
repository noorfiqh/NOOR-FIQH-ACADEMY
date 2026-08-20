'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { AppStore } from '@/lib/store';
import { Course, Lesson, Order } from '@/lib/types';
import { QuizModal } from '@/components/QuizModal';
import { CertificateView } from '@/components/CertificateView';
import { 
  BookOpen, 
  PlayCircle, 
  Award, 
  CheckCircle2, 
  Clock, 
  Lock, 
  FileText, 
  Download, 
  LogOut, 
  ShoppingBag, 
  HelpCircle,
  Sparkles,
  User,
  ShieldAlert,
  AlertCircle,
  Library,
  Eye,
  ExternalLink,
  CheckCircle,
  X,
  Video
} from 'lucide-react';
import { LiveClassCard } from '@/components/LiveClassCard';
import { PaymentModal } from '@/components/PaymentModal';
import { LiveClass } from '@/lib/types';

export default function DashboardPage() {
  const { user, logout, login, loginWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'courses' | 'books' | 'orders' | 'certificates' | 'live_classes'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [readingBookPdf, setReadingBookPdf] = useState<{ titleBn: string; pdfUrl: string } | null>(null);
  const [selectedLiveClassForPayment, setSelectedLiveClassForPayment] = useState<LiveClass | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<{
    userName: string;
    courseTitle: string;
    issueDate: string;
    certificateNumber: string;
    grade?: string;
    certificateCopyUrl?: string;
    customPdfUrl?: string;
  } | null>(null);

  // Sample quick login if not logged in
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const courses = AppStore.getCourses();
  const orders = React.useMemo(() => (user ? AppStore.getUserOrders(user.uid) : []), [user]);
  const progressList = user ? AppStore.getUserProgress(user.uid) : [];
  const userCerts = user ? AppStore.getCertificates(user.uid) : [];
  const liveClasses = AppStore.getLiveClasses();

  React.useEffect(() => {
    if (user && orders.length > 0) {
      const approvedCourseOrders = orders.filter(o => o.status === 'approved' && o.itemType === 'course');
      approvedCourseOrders.forEach(ord => {
        const course = AppStore.getCourseById(ord.itemId);
        if (course) {
          AppStore.issueCertificate(user.uid, user.name || ord.userName, course.id, course.titleBn);
        }
      });
    }
  }, [user, orders]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      login(loginEmail, loginPassword);
    } catch (err: any) {
      setLoginError(err.message || 'লগইন ব্যর্থ হয়েছে');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fdfcf9] flex items-center justify-center p-4 font-sans text-[#2c3e50]">
        <div className="bg-white w-full max-w-md p-8 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#112734] text-[#17A2B8] flex items-center justify-center mx-auto text-2xl font-black">
              ن
            </div>
            <h2 className="text-2xl font-black text-[#112734]">শিক্ষার্থী পোর্টাল লগইন</h2>
            <p className="text-xs text-[#8a817c]">নূর ফিকহ একাডেমি স্টুডেন্ট ড্যাশবোর্ড</p>
          </div>

          <div className="space-y-4">
            {/* Google Login */}
            <button
              onClick={() => loginWithGoogle()}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border-2 border-slate-200 hover:border-[#112734]/30 hover:bg-slate-50 text-slate-700 font-bold rounded-2xl transition-all shadow-sm text-xs"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.78 15.73 17.57V20.34H19.29C21.37 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
                <path d="M12 23C14.97 23 17.46 22.02 19.29 20.34L15.73 17.57C14.74 18.23 13.48 18.63 12 18.63C9.14 18.63 6.71 16.7 5.84 14.09H2.18V16.92C4.01 20.53 7.69 23 12 23Z" fill="#34A853" />
                <path d="M5.84 14.09C5.62 13.43 5.5 12.73 5.5 12C5.5 11.27 5.62 10.57 5.84 9.91V7.08H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.92L5.84 14.09Z" fill="#FBBC05" />
                <path d="M12 5.38C13.62 5.38 15.06 5.93 16.21 7.02L19.38 3.85C17.46 2.05 14.97 1 12 1C7.69 1 4.01 3.47 2.18 7.08L5.84 9.91C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EA4335" />
              </svg>
              <span>Google অ্যাকাউন্ট দিয়ে লগইন করুন</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-[11px] font-bold text-slate-400">অথবা ইমেইল দিয়ে</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2c3e50] mb-1">ইমেইল ঠিকানা</label>
                <input
                  type="email"
                  required
                  placeholder="student@noorfiqh.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#ece8e0] text-xs focus:outline-none focus:border-[#112734]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2c3e50] mb-1">পাসওয়ার্ড</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#ece8e0] text-xs focus:outline-none focus:border-[#112734]"
                />
              </div>

              {loginError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold rounded-2xl shadow-md transition-all text-xs"
              >
                লগইন করুন
              </button>

              {/* Quick Demo Access */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => login('student@noorfiqh.com', 'student123')}
                  className="text-[11px] text-[#112734] font-bold bg-[#17A2B8]/10 px-3 py-1.5 rounded-xl hover:bg-[#17A2B8]/15 transition-colors"
                >
                  ⚡ ডেমো স্টুডেন্ট একাউন্টে এক ক্লিকে প্রবেশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Active course study view
  if (selectedCourse) {
    const currentProgress = progressList.find(p => p.courseId === selectedCourse.id);
    const activeLesson = selectedLesson || selectedCourse.lessons[0];

    const isLessonCompleted = (lessonId: string) => {
      return Boolean(currentProgress?.completedLessons?.includes(lessonId) || currentProgress?.completedLessonIds?.includes(lessonId));
    };

    const handleMarkComplete = (lessonId: string) => {
      AppStore.markLessonComplete(user.uid, selectedCourse.id, lessonId, selectedCourse.lessons.length);
    };

    const handleCompleteEntireCourse = () => {
      AppStore.completeCourseFully(user.uid, selectedCourse.id, user.name);
      const cert = AppStore.getCertificates(user.uid).find(c => c.courseId === selectedCourse.id);
      if (cert) {
        setViewingCertificate({
          userName: cert.userName,
          courseTitle: cert.courseTitle,
          issueDate: cert.issueDate,
          certificateNumber: cert.certificateNumber,
          grade: cert.grade,
          certificateCopyUrl: cert.certificateCopyUrl || cert.customPdfUrl
        });
      } else {
        setViewingCertificate({
          userName: user.name || 'শিক্ষার্থী',
          courseTitle: selectedCourse.titleBn,
          issueDate: new Date().toLocaleDateString('bn-BD'),
          certificateNumber: `NFA-${selectedCourse.id.substring(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
          grade: 'Mumtaz (Distinction)'
        });
      }
    };

    const completedLessonsCount = selectedCourse.lessons.filter(l => isLessonCompleted(l.id)).length;
    const computedPercentage = Math.min(100, Math.round((completedLessonsCount / (selectedCourse.lessons.length || 1)) * 100));
    const isCourseDone = Boolean(currentProgress?.isCompleted || computedPercentage >= 100 || completedLessonsCount >= selectedCourse.lessons.length);

    return (
      <div className="min-h-screen bg-[#fdfcf9] font-sans text-[#2c3e50] pb-20">
        {/* Top Study Bar */}
        <div className="bg-[#112734] text-white py-4 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedCourse(null); setSelectedLesson(null); }}
              className="px-3 py-1.5 rounded-xl bg-[#112734] text-[#17A2B8]/80 hover:text-white text-xs font-bold transition-colors"
            >
              ← ড্যাশবোর্ডে ফিরুন
            </button>
            <h2 className="font-extrabold text-sm sm:text-base text-white truncate max-w-md">
              {selectedCourse.titleBn}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCompleteEntireCourse}
              className="px-3.5 py-1.5 bg-[#17A2B8] hover:bg-[#23626F] text-slate-950 hover:text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Award size={15} />
              <span>{isCourseDone ? 'সনদপত্র দেখুন 🎓' : 'কোর্স সম্পন্ন করুন ও সনদ গ্রহণ করুন 🎓'}</span>
            </button>
          </div>
        </div>

        {/* Study Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Video & Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Video Player Area */}
            <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800">
              <iframe
                src={activeLesson.videoUrl ? activeLesson.videoUrl.replace('watch?v=', 'embed/') : 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                title={activeLesson.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Lesson Title & Mark as Done Action */}
            <div className="bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-[#0f8293] uppercase tracking-wider">
                  বর্তমান পাঠ • {activeLesson.duration}
                </span>
                <h3 className="text-xl font-extrabold text-[#2c3e50]">{activeLesson.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMarkComplete(activeLesson.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isLessonCompleted(activeLesson.id)
                      ? 'bg-[#17A2B8]/15 text-[#112734] border border-emerald-300'
                      : 'bg-[#112734] text-white hover:bg-[#23626F]'
                  }`}
                >
                  <CheckCircle2 size={15} />
                  <span>{isLessonCompleted(activeLesson.id) ? 'সম্পন্ন হয়েছে ✓' : 'পাঠ শেষ করেছি'}</span>
                </button>

                <button
                  onClick={() => setShowQuizModal(true)}
                  className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle size={15} />
                  <span>কুইজ পরীক্ষা</span>
                </button>
              </div>
            </div>

            {/* Lesson Resources / Notes */}
            {activeLesson.pdfNotesUrl && (
              <div className="bg-[#fdfcf9] p-5 rounded-3xl border border-[#ece8e0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={22} className="text-[#112734]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#2c3e50]">এই লেকচারের হ্যান্ডনোট ও রেফারেন্স শিট</h4>
                    <p className="text-[10px] text-[#8a817c]">PDF ডাউনলোড করে পড়ার জন্য প্রস্তুত</p>
                  </div>
                </div>
                <a
                  href={activeLesson.pdfNotesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-white border border-[#ece8e0] text-[#112734] text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>নোট ডাউনলোড</span>
                </a>
              </div>
            )}
          </div>

          {/* Right Sidebar: Syllabus & Lesson Progression */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-extrabold text-sm text-[#112734]">পাঠ্যতালিকা ও অগ্রগতি</h4>
                <span className={`text-xs font-bold ${computedPercentage === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {computedPercentage}% সম্পন্ন {computedPercentage === 100 ? '✓' : ''}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${computedPercentage === 100 ? 'bg-emerald-600' : 'bg-[#112734]'}`}
                  style={{ width: `${computedPercentage}%` }}
                />
              </div>

              {/* Lessons List */}
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {selectedCourse.lessons.map((lesson, idx) => {
                  const isActive = activeLesson.id === lesson.id;
                  const completed = isLessonCompleted(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`w-full p-3 rounded-2xl text-left text-xs transition-all flex items-center justify-between gap-2 border ${
                        isActive
                          ? 'border-[#112734] bg-[#17A2B8]/10 text-[#112734] font-bold'
                          : 'border-[#ece8e0] hover:bg-slate-50 text-[#5a524d]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                          completed ? 'bg-[#17A2B8] text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {completed ? '✓' : idx + 1}
                        </span>
                        <span className="truncate">{lesson.title}</span>
                      </div>
                      <span className="text-[10px] text-[#8a817c] shrink-0">{lesson.duration}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Modal */}
        {showQuizModal && (
          <QuizModal
            isOpen={showQuizModal}
            onClose={() => setShowQuizModal(false)}
            lessonTitle={activeLesson.title}
            onPass={() => handleMarkComplete(activeLesson.id)}
          />
        )}

        {/* Certificate View Modal */}
        {viewingCertificate && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-2 sm:p-6 flex flex-col items-center justify-start">
            <div className="max-w-5xl w-full my-auto py-2 sm:py-6">
              <CertificateView
                userName={viewingCertificate.userName}
                courseTitle={viewingCertificate.courseTitle}
                issueDate={viewingCertificate.issueDate}
                certificateNumber={viewingCertificate.certificateNumber}
                grade={viewingCertificate.grade}
                certificateCopyUrl={viewingCertificate.certificateCopyUrl || viewingCertificate.customPdfUrl}
                onClose={() => setViewingCertificate(null)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // General Student Dashboard Overview
  return (
    <div className="min-h-screen bg-[#fdfcf9] font-sans text-[#2c3e50] py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* User Greeting Card */}
        <div className="bg-[#112734] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#17A2B8] text-slate-950 flex items-center justify-center text-xl font-bold overflow-hidden shadow-md">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'User Profile'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{user.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <span className="text-[11px] text-[#17A2B8] font-bold uppercase tracking-wider">
                স্বাগতম, শিক্ষার্থী
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{user.name}</h1>
              <p className="text-xs text-[#17A2B8]/80">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="px-4 py-2 bg-[#17A2B8] hover:bg-[#17A2B8]/20 text-slate-950 font-extrabold rounded-xl text-xs shadow transition-colors"
              >
                অ্যাডমিন প্যানেল
              </Link>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 bg-[#112734] hover:bg-[#112734] text-[#17A2B8]/80 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <LogOut size={14} />
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-2 border-b border-[#ece8e0] pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'courses'
                ? 'bg-[#112734] text-white'
                : 'bg-white text-[#5a524d] hover:bg-slate-50 border border-[#ece8e0]'
            }`}
          >
            আমার কোর্সসমূহ
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'books'
                ? 'bg-[#112734] text-white'
                : 'bg-white text-[#5a524d] hover:bg-slate-50 border border-[#ece8e0]'
            }`}
          >
            সংগৃহীত কিতাব (E-Books)
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'orders'
                ? 'bg-[#112734] text-white'
                : 'bg-white text-[#5a524d] hover:bg-slate-50 border border-[#ece8e0]'
            }`}
          >
            অর্ডার ও লেনদেন হিস্ট্রি ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'certificates'
                ? 'bg-[#112734] text-white'
                : 'bg-white text-[#5a524d] hover:bg-slate-50 border border-[#ece8e0]'
            }`}
          >
            <Award size={14} />
            <span>আমার সনদপত্র ({userCerts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('live_classes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'live_classes'
                ? 'bg-[#112734] text-white'
                : 'bg-white text-[#5a524d] hover:bg-slate-50 border border-[#ece8e0]'
            }`}
          >
            <Video size={14} />
            <span>লাইভ ক্লাস ({liveClasses.length})</span>
          </button>
        </div>

        {/* Tab 1: Enrolled Courses */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-lg text-[#112734]">ভর্তিকৃত পাঠ্যক্রম</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const prog = progressList.find(p => p.courseId === course.id);
                const totalL = course.lessons?.length || 1;
                const doneL = prog?.completedLessons?.length || prog?.completedLessonIds?.length || 0;
                const isFinished = Boolean(prog?.isCompleted || (prog && prog.progressPercentage >= 100) || doneL >= totalL);
                const percent = isFinished ? 100 : (prog ? Math.min(100, Math.round((doneL / totalL) * 100)) : 0);

                const handleCardComplete = () => {
                  AppStore.completeCourseFully(user.uid, course.id, user.name);
                  const cert = AppStore.getCertificates(user.uid).find(c => c.courseId === course.id);
                  if (cert) {
                    setViewingCertificate({
                      userName: cert.userName,
                      courseTitle: cert.courseTitle,
                      issueDate: cert.issueDate,
                      certificateNumber: cert.certificateNumber,
                      grade: cert.grade,
                      certificateCopyUrl: cert.certificateCopyUrl || cert.customPdfUrl
                    });
                  } else {
                    setViewingCertificate({
                      userName: user.name || 'শিক্ষার্থী',
                      courseTitle: course.titleBn,
                      issueDate: new Date().toLocaleDateString('bn-BD'),
                      certificateNumber: `NFA-${course.id.substring(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
                      grade: 'Mumtaz (Distinction)'
                    });
                  }
                };

                return (
                  <div
                    key={course.id}
                    className="bg-white p-5 rounded-3xl border border-[#ece8e0] card-natural-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video rounded-2xl overflow-hidden mb-3">
                        <img
                          src={course.thumbnail}
                          alt={course.titleBn}
                          className="w-full h-full object-cover"
                        />
                        {isFinished && (
                          <div className="absolute top-2 right-2 bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                            <CheckCircle size={12} />
                            <span>১০০% সম্পন্ন</span>
                          </div>
                        )}
                      </div>
                      <h4 className="font-extrabold text-base text-[#2c3e50] mb-2">{course.titleBn}</h4>
                      <p className="text-xs text-[#8a817c] mb-4">ইন্সট্রাক্টর: {course.instructor.nameBn}</p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-[#ece8e0]">
                      <div className="flex items-center justify-between text-xs font-bold text-[#5a524d]">
                        <span>অগ্রগতি</span>
                        <span className={percent === 100 ? 'text-emerald-700 font-extrabold' : 'text-[#112734]'}>
                          {percent}% সম্পন্ন {percent === 100 ? '✓' : ''}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${percent === 100 ? 'bg-emerald-600' : 'bg-[#112734]'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={() => setSelectedCourse(course)}
                          className="w-full py-2.5 bg-[#112734] hover:bg-[#23626F] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <PlayCircle size={15} />
                          <span>{percent === 100 ? 'ক্লাস পুনরায় দেখুন' : 'ক্লাস শুরু করুন'}</span>
                        </button>

                        {percent === 100 ? (
                          <button
                            onClick={handleCardComplete}
                            className="w-full py-2 bg-[#17A2B8] hover:bg-[#23626F] text-slate-950 hover:text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Award size={14} />
                            <span>সনদপত্র দেখুন 🎓</span>
                          </button>
                        ) : (
                          <button
                            onClick={handleCardComplete}
                            className="w-full py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl text-[11px] transition-colors flex items-center justify-center gap-1"
                          >
                            <Award size={13} />
                            <span>সম্পূর্ণ চিহ্নিত করে সনদ নিন 🎓</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Purchased Books & Library */}
        {activeTab === 'books' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl text-[#112734]">আমার লাইব্রেরি ও ই-বুক</h3>
                <p className="text-xs text-[#8a817c]">আপনার ক্রয়কৃত ও অনুমোদিত সকল ফিকহ কিতাবের ডিজিটাল পিডিএফ সংস্করণ</p>
              </div>
              <Link
                href="/books"
                className="px-4 py-2 bg-[#17A2B8]/10 hover:bg-[#17A2B8]/15 text-[#112734] rounded-xl text-xs font-bold border border-[#17A2B8]/30 flex items-center gap-1.5 transition-colors"
              >
                <Library size={15} />
                <span>আরও কিতাব কিনুন</span>
              </Link>
            </div>
            
            <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
              <AlertCircle size={20} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold mb-1">পিডিএফ (PDF) বই ব্যবহারের শর্তাবলী ও আমানতদারি নির্দেশিকা:</p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-800/90">
                  <li>এই পিডিএফটি শুধুমাত্র আপনার ব্যক্তিগত অধ্যয়নের জন্য। এটি প্রিন্ট করে বিক্রি করা বা অন্য কাউকে দেওয়া সম্পূর্ণ নিষেধ (আমানতের খেয়ানত)।</li>
                  <li>সোশ্যাল মিডিয়া, টেলিগ্রাম বা অন্য কোনো পাবলিক গ্রুপে এর কপি শেয়ার করা কপিরাইট ও শরীয়তের আমানতদারির সরাসরি লঙ্ঘন।</li>
                  <li>মোবাইল বা কম্পিউটারে যেকোনো সময় সরাসরি পড়ার ও ডাউনলোড করার সুবিধা উন্মুক্ত রয়েছে। আল্লাহ তা&apos;আলা আপনার ইলমে বরকত দান করুন।</li>
                </ul>
              </div>
            </div>

            {/* Pending PDF Orders Notice */}
            {orders.filter(o => o.status === 'pending' && o.itemType === 'book' && (o.purchaseType === 'pdf' || o.purchaseType === 'full_access')).length > 0 && (
              <div className="bg-blue-50/90 border border-blue-200 p-4 rounded-2xl flex items-start gap-3 text-blue-900 text-xs">
                <Clock size={18} className="shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-950 mb-0.5">যাচাইাধীন কিতাবের অর্ডার রয়েছে:</p>
                  <p className="text-[11px] text-blue-800">
                    আপনার {orders.filter(o => o.status === 'pending' && o.itemType === 'book').length}টি কিতাবের পেমেন্ট তথ্য এডমিন কর্তৃক ভেরিফাই হচ্ছে। এডমিন অনুমোদন দেওয়া মাত্রই তা স্বয়ংক্রিয়ভাবে নিচে পড়ার জন্য উন্মুক্ত হয়ে যাবে।
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {AppStore.getBooks().filter(book => {
                // Check if user has an approved order for this book's PDF
                return orders.some(o => 
                  o.status === 'approved' && 
                  o.itemType === 'book' && 
                  o.itemId === book.id && 
                  (o.purchaseType === 'pdf' || o.purchaseType === 'full_access')
                );
              }).map((book) => {
                const targetPdfUrl = book.pdfUrl || book.previewPdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
                return (
                  <div key={book.id} className="bg-white p-5 rounded-3xl border border-[#ece8e0] card-natural-shadow flex flex-col justify-between relative overflow-hidden group">
                    <div className="flex gap-4 mb-4">
                      <div className="w-20 aspect-[3/4] rounded-xl overflow-hidden shadow-md shrink-0 border border-slate-100 bg-slate-50">
                        <img src={book.coverImage} alt={book.titleBn} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1.5 flex-grow min-w-0">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#17A2B8]/10 text-[#23626F] text-[9px] font-black uppercase rounded-md border border-[#17A2B8]/20">
                          <CheckCircle size={10} className="text-[#17A2B8]" />
                          <span>PDF আনলকড</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-[#2c3e50] line-clamp-2 leading-tight">{book.titleBn}</h4>
                        <p className="text-[11px] text-[#8a817c] truncate">{book.authorBn}</p>
                        <p className="text-[10px] text-[#112734] font-semibold">{book.pages} পৃষ্ঠা • {book.language || 'বাংলা'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#ece8e0]">
                      <button
                        onClick={() => setReadingBookPdf({ titleBn: book.titleBn, pdfUrl: targetPdfUrl })}
                        className="py-2.5 px-3 bg-[#17A2B8]/10 hover:bg-[#17A2B8]/15 text-[#112734] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-[#17A2B8]/30 transition-colors"
                      >
                        <Eye size={14} />
                        <span>অনলাইনে পড়ুন</span>
                      </button>

                      <a
                        href={targetPdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-3 bg-[#112734] hover:bg-[#23626F] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Download size={14} />
                        <span>ডাউনলোড</span>
                      </a>
                    </div>
                  </div>
                );
              })}
              
              {AppStore.getBooks().filter(book => orders.some(o => o.status === 'approved' && o.itemType === 'book' && o.itemId === book.id && (o.purchaseType === 'pdf' || o.purchaseType === 'full_access'))).length === 0 && (
                <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-[#ece8e0] space-y-4">
                  <Library className="mx-auto text-slate-300" size={48} />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-base text-[#2c3e50]">আপনার লাইব্রেরিতে কোনো সক্রিয় ই-বুক নেই</h4>
                    <p className="text-xs text-[#8a817c]">আপনি যেকোনো ফিকহ কিতাবের পিডিএফ সংস্করণ কিনলে এখানে আজীবনের জন্য পড়তে পারবেন।</p>
                  </div>
                  <Link
                    href="/books"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#112734] hover:bg-[#23626F] text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                  >
                    <BookOpen size={15} />
                    <span>কিতাবের ক্যাটালগ দেখুন</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Orders History */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-lg text-[#112734]">অর্ডার ও ট্রানজেকশন তালিকা</h3>
            {orders.length > 0 ? (
              <div className="bg-white rounded-3xl border border-[#ece8e0] card-natural-shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fdfcf9] border-b border-[#ece8e0] text-[#8a817c] uppercase">
                      <tr>
                        <th className="p-4">অর্ডার আইডি</th>
                        <th className="p-4">আইটেম</th>
                        <th className="p-4">পেমেন্ট মেথড</th>
                        <th className="p-4">মূল্য</th>
                        <th className="p-4">স্ট্যাটাস</th>
                        <th className="p-4">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ece8e0]">
                      {orders.map((ord) => {
                        const linkedBook = ord.itemType === 'book' ? AppStore.getBookById(ord.itemId) : null;
                        const linkedCourse = ord.itemType === 'course' ? AppStore.getCourseById(ord.itemId) : null;
                        return (
                          <tr key={ord.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-mono font-bold">{ord.orderNumber}</td>
                            <td className="p-4">
                              <p className="font-bold text-[#2c3e50]">{ord.itemTitle}</p>
                              <span className="text-[10px] text-slate-500">
                                {ord.itemType === 'course' ? 'অনলাইন কোর্স' : (ord.purchaseType === 'pdf' ? 'ই-বুক (PDF)' : 'হার্ডকভার প্রিন্ট')}
                              </span>
                            </td>
                            <td className="p-4 uppercase font-mono text-[11px]">
                              {ord.paymentMethod} • Trx: {ord.trxId || 'N/A'}
                            </td>
                            <td className="p-4 font-bold text-[#112734]">৳{ord.amount}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                ord.status === 'approved'
                                  ? 'bg-[#17A2B8]/15 text-[#112734]'
                                  : (ord.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800')
                              }`}>
                                {ord.status === 'approved' ? 'অনুমোদিত ✓' : (ord.status === 'rejected' ? 'বাতিল' : 'যাচাইাধীন')}
                              </span>
                            </td>
                            <td className="p-4">
                              {ord.status === 'approved' && ord.itemType === 'book' && (ord.purchaseType === 'pdf' || ord.purchaseType === 'full_access') && linkedBook && (
                                <button
                                  onClick={() => setReadingBookPdf({ 
                                    titleBn: linkedBook.titleBn, 
                                    pdfUrl: linkedBook.pdfUrl || linkedBook.previewPdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
                                  })}
                                  className="px-3 py-1.5 bg-[#112734] hover:bg-[#23626F] text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                >
                                  <Eye size={12} />
                                  <span>PDF পড়ুন</span>
                                </button>
                              )}
                              {ord.status === 'approved' && ord.itemType === 'course' && linkedCourse && (
                                <button
                                  onClick={() => {
                                    setSelectedCourse(linkedCourse);
                                    setActiveTab('courses');
                                  }}
                                  className="px-3 py-1.5 bg-[#17A2B8]/15 hover:bg-emerald-200 text-[#112734] rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                >
                                  <PlayCircle size={12} />
                                  <span>ক্লাস শুরু</span>
                                </button>
                              )}
                              {ord.status === 'pending' && (
                                <span className="text-[10px] text-amber-700 font-semibold italic">ভেরিফিকেশনে আছে</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-[#ece8e0]">
                <p className="text-xs text-[#8a817c]">এখনও কোনো অর্ডার সম্পন্ন করা হয়নি।</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Certificates */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-[#112734]">আমার অর্জনকৃত সনদপত্রসমূহ</h3>
                <p className="text-xs text-[#8a817c]">কোর্স সফলভাবে সম্পন্ন করার পর নূর ফিকহ একাডেমি কর্তৃক ইস্যুকৃত ভেরিফায়েড ডিজিটাল সনদপত্র</p>
              </div>
              <Link
                href="/verify-certificate"
                className="px-4 py-2 bg-[#17A2B8]/10 hover:bg-[#17A2B8]/15 text-[#112734] rounded-xl text-xs font-bold border border-[#17A2B8]/30 flex items-center gap-1.5 transition-colors"
              >
                <ShieldAlert size={14} />
                <span>পাবলিক ভেরিফিকেশন পেজ</span>
              </Link>
            </div>

            {userCerts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userCerts.map((cert) => (
                  <div key={cert.id} className="bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-[#17A2B8]/10 text-[#112734] font-mono text-xs font-bold rounded-lg border border-[#17A2B8]/30">
                          {cert.certificateNumber}
                        </span>
                        <span className="text-[11px] text-[#8a817c] font-medium">{cert.issueDate}</span>
                      </div>

                      <h4 className="font-extrabold text-base text-[#2c3e50]">{cert.courseTitle}</h4>
                      <p className="text-xs text-[#112734] font-bold">ফলাফল: {cert.grade || 'Mumtaz (Distinction)'}</p>
                    </div>

                    <div className="pt-4 border-t border-[#ece8e0] flex items-center justify-between">
                      <button
                        onClick={() => setViewingCertificate(cert)}
                        className="w-full py-3 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all"
                      >
                        <Award size={16} />
                        <span>সনদ দেখুন ও ডাউনলোড করুন</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-[#ece8e0] space-y-4">
                <Award className="mx-auto text-slate-300" size={56} />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-[#2c3e50]">আপনার কোনো সনদপত্র ইস্যু হয়নি</h4>
                  <p className="text-xs text-[#8a817c]">যেকোনো কোর্সে ভর্তি হয়ে তা সফলভাবে সম্পন্ন করলে আপনার ড্যাশবোর্ডে সনদপত্র স্বয়ংক্রিয়ভাবে যুক্ত হবে।</p>
                </div>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#112734] hover:bg-[#23626F] text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                >
                  <BookOpen size={15} />
                  <span>কোর্স ক্যাটালগ দেখুন</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Live Classes */}
        {activeTab === 'live_classes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl text-[#112734]">লাইভ ক্লাস ও ওয়েবিনার শিডিউল</h3>
                <p className="text-xs text-[#8a817c]">জুম বা গুগল মিটের মাধ্যমে লাইভ প্রশ্নোত্তর ও ক্লাসে যুক্ত হওয়ার লিংক ও কাউন্টডাউন</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveClasses.map((cls) => (
                <LiveClassCard
                  key={cls.id}
                  liveClass={cls}
                  onSelectPayment={(c) => setSelectedLiveClassForPayment(c)}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* PDF Reading Modal for Dashboard */}
      {readingBookPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-emerald-950">
            {/* Reader Header */}
            <div className="p-4 bg-[#112734] text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <BookOpen className="text-[#17A2B8] shrink-0" size={20} />
                <h3 className="font-extrabold text-sm sm:text-base truncate">
                  {readingBookPdf.titleBn} (ই-বুক রিডার)
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={readingBookPdf.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#23626F] hover:bg-[#23626F] text-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                  title="নতুন ট্যাবে বা বাহ্যিক অ্যাপে খুলুন"
                >
                  <ExternalLink size={13} />
                  <span className="hidden sm:inline">নতুন উইন্ডোতে খুলুন</span>
                </a>
                <button
                  onClick={() => setReadingBookPdf(null)}
                  className="p-1.5 hover:bg-[#23626F] rounded-full text-[#17A2B8]/80 hover:text-white transition-colors"
                  title="বন্ধ করুন"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Embedded PDF Viewer */}
            <div className="flex-1 bg-slate-900 relative">
              <iframe
                src={readingBookPdf.pdfUrl.includes('drive.google.com') && !readingBookPdf.pdfUrl.includes('/preview') 
                  ? readingBookPdf.pdfUrl.replace('/view', '/preview') 
                  : readingBookPdf.pdfUrl}
                className="w-full h-full border-none"
                title={readingBookPdf.titleBn}
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal Viewer */}
      {viewingCertificate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-2 sm:p-6 flex flex-col items-center justify-start">
          <div className="max-w-5xl w-full my-auto py-2 sm:py-6">
            <CertificateView
              userName={viewingCertificate.userName}
              courseTitle={viewingCertificate.courseTitle}
              issueDate={viewingCertificate.issueDate}
              certificateNumber={viewingCertificate.certificateNumber}
              grade={viewingCertificate.grade}
              certificateCopyUrl={viewingCertificate.certificateCopyUrl || viewingCertificate.customPdfUrl}
              onClose={() => setViewingCertificate(null)}
            />
          </div>
        </div>
      )}

      {/* Live Class Payment Modal */}
      {selectedLiveClassForPayment && (
        <PaymentModal
          isOpen={!!selectedLiveClassForPayment}
          onClose={() => setSelectedLiveClassForPayment(null)}
          item={{
            id: selectedLiveClassForPayment.id,
            title: selectedLiveClassForPayment.title,
            titleBn: selectedLiveClassForPayment.titleBn,
            price: selectedLiveClassForPayment.price,
            type: 'live_class',
            purchaseType: 'full_access'
          }}
          onSuccess={() => {
            if (user) {
              AppStore.registerForLiveClass(selectedLiveClassForPayment.id, user.uid);
            }
          }}
        />
      )}
    </div>
  );
}
