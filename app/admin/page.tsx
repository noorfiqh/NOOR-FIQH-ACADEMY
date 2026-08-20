'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { AppStore } from '@/lib/store';
import { Course, Book, FatwaQuestion, Order, Certificate, LiveClass, SiteReview, Lesson, QuizQuestion, UserProfile, FacultyMember, SiteSettings } from '@/lib/types';
import { LoginModal } from '@/components/LoginModal';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  BookOpen, 
  ShoppingBag, 
  Award, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  DollarSign, 
  Users, 
  Send, 
  Video, 
  Settings, 
  Star, 
  LayoutDashboard, 
  Save, 
  Layers, 
  FileText, 
  Eye, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  ExternalLink, 
  ChevronRight, 
  Menu, 
  X, 
  Phone, 
  MessageSquare, 
  Image as ImageIcon, 
  Upload, 
  Sliders, 
  UserCheck, 
  UserPlus, 
  GraduationCap, 
  Mail,
  Printer
} from 'lucide-react';
import { CertificateView } from '@/components/CertificateView';
import { sendTestNotificationEmail } from '@/lib/email-service';

type AdminTab = 'overview' | 'courses' | 'orders' | 'fatwas' | 'books' | 'live_classes' | 'certificates' | 'reviews' | 'users' | 'faculty' | 'settings';

export default function AdminDashboardPage() {
  const { user, isAdmin, changeUserRole } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Core Data States
  const [courses, setCourses] = useState<Course[]>(() => AppStore.getCourses());
  const [orders, setOrders] = useState<Order[]>(() => AppStore.getOrders());
  const [fatwas, setFatwas] = useState<FatwaQuestion[]>(() => AppStore.getFatwas());
  const [books, setBooks] = useState<Book[]>(() => AppStore.getBooks());
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>(() => AppStore.getLiveClasses());
  const [certificates, setCertificates] = useState<Certificate[]>(() => AppStore.getCertificates());
  const [reviews, setReviews] = useState<SiteReview[]>(() => AppStore.getReviews());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => AppStore.getSettings());
  const [usersList, setUsersList] = useState<UserProfile[]>(() => AppStore.getUsers());
  const [facultyList, setFacultyList] = useState<FacultyMember[]>(() => AppStore.getFaculty());

  // Faculty Management State
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyCategoryFilter, setFacultyCategoryFilter] = useState<'all' | 'council' | 'faculty' | 'advisor'>('all');
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);
  const [isNewFaculty, setIsNewFaculty] = useState(false);

  // User Management State

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'scholar' | 'admin'>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<'student' | 'scholar' | 'admin'>('student');


  // Search & Filter States
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [fatwaFilter, setFatwaFilter] = useState<'all' | 'pending' | 'answered'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Course Editor State
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isNewCourse, setIsNewCourse] = useState(false);

  // Fatwa Modal State
  const [answeringFatwa, setAnsweringFatwa] = useState<FatwaQuestion | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerRefs, setAnswerRefs] = useState('');

  // Book Editor State
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isNewBook, setIsNewBook] = useState(false);

  // Live Class State
  const [editingLiveClass, setEditingLiveClass] = useState<LiveClass | null>(null);
  const [isNewLiveClass, setIsNewLiveClass] = useState(false);
  const [viewingLiveClassEnrollments, setViewingLiveClassEnrollments] = useState<LiveClass | null>(null);

  // Manual Certificate Issue State
  const [showIssueCertModal, setShowIssueCertModal] = useState(false);
  const [previewingCert, setPreviewingCert] = useState<Certificate | null>(null);
  const [certStudentName, setCertStudentName] = useState('');
  const [certCourseTitle, setCertCourseTitle] = useState('');
  const [certGrade, setCertGrade] = useState('Mumtaz (Distinction)');
  const [certCopyUrl, setCertCopyUrl] = useState('');

  // Review Editor State
  const [editingReview, setEditingReview] = useState<SiteReview | null>(null);
  const [isNewReview, setIsNewReview] = useState(false);

  // Settings Sub-sidebar Navigation State
  const [settingsSubTab, setSettingsSubTab] = useState<'general' | 'hero' | 'notice' | 'about' | 'terms' | 'faq' | 'contact' | 'marketing' | 'email_notify'>('general');
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailFeedback, setTestEmailFeedback] = useState<{ success: boolean; needsActivation?: boolean; message: string } | null>(null);

  const handleSendTestEmail = async () => {
    setTestEmailLoading(true);
    setTestEmailFeedback(null);
    const target = siteSettings.orderNotificationEmail?.trim() || 'noorfiqhaca@gmail.com';
    const res = await sendTestNotificationEmail(target, siteSettings.formSubmitEndpoint);
    setTestEmailFeedback(res);
    setTestEmailLoading(false);
  };

  const showNotification = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Load / Refresh all data
  const refreshAllData = () => {
    setCourses(AppStore.getCourses());
    setOrders(AppStore.getOrders());
    setFatwas(AppStore.getFatwas());
    setBooks(AppStore.getBooks());
    setLiveClasses(AppStore.getLiveClasses());
    setCertificates(AppStore.getCertificates());
    setReviews(AppStore.getReviews());
    setSiteSettings(AppStore.getSettings());
    setUsersList(AppStore.getUsers());
    setFacultyList(AppStore.getFaculty());
  };

  // Faculty & Research Council Handlers
  const handleOpenNewFaculty = () => {
    const newFaculty: FacultyMember = {
      id: 'fac-' + Date.now(),
      name: '',
      nameBn: '',
      designation: '',
      category: 'council',
      categoryLabelBn: 'গবেষণা পরিষদ',
      qualifications: '',
      bio: '',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      email: '',
      phone: '',
      order: facultyList.length + 1
    };
    setEditingFaculty(newFaculty);
    setIsNewFaculty(true);
  };

  const handleEditFaculty = (faculty: FacultyMember) => {
    setEditingFaculty(JSON.parse(JSON.stringify(faculty)));
    setIsNewFaculty(false);
  };

  const handleSaveFaculty = (faculty: FacultyMember) => {
    AppStore.saveFacultyMember(faculty);
    refreshAllData();
    setEditingFaculty(null);
    showNotification('গবেষণা পরিষদ ও শিক্ষক তথ্য সফলভাবে সংরক্ষণ করা হয়েছে');
  };

  const handleDeleteFaculty = (id: string, name: string) => {
    if (confirm(`আপনি কি "${name}"-কে তালিকা থেকে মুছে ফেলতে চান?`)) {
      AppStore.deleteFacultyMember(id);
      refreshAllData();
      showNotification('সদস্য মুছে ফেলা হয়েছে');
    }
  };


  // User Management Handlers
  const handleRoleChange = async (userIdOrEmail: string, newRole: 'student' | 'scholar' | 'admin') => {
    await changeUserRole(userIdOrEmail, newRole);
    refreshAllData();
    const roleText = newRole === 'admin' ? 'এডমিন' : newRole === 'scholar' ? 'মুফতী / স্কলার' : 'শিক্ষার্থী';
    showNotification(`ব্যবহারকারীর রোল পরিবর্তন করে "${roleText}" করা হয়েছে`);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`আপনি কি "${userName}" ব্যবহারকারীর প্রোফাইল মুছে ফেলতে চান?`)) {
      AppStore.deleteUser(userId);
      refreshAllData();
      showNotification('ব্যবহারকারী সফলভাবে ডিলিট করা হয়েছে');
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert('অনুগ্রহ করে নাম এবং ইমেইল প্রদান করুন');
      return;
    }

    const newUser: UserProfile = {
      uid: 'usr-' + Date.now(),
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      phone: newUserPhone.trim() || undefined,
      role: newUserRole,
      joinedAt: new Date().toISOString().split('T')[0]
    };

    AppStore.saveUser(newUser);
    refreshAllData();
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserRole('student');
    showNotification(`নতুন ব্যবহারকারী "${newUser.name}" সফলভাবে যুক্ত করা হয়েছে`);
  };


  // Calculate Key Business Metrics
  const totalRevenue = orders
    .filter(o => o.status === 'approved')
    .reduce((sum, o) => sum + (o.amount || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const pendingFatwasCount = fatwas.filter(f => f.status === 'pending').length;

  // Order Handlers
  const handleApproveOrder = (orderId: string) => {
    AppStore.updateOrderStatus(orderId, 'approved');
    refreshAllData();
    showNotification('অর্ডার ও কোর্স এক্সেস সফলভাবে অনুমোদন করা হয়েছে');
  };

  const handleRejectOrder = (orderId: string) => {
    AppStore.updateOrderStatus(orderId, 'rejected');
    refreshAllData();
    showNotification('অর্ডারটি বাতিল করা হয়েছে');
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('আপনি কি এই অর্ডার রেকর্ডটি মুছে ফেলতে চান?')) {
      AppStore.deleteOrder(orderId);
      refreshAllData();
      showNotification('অর্ডার রেকর্ড মুছে ফেলা হয়েছে');
    }
  };

  // Fatwa Answering Handler
  const handleAnswerFatwaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answeringFatwa || !answerText.trim()) return;

    AppStore.answerFatwa(answeringFatwa.id, {
      answer: answerText,
      references: answerRefs || undefined,
      answeredBy: user?.name || 'মুফতী পরিষদ, নূর ফিকহ একাডেমি'
    });

    setAnsweringFatwa(null);
    setAnswerText('');
    setAnswerRefs('');
    refreshAllData();
    showNotification('ফতোয়ার উত্তর সফলভাবে সংরক্ষণ ও প্রকাশ করা হয়েছে');
  };

  // Course Save Handler
  const handleSaveCourseSubmit = (courseToSave: Course) => {
    AppStore.saveCourse(courseToSave);
    setEditingCourse(null);
    setIsNewCourse(false);
    refreshAllData();
    showNotification(`কোর্স "${courseToSave.titleBn}" সফলভাবে সংরক্ষণ করা হয়েছে`);
  };

  const handleDeleteCourse = (id: string, title: string) => {
    if (confirm(`আপনি কি "${title}" কোর্সটি ডিলিট করতে চান?`)) {
      AppStore.deleteCourse(id);
      refreshAllData();
      showNotification('কোর্সটি মুছে ফেলা হয়েছে');
    }
  };

  // Book Save Handler
  const handleSaveBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    AppStore.saveBook(editingBook);
    setEditingBook(null);
    setIsNewBook(false);
    refreshAllData();
    showNotification(`কিতাব "${editingBook.titleBn}" সফলভাবে সংরক্ষণ করা হয়েছে`);
  };

  const handleDeleteBook = (id: string, title: string) => {
    if (confirm(`আপনি কি "${title}" কিতাবটি মুছে ফেলতে চান?`)) {
      AppStore.deleteBook(id);
      refreshAllData();
      showNotification('কিতাব রেকর্ড মুছে ফেলা হয়েছে');
    }
  };

  // Live Class Save Handler
  const handleSaveLiveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLiveClass) return;

    AppStore.saveLiveClass(editingLiveClass);
    setEditingLiveClass(null);
    setIsNewLiveClass(false);
    refreshAllData();
    showNotification('লাইভ ক্লাস শিডিউল আপডেট করা হয়েছে');
  };

  const handleDeleteLiveClass = (id: string) => {
    if (confirm('আপনি কি এই লাইভ ক্লাসটি ডিলিট করতে চান?')) {
      AppStore.deleteLiveClass(id);
      refreshAllData();
      showNotification('লাইভ ক্লাস মুছে ফেলা হয়েছে');
    }
  };

  // Certificate Issue Handler
  const handleIssueCertificateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certStudentName.trim() || !certCourseTitle.trim()) return;

    AppStore.issueCertificate(
      'manual-' + Date.now(),
      certStudentName.trim(),
      'course-' + Date.now(),
      certCourseTitle.trim(),
      'B1',
      certGrade.trim() || 'Mumtaz (Distinction)',
      certCopyUrl.trim() || undefined
    );

    setShowIssueCertModal(false);
    setCertStudentName('');
    setCertCourseTitle('');
    setCertGrade('Mumtaz (Distinction)');
    setCertCopyUrl('');
    refreshAllData();
    showNotification('নতুন ভেরিফায়েড সনদপত্র সফলভাবে ইস্যু করা হয়েছে');
  };

  const handleDeleteCert = (id: string) => {
    if (confirm('আপনি কি এই সার্টিফিকেটটি ডিলিট করতে চান?')) {
      AppStore.deleteCertificate(id);
      refreshAllData();
      showNotification('সার্টিফিকেট মুছে ফেলা হয়েছে');
    }
  };

  // Review Handler
  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    AppStore.saveReview(editingReview);
    setEditingReview(null);
    setIsNewReview(false);
    refreshAllData();
    showNotification('শিক্ষার্থীর রিভিউ সংরক্ষণ করা হয়েছে');
  };

  const handleDeleteReview = (id: string) => {
    if (confirm('আপনি কি এই রিভিউটি ডিলিট করতে চান?')) {
      AppStore.deleteReview(id);
      refreshAllData();
      showNotification('রিভিউ মুছে ফেলা হয়েছে');
    }
  };

  // Settings Save Handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    AppStore.saveSettings(siteSettings);
    refreshAllData();
    showNotification('সাইট সেটিংস ও কন্টাক্ট ইনফরমেশন সফলভাবে আপডেট হয়েছে');
  };

  const navMenuItems = [
    { id: 'overview', label: 'ওভারভিউ ড্যাশবোর্ড', icon: LayoutDashboard, badge: null },
    { id: 'courses', label: 'কোর্স ও পাঠ্যক্রম', icon: BookOpen, badge: `${courses.length}` },
    { id: 'orders', label: 'ভর্তি ও অর্ডার অনুমোদন', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : null, badgeColor: 'bg-amber-500 text-slate-950' },
    { id: 'fatwas', label: 'ফতোয়া ও ইফতা ডেস্ক', icon: HelpCircle, badge: pendingFatwasCount > 0 ? `${pendingFatwasCount}` : null, badgeColor: 'bg-red-500 text-white' },
    { id: 'books', label: 'কিতাব ও প্রকাশনা', icon: Layers, badge: `${books.length}` },
    { id: 'live_classes', label: 'লাইভ ক্লাস শিডিউল', icon: Video, badge: `${liveClasses.length}` },
    { id: 'faculty', label: 'গবেষণা পরিষদ ও শিক্ষকবৃন্দ', icon: GraduationCap, badge: `${facultyList.length}` },
    { id: 'certificates', label: 'সনদ রেজিস্ট্রি', icon: Award, badge: `${certificates.length}` },
    { id: 'reviews', label: 'শিক্ষার্থী মতামত ও রিভিউ', icon: Star, badge: `${reviews.length}` },
    { id: 'users', label: 'ব্যবহারকারী ও রোল ম্যানেজমেন্ট', icon: Users, badge: `${usersList.length}` },
    { id: 'settings', label: 'সাইট সেটিংস ও ব্র্যান্ডিং', icon: Settings, badge: null },
  ];


  // Access Control Barrier: If not authenticated as Admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#112734] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center space-y-6 border border-[#ece8e0] animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-[#17A2B8]/15 text-[#112734] rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-[#17A2B8]/30">
            <ShieldCheck size={36} />
          </div>
          
          <div className="space-y-2">
            <span className="text-[11px] font-black tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase inline-block">
              রেস্ট্রিক্টেড এডমিন এক্সেস
            </span>
            <h2 className="text-2xl font-black text-[#112734] font-anek">
              এডমিন অনুমতি প্রয়োজন
            </h2>
            <p className="text-xs text-[#5a524d] leading-relaxed">
              নূর ফিকহ একাডেমির এডমিন কন্ট্রোল প্যানেল শুধুমাত্র নির্ধারিত অ্যাকাউন্টের জন্য সংরক্ষিত। আপনার কাছে অ্যাডমিন ইমেইল ও আসল পাসওয়ার্ড থাকলে লগইন করুন।
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full py-3.5 bg-[#112734] hover:bg-[#23626F] text-white font-bold font-tiro rounded-xl shadow-lg transition-all text-sm cursor-pointer"
            >
              এডমিন হিসেবে লগইন করুন
            </button>
            <Link
              href="/"
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-tiro rounded-xl transition-all text-xs text-center"
            >
              হোমপেজে ফিরে যান
            </Link>
          </div>
        </div>

        {showLoginModal && (
          <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        )}
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-[#2c3e50] flex flex-col">
      
      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#112734] text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle size={20} className="text-[#17A2B8] shrink-0" />
          <span className="text-xs font-bold">{saveToast}</span>
        </div>
      )}

      {/* Top Admin Header Bar */}
      <header className="bg-[#112734] text-white sticky top-0 z-40 px-4 sm:px-8 py-3.5 border-b border-[#23626F] shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#23626F] text-white hover:bg-[#23626F] transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#17A2B8] text-slate-950 flex items-center justify-center font-black text-lg shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base leading-tight text-white flex items-center gap-1.5">
                <span>নূর ফিকহ একাডেমি • এডমিন কন্ট্রোল প্যানেল</span>
                <span className="text-[10px] bg-[#17A2B8] text-slate-950 px-2 py-0.5 rounded font-black tracking-wider uppercase">
                  MASTER ADMIN
                </span>
              </h1>
              <p className="text-[11px] text-[#17A2B8]/80/80">সাইটের সকল তথ্য, কোর্স, কুইজ, কিতাব ও পেমেন্ট ম্যানেজমেন্ট</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#112734]/80 hover:bg-[#23626F] text-[#17A2B8]/80 rounded-xl text-xs font-bold transition-all border border-[#23626F]/60 font-tiro"
          >
            <ExternalLink size={13} />
            <span>লাইভ সাইট দেখুন</span>
          </Link>
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-[#17A2B8] text-slate-950 rounded-xl text-xs font-extrabold transition-all shadow-sm font-tiro"
          >
            শিক্ষার্থী ভিউ
          </Link>
        </div>
      </header>

      {/* Main Layout Area: Sidebar + Content */}
      <div className="flex-1 flex max-w-full overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className={`
          fixed lg:sticky lg:top-[61px] lg:h-[calc(100vh-61px)] bottom-0 left-0 z-30 w-72 bg-white border-r border-[#ece8e0] flex flex-col transition-transform duration-300 ease-in-out shrink-0
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 border-b border-[#ece8e0] bg-[#fdfcf9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#17A2B8]/10 text-[#112734] font-black flex items-center justify-center border border-[#17A2B8]/30">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="font-extrabold text-xs text-[#2c3e50] truncate">{user?.name || 'মুফতী পরিষদ এডমিন'}</p>
                <p className="text-[10px] text-[#23626F] font-bold">সুপার এডমিনিস্ট্রেটর</p>
              </div>
            </div>
          </div>

          {/* Sidebar Navigation Items */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1 no-scrollbar text-xs font-bold">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isCurrent = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as AdminTab);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-200 text-left ${
                    isCurrent
                      ? 'bg-[#112734] text-white shadow-md'
                      : 'text-[#5a524d] hover:bg-slate-100/80 hover:text-[#112734]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isCurrent ? 'text-[#17A2B8]' : 'text-[#8a817c]'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.badgeColor || (isCurrent ? 'bg-[#112734] text-[#17A2B8]' : 'bg-slate-200 text-slate-800')}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer of Sidebar */}
          <div className="p-4 border-t border-[#ece8e0] bg-[#fdfcf9] text-center text-[11px] text-[#8a817c]">
            <p className="font-semibold text-[#112734]">নূর ফিকহ একাডেমি v2.5</p>
            <p className="text-[10px]">সকল ডেটা সরাসরি সংরক্ষিত হচ্ছে</p>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          />
        )}

        {/* Right Main Content Panel */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in">
              
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-[#112734] to-[#043629] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="text-xs text-[#17A2B8] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} /> একাডেমি সামারি ও অ্যানালিটিক্স
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    স্বাগতম, নূর ফিকহ একাডেমি ম্যানেজমেন্ট প্যানেলে
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl">
                    এখান থেকে সম্পূর্ণ ওয়েবসাইটের কোর্স, লেকচার মডিউল, কুইজ পরীক্ষা, কিতাবসমূহ, ফতোয়া নিরসন ও পেমেন্ট অনুমোদন পরিচালনা করুন।
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => {
                      setIsNewCourse(true);
                      setEditingCourse({
                        id: 'course-' + Date.now(),
                        title: '',
                        titleBn: '',
                        category: 'ibadat',
                        categoryLabelBn: 'তাহরাত ও নামাজ',
                        shortDescription: '',
                        description: '',
                        price: 1500,
                        originalPrice: 2000,
                        duration: '৩ মাস (২৪ লেকচার)',
                        level: 'intermediate',
                        levelBn: 'মধ্যম স্তর',
                        totalLessons: 1,
                        thumbnail: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80',
                        badge: 'নতুন কোর্স',
                        instructor: {
                          id: 'inst-1',
                          name: 'Mufti Abdullah Al-Noor',
                          nameBn: 'মুফতী আব্দুল্লাহ আন-নূর',
                          title: 'প্রধান গবেষক ও মুফতী',
                          roleBn: 'দারুল উলুম দেওবন্দ',
                          bio: 'উচ্চতর ফিকহ ও সমকালীন অর্থনীতি বিশেষজ্ঞ।',
                          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
                        },
                        objectives: ['বিশুদ্ধ মাসআলা অনুধাবন', 'দলীলভিত্তিক পড়াশোনা'],
                        lessons: [
                          {
                            id: 'les-1',
                            title: '১ম পাঠ: ভূমিকা ও মূলনীতি',
                            duration: '৪৫ মিনিট',
                            isFreePreview: true,
                            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                            pdfNotesUrl: ''
                          }
                        ],
                        rating: 4.9,
                        totalStudents: 0
                      });
                      setActiveTab('courses');
                    }}
                    className="px-4 py-2.5 bg-[#17A2B8] hover:bg-[#17A2B8]/20 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <Plus size={15} />
                    <span>নতুন কোর্স তৈরি</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className="px-4 py-2.5 bg-[#112734] hover:bg-[#23626F] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 border border-[#23626F]/80 transition-all"
                  >
                    <ShoppingBag size={15} />
                    <span>অর্ডার ভেরিফাই করুন</span>
                  </button>
                </div>
              </div>

              {/* Metric Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8a817c]">মোট সংগৃহীত পেমেন্ট</span>
                    <div className="w-9 h-9 rounded-xl bg-[#17A2B8]/10 text-[#23626F] flex items-center justify-center font-bold">
                      ৳
                    </div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#112734]">৳{totalRevenue.toLocaleString()}</h3>
                  <p className="text-[11px] text-[#17A2B8] font-semibold">{orders.filter(o => o.status === 'approved').length}টি সফল ভর্তি ও অর্ডার</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8a817c]">পেন্ডিং ভর্তি ও পেমেন্ট</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                      <ShoppingBag size={18} />
                    </div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-amber-700">{pendingOrdersCount}</h3>
                  <p className="text-[11px] text-amber-800 font-semibold">TrxID যাচাইয়ের অপেক্ষায় আছে</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8a817c]">অমীমাংসিত ফতোয়া প্রশ্ন</span>
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold">
                      <HelpCircle size={18} />
                    </div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-red-600">{pendingFatwasCount}</h3>
                  <p className="text-[11px] text-red-600 font-semibold">মুফতী পরিষদ পর্যালোচনায়</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8a817c]">সক্রিয় কোর্স ও লেকচার</span>
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                      <BookOpen size={18} />
                    </div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#2c3e50]">{courses.length} কোর্স</h3>
                  <p className="text-[11px] text-[#8a817c] font-semibold">{courses.reduce((acc, c) => acc + c.lessons.length, 0)}টি সম্পূর্ণ লেকচার</p>
                </div>
              </div>

              {/* Recent Pending Orders Preview */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#112734]">সর্বশেষ ভর্তি ও অর্ডার রিকোয়েস্ট</h3>
                    <p className="text-xs text-[#8a817c]">বিকাশ / নগদ পেমেন্ট যাচাই করে তাৎক্ষণিক এপ্রুভ করুন</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#112734] hover:underline flex items-center gap-1"
                  >
                    <span>সকল অর্ডার দেখুন</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fdfcf9] border-b border-[#ece8e0] text-[#8a817c] uppercase">
                      <tr>
                        <th className="p-3">অর্ডার নং</th>
                        <th className="p-3">শিক্ষার্থী</th>
                        <th className="p-3">কোর্স / আইটেম</th>
                        <th className="p-3">পেমেন্ট মেথড ও TrxID</th>
                        <th className="p-3">পরিমাণ</th>
                        <th className="p-3">স্ট্যাটাস ও অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ece8e0]">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-[#112734]">{ord.orderNumber}</td>
                          <td className="p-3 font-bold text-[#2c3e50]">
                            {ord.userName}
                            <p className="text-[10px] font-normal text-[#8a817c]">{ord.userPhone || ord.userEmail}</p>
                          </td>
                          <td className="p-3 font-medium text-[#2c3e50]">{ord.itemTitle}</td>
                          <td className="p-3">
                            <span className="uppercase font-bold text-[#112734]">{ord.paymentMethod}</span>
                            <p className="font-mono font-bold text-slate-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block ml-2">
                              {ord.trxId || 'N/A'}
                            </p>
                          </td>
                          <td className="p-3 font-black text-[#112734]">৳{ord.amount}</td>
                          <td className="p-3">
                            {ord.status === 'pending' ? (
                              <button
                                onClick={() => handleApproveOrder(ord.id)}
                                className="px-3 py-1 bg-[#17A2B8] hover:bg-[#23626F] text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-sm"
                              >
                                <CheckCircle size={12} />
                                <span>অনুমোদন</span>
                              </button>
                            ) : (
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.status === 'approved' ? 'bg-[#17A2B8]/15 text-[#112734]' : 'bg-red-100 text-red-800'
                              }`}>
                                {ord.status === 'approved' ? 'অনুমোদিত ✓' : 'বাতিলকৃত'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: COURSE & CURRICULUM MANAGEMENT */}
          {activeTab === 'courses' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-[#112734]">কোর্স ও পূর্ণাঙ্গ কারিকুলাম বিল্ডার</h2>
                  <p className="text-xs text-[#8a817c]">কোর্সের বিবরণ, মডিউল, লেকচার ভিডিও, পিডিএফ নোট এবং কুইজ পরীক্ষা ম্যানেজ করুন</p>
                </div>

                <button
                  onClick={() => {
                    setIsNewCourse(true);
                    setEditingCourse({
                      id: 'course-' + Date.now(),
                      title: '',
                      titleBn: '',
                      category: 'ibadat',
                      categoryLabelBn: 'তাহরাত ও নামাজ',
                      shortDescription: '',
                      description: '',
                      price: 1500,
                      originalPrice: 2000,
                      duration: '৩ মাস (২৪ লেকচার)',
                      level: 'intermediate',
                      levelBn: 'মধ্যম স্তর',
                      totalLessons: 1,
                      thumbnail: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80',
                      previewVideoUrl: '',
                      badge: 'নতুন কোর্স',
                      instructor: {
                        id: 'inst-1',
                        name: 'Mufti Abdullah Al-Noor',
                        nameBn: 'মুফতী আব্দুল্লাহ আন-নূর',
                        title: 'প্রধান গবেষক ও মুফতী',
                        roleBn: 'দারুল উলুম দেওবন্দ',
                        bio: 'উচ্চতর ফিকহ ও সমকালীন অর্থনীতি বিশেষজ্ঞ।',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
                      },
                      objectives: ['বিশুদ্ধ মাসআলা অনুধাবন', 'দলীলভিত্তিক পড়াশোনা'],
                      lessons: [
                        {
                          id: 'les-1',
                          title: '১ম পাঠ: ভূমিকা ও মূলনীতি',
                          duration: '৪৫ মিনিট',
                          isFreePreview: true,
                          videoUrl: '',
                          pdfNotesUrl: ''
                        }
                      ],
                      rating: 4.9,
                      totalStudents: 0
                    });
                  }}
                  className="px-4 py-2.5 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all"
                >
                  <Plus size={16} />
                  <span>নতুন কোর্স তৈরি করুন</span>
                </button>
              </div>

              {/* Course Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-3xl border border-[#ece8e0] card-natural-shadow overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="h-44 w-full relative bg-slate-100 overflow-hidden">
                        <img 
                          src={course.thumbnail} 
                          alt={course.titleBn} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-[#112734] text-[#17A2B8] text-[10px] font-extrabold px-3 py-1 rounded-full">
                          {course.categoryLabelBn}
                        </div>
                        <div className="absolute top-3 right-3 bg-[#17A2B8] text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow">
                          ৳{course.price}
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <h3 className="font-extrabold text-base text-[#2c3e50] line-clamp-1">{course.titleBn}</h3>
                        <p className="text-xs text-[#8a817c] line-clamp-2">{course.shortDescription || course.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-[#5a524d] pt-2 border-t border-[#ece8e0]">
                          <span className="font-bold">{course.lessons.length}টি লেকচার</span>
                          <span className="text-[11px] text-[#8a817c]">{course.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex gap-2">
                      <button
                        onClick={() => {
                          setIsNewCourse(false);
                          setEditingCourse(JSON.parse(JSON.stringify(course)));
                        }}
                        className="flex-1 py-2.5 bg-[#17A2B8]/10 hover:bg-[#17A2B8]/15 text-[#112734] rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#17A2B8]/30"
                      >
                        <Edit3 size={14} />
                        <span>কোর্স ও কারিকুলাম এডিট</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id, course.titleBn)}
                        className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors border border-red-200"
                        title="ডিলিট করুন"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* FULL COURSE & CURRICULUM BUILDER MODAL */}
              {editingCourse && (
                <CourseBuilderModal
                  course={editingCourse}
                  isNew={isNewCourse}
                  onClose={() => setEditingCourse(null)}
                  onSave={handleSaveCourseSubmit}
                />
              )}
            </div>
          )}

          {/* TAB 3: ORDERS & ENROLLMENT VERIFICATION */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-[#112734]">ভর্তি ও পেমেন্ট ভেরিফিকেশন</h2>
                  <p className="text-xs text-[#8a817c]">বিকাশ, নগদ, রকেটের TrxID যাচাই করে কোর্স ও কিতাব এক্সেস দিন</p>
                </div>

                <div className="flex gap-2">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setOrderFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        orderFilter === filter
                          ? 'bg-[#112734] text-white shadow'
                          : 'bg-white text-[#5a524d] border border-[#ece8e0] hover:bg-slate-50'
                      }`}
                    >
                      {filter === 'all' && `সকল (${orders.length})`}
                      {filter === 'pending' && `পেন্ডিং (${orders.filter(o => o.status === 'pending').length})`}
                      {filter === 'approved' && `অনুমোদিত (${orders.filter(o => o.status === 'approved').length})`}
                      {filter === 'rejected' && `বাতিল (${orders.filter(o => o.status === 'rejected').length})`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#ece8e0] card-natural-shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fdfcf9] border-b border-[#ece8e0] text-[#8a817c] uppercase">
                      <tr>
                        <th className="p-4">অর্ডার আইডি</th>
                        <th className="p-4">শিক্ষার্থীর বিবরণ</th>
                        <th className="p-4">আইটেম / কোর্স</th>
                        <th className="p-4">পেমেন্ট মেথড ও TrxID</th>
                        <th className="p-4">পরিমাণ</th>
                        <th className="p-4">তারিখ</th>
                        <th className="p-4">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ece8e0]">
                      {orders
                        .filter(o => orderFilter === 'all' || o.status === orderFilter)
                        .map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-mono font-bold text-[#112734]">{ord.orderNumber}</td>
                            <td className="p-4">
                              <p className="font-bold text-[#2c3e50]">{ord.userName}</p>
                              <p className="text-[11px] text-[#8a817c]">{ord.userPhone || ord.userEmail}</p>
                              {ord.shippingAddress && (
                                <p className="text-[10px] text-amber-800 italic mt-0.5">ঠিকানা: {ord.shippingAddress}</p>
                              )}
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-[#2c3e50]">{ord.itemTitle}</p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  ord.itemType === 'course' 
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                                    : (ord.purchaseType === 'pdf' ? 'bg-[#17A2B8]/10 text-[#112734] border border-[#17A2B8]/30' : 'bg-amber-50 text-amber-800 border border-amber-200')
                                }`}>
                                  {ord.itemType === 'course' ? '🎓 কোর্স এনরোলমেন্ট' : (ord.purchaseType === 'pdf' ? '📘 ই-বুক (PDF)' : '📦 হার্ডকভার প্রিন্ট')}
                                </span>

                                {ord.itemType === 'book' && ord.purchaseType === 'pdf' && (
                                  (() => {
                                    const linkedBook = books.find(b => b.id === ord.itemId);
                                    if (linkedBook?.pdfUrl) {
                                      return (
                                        <a
                                          href={linkedBook.pdfUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[9px] font-bold text-[#112734] bg-[#17A2B8]/15/60 px-1.5 py-0.5 rounded hover:underline flex items-center gap-0.5"
                                          title="পিডিএফ লিংক চেক করুন"
                                        >
                                          <span>PDF লিংক</span>
                                          <ExternalLink size={9} />
                                        </a>
                                      );
                                    } else {
                                      return (
                                        <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                          PDF লিংক সেট করা নেই
                                        </span>
                                      );
                                    }
                                  })()
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="uppercase font-bold text-[#112734]">{ord.paymentMethod}</span>
                              <div className="font-mono font-bold text-slate-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-1">
                                Trx: {ord.trxId || 'N/A'}
                              </div>
                            </td>
                            <td className="p-4 font-black text-[#112734] text-sm">৳{ord.amount}</td>
                            <td className="p-4 text-[11px] text-[#8a817c]">{new Date(ord.createdAt).toLocaleDateString('bn-BD')}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {ord.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveOrder(ord.id)}
                                      className="px-3 py-1.5 bg-[#17A2B8] hover:bg-[#23626F] text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-sm"
                                      title="অনুমোদন করুন"
                                    >
                                      <CheckCircle size={12} />
                                      <span>অনুমোদন</span>
                                    </button>
                                    <button
                                      onClick={() => handleRejectOrder(ord.id)}
                                      className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold text-[11px]"
                                      title="বাতিল করুন"
                                    >
                                      <XCircle size={12} />
                                    </button>
                                  </>
                                )}
                                {ord.status !== 'pending' && (
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    ord.status === 'approved' ? 'bg-[#17A2B8]/15 text-[#112734]' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {ord.status === 'approved' ? 'অনুমোদিত ✓' : 'বাতিলকৃত'}
                                  </span>
                                )}
                                <button
                                  onClick={() => handleDeleteOrder(ord.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FATWAS & RESEARCH DESK */}
          {activeTab === 'fatwas' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-[#112734]">ফতোয়া ও ইফতা গবেষণা ডেস্ক</h2>
                  <p className="text-xs text-[#8a817c]">শিক্ষার্থীদের প্রেরিত প্রশ্নের দলীলভিত্তিক উত্তর তৈরি ও প্রকাশ করুন</p>
                </div>

                <div className="flex gap-2">
                  {(['all', 'pending', 'answered'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFatwaFilter(f)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        fatwaFilter === f
                          ? 'bg-[#112734] text-white shadow'
                          : 'bg-white text-[#5a524d] border border-[#ece8e0]'
                      }`}
                    >
                      {f === 'all' && `সকল ফতোয়া (${fatwas.length})`}
                      {f === 'pending' && `অমীমাংসিত (${fatwas.filter(x => x.status === 'pending').length})`}
                      {f === 'answered' && `উত্তর সম্পন্ন (${fatwas.filter(x => x.status === 'answered').length})`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {fatwas
                  .filter(f => fatwaFilter === 'all' || f.status === fatwaFilter)
                  .map((fatwa) => (
                    <div key={fatwa.id} className="bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-[#17A2B8]/10 text-[#112734] font-bold rounded-full border border-[#17A2B8]/30">
                            {fatwa.categoryBn}
                          </span>
                          <span className="font-mono font-bold text-[#8a817c]">{fatwa.trackingCode}</span>
                          {fatwa.isPrivate && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded-full text-[10px]">
                              ব্যক্তিগত ফতোয়া
                            </span>
                          )}
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          fatwa.status === 'answered' ? 'bg-[#17A2B8]/15 text-[#112734]' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {fatwa.status === 'answered' ? 'উত্তর সম্পন্ন ✓' : 'অপেক্ষমান'}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-base text-[#2c3e50]">{fatwa.questionTitle}</h4>
                      <p className="text-xs text-[#5a524d] leading-relaxed bg-[#fdfcf9] p-3 rounded-xl border border-[#ece8e0]">
                        {fatwa.questionDetail || fatwa.questionBody}
                      </p>

                      {fatwa.status === 'answered' ? (
                        <div className="bg-[#17A2B8]/10/70 p-4 rounded-2xl border border-[#17A2B8]/30 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <strong className="text-[#112734] flex items-center gap-1.5">
                              <ShieldCheck size={15} /> আল-জাওয়াব (প্রদত্ত ফতোয়া)
                            </strong>
                            <button
                              onClick={() => {
                                setAnsweringFatwa(fatwa);
                                setAnswerText(fatwa.answer || fatwa.answerText || '');
                                setAnswerRefs(Array.isArray(fatwa.references) ? fatwa.references.join(', ') : (fatwa.references || ''));
                              }}
                              className="text-[#112734] font-bold hover:underline flex items-center gap-1"
                            >
                              <Edit3 size={12} /> এডিট করুন
                            </button>
                          </div>
                          <p className="text-[#2c3e50] leading-relaxed font-medium">{fatwa.answer || fatwa.answerText}</p>
                          {fatwa.references && (
                            <p className="text-[11px] text-[#8a817c] italic border-t border-[#17A2B8]/30 pt-1">
                              দলীল/রেফারেন্স: {Array.isArray(fatwa.references) ? fatwa.references.join(', ') : fatwa.references}
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAnsweringFatwa(fatwa);
                            setAnswerText('');
                            setAnswerRefs('');
                          }}
                          className="px-4 py-2.5 bg-[#112734] hover:bg-[#23626F] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Edit3 size={14} />
                          <span>মুফতী হিসেবে উত্তর লিখুন</span>
                        </button>
                      )}
                    </div>
                  ))}
              </div>

              {/* Answering Modal */}
              {answeringFatwa && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <div className="bg-white w-full max-w-2xl p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h4 className="font-extrabold text-base text-[#112734]">
                        ফতোয়া ও মাসআলা সমাধান ({answeringFatwa.trackingCode})
                      </h4>
                      <button onClick={() => setAnsweringFatwa(null)} className="text-xs text-[#8a817c] font-bold">
                        ✕ বন্ধ করুন
                      </button>
                    </div>

                    <div className="bg-[#fdfcf9] p-4 rounded-2xl border text-xs space-y-1">
                      <span className="text-[10px] font-bold text-amber-800 uppercase">প্রশ্নকারী: {answeringFatwa.askerName || 'সচেতন শিক্ষার্থী'}</span>
                      <h5 className="font-extrabold text-sm text-[#2c3e50]">{answeringFatwa.questionTitle}</h5>
                      <p className="text-[#5a524d]">{answeringFatwa.questionDetail || answeringFatwa.questionBody}</p>
                    </div>

                    <form onSubmit={handleAnswerFatwaSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#2c3e50] mb-1">শরয়ী উত্তর (আল-জাওয়াব) *</label>
                        <textarea
                          required
                          rows={6}
                          placeholder="বিশুদ্ধ ফিকহি উসূলের আলোকে দলীলভিত্তিক সিদ্ধান্ত লিখুন..."
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border border-[#ece8e0] text-xs focus:outline-none focus:border-[#112734]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#2c3e50] mb-1">প্রামাণ্য রেফারেন্স ও কিতাবের নাম</label>
                        <input
                          type="text"
                          placeholder="যেমন: রদ্দুল মুহতার ২/৩৪০, ফাতাওয়া হিন্দিয়া ১/৮৫, বাদায়েউস সানায়ে"
                          value={answerRefs}
                          onChange={(e) => setAnswerRefs(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#ece8e0] text-xs focus:outline-none focus:border-[#112734]"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setAnsweringFatwa(null)}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                        >
                          বাতিল
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#112734] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow"
                        >
                          <Send size={14} />
                          <span>ফতোয়া প্রকাশ করুন</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: BOOKS & PUBLICATIONS */}
          {activeTab === 'books' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-[#112734]">কিতাব ও প্রকাশনা ম্যানেজমেন্ট</h2>
                  <p className="text-xs text-[#8a817c]">মুদ্রিত কিতাব এবং ই-বুক (PDF) ক্যাটালগ পরিচালনা ও পিডিএফ রিডিং লিংক যুক্ত করুন</p>
                </div>

                <button
                  onClick={() => {
                    setIsNewBook(true);
                    setEditingBook({
                      id: 'book-' + Date.now(),
                      title: '',
                      titleBn: '',
                      author: 'Mufti Panel',
                      authorBn: 'মুফতী পরিষদ, নূর ফিকহ একাডেমি',
                      category: 'fiqh',
                      categoryBn: 'ফিকহ ও উসূল',
                      description: '',
                      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
                      hasPdf: true,
                      pdfPrice: 120,
                      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                      previewPdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                      hasHardcover: true,
                      hardcoverPrice: 350,
                      inStock: true,
                      pages: 240,
                      language: 'বাংলা ও আরবি',
                      publisher: 'নূর ফিকহ একাডেমি প্রকাশনা',
                      rating: 4.9,
                      status: 'published'
                    });
                  }}
                  className="px-4 py-2.5 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all"
                >
                  <Plus size={16} />
                  <span>নতুন কিতাব যোগ করুন</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                  <div key={book.id} className="bg-white rounded-3xl border border-[#ece8e0] card-natural-shadow p-5 flex flex-col justify-between space-y-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-28 rounded-xl bg-slate-100 overflow-hidden shrink-0 border relative">
                        <img src={book.coverImage} alt={book.titleBn} className="w-full h-full object-cover" />
                        {book.hasPdf && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-[#23626F]/90 text-[#17A2B8] text-[8px] font-black rounded">
                            PDF
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#17A2B8]/10 text-[#112734]">
                          {book.categoryBn}
                        </span>
                        <h4 className="font-extrabold text-sm text-[#2c3e50] line-clamp-1">{book.titleBn}</h4>
                        <p className="text-[11px] text-[#8a817c] truncate">{book.authorBn}</p>
                        <div className="pt-1 flex flex-wrap gap-2 text-xs font-black text-[#112734]">
                          {book.hasHardcover && <span>হার্ডকভার: ৳{book.hardcoverPrice}</span>}
                          {book.hasPdf && <span className="text-amber-700">PDF: ৳{book.pdfPrice}</span>}
                        </div>

                        {/* PDF Link Status Indicator */}
                        <div className="pt-1.5">
                          {book.hasPdf ? (
                            book.pdfUrl ? (
                              <div className="flex items-center gap-1.5 text-[10px] text-[#23626F] font-bold bg-[#17A2B8]/10 px-2 py-1 rounded-lg border border-[#17A2B8]/30">
                                <CheckCircle size={12} className="text-[#17A2B8] shrink-0" />
                                <span className="truncate">PDF লিংক সংযুক্ত</span>
                                <a 
                                  href={book.pdfUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-[#112734] underline ml-auto text-[9px] hover:text-[#17A2B8] font-extrabold"
                                >
                                  টেস্ট
                                </a>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-[10px] text-red-700 font-bold bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                                <AlertCircle size={12} className="text-red-500 shrink-0" />
                                <span>PDF লিংক অনুপস্থিত</span>
                              </div>
                            )
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">শুধুমাত্র প্রিন্ট কপি</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 border-t border-[#ece8e0] pt-3">
                      <button
                        onClick={() => {
                          setIsNewBook(false);
                          setEditingBook({ ...book });
                        }}
                        className="flex-1 py-2 bg-[#17A2B8]/10 hover:bg-[#17A2B8]/15 text-[#112734] rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Edit3 size={13} /> এডিট ও PDF লিংক
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.id, book.titleBn)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Book Modal */}
              {editingBook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                  <div className="bg-white w-full max-w-2xl p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto my-6 border border-[#ece8e0]">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h4 className="font-extrabold text-base sm:text-lg text-[#112734]">
                          {isNewBook ? 'নতুন কিতাব সংযোজন ও PDF কনফিগারেশন' : 'কিতাবের তথ্য ও PDF লিংক সংশোধন'}
                        </h4>
                        <p className="text-[11px] text-[#8a817c]">পিডিএফ লিংক যুক্ত করলে শিক্ষার্থীরা কেনার পর তাদের পোর্টালে পড়তে ও ডাউনলোড করতে পারবে</p>
                      </div>
                      <button 
                        onClick={() => setEditingBook(null)} 
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 text-sm font-bold transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveBookSubmit} className="space-y-4 text-xs">
                      {/* Title & Author */}
                      <div className="space-y-3 bg-[#fdfcf9] p-4 rounded-2xl border border-[#ece8e0]">
                        <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <BookOpen size={14} className="text-[#112734]" />
                          মৌলিক তথ্য
                        </h5>
                        
                        <div>
                          <label className="block font-bold text-[#2c3e50] mb-1">কিতাবের নাম (বাংলা) *</label>
                          <input
                            type="text"
                            required
                            placeholder="যেমন: আল-ফিকহুল মুয়াসসার (সহজ ফিকহ শিক্ষা সমগ্র)"
                            value={editingBook.titleBn}
                            onChange={(e) => setEditingBook({ ...editingBook, titleBn: e.target.value, title: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-[#112734]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-[#2c3e50] mb-1">লেখক / সংকলক</label>
                            <input
                              type="text"
                              placeholder="যেমন: মুফতী আব্দুল্লাহ আন-নূর"
                              value={editingBook.authorBn}
                              onChange={(e) => setEditingBook({ ...editingBook, authorBn: e.target.value, author: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-[#112734]"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-[#2c3e50] mb-1">ক্যাটাগরি</label>
                            <input
                              type="text"
                              placeholder="যেমন: ফিকহ কোষ ও গাইড"
                              value={editingBook.categoryBn}
                              onChange={(e) => setEditingBook({ ...editingBook, categoryBn: e.target.value, category: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-[#112734]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block font-bold text-[#2c3e50] mb-1">প্রকাশনী</label>
                            <input
                              type="text"
                              placeholder="যেমন: নূর ফিকহ একাডেমি প্রকাশনা"
                              value={editingBook.publisher || ''}
                              onChange={(e) => setEditingBook({ ...editingBook, publisher: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-[#112734]"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-[#2c3e50] mb-1">মোট পৃষ্ঠা</label>
                            <input
                              type="number"
                              placeholder="যেমন: 350"
                              value={editingBook.pages || ''}
                              onChange={(e) => setEditingBook({ ...editingBook, pages: Number(e.target.value) })}
                              className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-[#112734]"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-[#2c3e50] mb-1">ভাষা</label>
                            <input
                              type="text"
                              placeholder="যেমন: বাংলা ও আরবি"
                              value={editingBook.language || 'বাংলা'}
                              onChange={(e) => setEditingBook({ ...editingBook, language: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-[#112734]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* PDF MANAGEMENT SECTION */}
                      <div className="space-y-3 bg-[#17A2B8]/10/60 p-4 rounded-2xl border border-[#17A2B8]/30">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingBook.hasPdf}
                              onChange={(e) => setEditingBook({ ...editingBook, hasPdf: e.target.checked })}
                              className="w-4 h-4 text-[#112734] rounded accent-[#112734]"
                            />
                            <span className="font-extrabold text-sm text-[#112734]">
                              ই-বুক / PDF সংস্করণ চালু রাখুন
                            </span>
                          </label>
                        </div>

                        {editingBook.hasPdf && (
                          <div className="space-y-3 pt-2">
                            <div>
                              <label className="block font-bold text-[#2c3e50] mb-1">
                                ই-বুক / PDF মূল্য (টাকা) *
                              </label>
                              <input
                                type="number"
                                required={editingBook.hasPdf}
                                placeholder="যেমন: 150"
                                value={editingBook.pdfPrice || ''}
                                onChange={(e) => setEditingBook({ ...editingBook, pdfPrice: Number(e.target.value) })}
                                className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] bg-white focus:outline-none focus:border-[#112734]"
                              />
                            </div>

                            {/* MAIN PDF URL */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="block font-bold text-[#112734] text-xs">
                                  মূল PDF ডাউনলোড / অনলাইন রিডিং লিংক *
                                </label>
                                {editingBook.pdfUrl && (
                                  <a
                                    href={editingBook.pdfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-[#112734] font-bold hover:underline flex items-center gap-1"
                                  >
                                    <ExternalLink size={11} />
                                    <span>লিংক টেস্ট করুন</span>
                                  </a>
                                )}
                              </div>
                              <input
                                type="url"
                                required={editingBook.hasPdf}
                                placeholder="https://drive.google.com/file/d/.../view অথবা ক্লাউড পিডিএফ লিংক"
                                value={editingBook.pdfUrl || ''}
                                onChange={(e) => setEditingBook({ ...editingBook, pdfUrl: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#17A2B8]/500/20"
                              />
                              <p className="text-[10px] text-[#112734] leading-normal">
                                💡 <strong>গুরুত্বপূর্ণ:</strong> শিক্ষার্থী যখন এই বইটি কিনবে এবং এডমিন অর্ডারটি অ্যাপ্রুভ (অনুমোদন) করবে, তখন শিক্ষার্থীর নিজস্ব ড্যাশবোর্ডে (<span className="font-mono">/dashboard</span>) এই লিংক থেকে সরাসরি পিডিএফ পড়া এবং ডাউনলোড করার অপশন উন্মুক্ত হবে। গুগল ড্রাইভের লিংক দিলে &quot;Anyone with the link can view&quot; পারমিশন নিশ্চিত করুন।
                              </p>
                            </div>

                            {/* PREVIEW SAMPLE PDF URL */}
                            <div className="space-y-1 pt-1">
                              <div className="flex items-center justify-between">
                                <label className="block font-bold text-[#5a524d] text-xs">
                                  ফ্রি নমুনা / স্যাম্পল PDF লিংক (ঐচ্ছিক)
                                </label>
                                {editingBook.previewPdfUrl && (
                                  <a
                                    href={editingBook.previewPdfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-[#112734] font-bold hover:underline flex items-center gap-1"
                                  >
                                    <ExternalLink size={11} />
                                    <span>স্যাম্পল টেস্ট</span>
                                  </a>
                                )}
                              </div>
                              <input
                                type="url"
                                placeholder="https://... (প্রথম ১০-১৫ পৃষ্ঠার ফ্রি নমুনা অধ্যায়)"
                                value={editingBook.previewPdfUrl || ''}
                                onChange={(e) => setEditingBook({ ...editingBook, previewPdfUrl: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] bg-white font-mono text-xs text-slate-800 focus:outline-none focus:border-[#112734]"
                              />
                              <p className="text-[10px] text-[#8a817c]">
                                কিতাবের মূল বিবরণী পৃষ্ঠায় দর্শকরা কেনার আগে এই নমুনাটি পড়ে দেখতে পারবে।
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* HARDCOVER PRINT COPY SECTION */}
                      <div className="space-y-3 bg-[#fdfcf9] p-4 rounded-2xl border border-[#ece8e0]">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingBook.hasHardcover}
                              onChange={(e) => setEditingBook({ ...editingBook, hasHardcover: e.target.checked })}
                              className="w-4 h-4 text-[#112734] rounded accent-[#112734]"
                            />
                            <span className="font-bold text-[#2c3e50]">
                              মুদ্রিত হার্ডকভার কপি হোম ডেলিভারি অপশন চালু রাখুন
                            </span>
                          </label>
                        </div>

                        {editingBook.hasHardcover && (
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block font-bold text-[#2c3e50] mb-1">হার্ডকভার মূল্য (টাকা)</label>
                              <input
                                type="number"
                                placeholder="যেমন: 450"
                                value={editingBook.hardcoverPrice || ''}
                                onChange={(e) => setEditingBook({ ...editingBook, hardcoverPrice: Number(e.target.value) })}
                                className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] bg-white focus:outline-none focus:border-[#112734]"
                              />
                            </div>
                            <div>
                              <label className="block font-bold text-[#2c3e50] mb-1">স্টক স্ট্যাটাস</label>
                              <select
                                value={editingBook.inStock ? 'true' : 'false'}
                                onChange={(e) => setEditingBook({ ...editingBook, inStock: e.target.value === 'true' })}
                                className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] bg-white focus:outline-none focus:border-[#112734]"
                              >
                                <option value="true">স্টকে রয়েছে (In Stock)</option>
                                <option value="false">স্টক শেষ (Out of Stock)</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cover & Description */}
                      <div className="space-y-3 bg-[#fdfcf9] p-4 rounded-2xl border border-[#ece8e0]">
                        <div>
                          <label className="block font-bold text-[#2c3e50] mb-1">কভার ছবির URL *</label>
                          <input
                            type="text"
                            required
                            placeholder="https://images.unsplash.com/..."
                            value={editingBook.coverImage}
                            onChange={(e) => setEditingBook({ ...editingBook, coverImage: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] bg-white focus:outline-none focus:border-[#112734]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#2c3e50] mb-1">কিতাবের পরিচিতি ও বিস্তারিত আলোচনা *</label>
                          <textarea
                            rows={4}
                            required
                            placeholder="কিতাবের মূল বিষয়বস্তু, প্রয়োজনীয়তা ও পাঠকদের প্রাপ্তি সংক্ষেপে লিখুন..."
                            value={editingBook.description}
                            onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] bg-white focus:outline-none focus:border-[#112734]"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-3 border-t border-[#ece8e0]">
                        <button
                          type="button"
                          onClick={() => setEditingBook(null)}
                          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                        >
                          বাতিল
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-[#112734] hover:bg-[#23626F] text-white rounded-xl font-bold shadow-md transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle size={15} />
                          <span>সংরক্ষণ করুন</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: LIVE CLASSES */}
          {activeTab === 'live_classes' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-[#112734]">লাইভ ক্লাস ও ওয়েবিনার শিডিউল</h2>
                  <p className="text-xs text-[#8a817c]">জুম বা গুগল মিটের মাধ্যমে লাইভ প্রশ্নোত্তর ও ক্লাসের লিংক প্রদান করুন</p>
                </div>

                <button
                  onClick={() => {
                    setIsNewLiveClass(true);
                    setEditingLiveClass({
                      id: 'live-' + Date.now(),
                      title: 'সমকালীন ফিকহি জিজ্ঞাসা ও সরাসরি উত্তর',
                      titleBn: 'সমকালীন ফিকহি জিজ্ঞাসা ও সরাসরি উত্তর',
                      description: 'মুফতী সাহেবের সাথে সরাসরি প্রশ্নোত্তরের লাইভ সেশন।',
                      instructor: 'মুফতী আব্দুল্লাহ আন-নূর',
                      startTime: 'শুক্রবার, রাত ৯:০০ টা',
                      duration: '১ ঘণ্টা ৩০ মিনিট',
                      price: 0,
                      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
                      meetingLink: 'https://zoom.us/j/noorfiqh',
                      platform: 'Zoom',
                      status: 'upcoming',
                      enrolledStudentsCount: 45
                    });
                  }}
                  className="px-4 py-2.5 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all"
                >
                  <Plus size={16} />
                  <span>নতুন লাইভ ক্লাস যোগ করুন</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {liveClasses.map((cls) => {
                  const classOrders = orders.filter(o => o.itemType === 'live_class' && o.itemId === cls.id);
                  const pendingOrdersCount = classOrders.filter(o => o.status === 'pending').length;
                  const totalRegistered = (cls.registeredUserIds?.length || 0) + classOrders.filter(o => o.status === 'approved').length;

                  return (
                    <div key={cls.id} className="bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-black rounded-full flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                          {cls.platform}
                        </span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
                          {new Date(cls.startTime).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-[#2c3e50]">{cls.titleBn}</h3>
                      <p className="text-xs text-[#8a817c] line-clamp-2">{cls.description}</p>
                      
                      <div className="p-3 bg-[#fdfcf9] rounded-2xl border text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span><strong>প্রশিক্ষক:</strong> {cls.instructor}</span>
                          <span className="font-bold text-[#17A2B8]">{cls.price > 0 ? `৳${cls.price}` : 'ফ্রি'}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-600">
                          <span>নিবন্ধিত শিক্ষার্থী: <strong>{totalRegistered}</strong> জন</span>
                          <span>টার্গেট সিট: {cls.targetCapacity || 500}</span>
                        </div>
                        <p className="text-[#23626F] truncate"><strong>মিটিং লিংক:</strong> {cls.meetingLink}</p>
                      </div>

                      {/* Enrollment & Payment Approvals Button */}
                      <button
                        onClick={() => setViewingLiveClassEnrollments(cls)}
                        className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-black flex items-center justify-center gap-2 border border-amber-200 transition-colors"
                      >
                        <Users size={14} />
                        <span>আবেদন ও এনরোলমেন্ট ({classOrders.length + (cls.registeredUserIds?.length || 0)})</span>
                        {pendingOrdersCount > 0 && (
                          <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] rounded-full animate-pulse">
                            {pendingOrdersCount} পেন্ডিং
                          </span>
                        )}
                      </button>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            setIsNewLiveClass(false);
                            setEditingLiveClass({ ...cls });
                          }}
                          className="flex-1 py-2 bg-[#17A2B8]/10 hover:bg-[#17A2B8]/15 text-[#112734] rounded-xl text-xs font-bold"
                        >
                          এডিট
                        </button>
                        <button
                          onClick={() => handleDeleteLiveClass(cls.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Class Enrollment & Payment Approval Modal */}
              {viewingLiveClassEnrollments && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <div className="bg-white w-full max-w-2xl p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h4 className="font-extrabold text-base text-[#112734]">
                          শিক্ষার্থী এনরোলমেন্ট ও পেমেন্ট অনুমোদন
                        </h4>
                        <p className="text-xs text-[#8a817c]">
                          ক্লাস: {viewingLiveClassEnrollments.titleBn}
                        </p>
                      </div>
                      <button 
                        onClick={() => setViewingLiveClassEnrollments(null)} 
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="p-3 bg-[#fdfcf9] rounded-2xl border flex justify-between font-bold">
                        <span>মোট আবেদনকারী: {orders.filter(o => o.itemType === 'live_class' && o.itemId === viewingLiveClassEnrollments.id).length} জন</span>
                        <span className="text-[#23626F]">ফি: {viewingLiveClassEnrollments.price > 0 ? `৳${viewingLiveClassEnrollments.price}` : 'ফ্রি'}</span>
                      </div>

                      <div className="space-y-3">
                        <h5 className="font-extrabold text-slate-800">পেমেন্ট ও এনরোলমেন্ট আবেদন তালিকা:</h5>
                        {orders.filter(o => o.itemType === 'live_class' && o.itemId === viewingLiveClassEnrollments.id).length === 0 ? (
                          <p className="text-slate-400 text-center py-6 bg-slate-50 rounded-2xl">কোনো আবেদন পাওয়া যায়নি।</p>
                        ) : (
                          <div className="space-y-2">
                            {orders
                              .filter(o => o.itemType === 'live_class' && o.itemId === viewingLiveClassEnrollments.id)
                              .map(ord => (
                                <div key={ord.id} className="p-3.5 bg-white rounded-2xl border border-[#ece8e0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <p className="font-extrabold text-slate-900">{ord.userName}</p>
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        ord.status === 'approved' ? 'bg-[#17A2B8]/15 text-[#112734]' : ord.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {ord.status === 'approved' ? 'অনুমোদিত ✓' : ord.status === 'pending' ? 'পেন্ডিং' : 'বাতিল'}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">{ord.userEmail} {ord.userPhone ? `• ${ord.userPhone}` : ''}</p>
                                    {ord.paymentMethod && (
                                      <p className="text-[11px] font-mono text-slate-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                                        {ord.paymentMethod.toUpperCase()} | Trx: {ord.trxId || 'N/A'} (৳{ord.amount})
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {ord.status === 'pending' && (
                                      <>
                                        <button
                                          onClick={() => {
                                            AppStore.updateOrderStatus(ord.id, 'approved');
                                            refreshAllData();
                                            showNotification('আবেদন সফলভাবে অনুমোদিত হয়েছে এবং শিক্ষার্থী লাইভ লিংক পেমেন্ট অ্যাক্সেস পেয়েছে');
                                          }}
                                          className="px-3 py-1.5 bg-[#17A2B8] hover:bg-[#23626F] text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
                                        >
                                          <CheckCircle size={13} />
                                          <span>অনুমোদন দিন</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            AppStore.updateOrderStatus(ord.id, 'rejected');
                                            refreshAllData();
                                            showNotification('আবেদন বাতিল করা হয়েছে');
                                          }}
                                          className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold"
                                        >
                                          বাতিল
                                        </button>
                                      </>
                                    )}
                                    {ord.status === 'approved' && (
                                      <button
                                        onClick={() => {
                                          AppStore.updateOrderStatus(ord.id, 'pending');
                                          refreshAllData();
                                          showNotification('অনুমোদন ফিরিয়ে নেওয়া হয়েছে');
                                        }}
                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                                      >
                                        বাতিল করুন
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setViewingLiveClassEnrollments(null)}
                        className="px-6 py-2 bg-[#112734] text-white rounded-xl font-bold"
                      >
                        বন্ধ করুন
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Live Class Modal */}
              {editingLiveClass && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <div className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h4 className="font-extrabold text-base text-[#112734]">লাইভ ক্লাসের তথ্য ও সময় নির্ধারণ</h4>
                      <button onClick={() => setEditingLiveClass(null)} className="text-xs font-bold text-slate-400">✕</button>
                    </div>
                    <form onSubmit={handleSaveLiveClass} className="space-y-3 text-xs max-h-[80vh] overflow-y-auto pr-1">
                      <div>
                        <label className="block font-bold mb-1">ক্লাসের শিরোনাম *</label>
                        <input
                          type="text"
                          required
                          value={editingLiveClass.titleBn}
                          onChange={(e) => setEditingLiveClass({ ...editingLiveClass, titleBn: e.target.value, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold mb-1">প্রশিক্ষক / মুফতী</label>
                          <input
                            type="text"
                            value={editingLiveClass.instructor}
                            onChange={(e) => setEditingLiveClass({ ...editingLiveClass, instructor: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">লাইভ শুরুর তারিখ ও সময় *</label>
                          <input
                            type="datetime-local"
                            required
                            value={editingLiveClass.startTime ? editingLiveClass.startTime.slice(0, 16) : ''}
                            onChange={(e) => setEditingLiveClass({ ...editingLiveClass, startTime: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] font-mono"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold mb-1">প্ল্যাটফর্ম</label>
                          <select
                            value={editingLiveClass.platform}
                            onChange={(e) => setEditingLiveClass({ ...editingLiveClass, platform: e.target.value as any })}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                          >
                            <option value="Zoom">Zoom</option>
                            <option value="Google Meet">Google Meet</option>
                            <option value="YouTube Live">YouTube Live</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold mb-1">মূল্য (৳) (০=ফ্রি)</label>
                          <input
                            type="number"
                            value={editingLiveClass.price}
                            onChange={(e) => setEditingLiveClass({ ...editingLiveClass, price: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">টার্গেট সিট</label>
                          <input
                            type="number"
                            value={editingLiveClass.targetCapacity || 500}
                            onChange={(e) => setEditingLiveClass({ ...editingLiveClass, targetCapacity: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold mb-1">সময়কাল</label>
                          <input
                            type="text"
                            value={editingLiveClass.duration}
                            onChange={(e) => setEditingLiveClass({ ...editingLiveClass, duration: e.target.value })}
                            placeholder="২ ঘণ্টা"
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">থাম্বনেইল ইমেজ URL</label>
                          <input
                            type="url"
                            value={editingLiveClass.thumbnail}
                            onChange={(e) => setEditingLiveClass({ ...editingLiveClass, thumbnail: e.target.value })}
                            placeholder="https://..."
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Zoom/Meet/YouTube লিংক *</label>
                        <input
                          type="url"
                          required
                          value={editingLiveClass.meetingLink}
                          onChange={(e) => setEditingLiveClass({ ...editingLiveClass, meetingLink: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">সংক্ষিপ্ত বিবরণ</label>
                        <textarea
                          rows={2}
                          value={editingLiveClass.description}
                          onChange={(e) => setEditingLiveClass({ ...editingLiveClass, description: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setEditingLiveClass(null)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">বাতিল</button>
                        <button type="submit" className="px-6 py-2 bg-[#112734] text-white rounded-xl font-bold">সংরক্ষণ করুন</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: CERTIFICATE REGISTRY */}
          {activeTab === 'certificates' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-[#112734]">অফিসিয়াল সার্টিফিকেট রেজিস্ট্রি</h2>
                  <p className="text-xs text-[#8a817c]">শিক্ষার্থীদের জন্য ইউনিক সিরিয়ালযুক্ত ভেরিফায়েড সনদপত্র ইস্যু করুন</p>
                </div>

                <button
                  onClick={() => setShowIssueCertModal(true)}
                  className="px-4 py-2.5 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all"
                >
                  <Plus size={16} />
                  <span>ম্যানুয়াল সনদপত্র ইস্যু করুন</span>
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-[#ece8e0] card-natural-shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fdfcf9] border-b border-[#ece8e0] text-[#8a817c] uppercase">
                      <tr>
                        <th className="p-4">সনদ সিরিয়াল</th>
                        <th className="p-4">শিক্ষার্থীর নাম</th>
                        <th className="p-4">কোর্স</th>
                        <th className="p-4">ইস্যু তারিখ</th>
                        <th className="p-4">গ্রেড / ফলাফল</th>
                        <th className="p-4">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ece8e0]">
                      {certificates.map((cert) => (
                        <tr key={cert.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-mono font-bold text-[#112734]">{cert.certificateNumber}</td>
                          <td className="p-4 font-bold text-[#2c3e50]">{cert.userName}</td>
                          <td className="p-4">{cert.courseTitle}</td>
                          <td className="p-4 font-mono text-[11px]">{cert.issueDate}</td>
                          <td className="p-4 font-bold text-[#23626F]">{cert.grade}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setPreviewingCert(cert)}
                                className="px-3 py-1 bg-[#112734] text-white font-bold rounded-lg hover:bg-[#23626F] flex items-center gap-1 text-[11px] cursor-pointer shadow-sm"
                                title="সার্টিফিকেট প্রিভিউ ও প্রিন্ট"
                              >
                                <Printer size={12} />
                                <span>প্রিভিউ / প্রিন্ট</span>
                              </button>
                              <Link
                                href={`/verify-certificate?id=${cert.certificateNumber}`}
                                target="_blank"
                                className="px-3 py-1 bg-[#17A2B8]/10 text-[#112734] font-bold rounded-lg hover:bg-[#17A2B8]/15 flex items-center gap-1 text-[11px]"
                              >
                                <Eye size={12} />
                                <span>যাচাই</span>
                              </Link>
                              <button
                                onClick={() => handleDeleteCert(cert.id)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Issue Cert Modal */}
              {showIssueCertModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex flex-col items-center justify-start">
                  <div className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4 my-auto">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h4 className="font-extrabold text-base text-[#112734]">নতুন সনদপত্র প্রদান</h4>
                      <button onClick={() => setShowIssueCertModal(false)} className="text-xs font-bold text-slate-400 cursor-pointer">✕</button>
                    </div>
                    <form onSubmit={handleIssueCertificateSubmit} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold mb-1">শিক্ষার্থীর পূর্ণ নাম *</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: আব্দুর রহমান"
                          value={certStudentName}
                          onChange={(e) => setCertStudentName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">কোর্সের নাম *</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: উচ্চতর উসূলে ফিকহ ও কাওয়াইদে ফিকহিয়্যাহ"
                          value={certCourseTitle}
                          onChange={(e) => setCertCourseTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">গ্রেড / ফলাফল</label>
                        <input
                          type="text"
                          value={certGrade}
                          onChange={(e) => setCertGrade(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">কাস্টম সনদ ক্যাটালগ / টেমপ্লেট ব্যাকগ্রাউন্ড লিংক (ঐচ্ছিক)</label>
                        <input
                          type="url"
                          placeholder="https://example.com/certificate-template.jpg"
                          value={certCopyUrl}
                          onChange={(e) => setCertCopyUrl(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                        />
                        <span className="text-[10px] text-slate-500 block mt-1 font-normal">
                          * গুগল ড্রাইভ বা ইমেজ লিংক দিলে সেটার ব্যাকগ্রাউন্ডের উপরে টেক্সট বসে সুন্দরভাবে প্রিন্ট হবে।
                        </span>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowIssueCertModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold cursor-pointer">বাতিল</button>
                        <button type="submit" className="px-6 py-2 bg-[#112734] text-white rounded-xl font-bold cursor-pointer">ইস্যু করুন</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Admin Certificate Preview & Print Modal */}
              {previewingCert && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-2 sm:p-6 flex flex-col items-center justify-start">
                  <div className="max-w-5xl w-full my-auto py-2 sm:py-6">
                    <CertificateView
                      userName={previewingCert.userName}
                      courseTitle={previewingCert.courseTitle}
                      issueDate={previewingCert.issueDate}
                      certificateNumber={previewingCert.certificateNumber}
                      grade={previewingCert.grade}
                      certificateCopyUrl={previewingCert.certificateCopyUrl || previewingCert.customPdfUrl}
                      onClose={() => setPreviewingCert(null)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: REVIEWS & TESTIMONIALS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-[#112734]">শিক্ষার্থীদের মতামত ও প্রশংসাপত্র</h2>
                  <p className="text-xs text-[#8a817c]">হোমপেজে প্রদর্শিত শিক্ষার্থীদের রিভিউ যোগ ও এডিট করুন</p>
                </div>

                <button
                  onClick={() => {
                    setIsNewReview(true);
                    setEditingReview({
                      id: 'rev-' + Date.now(),
                      name: 'মাওলানা মাহমুদ হাসান',
                      role: 'মুফতী ও ফিকহ গবেষক',
                      location: 'ঢাকা',
                      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                      rating: 5,
                      content: 'নূর ফিকহ একাডেমি আধুনিক যুগের এক অপূর্ব উপহার। দলীলভিত্তিক প্রতিটি মাসআলার উপস্থাপনা অত্যন্ত চমৎকার।',
                      courseTitle: 'সমকালীন আধুনিক ফিকহ'
                    });
                  }}
                  className="px-4 py-2.5 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all"
                >
                  <Plus size={16} />
                  <span>নতুন রিভিউ যোগ করুন</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <img src={rev.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} alt={rev.name} className="w-10 h-10 rounded-full object-cover border" />
                        <div>
                          <h4 className="font-extrabold text-sm text-[#2c3e50]">{rev.name}</h4>
                          <p className="text-[10px] text-[#8a817c]">{rev.role} • {rev.location}</p>
                        </div>
                      </div>
                      <div className="flex text-amber-500 text-xs">
                        {'★'.repeat(rev.rating)}
                      </div>
                      <p className="text-xs text-[#5a524d] leading-relaxed italic">&ldquo;{rev.content}&rdquo;</p>
                    </div>

                    <div className="flex gap-2 border-t pt-2">
                      <button
                        onClick={() => {
                          setIsNewReview(false);
                          setEditingReview({ ...rev });
                        }}
                        className="flex-1 py-1.5 bg-[#17A2B8]/10 text-[#112734] rounded-xl text-xs font-bold"
                      >
                        এডিট
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-xl"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Review Modal */}
              {editingReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <div className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h4 className="font-extrabold text-base text-[#112734]">শিক্ষার্থী রিভিউ</h4>
                      <button onClick={() => setEditingReview(null)} className="text-xs font-bold text-slate-400">✕</button>
                    </div>
                    <form onSubmit={handleSaveReview} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold mb-1">শিক্ষার্থীর নাম *</label>
                        <input
                          type="text"
                          required
                          value={editingReview.name}
                          onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold mb-1">পদবী / পরিচয়</label>
                          <input
                            type="text"
                            value={editingReview.role}
                            onChange={(e) => setEditingReview({ ...editingReview, role: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">রেটিং (১-৫)</label>
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={editingReview.rating}
                            onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-bold mb-1">মতামত / বিবরণ *</label>
                        <textarea
                          rows={3}
                          required
                          value={editingReview.content}
                          onChange={(e) => setEditingReview({ ...editingReview, content: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setEditingReview(null)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">বাতিল</button>
                        <button type="submit" className="px-6 py-2 bg-[#112734] text-white rounded-xl font-bold">সংরক্ষণ</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: SITE SETTINGS & BRANDING */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Top Title & Save Header Bar */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 bg-[#17A2B8]/10 text-[#112734] font-black text-[10px] rounded-md border border-[#17A2B8]/20">
                      সিস্টেম কনফিগারেশন
                    </span>
                    <span className="text-xs text-[#8a817c] font-medium">• ৯টি সাব-ক্যাটাগরি</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#112734] flex items-center gap-2 font-anek">
                    <Settings size={22} className="text-[#17A2B8]" />
                    <span>সাইট সেটিংস ও ব্র্যান্ডিং সেন্টার</span>
                  </h2>
                  <p className="text-xs text-[#8a817c]">একাডেমির লোগো, হিরো ব্যানার, কন্টাক্ট, পলিসি, ইমেইল নোটিফিকেশন ও মেটা পিক্সেল পরিচালনা করুন</p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-6 py-2.5 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-2 transition-all shrink-0 cursor-pointer"
                >
                  <Save size={16} />
                  <span>পরিবর্তন সেভ করুন</span>
                </button>
              </div>

              {/* Main Grid: Sub-Sidebar + Content Form */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Sub-Sidebar Menu (3 Columns) */}
                <div className="lg:col-span-3 bg-white p-3 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-1.5 sticky top-20 z-20">
                  <div className="px-3 py-1.5 text-[10px] font-black text-[#8a817c] uppercase tracking-wider border-b border-slate-100 mb-1">
                    সেটিংস সাইডবার মেনু
                  </div>

                  <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-1 lg:pb-0">
                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('general')}
                      className={`flex-shrink-0 lg:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all ${
                        settingsSubTab === 'general'
                          ? 'bg-[#112734] text-white shadow-md'
                          : 'text-[#2c3e50] hover:bg-slate-50 border border-transparent hover:border-[#ece8e0]'
                      }`}
                    >
                      <Sparkles size={16} className={settingsSubTab === 'general' ? 'text-amber-400' : 'text-amber-600'} />
                      <span className="whitespace-nowrap">১. ব্র্যান্ডিং ও লোগো</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('hero')}
                      className={`flex-shrink-0 lg:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all ${
                        settingsSubTab === 'hero'
                          ? 'bg-[#112734] text-white shadow-md'
                          : 'text-[#2c3e50] hover:bg-slate-50 border border-transparent hover:border-[#ece8e0]'
                      }`}
                    >
                      <ImageIcon size={16} className={settingsSubTab === 'hero' ? 'text-amber-400' : 'text-blue-600'} />
                      <span className="whitespace-nowrap">২. হিরো সেকশন ও ব্যানার</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('notice')}
                      className={`flex-shrink-0 lg:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all ${
                        settingsSubTab === 'notice'
                          ? 'bg-[#112734] text-white shadow-md'
                          : 'text-[#2c3e50] hover:bg-slate-50 border border-transparent hover:border-[#ece8e0]'
                      }`}
                    >
                      <Sparkles size={16} className={settingsSubTab === 'notice' ? 'text-amber-400' : 'text-[#17A2B8]'} />
                      <span className="whitespace-nowrap">৩. টপ নোটিশ বার</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('about')}
                      className={`flex-shrink-0 lg:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all ${
                        settingsSubTab === 'about'
                          ? 'bg-[#112734] text-white shadow-md'
                          : 'text-[#2c3e50] hover:bg-slate-50 border border-transparent hover:border-[#ece8e0]'
                      }`}
                    >
                      <FileText size={16} className={settingsSubTab === 'about' ? 'text-amber-400' : 'text-purple-600'} />
                      <span className="whitespace-nowrap">৪. সম্পর্কে পেজ কন্টেন্ট</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('terms')}
                      className={`flex-shrink-0 lg:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all ${
                        settingsSubTab === 'terms'
                          ? 'bg-[#112734] text-white shadow-md'
                          : 'text-[#2c3e50] hover:bg-slate-50 border border-transparent hover:border-[#ece8e0]'
                      }`}
                    >
                      <ShieldCheck size={16} className={settingsSubTab === 'terms' ? 'text-amber-400' : 'text-emerald-600'} />
                      <span className="whitespace-nowrap">৫. গোপনীয়তা ও শর্তাবলী</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('faq')}
                      className={`flex-shrink-0 lg:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all ${
                        settingsSubTab === 'faq'
                          ? 'bg-[#112734] text-white shadow-md'
                          : 'text-[#2c3e50] hover:bg-slate-50 border border-transparent hover:border-[#ece8e0]'
                      }`}
                    >
                      <HelpCircle size={16} className={settingsSubTab === 'faq' ? 'text-amber-400' : 'text-orange-600'} />
                      <span className="whitespace-nowrap">৬. সাধারণ প্রশ্নোত্তর (FAQ)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('contact')}
                      className={`flex-shrink-0 lg:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all ${
                        settingsSubTab === 'contact'
                          ? 'bg-[#112734] text-white shadow-md'
                          : 'text-[#2c3e50] hover:bg-slate-50 border border-transparent hover:border-[#ece8e0]'
                      }`}
                    >
                      <Phone size={16} className={settingsSubTab === 'contact' ? 'text-amber-400' : 'text-teal-600'} />
                      <span className="whitespace-nowrap">৭. যোগাযোগ ও সোশ্যাল</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('marketing')}
                      className={`flex-shrink-0 lg:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all ${
                        settingsSubTab === 'marketing'
                          ? 'bg-[#112734] text-white shadow-md'
                          : 'text-[#2c3e50] hover:bg-slate-50 border border-transparent hover:border-[#ece8e0]'
                      }`}
                    >
                      <Award size={16} className={settingsSubTab === 'marketing' ? 'text-amber-400' : 'text-[#17A2B8]'} />
                      <span className="whitespace-nowrap">৮. পিক্সেল ও সনদ ক্যাটালগ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('email_notify')}
                      className={`flex-shrink-0 lg:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all ${
                        settingsSubTab === 'email_notify'
                          ? 'bg-[#112734] text-white shadow-md'
                          : 'text-[#2c3e50] hover:bg-slate-50 border border-transparent hover:border-[#ece8e0]'
                      }`}
                    >
                      <Mail size={16} className={settingsSubTab === 'email_notify' ? 'text-amber-400' : 'text-rose-600'} />
                      <span className="whitespace-nowrap">৯. অর্ডার ইমেইল নোটিফিকেশন</span>
                    </button>
                  </div>
                </div>

                {/* Right Form Content Panel (9 Columns) */}
                <div className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-[#ece8e0] card-natural-shadow">
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    
                    {/* 1. General Branding & Logo Management */}
                    {settingsSubTab === 'general' && (
                      <div className="space-y-6 animate-in fade-in">
                        <h3 className="font-extrabold text-base text-[#112734] border-b pb-2 flex items-center gap-2">
                          <Sparkles size={18} className="text-amber-500" />
                          <span>সাধারণ তথ্য ও ব্র্যান্ডিং</span>
                        </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-[#2c3e50] mb-1">একাডেমির নাম (বাংলা)</label>
                      <input
                        type="text"
                        value={siteSettings.siteNameBn}
                        onChange={(e) => setSiteSettings({ ...siteSettings, siteNameBn: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#2c3e50] mb-1">একাডেমির নাম (English)</label>
                      <input
                        type="text"
                        value={siteSettings.siteName}
                        onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                      />
                    </div>
                  </div>

                  {/* Dedicated Header & Footer Logo Management Box */}
                  <div className="bg-[#f8faf7] p-5 sm:p-6 rounded-3xl border border-[#ece8e0] space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ece8e0] pb-3">
                      <div>
                        <h4 className="font-black text-sm text-[#112734] font-anek flex items-center gap-2">
                          <ImageIcon size={18} className="text-amber-500" />
                          <span>হেডার ও ফুটার লোগো ব্যবস্থাপনা (Brand Logo)</span>
                        </h4>
                        <p className="text-[11px] text-[#8a817c] font-tiro mt-0.5">
                          লোগো হিসেবে গোল্ডেন আরবি ক্যালিগ্রাফি প্রতীক অথবা আপনার নিজস্ব লোগো ছবি আপলোড করে ব্যবহার করুন
                        </p>
                      </div>

                      {/* Logo Type Selector */}
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#ece8e0]">
                        <button
                          type="button"
                          onClick={() => setSiteSettings({ ...siteSettings, logoType: 'symbol' })}
                          className={`px-3 py-1 rounded-lg text-xs font-bold font-tiro transition-all ${
                            siteSettings.logoType !== 'image'
                              ? 'bg-[#112734] text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          আরবি প্রতীক লোগো
                        </button>
                        <button
                          type="button"
                          onClick={() => setSiteSettings({ ...siteSettings, logoType: 'image' })}
                          className={`px-3 py-1 rounded-lg text-xs font-bold font-tiro transition-all ${
                            siteSettings.logoType === 'image'
                              ? 'bg-[#112734] text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          কাস্টম লোগো ছবি
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                      {/* Left: Configuration Inputs */}
                      <div className="lg:col-span-7 space-y-4">
                        {siteSettings.logoType === 'image' ? (
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="block font-bold text-[#2c3e50]">
                                  কম্পিউটার বা মোবাইল থেকে লোগো ছবি আপলোড করুন
                                </label>
                                {siteSettings.logoImageUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setSiteSettings({ ...siteSettings, logoImageUrl: '' })}
                                    className="text-xs text-red-600 hover:underline font-bold flex items-center gap-1"
                                  >
                                    <Trash2 size={13} />
                                    <span>লোগো রিমুভ করুন</span>
                                  </button>
                                )}
                              </div>
                              <label className="flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-dashed border-emerald-300 hover:border-[#17A2B8] bg-white hover:bg-[#17A2B8]/10/50 rounded-2xl cursor-pointer transition-all">
                                <Upload size={16} className="text-[#112734]" />
                                <span className="font-bold text-[#112734]">
                                  {siteSettings.logoImageUrl ? 'লোগো ছবি পরিবর্তন করুন (PNG/JPG/SVG)' : 'লোগো ফাইল নির্বাচন করুন (PNG/JPG/SVG)'}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (uploadEvent) => {
                                        const result = uploadEvent.target?.result as string;
                                        if (result) {
                                          setSiteSettings({
                                            ...siteSettings,
                                            logoType: 'image',
                                            logoImageUrl: result
                                          });
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            <div>
                              <label className="block font-bold text-[#2c3e50] mb-1">
                                অথবা অনলাইন লোগো লিংক / URL প্রদান করুন
                              </label>
                              <input
                                type="text"
                                placeholder="https://... লোগো ছবির লিংক"
                                value={siteSettings.logoImageUrl || ''}
                                onChange={(e) => setSiteSettings({ ...siteSettings, logoImageUrl: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] bg-white font-mono"
                              />
                            </div>

                            <div className="p-3 bg-[#17A2B8]/10/80 rounded-xl border border-[#17A2B8]/30/80 text-[11px] text-[#112734] leading-relaxed font-tiro">
                              ✓ <strong>লোগো মোড সক্রিয়:</strong> কাস্টম লোগো ছবি ব্যবহৃত হলে হেডার ও ফুটারে শুধু লোগোটিই সুন্দরভাবে প্রদর্শিত হবে এবং পাশে কোনো বাড়তি লেখা থাকবে না, যাতে কোনো ওভাররাইট বা টেক্সট কনফ্লিক্ট না হয়।
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="block font-bold text-[#2c3e50] mb-1">
                                আরবি হরফ / প্রতীক (যেমন: ن, ف, ع ইত্যাদি)
                              </label>
                              <input
                                type="text"
                                value={siteSettings.logoSymbol || 'ن'}
                                onChange={(e) => setSiteSettings({ ...siteSettings, logoSymbol: e.target.value })}
                                placeholder="ن"
                                className="w-24 text-center px-3 py-2 rounded-xl border border-[#ece8e0] bg-white font-bold text-2xl"
                              />
                              <p className="text-[11px] text-[#8a817c] mt-1 font-tiro">
                                এটি প্রিমিয়াম গোল্ডেন গ্রেডিয়েন্ট ও ইসলামিক রাউন্ডেড স্কয়ার ফ্রেমে রেন্ডার হবে।
                              </p>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block font-bold text-[#2c3e50] mb-1">
                            লোগোর সাবটাইটেল / স্লোগান টেক্সট (প্রতীক মোডের জন্য)
                          </label>
                          <input
                            type="text"
                            value={siteSettings.logoSubtitle !== undefined ? siteSettings.logoSubtitle : 'NOOR FIQH ACADEMY'}
                            onChange={(e) => setSiteSettings({ ...siteSettings, logoSubtitle: e.target.value })}
                            placeholder="যেমন: NOOR FIQH ACADEMY"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] bg-white"
                          />
                        </div>
                      </div>

                      {/* Right: Live Preview Box */}
                      <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-[#112734] rounded-2xl text-white shadow-md border border-[#23626F]">
                        <span className="text-[10px] font-bold text-[#17A2B8] uppercase tracking-widest mb-3">
                          লাইভ হেডার ও ফুটার প্রিভিউ
                        </span>
                        
                        <div className="flex items-center justify-center min-h-16 bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm border border-white/20 w-full">
                          {siteSettings.logoType === 'image' && siteSettings.logoImageUrl ? (
                            <div className="h-12 flex items-center justify-center py-0.5">
                              <img
                                src={siteSettings.logoImageUrl}
                                alt="Logo Preview"
                                className="max-h-11 w-auto max-w-[220px] object-contain drop-shadow-sm"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 w-full">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-md border-2 border-white/20 shrink-0">
                                <span className="text-arabic text-3xl pb-1">{siteSettings.logoSymbol || 'ن'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-extrabold text-base text-white tracking-tight leading-tight font-anek">
                                  {siteSettings.siteNameBn || 'নূর ফিকহ একাডেমি'}
                                </span>
                                <span className="text-[10px] text-[#17A2B8] font-medium tracking-wide flex items-center gap-1 mt-0.5">
                                  <Sparkles size={10} />
                                  {siteSettings.logoSubtitle || siteSettings.siteName || 'NOOR FIQH ACADEMY'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="text-[10px] text-[#17A2B8]/80/80 text-center mt-2.5 font-tiro">
                          সেটিংস সংরক্ষণ করার সাথে সাথে হেডার ও ফুটারে স্বয়ংক্রিয়ভাবে আপডেট প্রদর্শিত হবে।
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block font-bold text-[#2c3e50] mb-1">হোমপেজ প্রধান শিরোনাম (Hero Title)</label>
                    <input
                      type="text"
                      value={siteSettings.heroTitleBn}
                      onChange={(e) => setSiteSettings({ ...siteSettings, heroTitleBn: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                    />
                  </div>

                  <div className="text-xs">
                    <label className="block font-bold text-[#2c3e50] mb-1">হোমপেজ সাব-শিরোনাম (Hero Subtitle)</label>
                    <textarea
                      rows={2}
                      value={siteSettings.heroSubtitleBn}
                      onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitleBn: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                    />
                  </div>
                </div>
              )}

              {/* 2. HERO BACKGROUND IMAGE CUSTOMIZATION */}
              {settingsSubTab === 'hero' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon size={18} className="text-[#112734]" />
                      <h3 className="font-extrabold text-base text-[#112734]">হিরো সেকশন ব্যাকগ্রাউন্ড ইমেজ (Hero Background Image)</h3>
                    </div>
                    {siteSettings.heroBgImage && (
                      <button
                        type="button"
                        onClick={() => setSiteSettings({ ...siteSettings, heroBgImage: '' })}
                        className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg font-bold flex items-center gap-1"
                      >
                        <Trash2 size={13} />
                        <span>ছবি রিমুভ করুন</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Upload / URL Input */}
                    <div className="space-y-3">
                      <div>
                        <label className="block font-bold text-[#2c3e50] mb-1.5">কম্পিউটার/মোবাইল থেকে সরাসরি ছবি আপলোড করুন</label>
                        <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-emerald-300 hover:border-[#17A2B8] bg-[#17A2B8]/10/50 hover:bg-[#17A2B8]/10 rounded-2xl cursor-pointer transition-all">
                          <Upload size={16} className="text-[#112734]" />
                          <span className="font-bold text-[#112734]">ছবি নির্বাচন করুন (Image File)</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (uploadEvent) => {
                                  const result = uploadEvent.target?.result as string;
                                  if (result) {
                                    setSiteSettings({ ...siteSettings, heroBgImage: result });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div>
                        <label className="block font-bold text-[#2c3e50] mb-1">অথবা অনলাইন ইমেজ লিংক / URL প্রদান করুন</label>
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/photo-... বা যেকোনো ক্লাউড ইমেজ লিংক"
                          value={siteSettings.heroBgImage || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, heroBgImage: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] font-mono text-xs"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-[#2c3e50] flex items-center gap-1.5">
                            <Sliders size={13} className="text-[#112734]" />
                            <span>ছবির দৃশ্যমানতা ও অস্বচ্ছতা (Opacity): {siteSettings.heroBgOpacity ?? 25}%</span>
                          </label>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={100}
                          step={5}
                          value={siteSettings.heroBgOpacity ?? 25}
                          onChange={(e) => setSiteSettings({ ...siteSettings, heroBgOpacity: Number(e.target.value) })}
                          className="w-full accent-[#112734] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-[#8a817c] mt-0.5">
                          <span>সূক্ষ্ম আবছা (5%)</span>
                          <span>প্রাকৃতিক ব্যালেন্স (25%)</span>
                          <span>সম্পূর্ণ স্পষ্ট (100%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Preview Box */}
                    <div>
                      <label className="block font-bold text-[#2c3e50] mb-1.5">লাইভ ব্যাকগ্রাউন্ড প্রিভিউ (Preview)</label>
                      <div className="relative h-44 rounded-2xl overflow-hidden academy-gradient flex items-center justify-center p-4 text-center border border-[#23626F] shadow-inner">
                        {siteSettings.heroBgImage ? (
                          <div
                            className="absolute inset-0 bg-cover bg-center pointer-events-none mix-blend-overlay transition-opacity"
                            style={{
                              backgroundImage: `url(${siteSettings.heroBgImage})`,
                              opacity: (siteSettings.heroBgOpacity ?? 25) / 100
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15)_0%,_transparent_70%)] pointer-events-none" />
                        )}
                        <div className="relative z-10 space-y-1">
                          <span className="text-[10px] font-bold tracking-widest text-[#17A2B8] uppercase bg-[#17A2B8]/20 px-2.5 py-0.5 rounded-full border border-[#17A2B8]/30">
                            {siteSettings.siteNameBn}
                          </span>
                          <h4 className="text-sm sm:text-base font-black text-white leading-tight">
                            {siteSettings.heroTitleBn || 'সহিহ ইলম ও সমকালীন ফিকহের বিশুদ্ধ আলোকবর্তিকা'}
                          </h4>
                          <p className="text-[11px] text-emerald-100/80 line-clamp-2">
                            {siteSettings.heroSubtitleBn || 'কোরআন ও সুন্নাহর প্রামাণ্য দিকনির্দেশনা শিখুন অভিজ্ঞ মুফতী ও ফিকহ বিশেষজ্ঞদের সান্নিধ্যে।'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. HERO SPOTLIGHT ISLAMIC ARCH CARD MANAGEMENT */}
                  <div className="space-y-4 pt-4 border-t border-[#ece8e0]">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-500" />
                      <h3 className="font-extrabold text-base text-[#112734]">হিরো সেকশনের ইসলামিক আর্চ কার্ড (Hero Spotlight Card)</h3>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer bg-[#17A2B8]/10 px-3 py-1.5 rounded-xl border border-[#17A2B8]/30">
                      <input
                        type="checkbox"
                        checked={siteSettings.heroCard?.enabled !== false}
                        onChange={(e) => {
                          const currentCard = siteSettings.heroCard || {
                            enabled: true,
                            arabicSymbol: 'ن',
                            badgeText: 'ভর্তি চলছে • নতুন ব্যাচ',
                            title: 'উচ্চতর ফিকহ ও ফতোয়া ডিপ্লোমা কোর্স',
                            subtitle: 'মুফতীগণের প্রত্যক্ষ তত্ত্বাবধানে কিতাবুল বুয়ু, ফারায়েজ ও সমকালীন আধুনিক চিকিৎসার ফিকহি গবেষণার সুযোগ।',
                            features: [
                              'সরাসরি লাইভ ক্লাস ও নোটপত্র',
                              'ভেরিফায়েড প্রফেশনাল সনদপত্র',
                              '২৪/৭ ওস্তাদ সাপোর্ট হেল্পডেস্ক'
                            ],
                            buttonText: 'কোর্সে যুক্ত হোন',
                            buttonLink: '/courses'
                          };
                          setSiteSettings({
                            ...siteSettings,
                            heroCard: { ...currentCard, enabled: e.target.checked }
                          });
                        }}
                        className="w-4 h-4 text-[#112734] rounded accent-[#112734]"
                      />
                      <span className="text-xs font-bold text-[#112734]">কার্ড প্রদর্শন চালু রাখুন</span>
                    </label>
                  </div>

                  {siteSettings.heroCard?.enabled !== false && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                      {/* Left: Form Fields */}
                      <div className="lg:col-span-7 space-y-3">
                        {/* Top Icon / Image / Symbol Section */}
                        <div className="bg-[#fdfcf9] p-3.5 rounded-2xl border border-[#ece8e0] space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-[#2c3e50] flex items-center gap-1.5">
                              <ImageIcon size={14} className="text-[#112734]" />
                              <span>কার্ডের শীর্ষ আইকন বা কাস্টম ছবি (Top Icon / Image / Symbol)</span>
                            </label>
                            {siteSettings.heroCard?.iconImage && (
                              <button
                                type="button"
                                onClick={() => {
                                  const currentCard = siteSettings.heroCard || {
                                    enabled: true,
                                    arabicSymbol: 'ن',
                                    badgeText: '',
                                    title: '',
                                    subtitle: '',
                                    features: [],
                                    buttonText: 'কোর্সে যুক্ত হোন',
                                    buttonLink: '/courses'
                                  };
                                  setSiteSettings({
                                    ...siteSettings,
                                    heroCard: { ...currentCard, iconImage: '' }
                                  });
                                }}
                                className="text-[11px] text-red-600 hover:underline font-bold flex items-center gap-1"
                              >
                                <Trash2 size={12} />
                                <span>ছবি মুছুন</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* File Upload Button */}
                            <div>
                              <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">ডিভাইস থেকে ছবি আপলোড</label>
                              <label className="flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-emerald-300 hover:border-[#17A2B8] bg-[#17A2B8]/10/50 hover:bg-[#17A2B8]/10 rounded-xl cursor-pointer transition-all">
                                <Upload size={14} className="text-[#112734]" />
                                <span className="font-bold text-[#112734] text-xs">আইকন/ছবি আপলোড করুন</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (uploadEvent) => {
                                        const result = uploadEvent.target?.result as string;
                                        if (result) {
                                          const currentCard = siteSettings.heroCard || {
                                            enabled: true,
                                            arabicSymbol: 'ن',
                                            badgeText: 'ভর্তি চলছে • নতুন ব্যাচ',
                                            title: 'উচ্চতর ফিকহ ও ফতোয়া ডিপ্লোমা কোর্স',
                                            subtitle: '',
                                            features: [],
                                            buttonText: 'কোর্সে যুক্ত হোন',
                                            buttonLink: '/courses'
                                          };
                                          setSiteSettings({
                                            ...siteSettings,
                                            heroCard: { ...currentCard, iconImage: result }
                                          });
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            {/* Image URL Input */}
                            <div>
                              <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">অথবা অনলাইন ছবির লিংক (URL)</label>
                              <input
                                type="text"
                                placeholder="https://... ইমেজ লিংক"
                                value={siteSettings.heroCard?.iconImage || ''}
                                onChange={(e) => {
                                  const heroCard = siteSettings.heroCard || {
                                    enabled: true,
                                    arabicSymbol: 'ن',
                                    badgeText: '',
                                    title: '',
                                    subtitle: '',
                                    features: [],
                                    buttonText: 'কোর্সে যুক্ত হোন',
                                    buttonLink: '/courses'
                                  };
                                  setSiteSettings({
                                    ...siteSettings,
                                    heroCard: { ...heroCard, iconImage: e.target.value }
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] font-mono text-xs"
                              />
                            </div>
                          </div>

                          {/* Fallback Arabic Character / Symbol Input */}
                          <div className="pt-1 border-t border-[#ece8e0]">
                            <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">
                              ছবি না থাকলে আরবি হরফ / টেক্সট প্রতীক (যেমন: ن, ف, ع ইত্যাদি)
                            </label>
                            <input
                              type="text"
                              value={siteSettings.heroCard?.arabicSymbol || 'ن'}
                              onChange={(e) => {
                                const heroCard = siteSettings.heroCard || {
                                  enabled: true,
                                  arabicSymbol: 'ن',
                                  badgeText: 'ভর্তি চলছে • নতুন ব্যাচ',
                                  title: 'উচ্চতর ফিকহ ও ফতোয়া ডিপ্লোমা কোর্স',
                                  subtitle: '',
                                  features: [],
                                  buttonText: 'কোর্সে যুক্ত হোন',
                                  buttonLink: '/courses'
                                };
                                setSiteSettings({
                                  ...siteSettings,
                                  heroCard: { ...heroCard, arabicSymbol: e.target.value }
                                });
                              }}
                              className="w-full px-3 py-1.5 rounded-xl border border-[#ece8e0] text-center font-bold text-base"
                            />
                          </div>
                        </div>

                        {/* Top Badge text */}
                        <div>
                          <label className="block font-bold text-[#2c3e50] mb-1">শীর্ষ ব্যাজ টেক্সট (Badge)</label>
                          <input
                            type="text"
                            value={siteSettings.heroCard?.badgeText || ''}
                            onChange={(e) => {
                              const heroCard = siteSettings.heroCard || {
                                enabled: true,
                                arabicSymbol: 'ن',
                                badgeText: '',
                                title: '',
                                subtitle: '',
                                features: [],
                                buttonText: 'কোর্সে যুক্ত হোন',
                                buttonLink: '/courses'
                              };
                              setSiteSettings({
                                ...siteSettings,
                                heroCard: { ...heroCard, badgeText: e.target.value }
                              });
                            }}
                            placeholder="যেমন: ভর্তি চলছে • নতুন ব্যাচ"
                            className="w-full px-3.5 py-2 rounded-xl border border-[#ece8e0]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#2c3e50] mb-1">কার্ডের মূল শিরোনাম (Course / Card Title)</label>
                          <input
                            type="text"
                            value={siteSettings.heroCard?.title || ''}
                            onChange={(e) => {
                              const heroCard = siteSettings.heroCard || {
                                enabled: true,
                                arabicSymbol: 'ن',
                                badgeText: '',
                                title: '',
                                subtitle: '',
                                features: [],
                                buttonText: 'কোর্সে যুক্ত হোন',
                                buttonLink: '/courses'
                              };
                              setSiteSettings({
                                ...siteSettings,
                                heroCard: { ...heroCard, title: e.target.value }
                              });
                            }}
                            placeholder="যেমন: উচ্চতর ফিকহ ও ফতোয়া ডিপ্লোমা কোর্স"
                            className="w-full px-3.5 py-2 rounded-xl border border-[#ece8e0] font-bold text-[#112734]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#2c3e50] mb-1">কার্ডের সংক্ষিপ্ত বিবরণী (Subtitle)</label>
                          <textarea
                            rows={2}
                            value={siteSettings.heroCard?.subtitle || ''}
                            onChange={(e) => {
                              const heroCard = siteSettings.heroCard || {
                                enabled: true,
                                arabicSymbol: 'ن',
                                badgeText: '',
                                title: '',
                                subtitle: '',
                                features: [],
                                buttonText: 'কোর্সে যুক্ত হোন',
                                buttonLink: '/courses'
                              };
                              setSiteSettings({
                                ...siteSettings,
                                heroCard: { ...heroCard, subtitle: e.target.value }
                              });
                            }}
                            className="w-full px-3.5 py-2 rounded-xl border border-[#ece8e0]"
                          />
                        </div>

                        {/* Feature Bullet Points */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-[#2c3e50]">ফিচার বুলেট পয়েন্টসমূহ (Bullet Highlights)</label>
                            <button
                              type="button"
                              onClick={() => {
                                const heroCard = siteSettings.heroCard || {
                                  enabled: true,
                                  arabicSymbol: 'ن',
                                  badgeText: 'ভর্তি চলছে',
                                  title: 'উচ্চতর ফিকহ কোর্স',
                                  subtitle: '',
                                  features: [],
                                  buttonText: 'কোর্সে যুক্ত হোন',
                                  buttonLink: '/courses'
                                };
                                const feats = [...(heroCard.features || []), 'নতুন সুবিধা'];
                                setSiteSettings({
                                  ...siteSettings,
                                  heroCard: { ...heroCard, features: feats }
                                });
                              }}
                              className="text-[11px] font-bold text-[#112734] hover:underline flex items-center gap-1"
                            >
                              <Plus size={12} />
                              <span>নতুন পয়েন্ট যোগ</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(siteSettings.heroCard?.features || [
                              'সরাসরি লাইভ ক্লাস ও নোটপত্র',
                              'ভেরিফায়েড প্রফেশনাল সনদপত্র',
                              '২৪/৭ ওস্তাদ সাপোর্ট হেল্পডেস্ক'
                            ]).map((feat, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-[#17A2B8] shrink-0" />
                                <input
                                  type="text"
                                  value={feat}
                                  onChange={(e) => {
                                    const heroCard = siteSettings.heroCard || {
                                      enabled: true,
                                      arabicSymbol: 'ن',
                                      badgeText: '',
                                      title: '',
                                      subtitle: '',
                                      features: [],
                                      buttonText: 'কোর্সে যুক্ত হোন',
                                      buttonLink: '/courses'
                                    };
                                    const feats = [...(heroCard.features || [])];
                                    feats[idx] = e.target.value;
                                    setSiteSettings({
                                      ...siteSettings,
                                      heroCard: { ...heroCard, features: feats }
                                    });
                                  }}
                                  className="w-full px-3 py-1.5 rounded-lg border border-[#ece8e0]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const heroCard = siteSettings.heroCard || {
                                      enabled: true,
                                      arabicSymbol: 'ن',
                                      badgeText: '',
                                      title: '',
                                      subtitle: '',
                                      features: [],
                                      buttonText: 'কোর্সে যুক্ত হোন',
                                      buttonLink: '/courses'
                                    };
                                    const feats = (heroCard.features || []).filter((_, i) => i !== idx);
                                    setSiteSettings({
                                      ...siteSettings,
                                      heroCard: { ...heroCard, features: feats }
                                    });
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-600 rounded"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Button Config */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div>
                            <label className="block font-bold text-[#2c3e50] mb-1">বাটন টেক্সট (Button Text)</label>
                            <input
                              type="text"
                              value={siteSettings.heroCard?.buttonText || 'কোর্সে যুক্ত হোন'}
                              onChange={(e) => {
                                const heroCard = siteSettings.heroCard || {
                                  enabled: true,
                                  arabicSymbol: 'ن',
                                  badgeText: '',
                                  title: '',
                                  subtitle: '',
                                  features: [],
                                  buttonText: 'কোর্সে যুক্ত হোন',
                                  buttonLink: '/courses'
                                };
                                setSiteSettings({
                                  ...siteSettings,
                                  heroCard: { ...heroCard, buttonText: e.target.value }
                                });
                              }}
                              className="w-full px-3.5 py-2 rounded-xl border border-[#ece8e0]"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-[#2c3e50] mb-1">বাটন লিংক (Button Link)</label>
                            <input
                              type="text"
                              value={siteSettings.heroCard?.buttonLink || '/courses'}
                              onChange={(e) => {
                                const heroCard = siteSettings.heroCard || {
                                  enabled: true,
                                  arabicSymbol: 'ن',
                                  badgeText: '',
                                  title: '',
                                  subtitle: '',
                                  features: [],
                                  buttonText: 'কোর্সে যুক্ত হোন',
                                  buttonLink: '/courses'
                                };
                                setSiteSettings({
                                  ...siteSettings,
                                  heroCard: { ...heroCard, buttonLink: e.target.value }
                                });
                              }}
                              className="w-full px-3.5 py-2 rounded-xl border border-[#ece8e0] font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Card Live Mini Preview */}
                      <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-[#f8faf7] rounded-2xl border border-[#ece8e0]">
                        <span className="text-[10px] font-bold text-[#8a817c] uppercase tracking-wider mb-2">আর্চ কার্ড প্রিভিউ</span>
                        <div className="w-full max-w-xs bg-white rounded-t-[70px] border border-[#ece8e0] shadow-md p-5 text-center space-y-3">
                          <div className="w-12 h-12 bg-[#112734] rounded-full mx-auto flex items-center justify-center text-[#17A2B8] shadow overflow-hidden border-2 border-[#17A2B8]/40">
                            {siteSettings.heroCard?.iconImage ? (
                              <img
                                src={siteSettings.heroCard.iconImage}
                                alt="Icon"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-arabic text-2xl font-bold">{siteSettings.heroCard?.arabicSymbol || 'ن'}</span>
                            )}
                          </div>
                          {siteSettings.heroCard?.badgeText && (
                            <span className="text-[9px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full uppercase inline-block">
                              {siteSettings.heroCard.badgeText}
                            </span>
                          )}
                          <h4 className="text-sm font-black text-[#112734] leading-tight">
                            {siteSettings.heroCard?.title || 'উচ্চতর ফিকহ কোর্স'}
                          </h4>
                          <p className="text-[11px] text-[#5a524d] leading-relaxed line-clamp-2">
                            {siteSettings.heroCard?.subtitle || 'মুফতীগণের প্রত্যক্ষ তত্ত্বাবধানে ফিকহি গবেষণার সুযোগ।'}
                          </p>
                          <div className="py-2 px-3 bg-[#112734] text-white font-bold text-xs rounded-xl font-tiro shadow-sm">
                            {siteSettings.heroCard?.buttonText || 'কোর্সে যুক্ত হোন'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

              {/* 3. TOP NOTIFICATION BAR MANAGEMENT */}
              {settingsSubTab === 'notice' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-[#17A2B8]" />
                      <h3 className="font-extrabold text-base text-[#112734]">টপ নোটিশ বার (Top Notification Bar)</h3>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="notifEnabled"
                        checked={siteSettings.notificationEnabled !== false}
                        onChange={(e) => setSiteSettings({ ...siteSettings, notificationEnabled: e.target.checked })}
                        className="w-4 h-4 rounded text-[#17A2B8] focus:ring-[#17A2B8]"
                      />
                      <label htmlFor="notifEnabled" className="font-bold text-[#2c3e50] cursor-pointer">
                        হেডার টপ নোটিশ বার সক্রিয় রাখুন (চালু/বন্ধ)
                      </label>
                    </div>

                    <div>
                      <label className="block font-bold text-[#2c3e50] mb-1">নোটিশ ব্যাজ টেক্সট (যেমন: ভর্তি চলছে)</label>
                      <input
                        type="text"
                        value={siteSettings.notificationBadgeText || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, notificationBadgeText: e.target.value })}
                        placeholder="ভর্তি চলছে"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#2c3e50] mb-1">নোটিশের মূল টেক্সট / বিজ্ঞপ্তি (খালি রাখলে নোটিশ বার দেখাবে না)</label>
                      <textarea
                        rows={2}
                        value={siteSettings.notificationText || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, notificationText: e.target.value })}
                        placeholder="নূর ফিকহ একাডেমি নতুন ব্যাচ: ইবাদত ও সমকালীন ফিকহ মাস্টারকোর্স"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="notifTimerEnabled"
                          checked={siteSettings.notificationTimerEnabled !== false}
                          onChange={(e) => setSiteSettings({ ...siteSettings, notificationTimerEnabled: e.target.checked })}
                          className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                        />
                        <label htmlFor="notifTimerEnabled" className="font-bold text-[#2c3e50] cursor-pointer">
                          কাউন্টডাউন টাইমার সক্রিয় করুন
                        </label>
                      </div>

                      {siteSettings.notificationTimerEnabled !== false && (
                        <div>
                          <label className="block font-bold text-[#2c3e50] mb-1">টাইমার শেষের সময় (Target Date & Time)</label>
                          <input
                            type="datetime-local"
                            value={siteSettings.notificationTimerEnd ? new Date(siteSettings.notificationTimerEnd).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, notificationTimerEnd: new Date(e.target.value).toISOString() })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. ABOUT PAGE & CARDS MANAGEMENT */}
              {settingsSubTab === 'about' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-purple-600" />
                      <h3 className="font-extrabold text-base text-[#112734]">পরিচিতি (About Us) পেজ ও লক্ষ্য-উদ্দেশ্য কার্ড</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const currentAbout = siteSettings.aboutPage || {
                          titleBn: 'সহিহ সুন্নাহ ও নির্ভরযোগ্য ফিকহের আলোকবর্তিকা',
                          subtitleBn: 'আধুনিক জীবনের নানাবিধ জটিলতায় কুরআন ও সুন্নাহর প্রামাণ্য দিকনির্দেশনা...',
                          cards: []
                        };
                        const newCard = {
                          id: 'card-' + Date.now(),
                          title: 'নতুন লক্ষ্য / উদ্দেশ্য কার্ড',
                          description: 'এখানে কার্ডের বিস্তারিত বিবরণ লিখুন...',
                          iconName: 'BookOpen'
                        };
                        setSiteSettings({
                          ...siteSettings,
                          aboutPage: {
                            ...currentAbout,
                            cards: [...currentAbout.cards, newCard]
                          }
                        });
                      }}
                      className="px-3 py-1.5 bg-[#112734] hover:bg-[#23626F] text-white rounded-xl text-xs font-normal transition-all flex items-center gap-1.5"
                    >
                      <span>+ নতুন কার্ড যোগ করুন</span>
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-[#2c3e50] mb-1">পরিচিতি পেজ হিরো শিরোনাম (Title)</label>
                      <input
                        type="text"
                        value={siteSettings.aboutPage?.titleBn || ''}
                        onChange={(e) => {
                          const currentAbout = siteSettings.aboutPage || { titleBn: '', subtitleBn: '', cards: [] };
                          setSiteSettings({
                            ...siteSettings,
                            aboutPage: { ...currentAbout, titleBn: e.target.value }
                          });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                        placeholder="যেমন: সহিহ সুন্নাহ ও নির্ভরযোগ্য ফিকহের আলোকবর্তিকা"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#2c3e50] mb-1">পরিচিতি পেজ সাবটাইটেল (Subtitle)</label>
                      <textarea
                        rows={3}
                        value={siteSettings.aboutPage?.subtitleBn || ''}
                        onChange={(e) => {
                          const currentAbout = siteSettings.aboutPage || { titleBn: '', subtitleBn: '', cards: [] };
                          setSiteSettings({
                            ...siteSettings,
                            aboutPage: { ...currentAbout, subtitleBn: e.target.value }
                          });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                        placeholder="বিস্তারিত বর্ণনা..."
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <h4 className="font-bold text-sm text-[#112734]">লক্ষ্য, উদ্দেশ্য ও দৃষ্টিভঙ্গি কার্ডসমূহ ({siteSettings.aboutPage?.cards?.length || 0}টি কার্ড)</h4>
                      
                      {(!siteSettings.aboutPage?.cards || siteSettings.aboutPage.cards.length === 0) && (
                        <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-2xl text-center">কোনো কার্ড নেই। উপরে &quot;+ নতুন কার্ড যোগ করুন&quot; বাটনে ক্লিক করে কার্ড তৈরি করুন।</p>
                      )}

                      {siteSettings.aboutPage?.cards?.map((card, idx) => (
                        <div key={card.id || idx} className="bg-[#f8faf7] p-4 rounded-2xl border border-[#ece8e0] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold text-[#112734] bg-[#17A2B8]/20 px-2.5 py-0.5 rounded-full">
                              কার্ড #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const currentAbout = siteSettings.aboutPage || { titleBn: '', subtitleBn: '', cards: [] };
                                const updatedCards = currentAbout.cards.filter(c => c.id !== card.id);
                                setSiteSettings({
                                  ...siteSettings,
                                  aboutPage: { ...currentAbout, cards: updatedCards }
                                });
                              }}
                              className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1"
                            >
                              <Trash2 size={13} />
                              <span>মুছে ফেলুন</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-[#2c3e50] mb-1">কার্ডের শিরোনাম (Title)</label>
                              <input
                                type="text"
                                value={card.title}
                                onChange={(e) => {
                                  const currentAbout = siteSettings.aboutPage || { titleBn: '', subtitleBn: '', cards: [] };
                                  const updatedCards = currentAbout.cards.map(c => c.id === card.id ? { ...c, title: e.target.value } : c);
                                  setSiteSettings({
                                    ...siteSettings,
                                    aboutPage: { ...currentAbout, cards: updatedCards }
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] bg-white font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-[#2c3e50] mb-1">আইকন (Icon)</label>
                              <select
                                value={card.iconName || 'BookOpen'}
                                onChange={(e) => {
                                  const currentAbout = siteSettings.aboutPage || { titleBn: '', subtitleBn: '', cards: [] };
                                  const updatedCards = currentAbout.cards.map(c => c.id === card.id ? { ...c, iconName: e.target.value } : c);
                                  setSiteSettings({
                                    ...siteSettings,
                                    aboutPage: { ...currentAbout, cards: updatedCards }
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] bg-white font-bold"
                              >
                                <option value="BookOpen">BookOpen (বই)</option>
                                <option value="Award">Award (পদক/দৃষ্টিভঙ্গি)</option>
                                <option value="ShieldCheck">ShieldCheck (নিরাপত্তা)</option>
                                <option value="Sparkles">Sparkles (আলো)</option>
                                <option value="Users">Users (জনগণ/পরিষদ)</option>
                                <option value="GraduationCap">GraduationCap (শিক্ষা)</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#2c3e50] mb-1">কার্ডের বিস্তারিত বিবরণ (Description)</label>
                            <textarea
                              rows={3}
                              value={card.description}
                              onChange={(e) => {
                                const currentAbout = siteSettings.aboutPage || { titleBn: '', subtitleBn: '', cards: [] };
                                const updatedCards = currentAbout.cards.map(c => c.id === card.id ? { ...c, description: e.target.value } : c);
                                setSiteSettings({
                                  ...siteSettings,
                                  aboutPage: { ...currentAbout, cards: updatedCards }
                                });
                              }}
                              className="w-full px-3.5 py-2 rounded-xl border border-[#ece8e0] bg-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. PRIVACY POLICY & TERMS MANAGEMENT */}
              {settingsSubTab === 'terms' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <ShieldCheck size={18} className="text-emerald-600" />
                    <h3 className="font-extrabold text-base text-[#112734]">গোপনীয়তা নীতি ও শর্তাবলী পেজ ম্যানেজমেন্ট (Privacy & Terms)</h3>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-[#2c3e50] mb-1">গোপনীয়তা নীতি (Privacy Policy) টেক্সট</label>
                      <textarea
                        rows={6}
                        value={siteSettings.privacyPolicyText || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, privacyPolicyText: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] font-tiro leading-relaxed"
                        placeholder="গোপনীয়তা নীতির বিস্তারিত বিবরণ এখানে লিখুন..."
                      />
                      <p className="text-[10px] text-slate-500 mt-1">অনুচ্ছেদ অনুযায়ী নতুন লাইন দেওয়ার জন্য Enter ব্যবহার করুন।</p>
                    </div>

                    <div>
                      <label className="block font-bold text-[#2c3e50] mb-1">শর্তাবলী ও নিয়মাবলী (Terms & Conditions) টেক্সট</label>
                      <textarea
                        rows={6}
                        value={siteSettings.termsText || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, termsText: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] font-tiro leading-relaxed"
                        placeholder="শর্তাবলী ও নিয়মাবলীর বিস্তারিত বিবরণ এখানে লিখুন..."
                      />
                      <p className="text-[10px] text-slate-500 mt-1">অনুচ্ছেদ অনুযায়ী নতুন লাইন দেওয়ার জন্য Enter ব্যবহার করুন।</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. FAQ MANAGEMENT */}
              {settingsSubTab === 'faq' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <HelpCircle size={18} className="text-orange-600" />
                      <h3 className="font-extrabold text-base text-[#112734]">সাধারণ প্রশ্নোত্তর (FAQ) ম্যানেজমেন্ট</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const currentFaqs = siteSettings.faqs || [];
                        const newFaq = {
                          id: 'faq-' + Date.now(),
                          q: 'নতুন প্রশ্ন এখানে লিখুন?',
                          a: 'প্রশ্নের উত্তর এখানে বিস্তারিত লিখুন...'
                        };
                        setSiteSettings({
                          ...siteSettings,
                          faqs: [...currentFaqs, newFaq]
                        });
                      }}
                      className="px-3 py-1.5 bg-[#112734] hover:bg-[#23626F] text-white rounded-xl text-xs font-normal transition-all flex items-center gap-1.5"
                    >
                      <span>+ নতুন প্রশ্ন যোগ করুন</span>
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    {(siteSettings.faqs || []).map((faq, index) => (
                      <div key={faq.id || index} className="bg-[#fdfcf9] p-4 rounded-2xl border border-[#ece8e0] space-y-3 relative group">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#112734]">প্রশ্ন #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (siteSettings.faqs || []).filter((_, i) => i !== index);
                              setSiteSettings({ ...siteSettings, faqs: updated });
                            }}
                            className="text-red-500 hover:text-red-700 font-bold p-1"
                            title="মুছে ফেলুন"
                          >
                            ✕ ডিলিট
                          </button>
                        </div>
                        <div>
                          <label className="block font-medium text-[#2c3e50] mb-1">প্রশ্ন (Question)</label>
                          <input
                            type="text"
                            value={faq.q}
                            onChange={(e) => {
                              const updated = [...(siteSettings.faqs || [])];
                              updated[index] = { ...updated[index], q: e.target.value };
                              setSiteSettings({ ...siteSettings, faqs: updated });
                            }}
                            className="w-full px-3.5 py-2 rounded-xl border border-[#ece8e0] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-[#2c3e50] mb-1">উত্তর (Answer)</label>
                          <textarea
                            rows={3}
                            value={faq.a}
                            onChange={(e) => {
                              const updated = [...(siteSettings.faqs || [])];
                              updated[index] = { ...updated[index], a: e.target.value };
                              setSiteSettings({ ...siteSettings, faqs: updated });
                            }}
                            className="w-full px-3.5 py-2 rounded-xl border border-[#ece8e0] bg-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Social & Contact */}
              {settingsSubTab === 'contact' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Phone size={18} className="text-teal-600" />
                    <h3 className="font-extrabold text-base text-[#112734]">যোগাযোগ ও সোশ্যাল মিডিয়া</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-[#2c3e50] mb-1">হোয়াটসঅ্যাপ নাম্বার (WhatsApp)</label>
                      <input
                        type="text"
                        value={siteSettings.whatsappNumber}
                        onChange={(e) => setSiteSettings({ ...siteSettings, whatsappNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#2c3e50] mb-1">অফিসিয়াল ফোন / হটলাইন</label>
                      <input
                        type="text"
                        value={siteSettings.phone}
                        onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#2c3e50] mb-1">অফিসিয়াল ইমেইল</label>
                      <input
                        type="email"
                        value={siteSettings.email}
                        onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#2c3e50] mb-1">ফেসবুক পেজ URL</label>
                      <input
                        type="text"
                        value={siteSettings.facebookUrl}
                        onChange={(e) => setSiteSettings({ ...siteSettings, facebookUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block font-bold text-[#2c3e50] mb-1">অফিস ও গবেষণা কেন্দ্রের ঠিকানা</label>
                    <input
                      type="text"
                      value={siteSettings.address}
                      onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                    />
                  </div>
                </div>
              )}

              {/* 8. TRACKING, MARKETING & CERTIFICATE CATALOG */}
              {settingsSubTab === 'marketing' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <Award size={18} className="text-[#17A2B8]" />
                      <h3 className="font-extrabold text-base text-[#112734]">মার্কেটিং ও পিক্সেল ট্র্যাকিং</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-[#2c3e50] mb-1">Meta Pixel ID (Facebook Ads)</label>
                        <input
                          type="text"
                          placeholder="যেমন: 123456789012345"
                          value={siteSettings.metaPixelId || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, metaPixelId: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#2c3e50] mb-1">Google Analytics ID (GA4)</label>
                        <input
                          type="text"
                          placeholder="যেমন: G-XXXXXXXXXX"
                          value={siteSettings.gaMeasurementId || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, gaMeasurementId: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Certificate Template Catalog */}
                  <div className="space-y-4 pt-4 border-t border-[#ece8e0]">
                    <h3 className="font-extrabold text-base text-[#112734] border-b pb-2">অফিসিয়াল সার্টিফিকেট ক্যাটালগ ও টেমপ্লেট লিংক</h3>
                    <div className="text-xs space-y-2">
                      <label className="block font-bold text-[#2c3e50]">
                        গুগল ড্রাইভ / ড্রপবক্স বা ক্লাউড টেমপ্লেট ক্যাটালগ লিংক (Default Certificate Template URL)
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com/certificate-template.png"
                        value={siteSettings.certificateTemplateUrl || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, certificateTemplateUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                      />
                      <p className="text-[11px] text-[#8a817c]">
                        এখানে কোনো কাস্টম সার্টিফিকেট ডিজাইনের ছবি বা ক্যাটালগ লিংক দিলে শিক্ষার্থীদের সনদে তা ব্যাকগ্রাউন্ড বা রেফারেন্স হিসেবে যুক্ত হবে।
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. ORDER EMAIL NOTIFICATION (FORM SUBMIT SYSTEM) */}
              {settingsSubTab === 'email_notify' && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Subtab Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ece8e0] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-inner shrink-0">
                        <Mail size={20} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-[#112734] flex items-center gap-2">
                          <span>অর্ডার ইমেইল নোটিফিকেশন (Form Submit সিস্টেম)</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            সক্রিয় • Live
                          </span>
                        </h3>
                        <p className="text-xs text-[#8a817c]">
                          কোন শিক্ষার্থী কোর্স বা কিতাব অর্ডার করলে সাথে সাথে সকল তথ্য সহ এডমিনের ইমেইলে ফর্ম সাবমিট নোটিফিকেশন যাবে
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Main Toggle & Target Email Card */}
                  <div className="bg-[#fdfcf9] border border-[#ece8e0] rounded-2xl p-5 space-y-5">
                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#ece8e0]">
                      <div>
                        <span className="text-xs font-black text-[#112734] block">
                          ইমেইল নোটিফিকেশন স্বয়ংক্রিয় প্রেরণ ব্যবস্থা
                        </span>
                        <span className="text-[11px] text-[#8a817c]">
                          চালু থাকলে প্রতিটি নতুন অর্ডারের সময় এডমিনের ইমেইলে স্বয়ংক্রিয়ভাবে পূর্ণাঙ্গ অর্ডার শিট মেইল হবে
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={siteSettings.orderNotificationEnabled !== false}
                          onChange={(e) =>
                            setSiteSettings({ ...siteSettings, orderNotificationEnabled: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {/* Admin Destination Email */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#2c3e50]">
                        এডমিন নোটিফিকেশন ইমেইল অ্যাড্রেস (Admin Receiving Email) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="যেমন: noorfiqhaca@gmail.com"
                          value={siteSettings.orderNotificationEmail || 'noorfiqhaca@gmail.com'}
                          onChange={(e) =>
                            setSiteSettings({ ...siteSettings, orderNotificationEmail: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ece8e0] text-xs font-mono font-bold text-[#112734] focus:outline-none focus:border-[#17A2B8]"
                          required
                        />
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                      <p className="text-[11px] text-[#8a817c]">
                        ডিফল্ট হিসেবে <strong className="text-slate-700">noorfiqhaca@gmail.com</strong> এ সকল অর্ডার তথ্য পাঠানো হবে। প্রয়োজন অনুযায়ী এটি পরিবর্তন করতে পারেন।
                      </p>
                    </div>

                    {/* Custom FormSubmit or Webhook Endpoint (Optional) */}
                    <div className="space-y-1.5 pt-2 border-t border-[#ece8e0]">
                      <label className="block text-xs font-bold text-[#2c3e50]">
                        কাস্টম ফর্ম সাবমিট এন্ডপয়েন্ট বা ওয়েবহুক (ঐচ্ছিক / Advanced)
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: https://formsubmit.co/ajax/your-email@gmail.com অথবা কাস্টম ওয়েবহুক"
                        value={siteSettings.formSubmitEndpoint || ''}
                        onChange={(e) =>
                          setSiteSettings({ ...siteSettings, formSubmitEndpoint: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] text-xs font-mono text-[#112734] focus:outline-none focus:border-[#17A2B8]"
                      />
                      <p className="text-[11px] text-[#8a817c]">
                        খালি রাখলে সিস্টেম স্বয়ংক্রিয়ভাবে বিল্ট-ইন সিকিউর Form Submit গেটওয়ে ব্যবহার করবে।
                      </p>
                    </div>
                  </div>

                  {/* Test Email Verification Box */}
                  <div className="bg-white border border-[#ece8e0] rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-black text-[#112734] flex items-center gap-1.5">
                          <Sparkles size={15} className="text-amber-500" />
                          <span>ইমেইল ডেলিভারি পরীক্ষা করুন (Live Test Notification)</span>
                        </h4>
                        <p className="text-[11px] text-[#8a817c]">
                          নিচের বাটনে ক্লিক করে এক ক্লিকে আপনার ইনবক্সে একটি নমুনা টেস্ট অর্ডার নোটিফিকেশন পাঠিয়ে নিশ্চিত হোন
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleSendTestEmail}
                        disabled={testEmailLoading}
                        className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {testEmailLoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>টেস্ট ইমেইল পাঠানো হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Send size={14} />
                            <span>টেস্ট ইমেইল পাঠান (Test Send)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Test Feedback Message */}
                    {testEmailFeedback && (
                      <div
                        className={`p-4 rounded-2xl text-xs space-y-2.5 border animate-in fade-in ${
                          testEmailFeedback.needsActivation
                            ? 'bg-amber-50 text-amber-950 border-amber-300 shadow-sm'
                            : testEmailFeedback.success
                            ? 'bg-emerald-50 text-emerald-950 border-emerald-200 shadow-sm'
                            : 'bg-rose-50 text-rose-950 border-rose-200'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {testEmailFeedback.needsActivation ? (
                            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                          ) : testEmailFeedback.success ? (
                            <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1">
                            <p className="font-extrabold text-sm leading-snug">
                              {testEmailFeedback.needsActivation
                                ? '⚠️ গুরুত্বপূর্ণ: FormSubmit এক-ক্লিক এক্টিভেশন প্রয়োজন'
                                : testEmailFeedback.success
                                ? '✅ সফল! ইমেইল ডেলিভারি সক্রিয় হয়েছে'
                                : 'ত্রুটি পরিলক্ষিত হয়েছে'}
                            </p>
                            <p className="text-xs leading-relaxed opacity-90">{testEmailFeedback.message}</p>
                          </div>
                        </div>

                        {testEmailFeedback.needsActivation && (
                          <div className="mt-3 pt-3 border-t border-amber-200/80 bg-white/70 rounded-xl p-3.5 space-y-2 text-xs">
                            <p className="font-bold text-amber-900">অ্যাক্টিভেশন সম্পন্ন করার ৩টি সহজ ধাপ:</p>
                            <ol className="list-decimal list-inside space-y-1 text-slate-700 font-medium">
                              <li>আপনার জিমেইল <strong className="text-slate-900">{siteSettings.orderNotificationEmail || 'noorfiqhaca@gmail.com'}</strong> ইনবক্স অথবা <strong>স্প্যাম (Spam)</strong> ফোল্ডারে যান।</li>
                              <li><strong>FormSubmit</strong> থেকে আসা <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-mono text-[11px]">Action Required: Activate FormSubmit</code> ইমেইলটি খুলুন।</li>
                              <li>ইমেইলের ভেতরে থাকা নীল রঙের <strong>&quot;Activate Form&quot;</strong> বাটনে একবার ক্লিক করুন।</li>
                            </ol>
                            <div className="pt-2 flex items-center gap-3">
                              <a
                                href="https://mail.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#112734] hover:bg-[#1a3a4f] text-white rounded-lg font-bold text-xs shadow-sm transition-all"
                              >
                                <Mail size={13} />
                                <span>জিমেইল ওপেন করুন (Open Gmail)</span>
                              </a>
                              <span className="text-[11px] text-amber-800">
                                একবার অ্যাক্টিভেট করলেই এরপর থেকে প্রতিবার অটোম্যাটিক মেইল আসবে।
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Information Breakdown Table of What Gets Sent */}
                  <div className="border border-[#ece8e0] rounded-2xl p-5 bg-[#fdfcf9] space-y-3">
                    <h4 className="text-xs font-black text-[#112734] flex items-center gap-2">
                      <FileText size={15} className="text-[#17A2B8]" />
                      <span>ইমেইলে যে সকল তথ্য পরিপাটি টেবিল আকারে প্রেরিত হবে:</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-2.5 bg-white border border-[#ece8e0] rounded-xl">
                        <span className="font-bold text-slate-800 block">১. অর্ডারের বিবরণ</span>
                        <span className="text-[11px] text-[#8a817c]">ইউনিক অর্ডার আইডি, ক্রয়ের তারিখ ও সময়</span>
                      </div>
                      <div className="p-2.5 bg-white border border-[#ece8e0] rounded-xl">
                        <span className="font-bold text-slate-800 block">২. ক্রেতা/শিক্ষার্থীর তথ্য</span>
                        <span className="text-[11px] text-[#8a817c]">নাম, ইমেইল, মোবাইল/হোয়াটসঅ্যাপ নম্বর</span>
                      </div>
                      <div className="p-2.5 bg-white border border-[#ece8e0] rounded-xl">
                        <span className="font-bold text-slate-800 block">৩. কোর্সের বা বইয়ের তথ্য</span>
                        <span className="text-[11px] text-[#8a817c]">শিরোনাম, ক্যাটাগরি, ভার্সন (PDF/Hardcover)</span>
                      </div>
                      <div className="p-2.5 bg-white border border-[#ece8e0] rounded-xl">
                        <span className="font-bold text-slate-800 block">৪. পেমেন্ট ভেরিফিকেশন</span>
                        <span className="text-[11px] text-[#8a817c]">টাকার পরিমাণ, মেথড (বিকাশ/নগদ), TrxID</span>
                      </div>
                      <div className="p-2.5 bg-white border border-[#ece8e0] rounded-xl">
                        <span className="font-bold text-slate-800 block">৫. ডেলিভারি ঠিকানা</span>
                        <span className="text-[11px] text-[#8a817c]">মুদ্রিত কিতাবের কুরিয়ার ঠিকানা ও ফোন নম্বর</span>
                      </div>
                      <div className="p-2.5 bg-white border border-[#ece8e0] rounded-xl">
                        <span className="font-bold text-slate-800 block">৬. এক-ক্লিক অ্যাডমিন লিঙ্ক</span>
                        <span className="text-[11px] text-[#8a817c]">ড্যাশবোর্ডে গিয়ে ১-ক্লিকে Approve করার সুবিধা</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Save Action Bar */}
              <div className="pt-6 border-t border-[#ece8e0] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-[#8a817c]">পরিবর্তনগুলো সেভ করার সাথে সাথে ওয়েবসাইটে যুক্ত হবে।</p>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Save size={16} />
                  <span>সাইট সেটিংস সেভ করুন</span>
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    )}

          {/* TAB 11: FACULTY & RESEARCH COUNCIL MANAGEMENT */}
          {activeTab === 'faculty' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header Box */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ece8e0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                    শিক্ষকমণ্ডলী ও শরীয়াহ বোর্ড
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#112734] font-anek flex items-center gap-2.5">
                    <GraduationCap className="text-amber-500" size={26} />
                    <span>গবেষণা পরিষদ ও শিক্ষকবৃন্দ ব্যবস্থাপনা</span>
                  </h2>
                  <p className="text-xs text-[#5a524d] leading-relaxed max-w-2xl">
                    নূর ফিকহ একাডেমির গবেষণা পরিষদ, সিনিয়র উস্তাযবৃন্দ এবং শরীয়াহ উপদেষ্টা পরিষদের সদস্যদের প্রোফাইল, পদবী, ছবি ও গবেষণাক্ষেত্র যুক্ত এবং সম্পাদনা করুন।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenNewFaculty}
                  className="px-5 py-3 bg-[#112734] hover:bg-[#23626F] text-white text-xs font-bold font-tiro rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>নতুন সদস্য যুক্ত করুন</span>
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-[#ece8e0] shadow-sm">
                  <p className="text-[#8a817c] font-bold">মোট স্কলার ও উস্তায</p>
                  <p className="text-2xl font-black text-[#112734] mt-1">{facultyList.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#ece8e0] shadow-sm">
                  <p className="text-[#8a817c] font-bold">গবেষণা পরিষদ</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">
                    {facultyList.filter(f => f.category === 'council').length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#ece8e0] shadow-sm">
                  <p className="text-[#8a817c] font-bold">উস্তায ও শিক্ষকবৃন্দ</p>
                  <p className="text-2xl font-black text-blue-700 mt-1">
                    {facultyList.filter(f => f.category === 'faculty').length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#ece8e0] shadow-sm">
                  <p className="text-[#8a817c] font-bold">উপদেষ্টা পরিষদ</p>
                  <p className="text-2xl font-black text-purple-700 mt-1">
                    {facultyList.filter(f => f.category === 'advisor').length}
                  </p>
                </div>
              </div>

              {/* Filter & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={facultySearch}
                    onChange={(e) => setFacultySearch(e.target.value)}
                    placeholder="নাম, পদবী বা শিক্ষাপ্রতিষ্ঠান দিয়ে খুঁজুন..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#ece8e0] rounded-xl text-xs outline-none focus:border-[#112734]"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: 'সকল সদস্য' },
                    { id: 'council', label: 'গবেষণা পরিষদ' },
                    { id: 'faculty', label: 'শিক্ষকবৃন্দ' },
                    { id: 'advisor', label: 'উপদেষ্টা পরিষদ' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFacultyCategoryFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-tiro transition-all ${
                        facultyCategoryFilter === f.id
                          ? 'bg-[#112734] text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-[#ece8e0] hover:bg-slate-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Faculty Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facultyList
                  .filter(f => {
                    const matchesCategory = facultyCategoryFilter === 'all' || f.category === facultyCategoryFilter;
                    const q = facultySearch.toLowerCase();
                    const matchesSearch = 
                      (f.nameBn && f.nameBn.toLowerCase().includes(q)) || 
                      (f.name && f.name.toLowerCase().includes(q)) || 
                      (f.designation && f.designation.toLowerCase().includes(q)) ||
                      (f.qualifications && f.qualifications.toLowerCase().includes(q));
                    return matchesCategory && matchesSearch;
                  })
                  .sort((a, b) => (a.order || 99) - (b.order || 99))
                  .map((member) => (
                    <div
                      key={member.id}
                      className="bg-white rounded-3xl border border-[#ece8e0] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#17A2B8]/20 shadow-inner bg-slate-50">
                              <img
                                src={member.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                                alt={member.nameBn || member.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            {member.order && (
                              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-[#17A2B8] text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center shadow">
                                #{member.order}
                              </span>
                            )}
                          </div>

                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            member.category === 'council'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : member.category === 'advisor'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-[#17A2B8]/10 text-[#112734] border border-[#17A2B8]/30'
                          }`}>
                            {member.category === 'council'
                              ? 'গবেষণা পরিষদ'
                              : member.category === 'advisor'
                              ? 'উপদেষ্টা পরিষদ'
                              : 'শিক্ষকবৃন্দ'}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-black text-base text-[#2c3e50] font-anek">
                            {member.nameBn || member.name}
                          </h3>
                          {member.name && member.name !== member.nameBn && (
                            <p className="text-[11px] text-slate-400 font-medium">{member.name}</p>
                          )}
                          <p className="text-xs font-bold text-[#112734] mt-1">{member.designation}</p>
                          {member.qualifications && (
                            <p className="text-[11px] text-[#8a817c] mt-0.5">{member.qualifications}</p>
                          )}
                        </div>

                        {member.bio && (
                          <p className="text-xs text-[#5a524d] leading-relaxed line-clamp-3 bg-[#fdfcf9] p-3 rounded-xl border border-[#ece8e0]/60">
                            {member.bio}
                          </p>
                        )}

                        <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                          {member.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail size={12} className="text-[#23626F] shrink-0" />
                              <span className="truncate">{member.email}</span>
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone size={12} className="text-[#23626F] shrink-0" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ece8e0]">
                        <button
                          type="button"
                          onClick={() => handleEditFaculty(member)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-[#112734] hover:text-white text-[#2c3e50] rounded-xl text-xs font-bold font-tiro flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Edit3 size={13} />
                          <span>সম্পাদনা</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaculty(member.id, member.nameBn || member.name)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="সদস্য মুছুন"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* FACULTY EDITOR MODAL */}
          {editingFaculty && (
            <FacultyEditorModal
              faculty={editingFaculty}
              isNew={isNewFaculty}
              onClose={() => setEditingFaculty(null)}
              onSave={handleSaveFaculty}
            />
          )}

          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header Box */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ece8e0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                    এক্সেস কন্ট্রোল ও ইউজার ডিরেক্টরি
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#112734] font-anek flex items-center gap-2.5">
                    <Users className="text-amber-500" size={24} />
                    <span>ব্যবহারকারী ও ভূমিকা (Role) ব্যবস্থাপনা</span>
                  </h2>
                  <p className="text-xs text-[#5a524d] leading-relaxed max-w-2xl">
                    নির্ধারিত মূল এডমিন (<span className="font-semibold text-[#112734]">noorfiqhaca@gmail.com</span>) ছাড়া অন্য যেকোনো শিক্ষার্থীকে এডমিন বা ফতোয়া গবেষক রোল প্রদান করতে পারবেন।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddUserModal(true)}
                  className="px-5 py-3 bg-[#112734] hover:bg-[#23626F] text-white text-xs font-bold font-tiro rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0 cursor-pointer"
                >
                  <UserPlus size={16} />
                  <span>নতুন ব্যবহারকারী যুক্ত করুন</span>
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-[#ece8e0] shadow-sm">
                  <p className="text-[#8a817c] font-bold">মোট নিবন্ধিত</p>
                  <p className="text-2xl font-black text-[#112734] mt-1">{usersList.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#ece8e0] shadow-sm">
                  <p className="text-[#8a817c] font-bold">শিক্ষার্থী</p>
                  <p className="text-2xl font-black text-blue-700 mt-1">
                    {usersList.filter(u => u.role === 'student').length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#ece8e0] shadow-sm">
                  <p className="text-[#8a817c] font-bold">মুফতী / গবেষক</p>
                  <p className="text-2xl font-black text-purple-700 mt-1">
                    {usersList.filter(u => u.role === 'scholar').length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#ece8e0] shadow-sm">
                  <p className="text-[#8a817c] font-bold">এডমিন প্যানেল</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">
                    {usersList.filter(u => u.role === 'admin').length}
                  </p>
                </div>
              </div>

              {/* Filter & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="নাম, ইমেইল বা মোবাইল দিয়ে খুঁজুন..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#ece8e0] rounded-xl text-xs outline-none focus:border-[#112734]"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: 'সকল ইউজার' },
                    { id: 'student', label: 'শিক্ষার্থী' },
                    { id: 'scholar', label: 'মুফতী / স্কলার' },
                    { id: 'admin', label: 'এডমিন' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setUserRoleFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-tiro transition-all ${
                        userRoleFilter === f.id
                          ? 'bg-[#112734] text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-[#ece8e0] hover:bg-slate-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users List Table */}
              <div className="bg-white rounded-3xl border border-[#ece8e0] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fdfcf9] border-b border-[#ece8e0] text-[#8a817c] font-bold">
                      <tr>
                        <th className="p-4 sm:p-5">ব্যবহারকারী</th>
                        <th className="p-4 sm:p-5">যোগাযোগ</th>
                        <th className="p-4 sm:p-5">বর্তমান ভূমিকা (Role)</th>
                        <th className="p-4 sm:p-5">রোল পরিবর্তন করুন</th>
                        <th className="p-4 sm:p-5 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ece8e0]">
                      {usersList
                        .filter(u => {
                          const matchesFilter = userRoleFilter === 'all' || u.role === userRoleFilter;
                          const q = userSearch.toLowerCase();
                          const matchesSearch = 
                            u.name.toLowerCase().includes(q) || 
                            u.email.toLowerCase().includes(q) || 
                            (u.phone && u.phone.includes(q));
                          return matchesFilter && matchesSearch;
                        })
                        .map((u) => {
                          const isSuper = u.email.toLowerCase() === 'noorfiqhaca@gmail.com';
                          return (
                            <tr key={u.uid || u.email} className="hover:bg-slate-50/70 transition-colors">
                              <td className="p-4 sm:p-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-[#17A2B8]/15 text-[#112734] flex items-center justify-center font-bold text-sm shrink-0 border border-[#17A2B8]/30">
                                    {u.name.slice(0, 1)}
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-[#2c3e50] flex items-center gap-1.5">
                                      <span>{u.name}</span>
                                      {isSuper && (
                                        <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.2 rounded-full">
                                          মাস্টার এডমিন
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{u.email}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="p-4 sm:p-5 text-[#5a524d]">
                                <div className="space-y-0.5">
                                  <p>{u.phone || 'মোবাইল নেই'}</p>
                                  <p className="text-[10px] text-slate-400">যোগদান: {u.joinedAt?.split('T')[0] || 'পূর্ববর্তী'}</p>
                                </div>
                              </td>

                              <td className="p-4 sm:p-5">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                                  u.role === 'admin'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                    : u.role === 'scholar'
                                    ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                    : 'bg-[#17A2B8]/10 text-[#112734] border border-[#17A2B8]/30'
                                }`}>
                                  <UserCheck size={12} />
                                  {u.role === 'admin' ? 'এডমিন' : u.role === 'scholar' ? 'মুফতী / গবেষক' : 'শিক্ষার্থী'}
                                </span>
                              </td>

                              <td className="p-4 sm:p-5">
                                {isSuper ? (
                                  <span className="text-[11px] text-slate-400 italic">সুপার এডমিন অপরিবর্তনীয়</span>
                                ) : (
                                  <select
                                    value={u.role}
                                    onChange={(e) => handleRoleChange(u.uid || u.email, e.target.value as any)}
                                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold font-tiro focus:border-[#112734] outline-none shadow-sm cursor-pointer"
                                  >
                                    <option value="student">শিক্ষার্থী (Student)</option>
                                    <option value="scholar">মুফতী / স্কলার (Scholar)</option>
                                    <option value="admin">পূর্ণ এডমিন (Admin)</option>
                                  </select>
                                )}
                              </td>

                              <td className="p-4 sm:p-5 text-right">
                                {!isSuper && (
                                  <button
                                    onClick={() => handleDeleteUser(u.uid, u.name)}
                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="ইউজার মুছুন"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ADD NEW USER MODAL */}
          {showAddUserModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[#ece8e0]">
                <div className="bg-[#112734] p-6 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus size={20} className="text-[#17A2B8]" />
                    <h3 className="font-black text-lg font-anek">নতুন ব্যবহারকারী যোগ করুন</h3>
                  </div>
                  <button
                    onClick={() => setShowAddUserModal(false)}
                    className="p-1.5 rounded-xl bg-[#23626F] text-white hover:bg-[#23626F]"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="block font-bold text-[#2c3e50]">ব্যবহারকারীর নাম *</label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="যেমন: মাওলানা হাফিজুর রহমান"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112734] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-[#2c3e50]">ইমেইল এড্রেস *</label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112734] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-[#2c3e50]">মোবাইল নম্বর (ঐচ্ছিক)</label>
                    <input
                      type="tel"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112734] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-[#2c3e50]">নির্ধারিত ভূমিকা (Role) *</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112734] outline-none font-tiro font-bold"
                    >
                      <option value="student">শিক্ষার্থী (Student)</option>
                      <option value="scholar">মুফতী / ফতোয়া গবেষক (Scholar)</option>
                      <option value="admin">পূর্ণ এডমিন (Admin)</option>
                    </select>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold font-tiro"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#112734] hover:bg-[#23626F] text-white rounded-xl font-bold font-tiro shadow-md"
                    >
                      সংরক্ষণ করুন
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}


        </main>
      </div>

    </div>
  );
}

// -------------------------------------------------------------------------------------
// FULL COURSE, LESSONS & QUIZ BUILDER MODAL COMPONENT
// -------------------------------------------------------------------------------------
interface CourseBuilderModalProps {
  course: Course;
  isNew: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
}

function CourseBuilderModal({ course, isNew, onClose, onSave }: CourseBuilderModalProps) {
  const [formData, setFormData] = useState<Course>(() => JSON.parse(JSON.stringify(course)));
  const [activeSubTab, setActiveSubTab] = useState<'basic' | 'curriculum' | 'quizzes' | 'instructor'>('basic');
  const [editingLessonIdx, setEditingLessonIdx] = useState<number | null>(null);

  const categories = [
    { id: 'ibadat', label: 'তাহরাত, নামাজ ও রোজা' },
    { id: 'muamalat', label: 'ব্যবসা ও আর্থিক লেনদেন' },
    { id: 'family', label: 'বিবাহ, তালাক ও পরিবার' },
    { id: 'usul', label: 'উসূলে ফিকহ ও ফতোয়া শাস্ত্র' },
    { id: 'contemporary', label: 'চিকিৎসা ও আধুনিক ফিকহ' },
  ];

  const handleAddLesson = () => {
    const newLesson: Lesson = {
      id: 'les-' + Date.now(),
      title: `নতুন পাঠ ${formData.lessons.length + 1}`,
      duration: '৪০ মিনিট',
      isFreePreview: false,
      videoUrl: '',
      pdfNotesUrl: '',
      notes: ''
    };
    setFormData({
      ...formData,
      lessons: [...formData.lessons, newLesson],
      totalLessons: formData.lessons.length + 1
    });
    setEditingLessonIdx(formData.lessons.length);
  };

  const handleRemoveLesson = (idx: number) => {
    if (confirm('এই পাঠটি মুছে ফেলতে চান?')) {
      const updated = formData.lessons.filter((_, i) => i !== idx);
      setFormData({
        ...formData,
        lessons: updated,
        totalLessons: updated.length
      });
      if (editingLessonIdx === idx) setEditingLessonIdx(null);
    }
  };

  const handleUpdateLesson = (idx: number, updated: Lesson) => {
    const lessons = [...formData.lessons];
    lessons[idx] = updated;
    setFormData({ ...formData, lessons });
  };

  // Add Quiz Question to a lesson
  const handleAddQuestionToLesson = (lessonIdx: number) => {
    const currentLesson = formData.lessons[lessonIdx];
    const timestamp = new Date().getTime();
    const existingQuiz = currentLesson.quiz ? { ...currentLesson.quiz, questions: [...currentLesson.quiz.questions] } : {
      id: `quiz-${timestamp}`,
      title: `${currentLesson.title} - মূল্যায়ন পরীক্ষা`,
      passingScore: 70,
      questions: []
    };

    const newQuestion: QuizQuestion = {
      id: `q-${timestamp}-${existingQuiz.questions.length}`,
      type: 'mcq',
      question: 'প্রশ্ন লিখুন...',
      options: ['অপশন ১', 'অপশন ২', 'অপশন ৩', 'অপশন ৪'],
      correctAnswer: 0,
      explanation: 'সহিহ উত্তরের সংক্ষিপ্ত ব্যাখ্যা...',
      marks: 10
    };

    const updatedQuiz = {
      ...existingQuiz,
      questions: [...existingQuiz.questions, newQuestion]
    };
    handleUpdateLesson(lessonIdx, { ...currentLesson, quiz: updatedQuiz });
  };

  const handleRemoveQuestionFromLesson = (lessonIdx: number, qIdx: number) => {
    const currentLesson = formData.lessons[lessonIdx];
    if (!currentLesson.quiz) return;
    const updatedQuiz = {
      ...currentLesson.quiz,
      questions: currentLesson.quiz.questions.filter((_, i) => i !== qIdx)
    };
    handleUpdateLesson(lessonIdx, { ...currentLesson, quiz: updatedQuiz });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleBn.trim()) {
      alert('অনুগ্রহ করে কোর্সের নাম লিখুন');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-6 bg-[#112734] text-white flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs text-[#17A2B8] font-bold uppercase tracking-wider">
              {isNew ? 'কোর্স ক্রিয়েটর' : 'কোর্স মডিফায়ার'}
            </span>
            <h3 className="text-xl font-black text-white">
              {formData.titleBn || 'নতুন কোর্স তৈরির ফর্ম'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#23626F] text-white hover:bg-[#23626F]">
            <X size={18} />
          </button>
        </div>

        {/* Builder Sub-Navigation Tabs */}
        <div className="flex border-b border-[#ece8e0] px-6 bg-[#fdfcf9] gap-4 overflow-x-auto text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('basic')}
            className={`py-3 border-b-2 transition-all ${
              activeSubTab === 'basic' ? 'border-[#112734] text-[#112734]' : 'border-transparent text-[#8a817c]'
            }`}
          >
            ১. প্রাথমিক তথ্য ও ফি
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('curriculum')}
            className={`py-3 border-b-2 transition-all ${
              activeSubTab === 'curriculum' ? 'border-[#112734] text-[#112734]' : 'border-transparent text-[#8a817c]'
            }`}
          >
            ২. লেকচার ও কারিকুলাম ({formData.lessons.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('quizzes')}
            className={`py-3 border-b-2 transition-all ${
              activeSubTab === 'quizzes' ? 'border-[#112734] text-[#112734]' : 'border-transparent text-[#8a817c]'
            }`}
          >
            ৩. কুইজ ও মূল্যায়ন পরীক্ষা
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('instructor')}
            className={`py-3 border-b-2 transition-all ${
              activeSubTab === 'instructor' ? 'border-[#112734] text-[#112734]' : 'border-transparent text-[#8a817c]'
            }`}
          >
            ৪. ইন্সট্রাক্টর ও উদ্দেশ্য
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-xs">
          
          {/* SUBTAB 1: BASIC INFO */}
          {activeSubTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-[#2c3e50] mb-1">কোর্সের নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ইবাদত ও সমকালীন আধুনিক ফিকহ মাস্টারকোর্স"
                  value={formData.titleBn}
                  onChange={(e) => setFormData({ ...formData, titleBn: e.target.value, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#2c3e50] mb-1">ক্যাটাগরি</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const selected = categories.find(c => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        category: e.target.value,
                        categoryLabelBn: selected?.label || 'সাধারণ ফিকহ'
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#2c3e50] mb-1">কোর্স ফি (টাকা) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2c3e50] mb-1">আসল মূল্য / ডিসকাউন্ট (টাকা)</label>
                  <input
                    type="number"
                    value={formData.originalPrice || ''}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#2c3e50] mb-1">কোর্সের সময়কাল</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2c3e50] mb-1">লেভেল</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({
                      ...formData,
                      level: e.target.value,
                      levelBn: e.target.value === 'beginner' ? 'প্রাথমিক' : e.target.value === 'advanced' ? 'উচ্চতর' : 'মধ্যম'
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                  >
                    <option value="beginner">প্রাথমিক স্তর</option>
                    <option value="intermediate">মধ্যম স্তর</option>
                    <option value="advanced">উচ্চতর স্তর</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#2c3e50] mb-1">ট্যাগ / ব্যাজ</label>
                  <input
                    type="text"
                    placeholder="যেমন: নতুন ব্যাচ, জনপ্রিয়"
                    value={formData.badge || ''}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2c3e50] mb-1">কোর্স থাম্বনেইল ছবির URL</label>
                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2c3e50] mb-1">
                  কোর্স প্রিভিউ/ট্রেলার ভিডিও লিংক (YouTube / Vimeo / MP4 Video URL)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: https://www.youtube.com/watch?v=... বা https://youtu.be/..."
                  value={formData.previewVideoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, previewVideoUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] font-mono text-xs"
                />
                <p className="text-[11px] text-[#8a817c] mt-1">
                  কোর্সের বিস্তারিত পেজের হিরো সেকশনে থাম্বনেইলের উপর এই ভিডিওটি চলবে।
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#2c3e50] mb-1">
                  কোর্সের সার্টিফিকেট টেমপ্লেট / গুগল ড্রাইভ ক্যাটালগ লিংক (ঐচ্ছিক)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/1MbLIdYDXBPyV2zqE_5_6MDVkhSlG0MvG/view?usp=sharing"
                  value={formData.certificateTemplateUrl || ''}
                  onChange={(e) => setFormData({ ...formData, certificateTemplateUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] font-mono text-xs"
                />
                <p className="text-[11px] text-[#8a817c] mt-1">
                  এখানে গুগোল ড্রাইভ ক্যাটালগ বা ছবি লিংক দিলে শিক্ষার্থীরা কোর্স শেষ করে সনদপত্র ডাউনলোড করার সময় তাদের নাম ও সনদের তথ্যসহ তা দেখতে পাবে।
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#2c3e50] mb-1">সংক্ষিপ্ত পরিচিতি</label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ece8e0]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2c3e50] mb-1">বিস্তারিত সিলেবাস ও বিবরণ</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ece8e0]"
                />
              </div>
            </div>
          )}

          {/* SUBTAB 2: LESSONS & CURRICULUM */}
          {activeSubTab === 'curriculum' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-[#112734]">পাঠ্যক্রম ও লেকচার তালিকা</h4>
                  <p className="text-[#8a817c]">প্রতিটি পাঠের শিরোনাম, ভিডিও লিংক ও পিডিএফ নোট যোগ করুন</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddLesson}
                  className="px-3.5 py-2 bg-[#112734] text-white rounded-xl font-bold flex items-center gap-1.5 shadow"
                >
                  <Plus size={14} /> লেকচার যোগ করুন
                </button>
              </div>

              <div className="space-y-4">
                {formData.lessons.map((lesson, idx) => {
                  const isEditing = editingLessonIdx === idx;
                  return (
                    <div key={lesson.id || idx} className="p-4 rounded-2xl border border-[#ece8e0] bg-[#fdfcf9] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#17A2B8]/15 text-[#112734] font-black flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-[#2c3e50]">{lesson.title}</span>
                          {lesson.isFreePreview && (
                            <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">
                              ফ্রি প্রিভিউ
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingLessonIdx(isEditing ? null : idx)}
                            className="px-3 py-1 bg-white border border-[#ece8e0] rounded-lg font-bold text-[#112734]"
                          >
                            {isEditing ? 'সংকোচন' : 'এডিট'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveLesson(idx)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="space-y-3 pt-3 border-t border-[#ece8e0] bg-white p-4 rounded-xl">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block font-bold mb-1">পাঠের শিরোনাম *</label>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => handleUpdateLesson(idx, { ...lesson, title: e.target.value })}
                                className="w-full px-3 py-1.5 rounded-lg border border-[#ece8e0]"
                              />
                            </div>
                            <div>
                              <label className="block font-bold mb-1">সময়কাল (Duration)</label>
                              <input
                                type="text"
                                placeholder="যেমন: ৪৫ মিনিট"
                                value={lesson.duration}
                                onChange={(e) => handleUpdateLesson(idx, { ...lesson, duration: e.target.value })}
                                className="w-full px-3 py-1.5 rounded-lg border border-[#ece8e0]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-bold mb-1">ভিডিও লিংক (YouTube / Vimeo / Direct)</label>
                              <input
                                type="text"
                                placeholder="https://www.youtube.com/embed/..."
                                value={lesson.videoUrl || ''}
                                onChange={(e) => handleUpdateLesson(idx, { ...lesson, videoUrl: e.target.value })}
                                className="w-full px-3 py-1.5 rounded-lg border border-[#ece8e0]"
                              />
                            </div>
                            <div>
                              <label className="block font-bold mb-1">পিডিএফ নোট লিংক (PDF Notes URL)</label>
                              <input
                                type="text"
                                placeholder="https://.../notes.pdf"
                                value={lesson.pdfNotesUrl || ''}
                                onChange={(e) => handleUpdateLesson(idx, { ...lesson, pdfNotesUrl: e.target.value })}
                                className="w-full px-3 py-1.5 rounded-lg border border-[#ece8e0]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              id={`free-${idx}`}
                              checked={lesson.isFreePreview || false}
                              onChange={(e) => handleUpdateLesson(idx, { ...lesson, isFreePreview: e.target.checked })}
                              className="rounded text-[#112734]"
                            />
                            <label htmlFor={`free-${idx}`} className="cursor-pointer font-bold text-[#5a524d]">
                              এই পাঠটি আনলকড ফ্রি প্রিভিউ হিসেবে রাখা হোক
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUBTAB 3: QUIZZES & EXAMS */}
          {activeSubTab === 'quizzes' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-extrabold text-sm text-[#112734]">মূল্যায়ন পরীক্ষা ও কুইজ প্রশ্ন তৈরি</h4>
                <p className="text-[#8a817c]">শিক্ষার্থীদের সনদপত্র অর্জনের জন্য লেকচারভিত্তিক বা কোর্সভিত্তিক কুইজ যোগ করুন</p>
              </div>

              {formData.lessons.map((lesson, lIdx) => (
                <div key={lesson.id || lIdx} className="p-4 rounded-2xl border border-[#ece8e0] bg-[#fdfcf9] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-[#112734]">পাঠ {lIdx + 1}: {lesson.title}</span>
                      <p className="text-[11px] text-[#8a817c]">
                        {lesson.quiz ? `${lesson.quiz.questions.length}টি প্রশ্ন যুক্ত আছে` : 'কোনো কুইজ যুক্ত করা হয়নি'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionToLesson(lIdx)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-[#17A2B8] text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm"
                    >
                      <Plus size={13} /> MCQ প্রশ্ন যোগ করুন
                    </button>
                  </div>

                  {lesson.quiz && lesson.quiz.questions.map((q, qIdx) => (
                    <div key={q.id || qIdx} className="bg-white p-4 rounded-xl border border-[#17A2B8]/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#112734]">প্রশ্ন {qIdx + 1} (মান: {q.marks || 10} নম্বর)</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionFromLesson(lIdx, qIdx)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="প্রশ্নটি লিখুন..."
                        value={q.question}
                        onChange={(e) => {
                          const updatedQ = { ...q, question: e.target.value };
                          lesson.quiz!.questions[qIdx] = updatedQ;
                          handleUpdateLesson(lIdx, { ...lesson });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-[#ece8e0] font-bold"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(q.options || ['ক', 'খ', 'গ', 'ঘ']).map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${lesson.id}-${qIdx}`}
                              checked={q.correctAnswer === oIdx}
                              onChange={() => {
                                q.correctAnswer = oIdx;
                                handleUpdateLesson(lIdx, { ...lesson });
                              }}
                              className="text-[#112734]"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...(q.options || [])];
                                newOpts[oIdx] = e.target.value;
                                q.options = newOpts;
                                handleUpdateLesson(lIdx, { ...lesson });
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg border text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* SUBTAB 4: INSTRUCTOR & OBJECTIVES */}
          {activeSubTab === 'instructor' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-[#112734]">ইন্সট্রাক্টরের তথ্য</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">ইন্সট্রাক্টরের নাম *</label>
                  <input
                    type="text"
                    value={formData.instructor.nameBn}
                    onChange={(e) => setFormData({
                      ...formData,
                      instructor: { ...formData.instructor, nameBn: e.target.value, name: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">পদবী / ডিগ্রি</label>
                  <input
                    type="text"
                    value={formData.instructor.title}
                    onChange={(e) => setFormData({
                      ...formData,
                      instructor: { ...formData.instructor, title: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">ইন্সট্রাক্টরের প্রোফাইল ছবি URL</label>
                <input
                  type="text"
                  value={formData.instructor.avatar}
                  onChange={(e) => setFormData({
                    ...formData,
                    instructor: { ...formData.instructor, avatar: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">ইন্সট্রাক্টরের সংক্ষিপ্ত পরিচিতি</label>
                <textarea
                  rows={2}
                  value={formData.instructor.bio}
                  onChange={(e) => setFormData({
                    ...formData,
                    instructor: { ...formData.instructor, bio: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-[#fdfcf9] border-t border-[#ece8e0] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold"
          >
            বাতিল
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold rounded-xl shadow-lg flex items-center gap-2 text-xs uppercase tracking-wider"
          >
            <Save size={16} />
            <span>সম্পূর্ণ কোর্সটি সেভ করুন</span>
          </button>
        </div>

      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------
// FACULTY & RESEARCH COUNCIL BUILDER MODAL COMPONENT
// -------------------------------------------------------------------------------------
interface FacultyEditorModalProps {
  faculty: FacultyMember;
  isNew: boolean;
  onClose: () => void;
  onSave: (faculty: FacultyMember) => void;
}

function FacultyEditorModal({ faculty, isNew, onClose, onSave }: FacultyEditorModalProps) {
  const [formData, setFormData] = useState<FacultyMember>(() => JSON.parse(JSON.stringify(faculty)));

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameBn.trim() && !formData.name.trim()) {
      alert('সদস্যের নাম প্রদান করুন');
      return;
    }
    if (!formData.designation.trim()) {
      alert('পদবী বা দায়িত্ব উল্লেখ করুন');
      return;
    }

    const categoryLabels: Record<string, string> = {
      council: 'গবেষণা পরিষদ',
      faculty: 'শিক্ষকবৃন্দ',
      advisor: 'উপদেষ্টা পরিষদ'
    };

    onSave({
      ...formData,
      categoryLabelBn: categoryLabels[formData.category] || 'গবেষণা পরিষদ'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[#ece8e0] my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#112734] p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <GraduationCap size={24} className="text-[#17A2B8]" />
            <div>
              <h3 className="font-black text-lg font-anek">
                {isNew ? 'নতুন শিক্ষক / গবেষক সদস্য যুক্ত করুন' : 'সদস্যের তথ্য সম্পাদনা করুন'}
              </h3>
              <p className="text-xs text-[#17A2B8]/80">গবেষণা পরিষদ, উস্তায বা উপদেষ্টা পরিষদের প্রোফাইল</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#23626F] text-white hover:bg-[#23626F]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Avatar Upload & Preview */}
          <div className="bg-[#fdfcf9] p-4 rounded-2xl border border-[#ece8e0] flex flex-col sm:flex-row items-center gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#17A2B8] bg-white shrink-0 shadow-inner">
              <img
                src={formData.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2 flex-1 w-full">
              <label className="block font-bold text-[#2c3e50]">প্রোফাইল ছবি (URL বা আপলোড)</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#112734]"
                />
                <label className="px-3.5 py-2 bg-[#112734]/10 text-[#112734] hover:bg-[#112734]/20 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                  <Upload size={14} />
                  <span>ছবি আপলোড</span>
                  <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-[#2c3e50]">নাম (বাংলা) *</label>
              <input
                type="text"
                required
                value={formData.nameBn}
                onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                placeholder="যেমন: মুফতী আব্দুল্লাহ আন-নূর"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112734] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-[#2c3e50]">নাম (English)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Mufti Abdullah An-Noor"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112734] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-[#2c3e50]">বিভাগ / পরিষদ ক্যাটাগরি *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112734] outline-none font-tiro font-bold"
              >
                <option value="council">গবেষণা পরিষদ (Research Council)</option>
                <option value="faculty">উস্তায ও শিক্ষকবৃন্দ (Teaching Faculty)</option>
                <option value="advisor">শরীয়াহ উপদেষ্টা পরিষদ (Advisory Board)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-[#2c3e50]">পদবী ও দায়িত্ব (Designation) *</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="যেমন: প্রতিষ্ঠাতা পরিচালক ও প্রধান ফিকহ গবেষক"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112734] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-[#2c3e50]">শিক্ষাগত যোগ্যতা, ডিগ্রি ও ইনস্টিটিউশন</label>
            <input
              type="text"
              value={formData.qualifications || ''}
              onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
              placeholder="যেমন: উচ্চতর ইফতা (দারুল উলুম দেওবন্দ / আল-আজহার), পিএইচডি"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112734] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-[#2c3e50]">সংক্ষিপ্ত পরিচিতি ও গবেষণা ক্ষেত্র (Bio)</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="গবেষকের ফিকহি গবেষণার ক্ষেত্র ও অভিজ্ঞতা সংক্ষেপে লিখুন..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112734] outline-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-[#2c3e50]">ইমেইল এড্রেস</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="scholar@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112734] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-[#2c3e50]">মোবাইল নম্বর</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="017XXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112734] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-[#2c3e50]">ডিসপ্লে ক্রম (Order)</label>
              <input
                type="number"
                value={formData.order || 1}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112734] outline-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#ece8e0]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold font-tiro"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#112734] hover:bg-[#23626F] text-white rounded-xl font-bold font-tiro shadow-md flex items-center gap-2"
            >
              <Save size={16} />
              <span>সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

