'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { AppStore, DEFAULT_COURSE_CATEGORIES, isDummyFatwa, DUMMY_ITEM_IDS, getDeletedFatwaIds } from '@/lib/store';
import { Course, Book, FatwaQuestion, Order, Certificate, LiveClass, SiteReview, Lesson, QuizQuestion, UserProfile, FacultyMember, SiteSettings, CourseCategory } from '@/lib/types';
import { LoginModal } from '@/components/LoginModal';
import { 
  ShieldCheck, 
  CheckCircle, 
  CheckCircle2, 
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
  Printer,
  Copy,
  Check,
  RefreshCw,
  Library,
  Truck,
  MapPin,
  BarChart3
} from 'lucide-react';
import { CertificateView } from '@/components/CertificateView';
import { sendTestNotificationEmail } from '@/lib/email-service';
import { formatImageUrl, handleImageError } from '@/lib/utils';
import { db, doc, deleteDoc, collection, onSnapshot, handleFirestoreError, OperationType } from '@/lib/firebase';

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
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null);

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
  const [selectedOrderForAction, setSelectedOrderForAction] = useState<Order | null>(null);
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);

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
  const [settingsSubTab, setSettingsSubTab] = useState<'general' | 'hero' | 'courses_page' | 'books_page' | 'fatwa_page' | 'categories' | 'notice' | 'about' | 'terms' | 'faq' | 'contact' | 'marketing' | 'email_notify'>('general');
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

  // Sync real-time data from Cloud Firestore
  useEffect(() => {
    if (!isAdmin) return;

    // Listen to Firestore Orders
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const firestoreOrders: Order[] = [];
      snapshot.forEach((doc) => {
        firestoreOrders.push({ id: doc.id, ...doc.data() } as Order);
      });
      firestoreOrders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setOrders(firestoreOrders);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    // Listen to Firestore Fatwas
    const unsubFatwas = onSnapshot(collection(db, 'fatwas'), (snapshot) => {
      const deletedIds = new Set(getDeletedFatwaIds());
      const firestoreFatwas: FatwaQuestion[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as FatwaQuestion;
        const isDummy = DUMMY_ITEM_IDS.has(docSnap.id) || deletedIds.has(docSnap.id) || isDummyFatwa({ id: docSnap.id, ...data });
        if (isDummy) {
          try {
            deleteDoc(doc(db, 'fatwas', docSnap.id)).catch(() => {});
          } catch (e) {}
        } else {
          firestoreFatwas.push({ id: docSnap.id, ...data } as FatwaQuestion);
        }
      });
      setFatwas(firestoreFatwas);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'fatwas');
    });

    // Listen to Firestore Courses
    const unsubCourses = onSnapshot(collection(db, 'courses'), (snapshot) => {
      const firestoreCourses: Course[] = [];
      snapshot.forEach((doc) => {
        firestoreCourses.push({ id: doc.id, ...doc.data() } as Course);
      });
      if (firestoreCourses.length > 0) {
        setCourses(firestoreCourses);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'courses');
    });

    // Listen to Firestore Books
    const unsubBooks = onSnapshot(collection(db, 'books'), (snapshot) => {
      const firestoreBooks: Book[] = [];
      snapshot.forEach((doc) => {
        firestoreBooks.push({ id: doc.id, ...doc.data() } as Book);
      });
      if (firestoreBooks.length > 0) {
        setBooks(firestoreBooks);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'books');
    });

    // Listen to local update events for immediate zero-latency UI updates
    const handleOrderLocalUpdate = () => {
      setOrders(AppStore.getOrders());
    };
    const handleFatwaLocalUpdate = () => {
      setFatwas(AppStore.getFatwas());
    };

    // Auto purge any lingering dummy fatwas on admin load
    AppStore.purgeDummyFatwas().catch(() => {});

    window.addEventListener('noorfiqh_orders_updated', handleOrderLocalUpdate);
    window.addEventListener('noorfiqh_store_updated', handleOrderLocalUpdate);
    window.addEventListener('noorfiqh_fatwas_updated', handleFatwaLocalUpdate);
    window.addEventListener('storage', handleOrderLocalUpdate);
    window.addEventListener('storage', handleFatwaLocalUpdate);

    return () => {
      unsubOrders();
      unsubFatwas();
      unsubCourses();
      unsubBooks();
      window.removeEventListener('noorfiqh_orders_updated', handleOrderLocalUpdate);
      window.removeEventListener('noorfiqh_store_updated', handleOrderLocalUpdate);
      window.removeEventListener('noorfiqh_fatwas_updated', handleFatwaLocalUpdate);
      window.removeEventListener('storage', handleOrderLocalUpdate);
      window.removeEventListener('storage', handleFatwaLocalUpdate);
    };
  }, [isAdmin]);

  // Handle URL params for direct navigation from course page (e.g. ?tab=courses&edit=course-1)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as AdminTab;
      const editCourseId = params.get('edit');
      if (tabParam) {
        setActiveTab(tabParam);
      }
      if (editCourseId) {
        setActiveTab('courses');
        const allCourses = AppStore.getCourses();
        const found = allCourses.find(c => c.id === editCourseId) || AppStore.getCourseById(editCourseId);
        if (found) {
          setIsNewCourse(false);
          setEditingCourse(JSON.parse(JSON.stringify(found)));
        }
      }
    }
  }, []);

  // Firestore Sync All Handler
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const handleSyncAllFirestore = async () => {
    setIsSyncingFirestore(true);
    setSyncStatusMsg('ফায়ারস্টোর ডাটাবেসে সিঙ্ক হচ্ছে...');
    try {
      const res = await AppStore.syncAllToFirestore();
      if (res.success) {
        setSyncStatusMsg(`সফলভাবে ${res.count}টি আইটেম ফায়ারস্টোরে আপলোড হয়েছে!`);
        showNotification(`ফায়ারস্টোরে ${res.count}টি আইটেম সংরক্ষিত হয়েছে`);
      } else {
        setSyncStatusMsg(`সিঙ্কে সমস্যা: ${res.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setSyncStatusMsg(`ব্যর্থ: ${err?.message || err}`);
    } finally {
      setIsSyncingFirestore(false);
      setTimeout(() => setSyncStatusMsg(null), 8000);
    }
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
  const handleApproveOrder = async (orderId: string) => {
    const ord = orders.find(o => o.id === orderId);
    AppStore.updateOrderStatus(orderId, 'approved');
    refreshAllData();
    showNotification(`অর্ডার #${ord?.orderNumber || ''} অনুমোদিত হয়েছে ও ${ord?.userName || 'শিক্ষার্থী'}কে কোর্স এক্সেস প্রদান করা হয়েছে।`);
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

  const handleSaveManualOrder = async (orderData: Partial<Order>) => {
    const newOrd: Order = {
      id: `ord-manual-${Date.now()}`,
      orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: orderData.userId || `user-${Date.now()}`,
      userName: orderData.userName || 'শিক্ষার্থী',
      userEmail: orderData.userEmail || '',
      userPhone: orderData.userPhone || '',
      itemType: orderData.itemType || 'course',
      itemId: orderData.itemId || '',
      itemTitle: orderData.itemTitle || '',
      amount: Number(orderData.amount) || 0,
      paymentMethod: orderData.paymentMethod || 'bkash',
      trxId: orderData.trxId || `MANUAL-${Math.floor(1000 + Math.random() * 9000)}`,
      status: orderData.status || 'approved',
      createdAt: new Date().toISOString(),
      shippingAddress: orderData.shippingAddress || '',
      purchaseType: orderData.purchaseType || 'pdf'
    };

    await AppStore.createOrderAsync(newOrd);
    refreshAllData();
    setShowManualOrderModal(false);
    showNotification(`ম্যানুয়াল ভর্তি সম্পন্ন হয়েছে এবং ${newOrd.userName}কে এক্সেস প্রদান করা হয়েছে!`);
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

  // Fatwa Delete & Purge Handlers
  const [deletingFatwaId, setDeletingFatwaId] = useState<string | null>(null);

  const handleDeleteFatwa = async (fatwa: FatwaQuestion) => {
    const title = fatwa.questionTitle || fatwa.trackingCode;
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${title}" ফতোয়াটি স্থায়ীভাবে মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।`)) {
      return;
    }
    setDeletingFatwaId(fatwa.id);
    try {
      AppStore.deleteFatwa(fatwa.id);
      try {
        await deleteDoc(doc(db, 'fatwas', fatwa.id));
      } catch (err) {
        console.warn('Firestore fatwa delete error:', err);
      }
      setFatwas(prev => prev.filter(f => f.id !== fatwa.id));
      showNotification('ফতোয়াটি সফলভাবে মুছে ফেলা হয়েছে');
    } catch (err) {
      console.error('Error deleting fatwa:', err);
      showNotification('ফতোয়া মুছতে সমস্যা হয়েছে');
    } finally {
      setDeletingFatwaId(null);
    }
  };

  const handlePurgeDummyFatwas = async () => {
    if (!window.confirm('আপনি কি ডাটাবেজ এবং সিস্টেম থেকে সকল ডামি/নমুনা ফতোয়া স্থায়ীভাবে মুছে ফেলতে চান?')) {
      return;
    }
    try {
      const res = await AppStore.purgeDummyFatwas();
      setFatwas(AppStore.getFatwas());
      showNotification(`সকল ডামি ফতোয়া ডাটাবেজ থেকে মুছে ফেলা হয়েছে (${res.count} টি অপসারিত)`);
    } catch (err) {
      console.error('Error purging dummy fatwas:', err);
      showNotification('ডামি ফতোয়া মুছতে সমস্যা হয়েছে');
    }
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
    setCourseToDelete({ id, title });
  };

  const confirmDeleteCourse = (id: string) => {
    AppStore.deleteCourse(id);
    setCourseToDelete(null);
    refreshAllData();
    showNotification('কোর্সটি সফলভাবে মুছে ফেলা হয়েছে');
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

              {/* Firestore Cloud Sync Card */}
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50/50 border border-amber-300/70 p-6 sm:p-7 rounded-3xl space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <h4 className="font-extrabold text-sm sm:text-base text-[#112734] flex items-center gap-2">
                        <span>Google Cloud Firestore ডাটাবেস ইন্টিগ্রেশন</span>
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-black tracking-wide">
                          (default) DATABASE
                        </span>
                      </h4>
                    </div>
                    <p className="text-xs text-[#5a524d] max-w-2xl leading-relaxed">
                      ওয়েবসাইটের সকল নতুন কোর্স, অর্ডার, কিতাব এবং ফতোয়া স্বয়ংক্রিয়ভাবে ক্লাউড ফায়ারস্টোরে সেভ হয়। ফায়ারবেস কনসোলে ডাটা দেখতে উপরের ড্রপডাউনে <strong>(default)</strong> ডাটাবেস সিলেক্ট করুন।
                    </p>
                  </div>

                  <button
                    onClick={handleSyncAllFirestore}
                    disabled={isSyncingFirestore}
                    className="px-5 py-3 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold text-xs rounded-2xl flex items-center gap-2 shadow-md transition-all shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    <Save size={16} className={isSyncingFirestore ? 'animate-spin' : ''} />
                    <span>{isSyncingFirestore ? 'ফায়ারস্টোরে সেভ হচ্ছে...' : '☁️ সকল ডাটা ফায়ারস্টোরে সিঙ্ক করুন'}</span>
                  </button>
                </div>

                {syncStatusMsg && (
                  <div className="p-3 bg-white border border-amber-200 rounded-xl text-xs font-bold text-amber-950 flex items-center gap-2">
                    <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                    <span>{syncStatusMsg}</span>
                  </div>
                )}
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
                          src={formatImageUrl(course.thumbnail)} 
                          alt={course.titleBn} 
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={(e) => handleImageError(e, course.thumbnail)}
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

              {/* COURSE DELETE CONFIRMATION MODAL */}
              {courseToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-red-100 space-y-5 animate-in zoom-in-95">
                    <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner border border-red-200">
                      <Trash2 size={28} />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-black text-slate-900 font-anek">
                        কোর্স মুছে ফেলার নিশ্চিতকরণ
                      </h3>
                      <p className="text-sm text-slate-600 font-tiro leading-relaxed">
                        আপনি কি নিশ্চিত যে <span className="font-bold text-red-600">&quot;{courseToDelete.title}&quot;</span> কোর্সটি সম্পূর্ণ মুছে ফেলতে চান? এটি মুছে ফেললে ডাটাবেজ থেকেও স্থায়ীভাবে মুছে যাবে।
                      </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setCourseToDelete(null)}
                        className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        বাতিল
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDeleteCourse(courseToDelete.id)}
                        className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Trash2 size={16} />
                        <span>হ্যাঁ, মুছে ফেলুন</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ORDERS & ENROLLMENT VERIFICATION */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header & Quick Action Buttons */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#ece8e0] card-natural-shadow">
                <div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="text-[#17A2B8]" size={24} />
                    <h2 className="text-2xl font-black text-[#112734] font-anek">ভর্তি ও অর্ডার অনুমোদন কেন্দ্র</h2>
                  </div>
                  <p className="text-xs text-[#8a817c] mt-1 font-tiro">
                    শিক্ষার্থীদের পেমেন্ট (bKash/Nagad/Rocket/Card/COD) যাচাই করে ১-ক্লিকে কোর্স এক্সেস দিন এবং হোয়াটসঅ্যাপে কনফার্মেশন পাঠান।
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      refreshAllData();
                      showNotification('ফায়ারস্টোর ও লোকাল ডাটাবেস থেকে রিফ্রেশ সম্পন্ন হয়েছে');
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold font-tiro bg-[#fdfcf9] hover:bg-slate-100 text-[#5a524d] border border-[#ece8e0] flex items-center gap-1.5 shadow-sm transition-all"
                    title="রিয়েল-টাইম রিফ্রেশ"
                  >
                    <RefreshCw size={14} className="text-[#17A2B8]" />
                    <span>রিফ্রেশ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowManualOrderModal(true)}
                    className="px-4 py-2 bg-[#112734] hover:bg-[#23626F] text-white rounded-xl text-xs font-bold font-tiro flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus size={15} />
                    <span>+ ম্যানুয়াল ভর্তি / নতুন অর্ডার</span>
                  </button>
                </div>
              </div>

              {/* Order Stats Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-[#ece8e0] card-natural-shadow">
                  <p className="text-[11px] font-bold text-[#8a817c] uppercase">মোট আবেদন</p>
                  <p className="text-2xl font-black text-[#112734] mt-1">{orders.length}</p>
                </div>
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 card-natural-shadow">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-amber-800 uppercase">পেন্ডিং যাচাই</p>
                    {orders.filter(o => o.status === 'pending').length > 0 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-2xl font-black text-amber-900 mt-1">
                    {orders.filter(o => o.status === 'pending').length}
                  </p>
                </div>
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 card-natural-shadow">
                  <p className="text-[11px] font-bold text-emerald-800 uppercase">অনুমোদিত ভর্তি</p>
                  <p className="text-2xl font-black text-emerald-900 mt-1">
                    {orders.filter(o => o.status === 'approved').length}
                  </p>
                </div>
                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/80 card-natural-shadow">
                  <p className="text-[11px] font-bold text-blue-800 uppercase">মোট আদায়কৃত ফি</p>
                  <p className="text-2xl font-black text-blue-900 mt-1">
                    ৳{orders.filter(o => o.status === 'approved').reduce((sum, o) => sum + (o.amount || 0), 0).toLocaleString('bn-BD')}
                  </p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#ece8e0]">
                {/* Status Tabs */}
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => {
                    const count = filter === 'all' 
                      ? orders.length 
                      : orders.filter(o => o.status === filter).length;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setOrderFilter(filter)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold font-tiro transition-all flex items-center gap-1.5 ${
                          orderFilter === filter
                            ? 'bg-[#112734] text-white shadow-sm'
                            : 'bg-[#fdfcf9] text-[#5a524d] hover:bg-slate-100 border border-[#ece8e0]'
                        }`}
                      >
                        <span>
                          {filter === 'all' && 'সকল অর্ডার'}
                          {filter === 'pending' && 'পেন্ডিং'}
                          {filter === 'approved' && 'অনুমোদিত'}
                          {filter === 'rejected' && 'বাতিল'}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          orderFilter === filter
                            ? 'bg-white/20 text-white font-bold'
                            : filter === 'pending' && count > 0 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Box */}
                <div className="relative min-w-[240px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="নাম, ফোন, TrxID বা অর্ডার খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-[#ece8e0] text-xs bg-[#fdfcf9] focus:bg-white focus:border-[#17A2B8] outline-none font-tiro"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Orders Table Container */}
              <div className="bg-white rounded-3xl border border-[#ece8e0] card-natural-shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fdfcf9] border-b border-[#ece8e0] text-[#8a817c] uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-4">অর্ডার নং ও তারিখ</th>
                        <th className="p-4">শিক্ষার্থীর তথ্য</th>
                        <th className="p-4">কোর্স / আইটেম</th>
                        <th className="p-4">পেমেন্ট মেথড ও TrxID</th>
                        <th className="p-4">ফি</th>
                        <th className="p-4">স্ট্যাটাস</th>
                        <th className="p-4 text-right">অ্যাকশন ও এক্সেস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ece8e0]">
                      {orders
                        .filter(o => orderFilter === 'all' || o.status === orderFilter)
                        .filter(o => {
                          if (!searchTerm.trim()) return true;
                          const q = searchTerm.toLowerCase();
                          return (
                            (o.userName || '').toLowerCase().includes(q) ||
                            (o.userPhone || '').toLowerCase().includes(q) ||
                            (o.userEmail || '').toLowerCase().includes(q) ||
                            (o.trxId || '').toLowerCase().includes(q) ||
                            (o.orderNumber || '').toLowerCase().includes(q) ||
                            (o.itemTitle || '').toLowerCase().includes(q)
                          );
                        })
                        .map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-4">
                              <span className="font-mono font-black text-[#112734] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {ord.orderNumber}
                              </span>
                              <p className="text-[11px] text-[#8a817c] mt-1">
                                {new Date(ord.createdAt || Date.now()).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </td>

                            <td className="p-4">
                              <p className="font-bold text-[#112734] text-[13px]">{ord.userName}</p>
                              {ord.userPhone && (
                                <a 
                                  href={`tel:${ord.userPhone}`}
                                  className="text-[11px] text-[#17A2B8] hover:underline font-mono flex items-center gap-1 mt-0.5"
                                  title="সরাসরি কল করুন"
                                >
                                  <Phone size={10} />
                                  <span>{ord.userPhone}</span>
                                </a>
                              )}
                              {ord.userEmail && (
                                <p className="text-[11px] text-[#8a817c] truncate max-w-[180px]">{ord.userEmail}</p>
                              )}
                              {ord.shippingAddress && (
                                <p className="text-[10px] text-amber-800 bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200/60 mt-1 line-clamp-1 max-w-[200px]" title={ord.shippingAddress}>
                                  ঠিকানা: {ord.shippingAddress}
                                </p>
                              )}
                            </td>

                            <td className="p-4">
                              <p className="font-bold text-[#2c3e50] max-w-[220px] line-clamp-2">{ord.itemTitle}</p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  ord.itemType === 'course' 
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                                    : (ord.purchaseType === 'pdf' ? 'bg-[#17A2B8]/10 text-[#112734] border border-[#17A2B8]/30' : 'bg-amber-50 text-amber-800 border border-amber-200')
                                }`}>
                                  {ord.itemType === 'course' ? '🎓 পূর্ণাঙ্গ কোর্স' : (ord.purchaseType === 'pdf' ? '📘 ই-বুক (PDF)' : '📦 হার্ডকভার বই')}
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
                                          className="text-[9px] font-bold text-[#17A2B8] bg-[#17A2B8]/10 px-1.5 py-0.5 rounded hover:underline flex items-center gap-0.5"
                                          title="পিডিএফ লিংক চেক করুন"
                                        >
                                          <span>PDF</span>
                                          <ExternalLink size={9} />
                                        </a>
                                      );
                                    }
                                    return null;
                                  })()
                                )}
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <span className="uppercase font-extrabold text-[#112734] text-[11px] px-1.5 py-0.5 bg-slate-100 rounded">
                                  {ord.paymentMethod}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-1">
                                <span className="font-mono font-bold text-slate-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                                  {ord.trxId || 'N/A'}
                                </span>
                                {ord.trxId && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (ord.trxId) {
                                        navigator.clipboard.writeText(ord.trxId);
                                        showNotification(`TrxID ${ord.trxId} কপি করা হয়েছে`);
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-[#17A2B8] rounded"
                                    title="TrxID কপি করুন"
                                  >
                                    <Copy size={11} />
                                  </button>
                                )}
                              </div>
                            </td>

                            <td className="p-4 font-black text-[#112734] text-sm">৳{ord.amount}</td>

                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                                ord.status === 'approved' 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                  : ord.status === 'rejected'
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                              }`}>
                                {ord.status === 'approved' && <><Check size={11} /> <span>অনুমোদিত</span></>}
                                {ord.status === 'rejected' && <><X size={11} /> <span>বাতিলকৃত</span></>}
                                {ord.status === 'pending' && <><Clock size={11} /> <span>পেন্ডিং</span></>}
                              </span>
                            </td>

                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Details & Action Button */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderForAction(ord)}
                                  className="px-2.5 py-1.5 bg-[#fdfcf9] hover:bg-slate-100 text-[#112734] border border-[#ece8e0] rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-sm"
                                  title="সম্পূর্ণ বিবরণ ও হোয়াটসঅ্যাপ মেসেজ"
                                >
                                  <Eye size={12} className="text-[#17A2B8]" />
                                  <span>বিবরণ</span>
                                </button>

                                {ord.status === 'pending' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleApproveOrder(ord.id)}
                                      className="px-3 py-1.5 bg-[#17A2B8] hover:bg-[#23626F] text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
                                      title="১-ক্লিকে অনুমোদন ও কোর্স এক্সেস দিন"
                                    >
                                      <CheckCircle size={12} />
                                      <span>অনুমোদন</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRejectOrder(ord.id)}
                                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-[11px]"
                                      title="অর্ডার বাতিল করুন"
                                    >
                                      <XCircle size={14} />
                                    </button>
                                  </>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrder(ord.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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

                  {/* Empty State */}
                  {orders.length === 0 && (
                    <div className="p-12 text-center text-[#8a817c] space-y-3">
                      <ShoppingBag size={40} className="mx-auto text-slate-300" />
                      <p className="font-bold text-sm text-[#112734]">এখনও কোনো কোর্স বা বইয়ের অর্ডার নেই</p>
                      <p className="text-xs max-w-sm mx-auto">
                        শিক্ষার্থীরা ওয়েবসাইট থেকে কোর্সে ভর্তি হলে বা বই অর্ডার করলে এখানে স্বয়ংক্রিয়ভাবে তালিকা দেখা যাবে।
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowManualOrderModal(true)}
                        className="mt-2 px-4 py-2 bg-[#112734] text-white rounded-xl text-xs font-bold"
                      >
                        + প্রথম ম্যানুয়াল অর্ডার তৈরি করুন
                      </button>
                    </div>
                  )}

                  {orders.length > 0 && orders.filter(o => orderFilter === 'all' || o.status === orderFilter).length === 0 && (
                    <div className="p-8 text-center text-[#8a817c]">
                      <p className="text-xs font-tiro">এই ফিল্টারে কোনো অর্ডার পাওয়া যায়নি।</p>
                    </div>
                  )}
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

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePurgeDummyFatwas}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-all shadow-sm"
                    title="ডাটাবেজ থেকে সকল ডামি/নমুনা ফতোয়া মুছে ফেলুন"
                  >
                    <Trash2 size={13} />
                    <span>ডামি ফতোয়া মুছে ফেলুন</span>
                  </button>
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
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            fatwa.status === 'answered' ? 'bg-[#17A2B8]/15 text-[#112734]' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {fatwa.status === 'answered' ? 'উত্তর সম্পন্ন ✓' : 'অপেক্ষমান'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteFatwa(fatwa)}
                            disabled={deletingFatwaId === fatwa.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="ফতোয়াটি স্থায়ীভাবে মুছে ফেলুন"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
                            <div className="flex items-center gap-2">
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
                              <button
                                onClick={() => handleDeleteFatwa(fatwa)}
                                disabled={deletingFatwaId === fatwa.id}
                                className="text-rose-600 hover:text-rose-700 font-bold hover:underline flex items-center gap-1 border-l border-slate-300 pl-2"
                              >
                                <Trash2 size={12} /> মুছে ফেলুন
                              </button>
                            </div>
                          </div>
                          <p className="text-[#2c3e50] leading-relaxed font-medium">{fatwa.answer || fatwa.answerText}</p>
                          {fatwa.references && (
                            <p className="text-[11px] text-[#8a817c] italic border-t border-[#17A2B8]/30 pt-1">
                              দলীল/রেফারেন্স: {Array.isArray(fatwa.references) ? fatwa.references.join(', ') : fatwa.references}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
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
                          <button
                            onClick={() => handleDeleteFatwa(fatwa)}
                            disabled={deletingFatwaId === fatwa.id}
                            className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-200"
                            title="ফতোয়াটি মুছে ফেলুন"
                          >
                            <Trash2 size={13} />
                            <span>{deletingFatwaId === fatwa.id ? 'মুছছে...' : 'মুছে ফেলুন'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                {fatwas.length === 0 && (
                  <div className="bg-white p-12 rounded-3xl border border-[#ece8e0] text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#112734] flex items-center justify-center mx-auto">
                      <HelpCircle size={24} />
                    </div>
                    <h4 className="font-extrabold text-sm text-[#112734]">কোনো ফতোয়া প্রশ্ন নেই</h4>
                    <p className="text-xs text-[#8a817c]">শিক্ষার্থীরা ওয়েবসাইট থেকে ফতোয়া প্রশ্ন পাঠালে তা এখানে সরাসরি রিয়েলটাইমে জমা হবে।</p>
                  </div>
                )}
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
                        <img 
                          src={formatImageUrl(book.coverImage)} 
                          alt={book.titleBn} 
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={(e) => handleImageError(e, book.coverImage)}
                          className="w-full h-full object-cover" 
                        />
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
                      name: '',
                      role: '',
                      location: '',
                      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                      rating: 5,
                      content: '',
                      courseTitle: ''
                    });
                  }}
                  className="px-4 py-2.5 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
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
                        <img 
                          src={formatImageUrl(rev.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80')} 
                          alt={rev.name} 
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={(e) => handleImageError(e, rev.avatar)}
                          className="w-10 h-10 rounded-full object-cover border" 
                        />
                        <div>
                          <h4 className="font-extrabold text-sm text-[#2c3e50]">{rev.name}</h4>
                          <p className="text-[10px] text-[#8a817c] flex items-center gap-1 flex-wrap">
                            {rev.role && <span>{rev.role}</span>}
                            {rev.role && rev.location && <span className="text-slate-300">•</span>}
                            {rev.location && (
                              <span className="inline-flex items-center gap-0.5 text-[#0f8293] font-semibold">
                                <MapPin size={10} />
                                {rev.location}
                              </span>
                            )}
                            {!rev.role && !rev.location && <span>কোর্স শিক্ষার্থী</span>}
                          </p>
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
                        className="flex-1 py-1.5 bg-[#17A2B8]/10 text-[#112734] rounded-xl text-xs font-bold hover:bg-[#17A2B8]/20 transition-colors cursor-pointer"
                      >
                        এডিট
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer"
                        title="রিভিউ ডিলিট করুন"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Review Modal */}
              {editingReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="bg-white w-full max-w-lg p-6 sm:p-7 rounded-3xl shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h4 className="font-extrabold text-base text-[#112734]">
                          {isNewReview ? 'নতুন শিক্ষার্থী রিভিউ যোগ করুন' : 'শিক্ষার্থী রিভিউ এডিট করুন'}
                        </h4>
                        <p className="text-[11px] text-[#8a817c]">শিক্ষার্থীর নাম, পদবী, জেলা ও প্রশংসাপত্র সংরক্ষণ করুন</p>
                      </div>
                      <button 
                        onClick={() => setEditingReview(null)} 
                        className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveReview} className="space-y-3.5 text-xs">
                      <div>
                        <label className="block font-bold mb-1 text-[#2c3e50]">শিক্ষার্থীর নাম *</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: ফয়সাল আহমদ / মোসাঃ শিরিন সুলতানা"
                          value={editingReview.name}
                          onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value, nameBn: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#ece8e0] focus:ring-2 focus:ring-[#17A2B8] outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold mb-1 text-[#2c3e50]">পদবী / পরিচয় (ঐচ্ছিক)</label>
                          <input
                            type="text"
                            placeholder="যেমন: শিক্ষার্থী, শিক্ষক, ব্যবসায়ী"
                            value={editingReview.role || ''}
                            onChange={(e) => setEditingReview({ ...editingReview, role: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-[#ece8e0] focus:ring-2 focus:ring-[#17A2B8] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold mb-1 text-[#112734] flex items-center justify-between">
                            <span className="flex items-center gap-1 font-extrabold text-[#0f8293]">
                              <MapPin size={12} />
                              <span>জেলা / অবস্থান *</span>
                            </span>
                            <span className="text-[10px] text-[#8a817c]">বাংলা বা ইংরেজি</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="যেমন: ঢাকা, চট্টগ্রাম, সিলেট, কুমিল্লা ইত্যাদি"
                            value={editingReview.location || ''}
                            onChange={(e) => setEditingReview({ ...editingReview, location: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border-2 border-[#17A2B8]/40 focus:border-[#17A2B8] focus:ring-2 focus:ring-[#17A2B8]/20 outline-none font-bold text-[#112734] bg-sky-50/20"
                          />
                        </div>
                      </div>

                      {/* Quick District selection chips */}
                      <div className="space-y-1.5 p-2.5 rounded-xl bg-[#faf8f5] border border-[#ece8e0]/70">
                        <span className="text-[10px] text-[#8a817c] font-semibold block">জনপ্রিয় জেলা নির্বাচন করুন (ক্লিক করলেই বসে যাবে):</span>
                        <div className="flex flex-wrap gap-1.5">
                          {['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ', 'কুমিল্লা', 'বগুড়া', 'নোয়াখালী', 'কুষ্টিয়া', 'প্রবাসী'].map((dist) => (
                            <button
                              key={dist}
                              type="button"
                              onClick={() => setEditingReview({ ...editingReview, location: dist })}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors cursor-pointer ${
                                editingReview.location === dist 
                                  ? 'bg-[#112734] text-white border-[#112734] shadow-xs' 
                                  : 'bg-white text-[#5a524d] border-[#ece8e0] hover:bg-emerald-50 hover:text-emerald-800'
                              }`}
                            >
                              {dist}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold mb-1 text-[#2c3e50]">রেটিং (১-৫)</label>
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={editingReview.rating}
                            onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                            className="w-full px-3 py-2.5 rounded-xl border border-[#ece8e0] focus:ring-2 focus:ring-[#17A2B8] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold mb-1 text-[#2c3e50]">কোর্স বা বিষয় (ঐচ্ছিক)</label>
                          <input
                            type="text"
                            placeholder="যেমন: সমকালীন আধুনিক ফিকহ"
                            value={editingReview.courseTitle || ''}
                            onChange={(e) => setEditingReview({ ...editingReview, courseTitle: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-[#ece8e0] focus:ring-2 focus:ring-[#17A2B8] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold mb-1 text-[#2c3e50]">প্রোফাইল ছবি / Avatar URL (ঐচ্ছিক)</label>
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/... অথবা খালি রাখুন"
                          value={editingReview.avatar || ''}
                          onChange={(e) => setEditingReview({ ...editingReview, avatar: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] focus:ring-2 focus:ring-[#17A2B8] outline-none text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1 text-[#2c3e50]">মতামত / বিবরণ *</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="শিক্ষার্থীর মূল্যবান মতামত বা কোর্স অভিজ্ঞতা লিখুন..."
                          value={editingReview.content}
                          onChange={(e) => setEditingReview({ ...editingReview, content: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#ece8e0] focus:ring-2 focus:ring-[#17A2B8] outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-[#ece8e0]">
                        <button 
                          type="button" 
                          onClick={() => setEditingReview(null)} 
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                        >
                          বাতিল
                        </button>
                        <button 
                          type="submit" 
                          className="px-6 py-2 bg-[#112734] hover:bg-[#23626F] text-white rounded-xl font-bold transition-colors shadow-md cursor-pointer"
                        >
                          সংরক্ষণ করুন
                        </button>
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
                      <span className="whitespace-nowrap">২. হোমপেজ হিরো ও ব্যানার</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('courses_page')}
                      className={`flex-shrink-0 lg:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all ${
                        settingsSubTab === 'courses_page'
                          ? 'bg-[#112734] text-white shadow-md'
                          : 'text-[#2c3e50] hover:bg-slate-50 border border-transparent hover:border-[#ece8e0]'
                      }`}
                    >
                      <BookOpen size={16} className={settingsSubTab === 'courses_page' ? 'text-amber-400' : 'text-indigo-600'} />
                      <span className="whitespace-nowrap">৩. কোর্সসমূহ পেজ ব্যানার ও টেক্সট</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('books_page')}
                      className={`flex-shrink-0 lg:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all ${
                        settingsSubTab === 'books_page'
                          ? 'bg-[#112734] text-white shadow-md'
                          : 'text-[#2c3e50] hover:bg-slate-50 border border-transparent hover:border-[#ece8e0]'
                      }`}
                    >
                      <Library size={16} className={settingsSubTab === 'books_page' ? 'text-amber-400' : 'text-amber-600'} />
                      <span className="whitespace-nowrap">৪. কিতাব ও প্রকাশনা পেজ সেটিংস</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('fatwa_page')}
                      className={`flex-shrink-0 lg:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all ${
                        settingsSubTab === 'fatwa_page'
                          ? 'bg-[#112734] text-white shadow-md'
                          : 'text-[#2c3e50] hover:bg-slate-50 border border-transparent hover:border-[#ece8e0]'
                      }`}
                    >
                      <HelpCircle size={16} className={settingsSubTab === 'fatwa_page' ? 'text-amber-400' : 'text-teal-600'} />
                      <span className="whitespace-nowrap">৫. ফতোয়া পেজ সেটিংস</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('categories')}
                      className={`flex-shrink-0 lg:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all ${
                        settingsSubTab === 'categories'
                          ? 'bg-[#112734] text-white shadow-md'
                          : 'text-[#2c3e50] hover:bg-slate-50 border border-transparent hover:border-[#ece8e0]'
                      }`}
                    >
                      <Layers size={16} className={settingsSubTab === 'categories' ? 'text-amber-400' : 'text-emerald-600'} />
                      <span className="whitespace-nowrap">৬. কোর্স ক্যাটাগরি ব্যবস্থাপনা</span>
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
                      <span className="whitespace-nowrap">৭. About পেজ কন্টেন্ট</span>
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
                      <span className="whitespace-nowrap">৮. টপ নোটিশ বার</span>
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
                      <span className="whitespace-nowrap">৯. গোপনীয়তা ও শর্তাবলী</span>
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
                      <span className="whitespace-nowrap">১০. সাধারণ প্রশ্নোত্তর (FAQ)</span>
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
                      <span className="whitespace-nowrap">১১. যোগাযোগ ও সোশ্যাল</span>
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
                      <span className="whitespace-nowrap">১২. পিক্সেল ও সনদ ক্যাটালগ</span>
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
                      <span className="whitespace-nowrap">১৩. অর্ডার ইমেইল নোটিফিকেশন</span>
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
                                src={formatImageUrl(siteSettings.logoImageUrl)}
                                alt="Logo Preview"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                onError={(e) => handleImageError(e, siteSettings.logoImageUrl)}
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
                                src={formatImageUrl(siteSettings.heroCard.iconImage)}
                                alt="Icon"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                onError={(e) => handleImageError(e, siteSettings.heroCard?.iconImage)}
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

                {/* 4. HERO STATS & LIVE METRICS CARD SETTINGS */}
                <div className="space-y-4 pt-6 border-t border-[#ece8e0]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                    <div>
                      <h3 className="font-extrabold text-base text-[#112734] flex items-center gap-2">
                        <BarChart3 size={18} className="text-[#17A2B8]" />
                        <span>হিরো সেকশন পরিসংখ্যান কার্ড (Stats & Metrics Cards)</span>
                      </h3>
                      <p className="text-xs text-[#8a817c] mt-0.5">
                        শিক্ষার্থী লগইন, প্রদত্ত ফতোয়া এবং রেফারেন্স প্রদানের সাথে সরাসরি কানেক্টেড কার্ডের কনফিগারেশন
                      </p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-[#ece8e0] text-xs font-bold text-[#112734]">
                      <input
                        type="checkbox"
                        checked={siteSettings.statsEnforceLiveOnly ?? false}
                        onChange={(e) => setSiteSettings({ ...siteSettings, statsEnforceLiveOnly: e.target.checked })}
                        className="rounded text-[#112734]"
                      />
                      <span>শুধুমাত্র লাইভ ডাটা দেখান (বেস কাউন্ট বাদ দিন)</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-[#2c3e50] mb-1">
                        শিক্ষার্থী বেস কাউন্ট (Base Student Count)
                      </label>
                      <input
                        type="number"
                        value={siteSettings.statsBaseStudents ?? 3600}
                        onChange={(e) => setSiteSettings({ ...siteSettings, statsBaseStudents: Number(e.target.value) })}
                        disabled={siteSettings.statsEnforceLiveOnly}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] disabled:bg-slate-100"
                      />
                      <p className="text-[11px] text-[#8a817c] mt-1">
                        প্রতিটি শিক্ষার্থী একাউন্ট ও লগইনের সাথে এই সংখ্যাটি স্বয়ংক্রিয়ভাবে বৃদ্ধি পায়। (ডিফল্ট: ৩৬০০)
                      </p>
                    </div>

                    <div>
                      <label className="block font-bold text-[#2c3e50] mb-1">
                        প্রদত্ত ফতোয়া বেস কাউন্ট (Base Fatwas Count)
                      </label>
                      <input
                        type="number"
                        value={siteSettings.statsBaseFatwas ?? 1200}
                        onChange={(e) => setSiteSettings({ ...siteSettings, statsBaseFatwas: Number(e.target.value) })}
                        disabled={siteSettings.statsEnforceLiveOnly}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] disabled:bg-slate-100"
                      />
                      <p className="text-[11px] text-[#8a817c] mt-1">
                        দারুল ইফতায় প্রতিটি ফতোয়ার উত্তর দেওয়ার সাথে সাথে এই সংখ্যাটি লাইভ ডেটাবেজ থেকে যুক্ত হয়। (ডিফল্ট: ১২০০)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2.5 COURSES PAGE CUSTOMIZATION */}
            {settingsSubTab === 'courses_page' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-[#112734] flex items-center gap-2">
                      <BookOpen size={20} className="text-indigo-600" />
                      <span>কোর্সসমূহ পেজ কাস্টমাইজেশন (Courses Page Settings)</span>
                    </h3>
                    <p className="text-xs text-[#8a817c] mt-0.5">
                      ওয়েবসাইটের <strong>&apos;/courses&apos;</strong> পেজের শীর্ষ হিরো সেকশন, ব্যানার ছবি, শিরোনাম, উপশিরোনাম ও হাইলাইটস এখান থেকে পরিবর্তন করুন।
                    </p>
                  </div>

                  <a
                    href="/courses"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all shrink-0 border border-indigo-200"
                  >
                    <span>কোর্স পেজ ভিজিট করুন</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Controls (7 Cols) */}
                  <div className="lg:col-span-7 space-y-5 text-xs">
                    
                    {/* 1. Hero Image Management Box */}
                    <div className="bg-[#fdfcf9] p-4 sm:p-5 rounded-2xl border border-[#ece8e0] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#112734] text-xs flex items-center gap-1.5">
                          <ImageIcon size={15} className="text-indigo-600" />
                          <span>হিরো ইমেজ ও ব্যানার ছবি</span>
                        </span>
                        
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={siteSettings.coursesPage?.showHeroImage !== false}
                            onChange={(e) => {
                              const curr = siteSettings.coursesPage || {
                                badgeText: 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ',
                                titleBn: 'নূর ফিকহ একাডেমি কোর্সসমূহ',
                                subtitleBn: 'দৈনন্দিন ইবাদত থেকে শুরু করে সমকালীন আধুনিক আর্থিক ও পারিবারিক সমস্যার দলীলভিত্তিক সহজ সমাধান।',
                                heroImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
                                showHeroImage: true,
                                heroImagePosition: 'right'
                              };
                              setSiteSettings({
                                ...siteSettings,
                                coursesPage: { ...curr, showHeroImage: e.target.checked }
                              });
                            }}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                          />
                          <span className="font-bold text-[#112734] text-[11px]">ছবি প্রদর্শন চালু</span>
                        </label>
                      </div>

                      {/* Image Upload & Link */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* File Upload Button */}
                          <div>
                            <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">ডিভাইস থেকে আপলোড করুন</label>
                            <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl cursor-pointer transition-all">
                              <Upload size={14} className="text-indigo-600" />
                              <span className="font-bold text-indigo-700 text-xs">ইমেজ ফাইল নির্বাচন</span>
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
                                        const curr = siteSettings.coursesPage || {
                                          badgeText: 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ',
                                          titleBn: 'নূর ফিকহ একাডেমি কোর্সসমূহ',
                                          subtitleBn: 'দৈনন্দিন ইবাদত থেকে শুরু করে সমকালীন আধুনিক আর্থিক ও পারিবারিক সমস্যার দলীলভিত্তিক সহজ সমাধান।',
                                          heroImage: '',
                                          showHeroImage: true,
                                          heroImagePosition: 'right'
                                        };
                                        setSiteSettings({
                                          ...siteSettings,
                                          coursesPage: { ...curr, heroImage: result, showHeroImage: true }
                                        });
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>

                          {/* Direct Image URL */}
                          <div>
                            <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">অথবা ছবির অনলাইন লিংক (URL)</label>
                            <input
                              type="text"
                              placeholder="https://... ইমেজ URL"
                              value={siteSettings.coursesPage?.heroImage || ''}
                              onChange={(e) => {
                                const curr = siteSettings.coursesPage || {
                                  badgeText: 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ',
                                  titleBn: 'নূর ফিকহ একাডেমি কোর্সসমূহ',
                                  subtitleBn: 'দৈনন্দিন ইবাদত থেকে শুরু করে সমকালীন আধুনিক আর্থিক ও পারিবারিক সমস্যার দলীলভিত্তিক সহজ সমাধান।',
                                  heroImage: '',
                                  showHeroImage: true,
                                  heroImagePosition: 'right'
                                };
                                setSiteSettings({
                                  ...siteSettings,
                                  coursesPage: { ...curr, heroImage: e.target.value }
                                });
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] font-mono text-xs bg-white focus:outline-none focus:border-indigo-600"
                            />
                          </div>
                        </div>

                        {/* Preset Quick Images */}
                        <div className="pt-2 border-t border-[#ece8e0]/70 space-y-1.5">
                          <span className="text-[11px] font-bold text-[#5a524d] block">
                            পছন্দসই ইসলামিক ও একাডেমিক ছবি নির্বাচন করুন (এক-ক্লিক প্রিসেট):
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { label: '📚 কিতাব ও লাইব্রেরী', url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80' },
                              { label: '🏛️ ইসলামিক আর্চ', url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80' },
                              { label: '📖 কুরআন ও ফিকহ স্টাডি', url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80' },
                              { label: '🕌 মনোরম একাডেমি ক্যাম্পাস', url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80' }
                            ].map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => {
                                  const curr = siteSettings.coursesPage || {
                                    badgeText: 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ',
                                    titleBn: 'নূর ফিকহ একাডেমি কোর্সসমূহ',
                                    subtitleBn: 'দৈনন্দিন ইবাদত থেকে শুরু করে সমকালীন আধুনিক আর্থিক ও পারিবারিক সমস্যার দলীলভিত্তিক সহজ সমাধান।',
                                    heroImage: '',
                                    showHeroImage: true,
                                    heroImagePosition: 'right'
                                  };
                                  setSiteSettings({
                                    ...siteSettings,
                                    coursesPage: { ...curr, heroImage: preset.url, showHeroImage: true }
                                  });
                                }}
                                className={`p-1.5 rounded-xl border text-[10px] font-bold text-center transition-all ${
                                  siteSettings.coursesPage?.heroImage === preset.url
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                                    : 'border-[#ece8e0] bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Image Layout Position */}
                        <div className="pt-2 border-t border-[#ece8e0]/70">
                          <label className="block text-[11px] font-bold text-[#5a524d] mb-1.5">ছবির লেআউট ও পজিশন</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'right', label: 'ডান পাশে ছবি (Right)' },
                              { id: 'left', label: 'বাম পাশে ছবি (Left)' },
                              { id: 'background', label: 'ব্যাকগ্রাউন্ড ব্যানার (Full)' }
                            ].map((pos) => (
                              <button
                                key={pos.id}
                                type="button"
                                onClick={() => {
                                  const curr = siteSettings.coursesPage || {
                                    badgeText: 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ',
                                    titleBn: 'নূর ফিকহ একাডেমি কোর্সসমূহ',
                                    subtitleBn: 'দৈনন্দিন ইবাদত থেকে শুরু করে সমকালীন আধুনিক আর্থিক ও পারিবারিক সমস্যার দলীলভিত্তিক সহজ সমাধান।',
                                    heroImage: '',
                                    showHeroImage: true,
                                    heroImagePosition: 'right'
                                  };
                                  setSiteSettings({
                                    ...siteSettings,
                                    coursesPage: { ...curr, heroImagePosition: pos.id as any }
                                  });
                                }}
                                className={`py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all text-center ${
                                  (siteSettings.coursesPage?.heroImagePosition || 'right') === pos.id
                                    ? 'bg-[#112734] text-white shadow-sm'
                                    : 'bg-white text-slate-700 border border-[#ece8e0] hover:bg-slate-50'
                                }`}
                              >
                                {pos.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Banner Opacity & Dark Overlay Transparency Controls */}
                        <div className="pt-3 border-t border-[#ece8e0]/70 space-y-3 bg-[#f8faf7] p-3 rounded-xl border border-[#ece8e0]">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-[#2c3e50] flex items-center gap-1.5">
                                <Sliders size={13} className="text-indigo-600" />
                                <span>ব্যানার ছবির স্বচ্ছতা/দৃশ্যমানতা (Image Opacity): {siteSettings.coursesPage?.heroImageOpacity ?? 35}%</span>
                              </label>
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                                {siteSettings.coursesPage?.heroImageOpacity ?? 35}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min={5}
                              max={100}
                              step={5}
                              value={siteSettings.coursesPage?.heroImageOpacity ?? 35}
                              onChange={(e) => {
                                const curr = siteSettings.coursesPage || {
                                  badgeText: 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ',
                                  titleBn: 'নূর ফিকহ একাডেমি কোর্সসমূহ',
                                  subtitleBn: '',
                                  heroImage: ''
                                };
                                setSiteSettings({
                                  ...siteSettings,
                                  coursesPage: { ...curr, heroImageOpacity: Number(e.target.value) }
                                });
                              }}
                              className="w-full accent-[#112734] cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-[#8a817c] mt-0.5">
                              <span>সূক্ষ্ম আবছা (৫%)</span>
                              <span>প্রস্তাবিত ব্যালেন্স (৩৫%)</span>
                              <span>সম্পূর্ণ স্পষ্ট (১০০%)</span>
                            </div>
                          </div>

                          {/* Dark Overlay Gradient Slider */}
                          <div className="pt-2 border-t border-dashed border-[#ece8e0]">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-[#2c3e50] flex items-center gap-1.5">
                                <Sparkles size={13} className="text-[#17A2B8]" />
                                <span>ডার্ক কালার ওভারলে তীব্রতা (Dark Gradient Tint): {siteSettings.coursesPage?.heroOverlayOpacity ?? 80}%</span>
                              </label>
                              <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-[#ece8e0]">
                                {siteSettings.coursesPage?.heroOverlayOpacity ?? 80}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min={10}
                              max={100}
                              step={5}
                              value={siteSettings.coursesPage?.heroOverlayOpacity ?? 80}
                              onChange={(e) => {
                                const curr = siteSettings.coursesPage || {
                                  badgeText: 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ',
                                  titleBn: 'নূর ফিকহ একাডেমি কোর্সসমূহ',
                                  subtitleBn: '',
                                  heroImage: ''
                                };
                                setSiteSettings({
                                  ...siteSettings,
                                  coursesPage: { ...curr, heroOverlayOpacity: Number(e.target.value) }
                                });
                              }}
                              className="w-full accent-[#112734] cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-[#8a817c] mt-0.5">
                              <span>হালকা টিন্ট (১০%)</span>
                              <span>স্ট্যান্ডার্ড ডিপ (৮০%)</span>
                              <span>ঘন অন্ধকার (১০০%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Text & Content Settings */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ece8e0] space-y-4 shadow-sm">
                      <span className="font-extrabold text-[#112734] text-xs flex items-center gap-1.5">
                        <FileText size={15} className="text-amber-600" />
                        <span>শিরোনাম, উপশিরোনাম ও ব্যাজ টেক্সট</span>
                      </span>

                      {/* Badge */}
                      <div>
                        <label className="block font-bold text-[#2c3e50] mb-1">শীর্ষ ব্যাজ টেক্সট (Top Badge)</label>
                        <input
                          type="text"
                          placeholder="যেমন: প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ"
                          value={siteSettings.coursesPage?.badgeText || ''}
                          onChange={(e) => {
                            const curr = siteSettings.coursesPage || {
                              badgeText: '',
                              titleBn: 'নূর ফিকহ একাডেমি কোর্সসমূহ',
                              subtitleBn: '',
                              heroImage: ''
                            };
                            setSiteSettings({
                              ...siteSettings,
                              coursesPage: { ...curr, badgeText: e.target.value }
                            });
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-[#112734] font-medium"
                        />
                      </div>

                      {/* Main Title */}
                      <div>
                        <label className="block font-bold text-[#2c3e50] mb-1">মূল শিরোনাম (Page Title)</label>
                        <input
                          type="text"
                          placeholder="যেমন: নূর ফিকহ একাডেমি কোর্সসমূহ"
                          value={siteSettings.coursesPage?.titleBn || ''}
                          onChange={(e) => {
                            const curr = siteSettings.coursesPage || {
                              badgeText: 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ',
                              titleBn: '',
                              subtitleBn: '',
                              heroImage: ''
                            };
                            setSiteSettings({
                              ...siteSettings,
                              coursesPage: { ...curr, titleBn: e.target.value }
                            });
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-[#112734] font-bold text-sm"
                        />
                      </div>

                      {/* Subtitle / Description */}
                      <div>
                        <label className="block font-bold text-[#2c3e50] mb-1">উপশিরোনাম ও বিবরণ (Subtitle / Description)</label>
                        <textarea
                          rows={3}
                          placeholder="যেমন: দৈনন্দিন ইবাদত থেকে শুরু করে সমকালীন আধুনিক আর্থিক ও পারিবারিক সমস্যার দলীলভিত্তিক সহজ সমাধান..."
                          value={siteSettings.coursesPage?.subtitleBn || ''}
                          onChange={(e) => {
                            const curr = siteSettings.coursesPage || {
                              badgeText: 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ',
                              titleBn: 'নূর ফিকহ একাডেমি কোর্সসমূহ',
                              subtitleBn: '',
                              heroImage: ''
                            };
                            setSiteSettings({
                              ...siteSettings,
                              coursesPage: { ...curr, subtitleBn: e.target.value }
                            });
                          }}
                          className="w-full px-3.5 py-2 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-[#112734] font-medium"
                        />
                      </div>

                      {/* Search Placeholder */}
                      <div>
                        <label className="block font-bold text-[#2c3e50] mb-1">সার্চ বক্স প্লেসহোল্ডার (Search Placeholder)</label>
                        <input
                          type="text"
                          placeholder="যেমন: কোর্সের নাম বা বিষয় খুঁজুন..."
                          value={siteSettings.coursesPage?.searchPlaceholder || ''}
                          onChange={(e) => {
                            const curr = siteSettings.coursesPage || {
                              badgeText: 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ',
                              titleBn: 'নূর ফিকহ একাডেমি কোর্সসমূহ',
                              subtitleBn: '',
                              heroImage: ''
                            };
                            setSiteSettings({
                              ...siteSettings,
                              coursesPage: { ...curr, searchPlaceholder: e.target.value }
                            });
                          }}
                          className="w-full px-3.5 py-2 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-[#112734]"
                        />
                      </div>
                    </div>

                    {/* 3. Three Highlight Badges */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ece8e0] space-y-3 shadow-sm">
                      <span className="font-extrabold text-[#112734] text-xs flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        <span>৩টি বৈশিষ্ট্য ও হাইলাইটস (Highlights Pills)</span>
                      </span>

                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">হাইলাইট ১</label>
                          <input
                            type="text"
                            placeholder="যেমন: সহিহ সুন্নাহ ও দলীলভিত্তিক পাঠ্যক্রম"
                            value={siteSettings.coursesPage?.highlight1 || ''}
                            onChange={(e) => {
                              const curr = siteSettings.coursesPage || {
                                badgeText: 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ',
                                titleBn: 'নূর ফিকহ একাডেমি কোর্সসমূহ',
                                subtitleBn: '',
                                heroImage: ''
                              };
                              setSiteSettings({
                                ...siteSettings,
                                coursesPage: { ...curr, highlight1: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">হাইলাইট ২</label>
                          <input
                            type="text"
                            placeholder="যেমন: অভিজ্ঞ মুফতী ও স্কলারদের সরাসরি তত্ত্বাবধান"
                            value={siteSettings.coursesPage?.highlight2 || ''}
                            onChange={(e) => {
                              const curr = siteSettings.coursesPage || {
                                badgeText: 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ',
                                titleBn: 'নূর ফিকহ একাডেমি কোর্সসমূহ',
                                subtitleBn: '',
                                heroImage: ''
                              };
                              setSiteSettings({
                                ...siteSettings,
                                coursesPage: { ...curr, highlight2: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">হাইলাইট ৩</label>
                          <input
                            type="text"
                            placeholder="যেমন: ভেরিফায়েড প্রফেশনাল সনদপত্র"
                            value={siteSettings.coursesPage?.highlight3 || ''}
                            onChange={(e) => {
                              const curr = siteSettings.coursesPage || {
                                badgeText: 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ',
                                titleBn: 'নূর ফিকহ একাডেমি কোর্সসমূহ',
                                subtitleBn: '',
                                heroImage: ''
                              };
                              setSiteSettings({
                                ...siteSettings,
                                coursesPage: { ...curr, highlight3: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] text-xs"
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Live Preview Box (5 Cols) */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="sticky top-24 bg-[#f8faf7] p-4 sm:p-5 rounded-2xl border border-[#ece8e0] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-[#8a817c] uppercase tracking-wider flex items-center gap-1.5">
                          <Eye size={13} className="text-indigo-600" />
                          <span>কোর্স পেজ লাইভ প্রিভিউ</span>
                        </span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                          রিয়েল-টাইম
                        </span>
                      </div>

                      {/* Mini Courses Page Hero Mockup */}
                      <div className="rounded-2xl border border-[#ece8e0] bg-[#fdfcf9] p-3 shadow-inner overflow-hidden">
                        
                        {/* Mock Hero Container */}
                        {siteSettings.coursesPage?.heroImagePosition === 'background' && siteSettings.coursesPage?.showHeroImage !== false && siteSettings.coursesPage?.heroImage ? (
                          <div className="relative rounded-xl overflow-hidden p-4 text-white bg-[#112734] border border-[#23626F] shadow-sm">
                            <img
                              src={formatImageUrl(siteSettings.coursesPage?.heroImage)}
                              alt="Courses Hero Preview"
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                              onError={(e) => handleImageError(e, siteSettings.coursesPage?.heroImage)}
                              style={{ opacity: (siteSettings.coursesPage?.heroImageOpacity ?? 35) / 100 }}
                              className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity"
                            />
                            <div 
                              className="absolute inset-0 bg-gradient-to-t from-[#112734] via-[#112734]/80 to-[#112734]/60 pointer-events-none transition-opacity" 
                              style={{ opacity: (siteSettings.coursesPage?.heroOverlayOpacity ?? 80) / 100 }}
                            />
                            <div className="relative z-10 space-y-2">
                              <span className="inline-block px-2 py-0.5 rounded-full bg-[#17A2B8]/20 text-[#17A2B8] text-[9px] font-bold border border-[#17A2B8]/40">
                                ✨ {siteSettings.coursesPage?.badgeText || 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ'}
                              </span>
                              <h4 className="text-sm font-black leading-tight text-white font-anek">
                                {siteSettings.coursesPage?.titleBn || 'নূর ফিকহ একাডেমি কোর্সসমূহ'}
                              </h4>
                              <p className="text-[10px] text-slate-200 line-clamp-2 leading-relaxed font-tiro">
                                {siteSettings.coursesPage?.subtitleBn || 'দৈনন্দিন ইবাদত থেকে শুরু করে সমকালীন আধুনিক আর্থিক ও পারিবারিক সমস্যার দলীলভিত্তিক সহজ সমাধান।'}
                              </p>
                            </div>
                          </div>
                        ) : siteSettings.coursesPage?.showHeroImage !== false && siteSettings.coursesPage?.heroImage ? (
                          <div className="bg-white rounded-xl p-3.5 border border-[#ece8e0] shadow-sm space-y-2.5">
                            <div className={`flex flex-col sm:flex-row gap-3 items-center ${siteSettings.coursesPage?.heroImagePosition === 'left' ? 'sm:flex-row-reverse' : ''}`}>
                              <div className="flex-1 space-y-1.5">
                                <span className="inline-block px-2 py-0.5 rounded-full bg-[#17A2B8]/10 text-[#112734] text-[9px] font-bold border border-[#17A2B8]/30">
                                  ✨ {siteSettings.coursesPage?.badgeText || 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ'}
                                </span>
                                <h4 className="text-xs font-black text-[#112734] leading-tight font-anek">
                                  {siteSettings.coursesPage?.titleBn || 'নূর ফিকহ একাডেমি কোর্সসমূহ'}
                                </h4>
                                <p className="text-[10px] text-[#5a524d] line-clamp-2 leading-relaxed font-tiro">
                                  {siteSettings.coursesPage?.subtitleBn || 'দৈনন্দিন ইবাদত থেকে শুরু করে সমকালীন আধুনিক আর্থিক ও পারিবারিক সমস্যার দলীলভিত্তিক সহজ সমাধান।'}
                                </p>
                              </div>
                              <div className="w-24 h-16 rounded-lg overflow-hidden border border-[#ece8e0] shrink-0 bg-slate-100">
                                <img
                                  src={formatImageUrl(siteSettings.coursesPage?.heroImage)}
                                  alt="Course Hero Preview"
                                  referrerPolicy="no-referrer"
                                  crossOrigin="anonymous"
                                  onError={(e) => handleImageError(e, siteSettings.coursesPage?.heroImage)}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            
                            {/* Highlights pills */}
                            <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                              {(siteSettings.coursesPage?.highlight1 || 'সহিহ সুন্নাহ ও দলীলভিত্তিক পাঠ্যক্রম') && (
                                <span className="text-[9px] bg-slate-50 text-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200">
                                  ✓ {siteSettings.coursesPage?.highlight1 || 'সহিহ সুন্নাহ ও দলীলভিত্তিক পাঠ্যক্রম'}
                                </span>
                              )}
                              {(siteSettings.coursesPage?.highlight2 || 'অভিজ্ঞ মুফতী ও স্কলারদের সরাসরি তত্ত্বাবধান') && (
                                <span className="text-[9px] bg-slate-50 text-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200">
                                  🎓 {siteSettings.coursesPage?.highlight2 || 'অভিজ্ঞ মুফতী ও স্কলারদের সরাসরি তত্ত্বাবধান'}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl p-4 border border-[#ece8e0] text-center space-y-2 shadow-sm">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-[#17A2B8]/10 text-[#112734] text-[9px] font-bold border border-[#17A2B8]/30">
                              ✨ {siteSettings.coursesPage?.badgeText || 'প্রামাণ্য ফিকহ পাঠ্যক্রম ক্যাটালগ'}
                            </span>
                            <h4 className="text-sm font-black text-[#112734] leading-tight font-anek">
                              {siteSettings.coursesPage?.titleBn || 'নূর ফিকহ একাডেমি কোর্সসমূহ'}
                            </h4>
                            <p className="text-[10px] text-[#5a524d] leading-relaxed font-tiro">
                              {siteSettings.coursesPage?.subtitleBn || 'দৈনন্দিন ইবাদত থেকে শুরু করে সমকালীন আধুনিক আর্থিক ও পারিবারিক সমস্যার দলীলভিত্তিক সহজ সমাধান।'}
                            </p>
                          </div>
                        )}

                        {/* Search Toolbar Preview */}
                        <div className="mt-2.5 p-2 bg-white rounded-lg border border-[#ece8e0] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Search size={11} />
                            <span>{siteSettings.coursesPage?.searchPlaceholder || 'কোর্সের নাম বা বিষয় খুঁজুন...'}</span>
                          </div>
                          <span className="text-[9px] font-bold text-[#112734] bg-slate-100 px-1.5 py-0.5 rounded">
                            মোট: {courses.length}টি কোর্স
                          </span>
                        </div>

                      </div>

                      <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
                        💡 <strong>পরামর্শ:</strong> কাঙ্ক্ষিত পরিবর্তন শেষে নিচে <strong>&quot;সাইট সেটিংস সেভ করুন&quot;</strong> বাটনে ক্লিক করলে তা সরাসরি মূল ওয়েবসাইটে সেভ হয়ে যাবে।
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 4. BOOKS & PUBLICATIONS PAGE CUSTOMIZATION */}
            {settingsSubTab === 'books_page' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-[#112734] flex items-center gap-2">
                      <Library size={20} className="text-amber-600" />
                      <span>কিতাব ও প্রকাশনা পেজ সেটিংস (Books Page Settings)</span>
                    </h3>
                    <p className="text-xs text-[#8a817c] mt-0.5">
                      ওয়েবসাইটের <strong>&apos;/books&apos;</strong> পেজের হিরো ব্যানার ইমেজ, শিরোনাম, উপশিরোনাম, ৩টি হাইলাইট ব্যাজ ও সার্চ বার কাস্টমাইজ করুন।
                    </p>
                  </div>

                  <a
                    href="/books"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition-all shrink-0 border border-amber-200"
                  >
                    <span>কিতাব পেজ ভিজিট করুন</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Controls (7 Cols) */}
                  <div className="lg:col-span-7 space-y-5 text-xs">
                    
                    {/* 1. Hero Image Management Box */}
                    <div className="bg-[#fdfcf9] p-4 sm:p-5 rounded-2xl border border-[#ece8e0] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#112734] text-xs flex items-center gap-1.5">
                          <ImageIcon size={15} className="text-amber-600" />
                          <span>হিরো ইমেজ ও ব্যানার ছবি</span>
                        </span>
                        
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={siteSettings.booksPage?.showHeroImage !== false}
                            onChange={(e) => {
                              const curr = siteSettings.booksPage || {
                                badgeText: 'নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ',
                                titleBn: 'প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার',
                                subtitleBn: 'বিশুদ্ধ আকীদা, নির্ভরযোগ্য ফিকহ, সীরাত, হাদীস এবং সমকালীন গবেষণাধর্মী প্রামাণ্য কিতাবসমূহ সংগ্রহ করুন ঘরে বসেই নির্ভরযোগ্য হোম ডেলিভারির মাধ্যমে।',
                                heroImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
                                showHeroImage: true,
                                heroImagePosition: 'right'
                              };
                              setSiteSettings({
                                ...siteSettings,
                                booksPage: { ...curr, showHeroImage: e.target.checked }
                              });
                            }}
                            className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                          />
                          <span className="font-bold text-[#112734] text-[11px]">ছবি প্রদর্শন চালু</span>
                        </label>
                      </div>

                      {/* Image Upload & Link */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* File Upload Button */}
                          <div>
                            <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">ডিভাইস থেকে আপলোড করুন</label>
                            <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 rounded-xl cursor-pointer transition-all">
                              <Upload size={14} className="text-amber-600" />
                              <span className="font-bold text-amber-800 text-xs">ইমেজ ফাইল নির্বাচন</span>
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
                                        const curr = siteSettings.booksPage || {
                                          badgeText: 'নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ',
                                          titleBn: 'প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার',
                                          subtitleBn: 'বিশুদ্ধ আকীদা, নির্ভরযোগ্য ফিকহ, সীরাত, হাদীস এবং সমকালীন গবেষণাধর্মী প্রামাণ্য কিতাবসমূহ সংগ্রহ করুন ঘরে বসেই নির্ভরযোগ্য হোম ডেলিভারির মাধ্যমে।',
                                          heroImage: '',
                                          showHeroImage: true,
                                          heroImagePosition: 'right'
                                        };
                                        setSiteSettings({
                                          ...siteSettings,
                                          booksPage: { ...curr, heroImage: result, showHeroImage: true }
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
                            <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">অথবা ইমেজ ইউআরএল (URL)</label>
                            <input
                              type="text"
                              placeholder="https://example.com/books-banner.jpg"
                              value={siteSettings.booksPage?.heroImage || ''}
                              onChange={(e) => {
                                const curr = siteSettings.booksPage || {
                                  badgeText: 'নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ',
                                  titleBn: 'প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার',
                                  subtitleBn: 'বিশুদ্ধ আকীদা, নির্ভরযোগ্য ফিকহ, সীরাত, হাদীস এবং সমকালীন গবেষণাধর্মী প্রামাণ্য কিতাবসমূহ সংগ্রহ করুন ঘরে বসেই নির্ভরযোগ্য হোম ডেলিভারির মাধ্যমে।',
                                  heroImage: '',
                                  showHeroImage: true,
                                  heroImagePosition: 'right'
                                };
                                setSiteSettings({
                                  ...siteSettings,
                                  booksPage: { ...curr, heroImage: e.target.value }
                                });
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-amber-600 text-xs font-mono"
                            />
                          </div>
                        </div>

                        {/* Image Preview / Remove Row */}
                        {siteSettings.booksPage?.heroImage && (
                          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#ece8e0]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#ece8e0] bg-slate-100 shrink-0">
                                <img
                                  src={formatImageUrl(siteSettings.booksPage.heroImage)}
                                  alt="Books Hero Banner"
                                  referrerPolicy="no-referrer"
                                  crossOrigin="anonymous"
                                  onError={(e) => handleImageError(e, siteSettings.booksPage?.heroImage)}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="overflow-hidden">
                                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                  <CheckCircle2 size={13} />
                                  <span>ইমেজ সক্রিয় আছে</span>
                                </span>
                                <span className="text-[10px] text-slate-500 block truncate max-w-[200px] sm:max-w-[280px]">
                                  {siteSettings.booksPage.heroImage.startsWith('data:') ? 'আপলোডকৃত লোকাল ফাইল' : siteSettings.booksPage.heroImage}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const curr = siteSettings.booksPage || {
                                  badgeText: 'নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ',
                                  titleBn: 'প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার',
                                  subtitleBn: '',
                                  heroImage: ''
                                };
                                setSiteSettings({
                                  ...siteSettings,
                                  booksPage: { ...curr, heroImage: '' }
                                });
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="ইমেজ মুছুন"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}

                        {/* Quick Presets */}
                        <div className="pt-2 border-t border-[#ece8e0]/70">
                          <label className="block text-[11px] font-bold text-[#5a524d] mb-1.5">রেডিমেড প্রিসেট ইমেজসমূহ (ক্লিক করে নির্বাচন করুন)</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { label: '📚 মাকতাবা ও কিতাব', url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80' },
                              { label: '📖 ইসলামি পাঠ ও গবেষণা', url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=1200&q=80' },
                              { label: '✨ পবিত্র কুরআন ও কিতাব', url: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=1200&q=80' },
                              { label: '🏛️ ক্লাসিক লাইব্রেরি', url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80' }
                            ].map((preset) => (
                              <button
                                key={preset.url}
                                type="button"
                                onClick={() => {
                                  const curr = siteSettings.booksPage || {
                                    badgeText: 'নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ',
                                    titleBn: 'প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার',
                                    subtitleBn: 'বিশুদ্ধ আকীদা, নির্ভরযোগ্য ফিকহ, সীরাত, হাদীস এবং সমকালীন গবেষণাধর্মী প্রামাণ্য কিতাবসমূহ সংগ্রহ করুন ঘরে বসেই নির্ভরযোগ্য হোম ডেলিভারির মাধ্যমে।',
                                    heroImage: preset.url,
                                    showHeroImage: true,
                                    heroImagePosition: 'right'
                                  };
                                  setSiteSettings({
                                    ...siteSettings,
                                    booksPage: { ...curr, heroImage: preset.url, showHeroImage: true }
                                  });
                                }}
                                className={`p-1.5 rounded-xl border text-[10px] font-bold text-center transition-all ${
                                  siteSettings.booksPage?.heroImage === preset.url
                                    ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm'
                                    : 'border-[#ece8e0] bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Image Layout Position */}
                        <div className="pt-2 border-t border-[#ece8e0]/70">
                          <label className="block text-[11px] font-bold text-[#5a524d] mb-1.5">ছবির লেআউট ও পজিশন</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'right', label: 'ডান পাশে ছবি (Right)' },
                              { id: 'left', label: 'বাম পাশে ছবি (Left)' },
                              { id: 'background', label: 'ব্যাকগ্রাউন্ড ব্যানার (Full)' }
                            ].map((pos) => (
                              <button
                                key={pos.id}
                                type="button"
                                onClick={() => {
                                  const curr = siteSettings.booksPage || {
                                    badgeText: 'নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ',
                                    titleBn: 'প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার',
                                    subtitleBn: 'বিশুদ্ধ আকীদা, নির্ভরযোগ্য ফিকহ, সীরাত, হাদীস এবং সমকালীন গবেষণাধর্মী প্রামাণ্য কিতাবসমূহ সংগ্রহ করুন ঘরে বসেই নির্ভরযোগ্য হোম ডেলিভারির মাধ্যমে।',
                                    heroImage: '',
                                    showHeroImage: true,
                                    heroImagePosition: 'right'
                                  };
                                  setSiteSettings({
                                    ...siteSettings,
                                    booksPage: { ...curr, heroImagePosition: pos.id as any }
                                  });
                                }}
                                className={`py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all text-center ${
                                  (siteSettings.booksPage?.heroImagePosition || 'right') === pos.id
                                    ? 'bg-[#112734] text-white shadow-sm'
                                    : 'bg-white text-slate-700 border border-[#ece8e0] hover:bg-slate-50'
                                }`}
                              >
                                {pos.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Banner Opacity & Dark Overlay Transparency Controls */}
                        <div className="pt-3 border-t border-[#ece8e0]/70 space-y-3 bg-[#fdfcf9] p-3 rounded-xl border border-amber-200/60">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-[#2c3e50] flex items-center gap-1.5">
                                <Sliders size={13} className="text-amber-600" />
                                <span>ব্যানার ছবির স্বচ্ছতা/দৃশ্যমানতা (Image Opacity): {siteSettings.booksPage?.heroImageOpacity ?? 35}%</span>
                              </label>
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                {siteSettings.booksPage?.heroImageOpacity ?? 35}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min={5}
                              max={100}
                              step={5}
                              value={siteSettings.booksPage?.heroImageOpacity ?? 35}
                              onChange={(e) => {
                                const curr = siteSettings.booksPage || {
                                  badgeText: 'নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ',
                                  titleBn: 'প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার',
                                  subtitleBn: '',
                                  heroImage: ''
                                };
                                setSiteSettings({
                                  ...siteSettings,
                                  booksPage: { ...curr, heroImageOpacity: Number(e.target.value) }
                                });
                              }}
                              className="w-full accent-[#112734] cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-[#8a817c] mt-0.5">
                              <span>সূক্ষ্ম আবছা (৫%)</span>
                              <span>প্রস্তাবিত ব্যালেন্স (৩৫%)</span>
                              <span>সম্পূর্ণ স্পষ্ট (১০০%)</span>
                            </div>
                          </div>

                          {/* Dark Overlay Gradient Slider */}
                          <div className="pt-2 border-t border-dashed border-[#ece8e0]">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-[#2c3e50] flex items-center gap-1.5">
                                <Sparkles size={13} className="text-amber-600" />
                                <span>ডার্ক কালার ওভারলে তীব্রতা (Dark Gradient Tint): {siteSettings.booksPage?.heroOverlayOpacity ?? 80}%</span>
                              </label>
                              <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-[#ece8e0]">
                                {siteSettings.booksPage?.heroOverlayOpacity ?? 80}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min={10}
                              max={100}
                              step={5}
                              value={siteSettings.booksPage?.heroOverlayOpacity ?? 80}
                              onChange={(e) => {
                                const curr = siteSettings.booksPage || {
                                  badgeText: 'নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ',
                                  titleBn: 'প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার',
                                  subtitleBn: '',
                                  heroImage: ''
                                };
                                setSiteSettings({
                                  ...siteSettings,
                                  booksPage: { ...curr, heroOverlayOpacity: Number(e.target.value) }
                                });
                              }}
                              className="w-full accent-[#112734] cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-[#8a817c] mt-0.5">
                              <span>হালকা টিন্ট (১০%)</span>
                              <span>স্ট্যান্ডার্ড ডিপ (৮০%)</span>
                              <span>ঘন অন্ধকার (১০০%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Text & Content Settings */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ece8e0] space-y-4 shadow-sm">
                      <span className="font-extrabold text-[#112734] text-xs flex items-center gap-1.5">
                        <FileText size={15} className="text-amber-600" />
                        <span>শিরোনাম, উপশিরোনাম ও ব্যাজ টেক্সট</span>
                      </span>

                      {/* Badge */}
                      <div>
                        <label className="block font-bold text-[#2c3e50] mb-1">শীর্ষ ব্যাজ টেক্সট (Top Badge)</label>
                        <input
                          type="text"
                          placeholder="যেমন: নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ"
                          value={siteSettings.booksPage?.badgeText || ''}
                          onChange={(e) => {
                            const curr = siteSettings.booksPage || {
                              badgeText: '',
                              titleBn: 'প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার',
                              subtitleBn: '',
                              heroImage: ''
                            };
                            setSiteSettings({
                              ...siteSettings,
                              booksPage: { ...curr, badgeText: e.target.value }
                            });
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-[#112734] font-medium"
                        />
                      </div>

                      {/* Main Title */}
                      <div>
                        <label className="block font-bold text-[#2c3e50] mb-1">মূল শিরোনাম (Page Title)</label>
                        <input
                          type="text"
                          placeholder="যেমন: প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার"
                          value={siteSettings.booksPage?.titleBn || ''}
                          onChange={(e) => {
                            const curr = siteSettings.booksPage || {
                              badgeText: 'নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ',
                              titleBn: '',
                              subtitleBn: '',
                              heroImage: ''
                            };
                            setSiteSettings({
                              ...siteSettings,
                              booksPage: { ...curr, titleBn: e.target.value }
                            });
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-[#112734] font-bold text-sm"
                        />
                      </div>

                      {/* Subtitle / Description */}
                      <div>
                        <label className="block font-bold text-[#2c3e50] mb-1">উপশিরোনাম ও বিবরণ (Subtitle / Description)</label>
                        <textarea
                          rows={3}
                          placeholder="যেমন: বিশুদ্ধ আকীদা, নির্ভরযোগ্য ফিকহ, সীরাত, হাদীস এবং সমকালীন গবেষণাধর্মী প্রামাণ্য কিতাবসমূহ সংগ্রহ করুন..."
                          value={siteSettings.booksPage?.subtitleBn || ''}
                          onChange={(e) => {
                            const curr = siteSettings.booksPage || {
                              badgeText: 'নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ',
                              titleBn: 'প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার',
                              subtitleBn: '',
                              heroImage: ''
                            };
                            setSiteSettings({
                              ...siteSettings,
                              booksPage: { ...curr, subtitleBn: e.target.value }
                            });
                          }}
                          className="w-full px-3.5 py-2 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-[#112734] font-medium"
                        />
                      </div>
                    </div>

                    {/* 3. Three Highlight Badges */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ece8e0] space-y-3 shadow-sm">
                      <span className="font-extrabold text-[#112734] text-xs flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        <span>৩টি বৈশিষ্ট্য ও হাইলাইটস (Highlights Pills)</span>
                      </span>

                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">হাইলাইট ১</label>
                          <input
                            type="text"
                            placeholder="যেমন: সারাদেশে দ্রুততম হোম ডেলিভারি"
                            value={siteSettings.booksPage?.highlight1 || ''}
                            onChange={(e) => {
                              const curr = siteSettings.booksPage || {
                                badgeText: 'নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ',
                                titleBn: 'প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার',
                                subtitleBn: '',
                                heroImage: ''
                              };
                              setSiteSettings({
                                ...siteSettings,
                                booksPage: { ...curr, highlight1: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">হাইলাইট ২</label>
                          <input
                            type="text"
                            placeholder="যেমন: প্রামাণ্য ও নির্ভরযোগ্য ফিকহী সংকলন"
                            value={siteSettings.booksPage?.highlight2 || ''}
                            onChange={(e) => {
                              const curr = siteSettings.booksPage || {
                                badgeText: 'নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ',
                                titleBn: 'প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার',
                                subtitleBn: '',
                                heroImage: ''
                              };
                              setSiteSettings({
                                ...siteSettings,
                                booksPage: { ...curr, highlight2: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">হাইলাইট ৩</label>
                          <input
                            type="text"
                            placeholder="যেমন: সুলভ হাদিয়া ও ক্যাশ অন ডেলিভারি"
                            value={siteSettings.booksPage?.highlight3 || ''}
                            onChange={(e) => {
                              const curr = siteSettings.booksPage || {
                                badgeText: 'নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ',
                                titleBn: 'প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার',
                                subtitleBn: '',
                                heroImage: ''
                              };
                              setSiteSettings({
                                ...siteSettings,
                                booksPage: { ...curr, highlight3: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 4. Search & Section Headings */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ece8e0] space-y-4 shadow-sm">
                      <span className="font-extrabold text-[#112734] text-xs flex items-center gap-1.5">
                        <Search size={15} className="text-amber-600" />
                        <span>সার্চ বার ও কিতাব তালিকা সেকশন হেডলাইন</span>
                      </span>

                      {/* Search Placeholder */}
                      <div>
                        <label className="block font-bold text-[#2c3e50] mb-1">সার্চ বক্স প্লেসহোল্ডার (Search Placeholder)</label>
                        <input
                          type="text"
                          placeholder="যেমন: কিতাবের নাম, লেখক, অনুবাদক বা বিষয় দিয়ে অনুসন্ধান করুন..."
                          value={siteSettings.booksPage?.searchPlaceholder || ''}
                          onChange={(e) => {
                            const curr = siteSettings.booksPage || {
                              badgeText: 'নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ',
                              titleBn: 'প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার',
                              subtitleBn: '',
                              heroImage: ''
                            };
                            setSiteSettings({
                              ...siteSettings,
                              booksPage: { ...curr, searchPlaceholder: e.target.value }
                            });
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] text-xs bg-[#fdfcf9]"
                        />
                      </div>

                      {/* Books Section Title & Subtitle */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/40 rounded-xl border border-amber-100">
                        <div>
                          <label className="block text-[11px] font-bold text-amber-900 mb-1">কিতাব তালিকার সেকশন শিরোনাম</label>
                          <input
                            type="text"
                            placeholder="যেমন: প্রকাশিত ও সংগৃহীত কিতাবসমূহ"
                            value={siteSettings.booksPage?.featuredSectionTitle || ''}
                            onChange={(e) => {
                              const curr = siteSettings.booksPage || {
                                badgeText: 'নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ',
                                titleBn: 'প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার',
                                subtitleBn: '',
                                heroImage: ''
                              };
                              setSiteSettings({
                                ...siteSettings,
                                booksPage: { ...curr, featuredSectionTitle: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-amber-900 mb-1">কিতাব তালিকার সেকশন বিবরণ/সাবটাইটেল</label>
                          <input
                            type="text"
                            placeholder="যেমন: আপনার পছন্দের কিতাবটি সহজে বেছে নিতে ক্যাটাগরি ও ফিল্টার ব্যবহার করুন"
                            value={siteSettings.booksPage?.featuredSectionSubtitle || ''}
                            onChange={(e) => {
                              const curr = siteSettings.booksPage || {
                                badgeText: 'নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ',
                                titleBn: 'প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার',
                                subtitleBn: '',
                                heroImage: ''
                              };
                              setSiteSettings({
                                ...siteSettings,
                                booksPage: { ...curr, featuredSectionSubtitle: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Live Preview Column (5 Cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="sticky top-24 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#112734] text-xs flex items-center gap-1.5">
                          <Eye size={15} className="text-amber-600" />
                          <span>রিয়েলটাইম লাইভ প্রিভিউ (Live Preview)</span>
                        </span>
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          /books পেজে যেমন দেখাবে
                        </span>
                      </div>

                      {/* Mini Mock of /books Hero */}
                      <div className="rounded-2xl border border-[#ece8e0] shadow-md bg-white overflow-hidden text-slate-800">
                        {/* Browser Top Bar Mock */}
                        <div className="bg-[#112734] px-3 py-2 flex items-center gap-1.5 border-b border-[#112734]">
                          <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                          <span className="text-[10px] font-mono text-slate-300 ml-2 truncate">
                            noorfiqhacademy.com/books
                          </span>
                        </div>

                        {/* Preview Body */}
                        <div className="p-4 bg-gradient-to-b from-[#f8f9fa] to-white relative overflow-hidden space-y-3.5">
                          {/* Background image preview if background mode */}
                          {siteSettings.booksPage?.heroImage && siteSettings.booksPage?.heroImagePosition === 'background' && siteSettings.booksPage?.showHeroImage !== false && (
                            <div 
                              className="absolute inset-0 pointer-events-none transition-opacity"
                              style={{ opacity: (siteSettings.booksPage?.heroImageOpacity ?? 35) / 100 }}
                            >
                              <img
                                src={formatImageUrl(siteSettings.booksPage.heroImage)}
                                alt="bg"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                onError={(e) => handleImageError(e, siteSettings.booksPage?.heroImage)}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          {siteSettings.booksPage?.heroImage && siteSettings.booksPage?.heroImagePosition === 'background' && siteSettings.booksPage?.showHeroImage !== false && (
                            <div 
                              className="absolute inset-0 bg-[#112734] pointer-events-none transition-opacity"
                              style={{ opacity: (siteSettings.booksPage?.heroOverlayOpacity ?? 80) / 100 }}
                            />
                          )}

                          {/* Top Badge */}
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-[9px] font-bold text-amber-900 shadow-sm">
                            <Library size={10} className="text-amber-700 shrink-0" />
                            <span className="truncate">{siteSettings.booksPage?.badgeText || 'নূর ফিকহ একাডেমি মাকতাবা ও প্রকাশনা বিভাগ'}</span>
                          </div>

                          {/* Hero flex / grid */}
                          <div className={`flex flex-col gap-3 relative z-10 ${
                            siteSettings.booksPage?.heroImage && siteSettings.booksPage?.showHeroImage !== false && siteSettings.booksPage?.heroImagePosition === 'left' ? 'sm:flex-row-reverse items-center' :
                            siteSettings.booksPage?.heroImage && siteSettings.booksPage?.showHeroImage !== false && siteSettings.booksPage?.heroImagePosition === 'right' ? 'sm:flex-row items-center' : ''
                          }`}>
                            <div className="flex-1 space-y-2">
                              <h4 className="text-sm font-extrabold text-[#112734] leading-snug">
                                {siteSettings.booksPage?.titleBn || 'প্রামাণ্য ইসলামী কিতাব ও প্রকাশনা সম্ভার'}
                              </h4>
                              <p className="text-[10px] text-[#5a524d] leading-relaxed line-clamp-3">
                                {siteSettings.booksPage?.subtitleBn || 'বিশুদ্ধ আকীদা, নির্ভরযোগ্য ফিকহ, সীরাত, হাদীস এবং সমকালীন গবেষণাধর্মী প্রামাণ্য কিতাবসমূহ সংগ্রহ করুন...'}
                              </p>

                              {/* Highlight Pills */}
                              <div className="space-y-1 pt-1">
                                {[
                                  siteSettings.booksPage?.highlight1 || 'সারাদেশে দ্রুততম হোম ডেলিভারি',
                                  siteSettings.booksPage?.highlight2 || 'প্রামাণ্য ও নির্ভরযোগ্য ফিকহী সংকলন',
                                  siteSettings.booksPage?.highlight3 || 'সুলভ হাদিয়া ও ক্যাশ অন ডেলিভারি'
                                ].map((hl, idx) => (
                                  <div key={idx} className="flex items-center gap-1 text-[9px] text-slate-700">
                                    <CheckCircle2 size={11} className="text-amber-600 shrink-0" />
                                    <span className="truncate font-medium">{hl}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Image side mock */}
                            {siteSettings.booksPage?.heroImage && siteSettings.booksPage?.showHeroImage !== false && siteSettings.booksPage?.heroImagePosition !== 'background' && (
                              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 border-white shadow-md bg-slate-100 shrink-0">
                                <img
                                  src={formatImageUrl(siteSettings.booksPage.heroImage)}
                                  alt="Preview"
                                  referrerPolicy="no-referrer"
                                  crossOrigin="anonymous"
                                  onError={(e) => handleImageError(e, siteSettings.booksPage?.heroImage)}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>

                          {/* Search bar mock */}
                          <div className="mt-2 p-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                            <Search size={12} className="text-amber-600 shrink-0" />
                            <span className="text-[9px] text-slate-400 italic truncate">
                              {siteSettings.booksPage?.searchPlaceholder || 'কিতাবের নাম, লেখক বা বিষয় দিয়ে অনুসন্ধান করুন...'}
                            </span>
                          </div>

                          {/* Section Title mock */}
                          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                            <div>
                              <span className="text-[10px] font-bold text-[#112734] block">
                                {siteSettings.booksPage?.featuredSectionTitle || 'প্রকাশিত ও সংগৃহীত কিতাবসমূহ'}
                              </span>
                              <span className="text-[8px] text-slate-500 block truncate">
                                {siteSettings.booksPage?.featuredSectionSubtitle || 'ক্যাটাগরি ও ফিল্টার ব্যবহার করুন'}
                              </span>
                            </div>
                            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200">
                              ফিল্টার
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-amber-50/70 rounded-b-2xl border-t border-amber-100 text-[11px] text-amber-900 leading-relaxed">
                          💡 <strong>পরামর্শ:</strong> কাঙ্ক্ষিত পরিবর্তন শেষে নিচে <strong>&quot;সাইট সেটিংস সেভ করুন&quot;</strong> বাটনে ক্লিক করলে তা সরাসরি কিতাব পেজে সেভ হয়ে রিয়েলটাইমে দৃশ্যমান হবে।
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* 5. FATWA & MASALA PAGE CUSTOMIZATION */}
            {settingsSubTab === 'fatwa_page' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-[#112734] flex items-center gap-2">
                      <HelpCircle size={20} className="text-teal-600" />
                      <span>ফতোয়া ও মাসআলা পেজ সেটিংস (Fatwa Page Settings)</span>
                    </h3>
                    <p className="text-xs text-[#8a817c] mt-0.5">
                      ওয়েবসাইটের <strong>&apos;/fatwa&apos;</strong> পেজের শীর্ষ হিরো সেকশন, ব্যানার ছবি, শিরোনাম, উপশিরোনাম, ৩টি হাইলাইটস ও সেকশন হেডলাইন পরিবর্তন করুন।
                    </p>
                  </div>

                  <a
                    href="/fatwa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-bold transition-all shrink-0 border border-teal-200"
                  >
                    <span>ফতোয়া পেজ ভিজিট করুন</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Controls (7 Cols) */}
                  <div className="lg:col-span-7 space-y-5 text-xs">
                    
                    {/* 1. Hero Image Management Box */}
                    <div className="bg-[#fdfcf9] p-4 sm:p-5 rounded-2xl border border-[#ece8e0] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#112734] text-xs flex items-center gap-1.5">
                          <ImageIcon size={15} className="text-teal-600" />
                          <span>হিরো ইমেজ ও ব্যানার ছবি</span>
                        </span>
                        
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={siteSettings.fatwaPage?.showHeroImage !== false}
                            onChange={(e) => {
                              const curr = siteSettings.fatwaPage || {
                                badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                                titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                                subtitleBn: 'দৈনন্দিন আমল, সমকালীন আধুনিক চিকিৎসাবিজ্ঞান, লেনদেন ও পারিবারিক যেকোনো জটিল মাসআলার সমাধান নির্ভরযোগ্য ও প্রামাণ্য দলীলসহ জেনে নিন।',
                                heroImage: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80',
                                showHeroImage: true,
                                heroImagePosition: 'right'
                              };
                              setSiteSettings({
                                ...siteSettings,
                                fatwaPage: { ...curr, showHeroImage: e.target.checked }
                              });
                            }}
                            className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                          />
                          <span className="font-bold text-[#112734] text-[11px]">ছবি প্রদর্শন চালু</span>
                        </label>
                      </div>

                      {/* Image Upload & Link */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* File Upload Button */}
                          <div>
                            <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">ডিভাইস থেকে আপলোড করুন</label>
                            <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50 rounded-xl cursor-pointer transition-all">
                              <Upload size={14} className="text-teal-600" />
                              <span className="font-bold text-teal-700 text-xs">ইমেজ ফাইল নির্বাচন</span>
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
                                        const curr = siteSettings.fatwaPage || {
                                          badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                                          titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                                          subtitleBn: 'দৈনন্দিন আমল, সমকালীন আধুনিক চিকিৎসাবিজ্ঞান, লেনদেন ও পারিবারিক যেকোনো জটিল মাসআলার সমাধান নির্ভরযোগ্য ও প্রামাণ্য দলীলসহ জেনে নিন।',
                                          heroImage: '',
                                          showHeroImage: true,
                                          heroImagePosition: 'right'
                                        };
                                        setSiteSettings({
                                          ...siteSettings,
                                          fatwaPage: { ...curr, heroImage: result, showHeroImage: true }
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
                            <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">অথবা ইমেজ ইউআরএল (URL)</label>
                            <input
                              type="text"
                              placeholder="https://example.com/image.jpg"
                              value={siteSettings.fatwaPage?.heroImage || ''}
                              onChange={(e) => {
                                const curr = siteSettings.fatwaPage || {
                                  badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                                  titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                                  subtitleBn: 'দৈনন্দিন আমল, সমকালীন আধুনিক চিকিৎসাবিজ্ঞান, লেনদেন ও পারিবারিক যেকোনো জটিল মাসআলার সমাধান নির্ভরযোগ্য ও প্রামাণ্য দলীলসহ জেনে নিন।',
                                  heroImage: '',
                                  showHeroImage: true,
                                  heroImagePosition: 'right'
                                };
                                setSiteSettings({
                                  ...siteSettings,
                                  fatwaPage: { ...curr, heroImage: e.target.value }
                                });
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-teal-600 text-xs font-mono"
                            />
                          </div>
                        </div>

                        {/* Image Preview / Remove Row */}
                        {siteSettings.fatwaPage?.heroImage && (
                          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#ece8e0]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#ece8e0] bg-slate-100 shrink-0">
                                <img
                                  src={formatImageUrl(siteSettings.fatwaPage.heroImage)}
                                  alt="Fatwa Hero Banner"
                                  referrerPolicy="no-referrer"
                                  crossOrigin="anonymous"
                                  onError={(e) => handleImageError(e, siteSettings.fatwaPage?.heroImage)}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <span className="block font-bold text-slate-800 text-[11px]">বর্তমান ব্যানার ছবি</span>
                                <span className="block text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                                  {siteSettings.fatwaPage.heroImage.startsWith('data:') ? 'আপলোডকৃত ছবি (Base64)' : siteSettings.fatwaPage.heroImage}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const curr = siteSettings.fatwaPage || {
                                  badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                                  titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                                  subtitleBn: '',
                                  heroImage: ''
                                };
                                setSiteSettings({
                                  ...siteSettings,
                                  fatwaPage: { ...curr, heroImage: '' }
                                });
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-bold flex items-center gap-1 text-[11px]"
                            >
                              <Trash2 size={13} />
                              <span>মুছুন</span>
                            </button>
                          </div>
                        )}

                        {/* Presets Grid */}
                        <div className="pt-2">
                          <label className="block text-[11px] font-bold text-[#5a524d] mb-1.5">প্রিসেট ইসলামিক ছবি থেকে বেছে নিন:</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              {
                                label: 'প্রামাণ্য কিতাব ও লাইব্রেরী',
                                url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80'
                              },
                              {
                                label: 'ইসলামিক আর্চ ও মসজিদ',
                                url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80'
                              },
                              {
                                label: 'কুরআন ও রিডিং ডেস্ক',
                                url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1200&q=80'
                              },
                              {
                                label: 'দারুল ইফতা স্টাডি',
                                url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80'
                              }
                            ].map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => {
                                  const curr = siteSettings.fatwaPage || {
                                    badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                                    titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                                    subtitleBn: 'দৈনন্দিন আমল, সমকালীন আধুনিক চিকিৎসাবিজ্ঞান, লেনদেন ও পারিবারিক যেকোনো জটিল মাসআলার সমাধান নির্ভরযোগ্য ও প্রামাণ্য দলীলসহ জেনে নিন।',
                                    heroImage: '',
                                    showHeroImage: true,
                                    heroImagePosition: 'right'
                                  };
                                  setSiteSettings({
                                    ...siteSettings,
                                    fatwaPage: { ...curr, heroImage: preset.url, showHeroImage: true }
                                  });
                                }}
                                className={`p-1.5 rounded-xl border text-[10px] font-bold text-center transition-all ${
                                  siteSettings.fatwaPage?.heroImage === preset.url
                                    ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm'
                                    : 'border-[#ece8e0] bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Image Layout Position */}
                        <div className="pt-2 border-t border-[#ece8e0]/70">
                          <label className="block text-[11px] font-bold text-[#5a524d] mb-1.5">ছবির লেআউট ও পজিশন</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'right', label: 'ডান পাশে ছবি (Right)' },
                              { id: 'left', label: 'বাম পাশে ছবি (Left)' },
                              { id: 'background', label: 'ব্যাকগ্রাউন্ড ব্যানার (Full)' }
                            ].map((pos) => (
                              <button
                                key={pos.id}
                                type="button"
                                onClick={() => {
                                  const curr = siteSettings.fatwaPage || {
                                    badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                                    titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                                    subtitleBn: 'দৈনন্দিন আমল, সমকালীন আধুনিক চিকিৎসাবিজ্ঞান, লেনদেন ও পারিবারিক যেকোনো জটিল মাসআলার সমাধান নির্ভরযোগ্য ও প্রামাণ্য দলীলসহ জেনে নিন।',
                                    heroImage: '',
                                    showHeroImage: true,
                                    heroImagePosition: 'right'
                                  };
                                  setSiteSettings({
                                    ...siteSettings,
                                    fatwaPage: { ...curr, heroImagePosition: pos.id as any }
                                  });
                                }}
                                className={`py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all text-center ${
                                  (siteSettings.fatwaPage?.heroImagePosition || 'right') === pos.id
                                    ? 'bg-[#112734] text-white shadow-sm'
                                    : 'bg-white text-slate-700 border border-[#ece8e0] hover:bg-slate-50'
                                }`}
                              >
                                {pos.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Banner Opacity & Dark Overlay Transparency Controls */}
                        <div className="pt-3 border-t border-[#ece8e0]/70 space-y-3 bg-[#f8faf7] p-3 rounded-xl border border-teal-200/70">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-[#2c3e50] flex items-center gap-1.5">
                                <Sliders size={13} className="text-teal-600" />
                                <span>ব্যানার ছবির স্বচ্ছতা/দৃশ্যমানতা (Image Opacity): {siteSettings.fatwaPage?.heroImageOpacity ?? 35}%</span>
                              </label>
                              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                                {siteSettings.fatwaPage?.heroImageOpacity ?? 35}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min={5}
                              max={100}
                              step={5}
                              value={siteSettings.fatwaPage?.heroImageOpacity ?? 35}
                              onChange={(e) => {
                                const curr = siteSettings.fatwaPage || {
                                  badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                                  titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                                  subtitleBn: '',
                                  heroImage: ''
                                };
                                setSiteSettings({
                                  ...siteSettings,
                                  fatwaPage: { ...curr, heroImageOpacity: Number(e.target.value) }
                                });
                              }}
                              className="w-full accent-[#112734] cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-[#8a817c] mt-0.5">
                              <span>সূক্ষ্ম আবছা (৫%)</span>
                              <span>প্রস্তাবিত ব্যালেন্স (৩৫%)</span>
                              <span>সম্পূর্ণ স্পষ্ট (১০০%)</span>
                            </div>
                          </div>

                          {/* Dark Overlay Gradient Slider */}
                          <div className="pt-2 border-t border-dashed border-[#ece8e0]">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-[#2c3e50] flex items-center gap-1.5">
                                <Sparkles size={13} className="text-teal-600" />
                                <span>ডার্ক কালার ওভারলে তীব্রতা (Dark Gradient Tint): {siteSettings.fatwaPage?.heroOverlayOpacity ?? 80}%</span>
                              </label>
                              <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-[#ece8e0]">
                                {siteSettings.fatwaPage?.heroOverlayOpacity ?? 80}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min={10}
                              max={100}
                              step={5}
                              value={siteSettings.fatwaPage?.heroOverlayOpacity ?? 80}
                              onChange={(e) => {
                                const curr = siteSettings.fatwaPage || {
                                  badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                                  titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                                  subtitleBn: '',
                                  heroImage: ''
                                };
                                setSiteSettings({
                                  ...siteSettings,
                                  fatwaPage: { ...curr, heroOverlayOpacity: Number(e.target.value) }
                                });
                              }}
                              className="w-full accent-[#112734] cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-[#8a817c] mt-0.5">
                              <span>হালকা টিন্ট (১০%)</span>
                              <span>স্ট্যান্ডার্ড ডিপ (৮০%)</span>
                              <span>ঘন অন্ধকার (১০০%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Text & Content Settings */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ece8e0] space-y-4 shadow-sm">
                      <span className="font-extrabold text-[#112734] text-xs flex items-center gap-1.5">
                        <FileText size={15} className="text-teal-600" />
                        <span>শিরোনাম, উপশিরোনাম ও ব্যাজ টেক্সট</span>
                      </span>

                      {/* Badge */}
                      <div>
                        <label className="block font-bold text-[#2c3e50] mb-1">শীর্ষ ব্যাজ টেক্সট (Top Badge)</label>
                        <input
                          type="text"
                          placeholder="যেমন: দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY"
                          value={siteSettings.fatwaPage?.badgeText || ''}
                          onChange={(e) => {
                            const curr = siteSettings.fatwaPage || {
                              badgeText: '',
                              titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                              subtitleBn: '',
                              heroImage: ''
                            };
                            setSiteSettings({
                              ...siteSettings,
                              fatwaPage: { ...curr, badgeText: e.target.value }
                            });
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-[#112734] font-medium"
                        />
                      </div>

                      {/* Main Title */}
                      <div>
                        <label className="block font-bold text-[#2c3e50] mb-1">মূল শিরোনাম (Page Title)</label>
                        <input
                          type="text"
                          placeholder="যেমন: অনলাইন ইফতা ও ফতোয়া সেবা"
                          value={siteSettings.fatwaPage?.titleBn || ''}
                          onChange={(e) => {
                            const curr = siteSettings.fatwaPage || {
                              badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                              titleBn: '',
                              subtitleBn: '',
                              heroImage: ''
                            };
                            setSiteSettings({
                              ...siteSettings,
                              fatwaPage: { ...curr, titleBn: e.target.value }
                            });
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-[#112734] font-bold text-sm"
                        />
                      </div>

                      {/* Subtitle / Description */}
                      <div>
                        <label className="block font-bold text-[#2c3e50] mb-1">উপশিরোনাম ও বিবরণ (Subtitle / Description)</label>
                        <textarea
                          rows={3}
                          placeholder="যেমন: দৈনন্দিন আমল, সমকালীন আধুনিক চিকিৎসাবিজ্ঞান, লেনদেন ও পারিবারিক যেকোনো জটিল মাসআলার সমাধান নির্ভরযোগ্য ও প্রামাণ্য দলীলসহ জেনে নিন..."
                          value={siteSettings.fatwaPage?.subtitleBn || ''}
                          onChange={(e) => {
                            const curr = siteSettings.fatwaPage || {
                              badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                              titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                              subtitleBn: '',
                              heroImage: ''
                            };
                            setSiteSettings({
                              ...siteSettings,
                              fatwaPage: { ...curr, subtitleBn: e.target.value }
                            });
                          }}
                          className="w-full px-3.5 py-2 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-[#112734] font-medium"
                        />
                      </div>
                    </div>

                    {/* 3. Three Highlight Badges */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ece8e0] space-y-3 shadow-sm">
                      <span className="font-extrabold text-[#112734] text-xs flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        <span>৩টি বৈশিষ্ট্য ও হাইলাইটস (Highlights Pills)</span>
                      </span>

                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">হাইলাইট ১</label>
                          <input
                            type="text"
                            placeholder="যেমন: প্রামাণ্য ফিকহী কিতাব ও দলীলভিত্তিক সমাধান"
                            value={siteSettings.fatwaPage?.highlight1 || ''}
                            onChange={(e) => {
                              const curr = siteSettings.fatwaPage || {
                                badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                                titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                                subtitleBn: '',
                                heroImage: ''
                              };
                              setSiteSettings({
                                ...siteSettings,
                                fatwaPage: { ...curr, highlight1: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">হাইলাইট ২</label>
                          <input
                            type="text"
                            placeholder="যেমন: অভিজ্ঞ মুফতী বোর্ডের সরাসরি তত্ত্বাবধান"
                            value={siteSettings.fatwaPage?.highlight2 || ''}
                            onChange={(e) => {
                              const curr = siteSettings.fatwaPage || {
                                badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                                titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                                subtitleBn: '',
                                heroImage: ''
                              };
                              setSiteSettings({
                                ...siteSettings,
                                fatwaPage: { ...curr, highlight2: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">হাইলাইট ৩</label>
                          <input
                            type="text"
                            placeholder="যেমন: ব্যক্তিগত ও গোপনীয় প্রশ্ন ট্র্যাকিং সেবা"
                            value={siteSettings.fatwaPage?.highlight3 || ''}
                            onChange={(e) => {
                              const curr = siteSettings.fatwaPage || {
                                badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                                titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                                subtitleBn: '',
                                heroImage: ''
                              };
                              setSiteSettings({
                                ...siteSettings,
                                fatwaPage: { ...curr, highlight3: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 4. Section Headings (Ask Card, Track Card, Archive) */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ece8e0] space-y-4 shadow-sm">
                      <span className="font-extrabold text-[#112734] text-xs flex items-center gap-1.5">
                        <Send size={15} className="text-teal-600" />
                        <span>সেকশন ও কার্ডের শিরোনামসমূহ (Card & Archive Headings)</span>
                      </span>

                      {/* Ask Card */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-teal-50/40 rounded-xl border border-teal-100">
                        <div>
                          <label className="block text-[11px] font-bold text-teal-900 mb-1">প্রশ্ন পাঠানোর কার্ড শিরোনাম</label>
                          <input
                            type="text"
                            placeholder="যেমন: সরাসরি ফতোয়া বিভাগে প্রশ্ন পাঠান"
                            value={siteSettings.fatwaPage?.askCardTitle || ''}
                            onChange={(e) => {
                              const curr = siteSettings.fatwaPage || {
                                badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                                titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                                subtitleBn: '',
                                heroImage: ''
                              };
                              setSiteSettings({
                                ...siteSettings,
                                fatwaPage: { ...curr, askCardTitle: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-teal-200 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-teal-900 mb-1">প্রশ্ন পাঠানোর কার্ড সাবটাইটেল</label>
                          <input
                            type="text"
                            placeholder="যেমন: মুফতী প্যানেল কর্তৃক ব্যক্তিগতভাবে যাচাই ও সমাধান করা হবে"
                            value={siteSettings.fatwaPage?.askCardSubtitle || ''}
                            onChange={(e) => {
                              const curr = siteSettings.fatwaPage || {
                                badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                                titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                                subtitleBn: '',
                                heroImage: ''
                              };
                              setSiteSettings({
                                ...siteSettings,
                                fatwaPage: { ...curr, askCardSubtitle: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-teal-200 text-xs bg-white"
                          />
                        </div>
                      </div>

                      {/* Track Card */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/40 rounded-xl border border-amber-100">
                        <div>
                          <label className="block text-[11px] font-bold text-amber-900 mb-1">ট্র্যাকিং কার্ড শিরোনাম</label>
                          <input
                            type="text"
                            placeholder="যেমন: প্রশ্নের স্ট্যাটাস দেখুন"
                            value={siteSettings.fatwaPage?.trackCardTitle || ''}
                            onChange={(e) => {
                              const curr = siteSettings.fatwaPage || {
                                badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                                titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                                subtitleBn: '',
                                heroImage: ''
                              };
                              setSiteSettings({
                                ...siteSettings,
                                fatwaPage: { ...curr, trackCardTitle: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-amber-900 mb-1">ট্র্যাকিং কার্ড সাবটাইটেল</label>
                          <input
                            type="text"
                            placeholder="যেমন: ট্র্যাকিং কোড দিয়ে উত্তর জানুন"
                            value={siteSettings.fatwaPage?.trackCardSubtitle || ''}
                            onChange={(e) => {
                              const curr = siteSettings.fatwaPage || {
                                badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                                titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                                subtitleBn: '',
                                heroImage: ''
                              };
                              setSiteSettings({
                                ...siteSettings,
                                fatwaPage: { ...curr, trackCardSubtitle: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs bg-white"
                          />
                        </div>
                      </div>

                      {/* Archive Section */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-800 mb-1">আর্কাইভ সেকশন শিরোনাম</label>
                          <input
                            type="text"
                            placeholder="যেমন: উন্মুক্ত ফতোয়া ও গবেষণা আর্কাইভ"
                            value={siteSettings.fatwaPage?.archiveTitle || ''}
                            onChange={(e) => {
                              const curr = siteSettings.fatwaPage || {
                                badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                                titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                                subtitleBn: '',
                                heroImage: ''
                              };
                              setSiteSettings({
                                ...siteSettings,
                                fatwaPage: { ...curr, archiveTitle: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-800 mb-1">আর্কাইভ সেকশন সাবটাইটেল</label>
                          <input
                            type="text"
                            placeholder="যেমন: মুফতীগণের স্বাক্ষরিত ও প্রামাণ্য গ্রন্থাবলি থেকে সংকলিত উত্তরসমূহ"
                            value={siteSettings.fatwaPage?.archiveSubtitle || ''}
                            onChange={(e) => {
                              const curr = siteSettings.fatwaPage || {
                                badgeText: 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY',
                                titleBn: 'অনলাইন ইফতা ও ফতোয়া সেবা',
                                subtitleBn: '',
                                heroImage: ''
                              };
                              setSiteSettings({
                                ...siteSettings,
                                fatwaPage: { ...curr, archiveSubtitle: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Preview Panel (5 Cols) */}
                  <div className="lg:col-span-5 space-y-4 text-xs">
                    <div className="sticky top-6 space-y-4">
                      
                      {/* Live Mini Preview Box */}
                      <div className="bg-[#f8faf7] p-4 sm:p-5 rounded-2xl border border-[#ece8e0] shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-[#8a817c] uppercase tracking-wider flex items-center gap-1">
                            <Eye size={12} className="text-teal-600" />
                            <span>লাইভ প্রিভিউ (Live Mini Preview)</span>
                          </span>
                          <span className="text-[9px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                            /fatwa
                          </span>
                        </div>

                        {/* Hero Section Preview Rendering */}
                        {siteSettings.fatwaPage?.heroImagePosition === 'background' && siteSettings.fatwaPage?.showHeroImage !== false && siteSettings.fatwaPage?.heroImage ? (
                          <div className="relative rounded-2xl overflow-hidden min-h-[160px] p-5 flex items-center justify-center text-center shadow-inner border border-[#23626F] bg-[#112734]">
                            <img
                              src={formatImageUrl(siteSettings.fatwaPage?.heroImage)}
                              alt="Fatwa Hero Preview"
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                              onError={(e) => handleImageError(e, siteSettings.fatwaPage?.heroImage)}
                              style={{ opacity: (siteSettings.fatwaPage?.heroImageOpacity ?? 35) / 100 }}
                              className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity"
                            />
                            <div 
                              className="absolute inset-0 bg-gradient-to-t from-[#112734] via-[#112734]/80 to-[#112734]/60 pointer-events-none transition-opacity" 
                              style={{ opacity: (siteSettings.fatwaPage?.heroOverlayOpacity ?? 80) / 100 }}
                            />
                            
                            <div className="relative z-10 space-y-2">
                              <span className="inline-block px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 text-[9px] font-bold border border-teal-400/40">
                                ✨ {siteSettings.fatwaPage?.badgeText || 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY'}
                              </span>
                              <h4 className="text-sm font-black leading-tight text-white font-anek">
                                {siteSettings.fatwaPage?.titleBn || 'অনলাইন ইফতা ও ফতোয়া সেবা'}
                              </h4>
                              <p className="text-[10px] text-slate-200 line-clamp-2 leading-relaxed font-tiro">
                                {siteSettings.fatwaPage?.subtitleBn || 'দৈনন্দিন আমল, সমকালীন আধুনিক চিকিৎসাবিজ্ঞান, লেনদেন ও পারিবারিক যেকোনো জটিল মাসআলার সমাধান নির্ভরযোগ্য ও প্রামাণ্য দলীলসহ জেনে নিন।'}
                              </p>
                            </div>
                          </div>
                        ) : siteSettings.fatwaPage?.showHeroImage !== false && siteSettings.fatwaPage?.heroImage ? (
                          <div className="bg-white rounded-xl p-3.5 border border-[#ece8e0] shadow-sm space-y-2.5">
                            <div className={`flex flex-col sm:flex-row gap-3 items-center ${siteSettings.fatwaPage?.heroImagePosition === 'left' ? 'sm:flex-row-reverse' : ''}`}>
                              <div className="flex-1 space-y-1.5">
                                <span className="inline-block px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[9px] font-bold border border-teal-200">
                                  ✨ {siteSettings.fatwaPage?.badgeText || 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY'}
                                </span>
                                <h4 className="text-xs font-black text-[#112734] leading-tight font-anek">
                                  {siteSettings.fatwaPage?.titleBn || 'অনলাইন ইফতা ও ফতোয়া সেবা'}
                                </h4>
                                <p className="text-[10px] text-[#5a524d] line-clamp-2 leading-relaxed font-tiro">
                                  {siteSettings.fatwaPage?.subtitleBn || 'দৈনন্দিন আমল, সমকালীন আধুনিক চিকিৎসাবিজ্ঞান, লেনদেন ও পারিবারিক যেকোনো জটিল মাসআলার সমাধান নির্ভরযোগ্য ও প্রামাণ্য দলীলসহ জেনে নিন।'}
                                </p>
                              </div>
                              <div className="w-24 h-16 rounded-lg overflow-hidden border border-[#ece8e0] shrink-0 bg-slate-100">
                                <img
                                  src={formatImageUrl(siteSettings.fatwaPage?.heroImage)}
                                  alt="Fatwa Hero Preview"
                                  referrerPolicy="no-referrer"
                                  crossOrigin="anonymous"
                                  onError={(e) => handleImageError(e, siteSettings.fatwaPage?.heroImage)}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            
                            {/* Highlights pills */}
                            <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                              {(siteSettings.fatwaPage?.highlight1 || 'প্রামাণ্য ফিকহী কিতাব ও দলীলভিত্তিক সমাধান') && (
                                <span className="text-[9px] bg-slate-50 text-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200">
                                  ✓ {siteSettings.fatwaPage?.highlight1 || 'প্রামাণ্য ফিকহী কিতাব ও দলীলভিত্তিক সমাধান'}
                                </span>
                              )}
                              {(siteSettings.fatwaPage?.highlight2 || 'অভিজ্ঞ মুফতী বোর্ডের সরাসরি তত্ত্বাবধান') && (
                                <span className="text-[9px] bg-slate-50 text-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200">
                                  🎓 {siteSettings.fatwaPage?.highlight2 || 'অভিজ্ঞ মুফতী বোর্ডের সরাসরি তত্ত্বাবধান'}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl p-4 border border-[#ece8e0] text-center space-y-2 shadow-sm">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[9px] font-bold border border-teal-200">
                              ✨ {siteSettings.fatwaPage?.badgeText || 'দারুল ইফতা ও ফতোয়া বিভাগ • NOOR FIQH ACADEMY'}
                            </span>
                            <h4 className="text-sm font-black text-[#112734] leading-tight font-anek">
                              {siteSettings.fatwaPage?.titleBn || 'অনলাইন ইফতা ও ফতোয়া সেবা'}
                            </h4>
                            <p className="text-[10px] text-[#5a524d] leading-relaxed font-tiro">
                              {siteSettings.fatwaPage?.subtitleBn || 'দৈনন্দিন আমল, সমকালীন আধুনিক চিকিৎসাবিজ্ঞান, লেনদেন ও পারিবারিক যেকোনো জটিল মাসআলার সমাধান নির্ভরযোগ্য ও প্রামাণ্য দলীলসহ জেনে নিন।'}
                            </p>
                          </div>
                        )}

                        {/* Fatwa Action Cards Preview */}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="p-2.5 bg-white rounded-lg border border-teal-200 text-center space-y-1">
                            <span className="text-[10px] font-bold text-teal-800 block truncate">
                              {siteSettings.fatwaPage?.askCardTitle || 'সরাসরি প্রশ্ন পাঠান'}
                            </span>
                            <span className="text-[8px] text-slate-500 block truncate">
                              {siteSettings.fatwaPage?.askCardSubtitle || 'মুফতী প্যানেল কর্তৃক যাচাই'}
                            </span>
                          </div>
                          <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-center space-y-1">
                            <span className="text-[10px] font-bold text-amber-800 block truncate">
                              {siteSettings.fatwaPage?.trackCardTitle || 'স্ট্যাটাস দেখুন'}
                            </span>
                            <span className="text-[8px] text-slate-500 block truncate">
                              {siteSettings.fatwaPage?.trackCardSubtitle || 'ট্র্যাকিং কোড দিয়ে উত্তর'}
                            </span>
                          </div>
                        </div>

                      </div>

                      <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100 text-[11px] text-teal-900 leading-relaxed">
                        💡 <strong>পরামর্শ:</strong> কাঙ্ক্ষিত পরিবর্তন শেষে নিচে <strong>&quot;সাইট সেটিংস সেভ করুন&quot;</strong> বাটনে ক্লিক করলে তা সরাসরি ফতোয়া পেজে সেভ হয়ে দৃশ্যমান হবে।
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 5. COURSE CATEGORIES MANAGEMENT */}
            {settingsSubTab === 'categories' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
                  <div>
                    <h3 className="font-extrabold text-base text-[#112734] flex items-center gap-2">
                      <BookOpen size={18} className="text-emerald-600" />
                      <span>কোর্স ক্যাটাগরি ও ফিল্টার ব্যবস্থাপনা</span>
                    </h3>
                    <p className="text-xs text-[#8a817c] mt-0.5">
                      ওয়েবসাইটের কোর্স পেইজ এবং নতুন কোর্স যুক্ত করার সময় প্রদর্শিত সকল ক্যাটাগরি এখান থেকে যোগ, এডিট বা মুছতে পারবেন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const label = prompt('নতুন ক্যাটাগরির নাম লিখুন:');
                      if (label && label.trim()) {
                        const currentCats = siteSettings.courseCategories || DEFAULT_COURSE_CATEGORIES;
                        const newId = 'cat-' + Date.now().toString().slice(-6);
                        const updated = [...currentCats, { id: newId, label: label.trim() }];
                        setSiteSettings({ ...siteSettings, courseCategories: updated });
                        AppStore.saveCourseCategories(updated);
                        showNotification('নতুন ক্যাটাগরি সফলভাবে যোগ হয়েছে');
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    <Plus size={14} />
                    <span>+ নতুন ক্যাটাগরি যোগ করুন</span>
                  </button>
                </div>

                {/* Categories Table / Card Grid */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(siteSettings.courseCategories || DEFAULT_COURSE_CATEGORIES).map((cat, idx) => (
                      <div
                        key={cat.id || idx}
                        className="p-4 bg-white rounded-2xl border border-[#ece8e0] shadow-sm flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-[#112734]">{cat.label}</h4>
                            <span className="text-[10px] font-mono text-slate-400">ID: {cat.id}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const newLabel = prompt('ক্যাটাগরির নতুন নাম লিখুন:', cat.label);
                              if (newLabel && newLabel.trim() && newLabel.trim() !== cat.label) {
                                const currentCats = siteSettings.courseCategories || DEFAULT_COURSE_CATEGORIES;
                                const updated = currentCats.map(c => c.id === cat.id ? { ...c, label: newLabel.trim() } : c);
                                setSiteSettings({ ...siteSettings, courseCategories: updated });
                                AppStore.saveCourseCategories(updated);
                                showNotification('ক্যাটাগরি আপডেট হয়েছে');
                              }
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold transition-colors"
                            title="এডিট করুন"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const currentCats = siteSettings.courseCategories || DEFAULT_COURSE_CATEGORIES;
                              if (currentCats.length <= 1) {
                                alert('অন্তত একটি ক্যাটাগরি থাকতে হবে!');
                                return;
                              }
                              if (confirm(`"${cat.label}" ক্যাটাগরিটি মুছে ফেলতে চান?`)) {
                                const updated = currentCats.filter(c => c.id !== cat.id);
                                setSiteSettings({ ...siteSettings, courseCategories: updated });
                                AppStore.saveCourseCategories(updated);
                                showNotification('ক্যাটাগরি মুছে ফেলা হয়েছে');
                              }
                            }}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles size={14} className="text-emerald-700" />
                      <span>টিপস ও তথ্য:</span>
                    </p>
                    <p className="text-[11px] text-emerald-900 leading-relaxed">
                      এখানে যে ক্যাটাগরিগুলো সেভ করবেন, কোর্স তৈরীর ড্রপডাউনে এবং মূল কোর্সের ফিল্টারে তা সরাসরি লাইভ আপডেট হবে। এছাড়াও কোর্স তৈরীর পপআপ উইন্ডো থেকেই সরাসরি নতুন ক্যাটাগরি তৈরি করতে পারবেন।
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. TOP NOTIFICATION BAR MANAGEMENT */}
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
                    {/* Badge */}
                    <div>
                      <label className="block font-bold text-[#2c3e50] mb-1">শীর্ষ ব্যাজ টেক্সট (Top Badge)</label>
                      <input
                        type="text"
                        value={siteSettings.aboutPage?.badgeText || ''}
                        onChange={(e) => {
                          const currentAbout = siteSettings.aboutPage || { titleBn: '', subtitleBn: '', cards: [] };
                          setSiteSettings({
                            ...siteSettings,
                            aboutPage: { ...currentAbout, badgeText: e.target.value }
                          });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0]"
                        placeholder="যেমন: নূর ফিকহ একাডেমি পরিচিতি • NOOR FIQH ACADEMY"
                      />
                    </div>

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

                    {/* Hero Image Settings for About Page */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-[#ece8e0] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#112734] flex items-center gap-1.5">
                          <ImageIcon size={14} className="text-[#0f8293]" />
                          <span>পরিচিতি পেজ হিরো ব্যানার বা ছবি (Hero Image)</span>
                        </span>
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={siteSettings.aboutPage?.showHeroImage !== false}
                            onChange={(e) => {
                              const currentAbout = siteSettings.aboutPage || { titleBn: '', subtitleBn: '', cards: [] };
                              setSiteSettings({
                                ...siteSettings,
                                aboutPage: { ...currentAbout, showHeroImage: e.target.checked }
                              });
                            }}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span>ছবি প্রদর্শন করুন</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Direct Upload */}
                        <div>
                          <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">কম্পিউটার/মোবাইল থেকে আপলোড</label>
                          <label className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-white border border-dashed border-[#ece8e0] hover:border-teal-500 rounded-xl cursor-pointer text-xs text-slate-600 transition-colors">
                            <Upload size={14} className="text-teal-600" />
                            <span>ছবি আপলোড করুন</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const result = reader.result as string;
                                    if (result) {
                                      const currentAbout = siteSettings.aboutPage || { titleBn: '', subtitleBn: '', cards: [] };
                                      setSiteSettings({
                                        ...siteSettings,
                                        aboutPage: { ...currentAbout, heroImage: result, showHeroImage: true }
                                      });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>

                        {/* Image URL / Google Drive */}
                        <div>
                          <label className="block text-[11px] font-semibold text-[#5a524d] mb-1">অথবা ইমেজ ইউআরএল বা গুগল ড্রাইভ লিংক</label>
                          <input
                            type="text"
                            placeholder="https://drive.google.com/... বা https://example.com/image.jpg"
                            value={siteSettings.aboutPage?.heroImage || ''}
                            onChange={(e) => {
                              const currentAbout = siteSettings.aboutPage || { titleBn: '', subtitleBn: '', cards: [] };
                              setSiteSettings({
                                ...siteSettings,
                                aboutPage: { ...currentAbout, heroImage: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] focus:outline-none focus:border-teal-600 text-xs font-mono bg-white"
                          />
                        </div>
                      </div>

                      {/* Image Preview */}
                      {siteSettings.aboutPage?.heroImage && (
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#ece8e0]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#ece8e0] bg-slate-100 shrink-0">
                              <img
                                src={formatImageUrl(siteSettings.aboutPage.heroImage)}
                                alt="About Hero Banner"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                onError={(e) => handleImageError(e, siteSettings.aboutPage?.heroImage)}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="block font-bold text-slate-800 text-[11px]">বর্তমান ছবি</span>
                              <span className="block text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-xs font-mono">
                                {siteSettings.aboutPage.heroImage}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const currentAbout = siteSettings.aboutPage || { titleBn: '', subtitleBn: '', cards: [] };
                              setSiteSettings({
                                ...siteSettings,
                                aboutPage: { ...currentAbout, heroImage: '' }
                              });
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-bold flex items-center gap-1 text-[11px]"
                          >
                            <Trash2 size={13} />
                            <span>মুছুন</span>
                          </button>
                        </div>
                      )}

                      {/* Layout Position */}
                      <div className="pt-2 border-t border-[#ece8e0]/70">
                        <label className="block text-[11px] font-bold text-[#5a524d] mb-1.5">ছবির অবস্থান (Position)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'right', label: 'ডান পাশে ছবি (Right)' },
                            { id: 'left', label: 'বাম পাশে ছবি (Left)' },
                            { id: 'background', label: 'ব্যাকগ্রাউন্ড ব্যানার (Full)' }
                          ].map((pos) => (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => {
                                const currentAbout = siteSettings.aboutPage || { titleBn: '', subtitleBn: '', cards: [] };
                                setSiteSettings({
                                  ...siteSettings,
                                  aboutPage: { ...currentAbout, heroImagePosition: pos.id as any }
                                });
                              }}
                              className={`py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all text-center ${
                                (siteSettings.aboutPage?.heroImagePosition || 'right') === pos.id
                                  ? 'bg-[#112734] text-white shadow-sm'
                                  : 'bg-white text-slate-700 border border-[#ece8e0] hover:bg-slate-50'
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>
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
                                src={formatImageUrl(member.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80')}
                                alt={member.nameBn || member.name}
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                onError={(e) => handleImageError(e, member.avatar)}
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


          {/* ORDER ACTION & DETAILS MODAL */}
          {selectedOrderForAction && (
            <OrderActionModal
              order={selectedOrderForAction}
              courses={courses}
              books={books}
              onClose={() => setSelectedOrderForAction(null)}
              onApprove={(id) => {
                handleApproveOrder(id);
                setSelectedOrderForAction(null);
              }}
              onReject={(id) => {
                handleRejectOrder(id);
                setSelectedOrderForAction(null);
              }}
              onDelete={(id) => {
                handleDeleteOrder(id);
                setSelectedOrderForAction(null);
              }}
              onStatusChange={(id, status) => {
                AppStore.updateOrderStatus(id, status);
                refreshAllData();
                showNotification(`অর্ডার স্ট্যাটাস '${status}' হিসেবে আপডেট করা হয়েছে`);
                setSelectedOrderForAction(null);
              }}
            />
          )}

          {/* MANUAL ORDER / STUDENT ENROLLMENT MODAL */}
          {showManualOrderModal && (
            <ManualOrderModal
              courses={courses}
              books={books}
              onClose={() => setShowManualOrderModal(false)}
              onSave={handleSaveManualOrder}
            />
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
  const [formData, setFormData] = useState<Course>(() => {
    const copy = JSON.parse(JSON.stringify(course));
    if (!copy.objectives || !Array.isArray(copy.objectives)) {
      copy.objectives = [];
    }
    if (!copy.instructor) {
      copy.instructor = {
        id: 'inst-1',
        name: 'Mufti Ammar Bin Noor',
        nameBn: 'মুফতী আম্মার বিন নূর',
        title: 'মুহাদ্দিস ও ফকিহ',
        roleBn: 'দারুল উলুম দেওবন্দ',
        bio: 'নূর ফিকহ একাডেমির সিনিয়র ফ্যাকাল্টি সদস্য।',
        avatar: ''
      };
    } else if (copy.instructor.roleBn === undefined) {
      copy.instructor.roleBn = 'দারুল উলুম দেওবন্দ';
    }
    return copy;
  });
  const [activeSubTab, setActiveSubTab] = useState<'basic' | 'objectives' | 'curriculum' | 'quizzes' | 'instructor'>('basic');
  const [editingLessonIdx, setEditingLessonIdx] = useState<number | null>(null);

  // Objectives (এই কোর্সে যা যা শিখবেন) State & Handlers
  const [newObjective, setNewObjective] = useState('');
  const [editingObjIdx, setEditingObjIdx] = useState<number | null>(null);
  const [editingObjText, setEditingObjText] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkObjectivesText, setBulkObjectivesText] = useState('');

  const handleAddObjective = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newObjective.trim()) return;
    const current = formData.objectives || [];
    setFormData({
      ...formData,
      objectives: [...current, newObjective.trim()]
    });
    setNewObjective('');
  };

  const handleUpdateObjective = (idx: number, text: string) => {
    if (!text.trim()) return;
    const updated = [...(formData.objectives || [])];
    updated[idx] = text.trim();
    setFormData({ ...formData, objectives: updated });
    setEditingObjIdx(null);
    setEditingObjText('');
  };

  const handleRemoveObjective = (idx: number) => {
    const updated = (formData.objectives || []).filter((_, i) => i !== idx);
    setFormData({ ...formData, objectives: updated });
    if (editingObjIdx === idx) {
      setEditingObjIdx(null);
      setEditingObjText('');
    }
  };

  const handleMoveObjective = (idx: number, direction: 'up' | 'down') => {
    const list = [...(formData.objectives || [])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    setFormData({ ...formData, objectives: list });
  };

  const handleSaveBulkObjectives = () => {
    const parsed = bulkObjectivesText
      .split('\n')
      .map(line => line.replace(/^[\s•\-\*\d\.\)\✓\-\>\–]+\s*/, '').trim())
      .filter(line => line.length > 0);
    setFormData({ ...formData, objectives: parsed });
    setIsBulkMode(false);
  };

  // Dynamic Course Categories
  const [categories, setCategories] = useState<CourseCategory[]>(() => AppStore.getCourseCategories());
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatLabel, setEditingCatLabel] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;
    const newId = 'cat-' + Date.now().toString().slice(-6);
    const updated = [...categories, { id: newId, label: newCatLabel.trim() }];
    setCategories(updated);
    AppStore.saveCourseCategories(updated);
    setFormData({
      ...formData,
      category: newId,
      categoryLabelBn: newCatLabel.trim()
    });
    setNewCatLabel('');
  };

  const handleUpdateCategory = (id: string) => {
    if (!editingCatLabel.trim()) return;
    const updated = categories.map(c => c.id === id ? { ...c, label: editingCatLabel.trim() } : c);
    setCategories(updated);
    AppStore.saveCourseCategories(updated);
    if (formData.category === id) {
      setFormData({
        ...formData,
        categoryLabelBn: editingCatLabel.trim()
      });
    }
    setEditingCatId(null);
    setEditingCatLabel('');
  };

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) {
      alert('অন্তত একটি ক্যাটাগরি থাকতে হবে!');
      return;
    }
    if (confirm('এই ক্যাটাগরি মুছে ফেলতে চান?')) {
      const updated = categories.filter(c => c.id !== id);
      setCategories(updated);
      AppStore.saveCourseCategories(updated);
      if (formData.category === id) {
        setFormData({
          ...formData,
          category: updated[0].id,
          categoryLabelBn: updated[0].label
        });
      }
    }
  };

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
    const cleanedObjectives = (formData.objectives || [])
      .map(o => (typeof o === 'string' ? o.trim() : ''))
      .filter(Boolean);

    onSave({
      ...formData,
      objectives: cleanedObjectives
    });
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
        <div className="flex border-b border-[#ece8e0] px-6 bg-[#fdfcf9] gap-2 sm:gap-4 overflow-x-auto text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('basic')}
            className={`py-3 px-2 border-b-2 transition-all shrink-0 ${
              activeSubTab === 'basic' ? 'border-[#112734] text-[#112734]' : 'border-transparent text-[#8a817c]'
            }`}
          >
            ১. প্রাথমিক তথ্য ও ফি
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('objectives')}
            className={`py-3 px-2 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeSubTab === 'objectives' ? 'border-[#112734] text-[#112734]' : 'border-transparent text-[#8a817c]'
            }`}
          >
            <span>২. এই কোর্সে যা যা শিখবেন</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              (formData.objectives?.length || 0) > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-200 text-slate-600'
            }`}>
              {formData.objectives?.length || 0}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('curriculum')}
            className={`py-3 px-2 border-b-2 transition-all shrink-0 ${
              activeSubTab === 'curriculum' ? 'border-[#112734] text-[#112734]' : 'border-transparent text-[#8a817c]'
            }`}
          >
            ৩. লেকচার ও কারিকুলাম ({formData.lessons.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('quizzes')}
            className={`py-3 px-2 border-b-2 transition-all shrink-0 ${
              activeSubTab === 'quizzes' ? 'border-[#112734] text-[#112734]' : 'border-transparent text-[#8a817c]'
            }`}
          >
            ৪. কুইজ ও মূল্যায়ন পরীক্ষা
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('instructor')}
            className={`py-3 px-2 border-b-2 transition-all shrink-0 ${
              activeSubTab === 'instructor' ? 'border-[#112734] text-[#112734]' : 'border-transparent text-[#8a817c]'
            }`}
          >
            ৫. ইন্সট্রাক্টরের তথ্য
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
                <div className="sm:col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#2c3e50] text-xs">ক্যাটাগরি *</label>
                    <button
                      type="button"
                      onClick={() => setIsManagingCategories(!isManagingCategories)}
                      className="text-[11px] text-[#17A2B8] hover:text-[#112734] font-bold underline transition-colors"
                    >
                      {isManagingCategories ? '✕ বন্ধ করুন' : '⚙️ কাস্টমাইজ / এডিট'}
                    </button>
                  </div>
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
                    className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] font-medium text-xs bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#2c3e50] mb-1 text-xs">কোর্স ফি (টাকা) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2c3e50] mb-1 text-xs">আসল মূল্য / ডিসকাউন্ট (টাকা)</label>
                  <input
                    type="number"
                    value={formData.originalPrice || ''}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] text-xs"
                  />
                </div>
              </div>

              {/* Category Management Drawer */}
              {isManagingCategories && (
                <div className="p-4 bg-slate-50 border border-[#17A2B8]/40 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-xs font-black text-[#112734] flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-500" />
                      <span>ক্যাটাগরি ম্যানেজমেন্ট (নতুন যোগ, নাম পরিবর্তন ও মুছে ফেলা)</span>
                    </h4>
                    <span className="text-[10px] text-[#8a817c]">মোট ক্যাটাগরি: {categories.length}টি</span>
                  </div>

                  {/* Add New Category Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="নতুন ক্যাটাগরির নাম লিখুন..."
                      value={newCatLabel}
                      onChange={(e) => setNewCatLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCategory(e);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-[#ece8e0] bg-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-3.5 py-1.5 bg-[#112734] hover:bg-[#23626F] text-white text-xs font-bold rounded-xl shadow transition-colors shrink-0"
                    >
                      + যোগ করুন
                    </button>
                  </div>

                  {/* List of Existing Categories for Quick Edit & Delete */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200 text-xs">
                        {editingCatId === cat.id ? (
                          <div className="flex-1 flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editingCatLabel}
                              onChange={(e) => setEditingCatLabel(e.target.value)}
                              className="flex-1 px-2.5 py-1 rounded-lg border border-[#17A2B8] text-xs font-bold"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateCategory(cat.id)}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold"
                            >
                              সেভ
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCatId(null)}
                              className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-[11px]"
                            >
                              বাতিল
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${formData.category === cat.id ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                              <span className="font-bold text-[#2c3e50]">{cat.label}</span>
                              {formData.category === cat.id && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">সিলেক্টেড</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCatId(cat.id);
                                  setEditingCatLabel(cat.label);
                                }}
                                className="px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 rounded"
                                title="এডিট করুন"
                              >
                                ✏️ এডিট
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="px-2 py-0.5 text-xs text-rose-600 hover:bg-rose-50 rounded"
                                title="মুছে ফেলুন"
                              >
                                🗑️ মুছুন
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

              {/* Quick Jump to Objectives Editor */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h5 className="font-bold text-[#112734] text-xs flex items-center gap-1.5 font-anek">
                    <CheckCircle2 size={16} className="text-amber-600" />
                    <span>এই কোর্সে যা যা শিখবেন ({formData.objectives?.length || 0}টি বিষয় যুক্ত আছে)</span>
                  </h5>
                  <p className="text-[11px] text-[#5a524d] mt-0.5 font-noto">
                    কোর্স পেজের বিশেষ চেকলিস্ট পয়েন্টগুলো এডিট বা নতুন পয়েন্ট যোগ করতে &quot;এই কোর্সে যা যা শিখবেন&quot; ট্যাবে যান।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('objectives')}
                  className="px-4 py-2 bg-[#112734] hover:bg-[#23626F] text-white text-xs font-bold rounded-xl shadow transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <Edit3 size={13} />
                  <span>শিখনফল এডিট করুন →</span>
                </button>
              </div>
            </div>
          )}

          {/* SUBTAB 2: COURSE OBJECTIVES / এই কোর্সে যা যা শিখবেন */}
          {activeSubTab === 'objectives' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80">
                <div>
                  <h4 className="font-extrabold text-sm text-[#112734] flex items-center gap-2 font-anek">
                    <CheckCircle2 size={18} className="text-amber-600" />
                    <span>কোর্স পেজের &quot;এই কোর্সে যা যা শিখবেন&quot; তালিকা</span>
                  </h4>
                  <p className="text-[11px] text-[#5a524d] mt-0.5 font-noto">
                    শিক্ষার্থীরা কোর্স এনরোল করার আগে এই বিষয়গুলো কোর্স ডিটেইল পেজে স্পষ্ট চেকলিস্ট আকারে দেখতে পাবে।
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isBulkMode) {
                        setBulkObjectivesText((formData.objectives || []).join('\n'));
                      }
                      setIsBulkMode(!isBulkMode);
                    }}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-[#112734] border border-[#ece8e0] rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                  >
                    {isBulkMode ? '📋 একক তালিকা ভিউ' : '📝 একসাথে বাল্ক এডিট / পেস্ট'}
                  </button>
                </div>
              </div>

              {/* Bulk Edit Mode */}
              {isBulkMode ? (
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#ece8e0]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="font-bold text-[#112734] text-xs">
                      প্রতি লাইনে একটি করে বিষয় বা শিখনফল লিখুন (বা একবারে কপি-পেস্ট করুন):
                    </label>
                    <span className="text-[11px] text-[#8a817c]">
                      (বুলেট চিহ্ন বা ক্রমিক নম্বর থাকলে স্বয়ংক্রিয়ভাবে ক্লিন হয়ে যাবে)
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={bulkObjectivesText}
                    onChange={(e) => setBulkObjectivesText(e.target.value)}
                    placeholder={`বিশুদ্ধভাবে তাহরাত ও নামাজ আদায়ের সকল খুঁটিনাটি বিধান জানা\nদৈনন্দিন ভুলত্রুটি ও সাহু সেজদার সঠিক সমাধান শেখা\nআধুনিক যুগে যাকাতের নিখুঁত হিসাব বের করতে পারা\nরমজান ও নফল রোজার সমকালীন মেডিকেল মাসআলা সমাধান করা`}
                    className="w-full p-3.5 rounded-xl border border-[#ece8e0] text-xs font-noto leading-relaxed focus:border-[#17A2B8] outline-none"
                  />
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsBulkMode(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveBulkObjectives}
                      className="px-5 py-2 bg-[#112734] hover:bg-[#23626F] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow"
                    >
                      <Save size={14} />
                      <span>বাল্ক তালিকা আপডেট করুন</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Single Item List Mode */
                <div className="space-y-4">
                  {/* Add New Objective Form */}
                  <form onSubmit={handleAddObjective} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="নতুন শিখনফল বা বিষয় লিখুন (যেমন: শেয়ার মার্কেট ও আধুনিক পেমেন্টের শরয়ী বিধান)..."
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[#ece8e0] text-xs focus:border-[#17A2B8] outline-none bg-white font-noto"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#112734] hover:bg-[#23626F] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 shadow transition-colors"
                    >
                      <Plus size={14} />
                      <span>যোগ করুন</span>
                    </button>
                  </form>

                  {/* Existing Objectives List */}
                  {(!formData.objectives || formData.objectives.length === 0) ? (
                    <div className="text-center py-10 bg-[#fdfcf9] rounded-2xl border-2 border-dashed border-[#ece8e0] text-slate-500 space-y-2">
                      <CheckCircle2 size={32} className="mx-auto text-slate-400" />
                      <p className="font-bold text-xs text-slate-700">এখনও কোনো &quot;যা যা শিখবেন&quot; বিষয় যোগ করা হয়নি।</p>
                      <p className="text-[11px] text-slate-400 font-noto">
                        উপরের ঘরে লিখে যোগ করুন অথবা &quot;একসাথে বাল্ক এডিট / পেস্ট&quot; বাটনে ক্লিক করে একবারে পেস্ট করুন।
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {formData.objectives.map((obj, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-[#ece8e0] shadow-sm hover:border-[#17A2B8]/50 transition-all group"
                        >
                          {/* Index badge */}
                          <span className="w-6 h-6 rounded-full bg-[#17A2B8]/10 text-[#112734] font-bold text-xs flex items-center justify-center shrink-0 font-anek">
                            {idx + 1}
                          </span>

                          {/* Edit or display */}
                          {editingObjIdx === idx ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={editingObjText}
                                onChange={(e) => setEditingObjText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleUpdateObjective(idx, editingObjText);
                                  }
                                }}
                                autoFocus
                                className="flex-1 px-3 py-1.5 rounded-lg border border-[#17A2B8] text-xs font-noto outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateObjective(idx, editingObjText)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shrink-0"
                              >
                                সেভ
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingObjIdx(null);
                                  setEditingObjText('');
                                }}
                                className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs shrink-0"
                              >
                                বাতিল
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="flex-1 text-xs text-[#2c3e50] font-noto leading-relaxed">
                                {obj}
                              </span>

                              <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 shrink-0">
                                {/* Move Up */}
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveObjective(idx, 'up')}
                                  className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors ${
                                    idx === 0 ? 'opacity-30 cursor-not-allowed' : ''
                                  }`}
                                  title="উপরে নিন"
                                >
                                  ↑
                                </button>

                                {/* Move Down */}
                                <button
                                  type="button"
                                  disabled={idx === formData.objectives.length - 1}
                                  onClick={() => handleMoveObjective(idx, 'down')}
                                  className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors ${
                                    idx === formData.objectives.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                                  }`}
                                  title="নিচে নিন"
                                >
                                  ↓
                                </button>

                                {/* Edit */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingObjIdx(idx);
                                    setEditingObjText(obj);
                                  }}
                                  className="px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg font-bold transition-colors"
                                  title="সম্পাদনা করুন"
                                >
                                  ✏️ এডিট
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveObjective(idx)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Live Preview Box matching Course Page */}
                  {(formData.objectives && formData.objectives.length > 0) && (
                    <div className="mt-6 pt-5 border-t border-[#ece8e0]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#8a817c] uppercase tracking-wider">
                          লাইভ প্রিভিউ (কোর্স পেজে শিক্ষার্থীরা যেভাবে দেখবে)
                        </span>
                        <span className="text-[11px] text-emerald-600 font-bold">✓ লাইভ প্রিভিউ</span>
                      </div>
                      <div className="bg-[#fcfdfd] p-5 rounded-2xl border border-[#ece8e0] shadow-sm space-y-3">
                        <h4 className="text-base font-extrabold text-[#112734] flex items-center gap-2 font-anek">
                          <CheckCircle2 size={18} className="text-amber-600" />
                          এই কোর্সে যা যা শিখবেন
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-[#5a524d] font-noto">
                          {formData.objectives.map((obj, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-[#17A2B8]/15 text-[#112734] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-anek">
                                ✓
                              </span>
                              <span className="leading-relaxed">{obj}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 3: LESSONS & CURRICULUM */}
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
                <label className="block font-bold mb-1">শিক্ষা প্রতিষ্ঠান / পরিচয় (যেমন: দারুল উলুম দেওবন্দ, আল-আজহার)</label>
                <input
                  type="text"
                  value={formData.instructor.roleBn || ''}
                  placeholder="যেমন: দারুল উলুম দেওবন্দ"
                  onChange={(e) => setFormData({
                    ...formData,
                    instructor: { ...formData.instructor, roleBn: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ece8e0]"
                />
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

              {/* Objectives quick link */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-[#ece8e0] flex items-center justify-between mt-4">
                <div>
                  <h5 className="font-bold text-[#112734] text-xs flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-amber-600" />
                    <span>এই কোর্সে যা যা শিখবেন (Objectives)</span>
                  </h5>
                  <p className="text-[11px] text-[#8a817c] mt-0.5 font-noto">
                    বর্তমানে মোট {formData.objectives?.length || 0}টি বিষয় নির্ধারিত রয়েছে।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('objectives')}
                  className="px-3.5 py-1.5 bg-[#112734] text-white hover:bg-[#23626F] text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  শিখনফল এডিট ট্যাবে যান →
                </button>
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
                src={formatImageUrl(formData.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80')}
                alt="Avatar preview"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => handleImageError(e, formData.avatar)}
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

// -------------------------------------------------------------------------------------
// ORDER DETAILS & ACTION MODAL
// -------------------------------------------------------------------------------------
interface OrderActionModalProps {
  order: Order;
  courses: Course[];
  books: Book[];
  onClose: () => void;
  onApprove: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onDelete: (orderId: string) => void;
  onStatusChange: (orderId: string, status: 'approved' | 'rejected' | 'pending') => void;
}

function OrderActionModal({ order, courses, books, onClose, onApprove, onReject, onDelete, onStatusChange }: OrderActionModalProps) {
  const [copiedTrx, setCopiedTrx] = useState(false);

  const cleanPhone = (order.userPhone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('88') ? cleanPhone : cleanPhone ? `88${cleanPhone}` : '';

  const waMessage = encodeURIComponent(
    `আসসালামু আলাইকুম ${order.userName},\n\nনূর ফিকহ একাডেমিতে "${order.itemTitle}"-এ আপনার ভর্তি ও অর্ডার (অর্ডার নং: ${order.orderNumber}) সফলভাবে অনুমোদিত হয়েছে। আলহামদুলিল্লাহ!\n\nআপনি এখন আপনার একাউন্টে লগইন করে কোর্স শুরু করতে পারবেন:\nhttps://noorfiqh.academy/dashboard\n\nযেকোনো সহায়তায় আমাদের সাথে যোগাযোগ করুন। জাযাকাল্লাহু খাইরান!`
  );

  const waUrl = formattedPhone ? `https://wa.me/${formattedPhone}?text=${waMessage}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-[#ece8e0] my-8 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#112734] p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#17A2B8]/20 border border-[#17A2B8]/40 flex items-center justify-center text-[#17A2B8]">
              <ShoppingBag size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono bg-white/15 px-2 py-0.5 rounded font-bold">
                  {order.orderNumber}
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  order.status === 'approved' 
                    ? 'bg-emerald-500 text-white' 
                    : order.status === 'rejected'
                    ? 'bg-red-500 text-white'
                    : 'bg-amber-400 text-slate-950 animate-pulse'
                }`}>
                  {order.status === 'approved' ? 'অনুমোদিত' : order.status === 'rejected' ? 'বাতিলকৃত' : 'পেন্ডিং ভেরিফিকেশন'}
                </span>
              </div>
              <h3 className="text-lg font-black font-anek mt-1">অর্ডার ও ভর্তি বিবরণ</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#23626F] text-white hover:bg-[#23626F] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Student Info Box */}
          <div className="bg-[#fdfcf9] p-4 rounded-2xl border border-[#ece8e0] space-y-2.5">
            <span className="text-[10px] font-extrabold text-[#8a817c] uppercase tracking-wider block">
              শিক্ষার্থীর তথ্য
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-[#8a817c]">শিক্ষার্থীর নাম</p>
                <p className="font-extrabold text-sm text-[#112734]">{order.userName}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#8a817c]">মোবাইল নম্বর</p>
                <p className="font-mono font-bold text-sm text-[#112734]">
                  {order.userPhone || 'দেওয়া হয়নি'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#8a817c]">ইমেইল এড্রেস</p>
                <p className="font-bold text-[#112734] truncate">{order.userEmail || 'দেওয়া হয়নি'}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#8a817c]">আবেদনের তারিখ</p>
                <p className="font-bold text-[#112734]">
                  {new Date(order.createdAt || Date.now()).toLocaleDateString('bn-BD', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {order.shippingAddress && (
              <div className="pt-2 border-t border-[#ece8e0]">
                <p className="text-[11px] text-amber-800 font-bold">ডেলিভারি ঠিকানা:</p>
                <p className="text-xs text-[#2c3e50] mt-0.5">{order.shippingAddress}</p>
              </div>
            )}
          </div>

          {/* Item & Payment Details Box */}
          <div className="bg-[#fdfcf9] p-4 rounded-2xl border border-[#ece8e0] space-y-3">
            <span className="text-[10px] font-extrabold text-[#8a817c] uppercase tracking-wider block">
              কোর্স ও পেমেন্টের বিবরণ
            </span>

            <div className="flex items-start justify-between gap-3 p-3 bg-white rounded-xl border border-[#ece8e0]">
              <div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                  order.itemType === 'course' 
                    ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {order.itemType === 'course' ? '🎓 পূর্ণাঙ্গ কোর্স' : '📘 কিতাব / প্রকাশনা'}
                </span>
                <h4 className="font-black text-sm text-[#112734] mt-1">{order.itemTitle}</h4>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-[#8a817c] block">মোট ফি</span>
                <span className="font-black text-lg text-[#112734]">৳{order.amount}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white rounded-xl border border-[#ece8e0]">
                <p className="text-[10px] text-[#8a817c] uppercase font-bold">পেমেন্ট মেথড</p>
                <p className="font-extrabold text-sm text-[#112734] uppercase mt-0.5">
                  {order.paymentMethod}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#ece8e0]">
                <p className="text-[10px] text-[#8a817c] uppercase font-bold">Transaction ID (TrxID)</p>
                <div className="flex items-center justify-between gap-1 mt-0.5">
                  <span className="font-mono font-black text-xs text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {order.trxId || 'N/A'}
                  </span>
                  {order.trxId && (
                    <button
                      type="button"
                      onClick={() => {
                        if (order.trxId) {
                          navigator.clipboard.writeText(order.trxId);
                          setCopiedTrx(true);
                          setTimeout(() => setCopiedTrx(false), 2500);
                        }
                      }}
                      className="text-[10px] text-[#17A2B8] hover:underline font-bold flex items-center gap-0.5"
                    >
                      {copiedTrx ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      <span>{copiedTrx ? 'কপি হয়েছে' : 'কপি'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Direct Communication Buttons */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
            <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
              <MessageSquare size={13} className="text-emerald-700" />
              <span>শিক্ষার্থীর সাথে সরাসরি যোগাযোগ ও নোটিফিকেশন</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {waUrl ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <MessageSquare size={13} />
                  <span>হোয়াটসঅ্যাপে কনফার্মেশন পাঠান</span>
                </a>
              ) : (
                <span className="text-[10px] text-slate-400 italic">
                  * হোয়াটসঅ্যাপ পাঠানোর জন্য ফোন নম্বর প্রয়োজন
                </span>
              )}

              {order.userPhone && (
                <a
                  href={`tel:${order.userPhone}`}
                  className="px-3 py-2 bg-white text-[#112734] border border-[#ece8e0] hover:bg-slate-50 rounded-xl font-bold text-xs flex items-center gap-1.5"
                >
                  <Phone size={13} className="text-[#17A2B8]" />
                  <span>সরাসরি কল করুন</span>
                </a>
              )}

              {order.userEmail && (
                <a
                  href={`mailto:${order.userEmail}?subject=নূর ফিকহ একাডেমি - আপনার অর্ডার #${order.orderNumber} অনুমোদিত হয়েছে`}
                  className="px-3 py-2 bg-white text-[#112734] border border-[#ece8e0] hover:bg-slate-50 rounded-xl font-bold text-xs flex items-center gap-1.5"
                >
                  <Mail size={13} className="text-[#17A2B8]" />
                  <span>ইমেইল পাঠান</span>
                </a>
              )}
            </div>
          </div>

          {/* Status Change Selector */}
          <div className="bg-[#fdfcf9] p-3.5 rounded-2xl border border-[#ece8e0] flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-[#112734] text-xs">স্ট্যাটাস পরিবর্তন করুন</p>
              <p className="text-[10px] text-[#8a817c]">প্রয়োজনে স্ট্যাটাস পেন্ডিং, অনুমোদিত বা বাতিল করুন</p>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => onStatusChange(order.id, 'approved')}
                className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                  order.status === 'approved'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                অনুমোদিত
              </button>
              <button
                type="button"
                onClick={() => onStatusChange(order.id, 'pending')}
                className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                  order.status === 'pending'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50'
                }`}
              >
                পেন্ডিং
              </button>
              <button
                type="button"
                onClick={() => onStatusChange(order.id, 'rejected')}
                className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                  order.status === 'rejected'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white text-red-800 border border-red-300 hover:bg-red-50'
                }`}
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-[#fdfcf9] border-t border-[#ece8e0] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => onDelete(order.id)}
            className="px-3.5 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Trash2 size={14} />
            <span>মুছে ফেলুন</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
            >
              বন্ধ করুন
            </button>

            {order.status === 'pending' && (
              <button
                type="button"
                onClick={() => onApprove(order.id)}
                className="px-5 py-2 bg-[#17A2B8] hover:bg-[#23626F] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <CheckCircle size={14} />
                <span>অনুমোদন ও এক্সেস দিন</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------
// MANUAL ORDER / STUDENT ENROLLMENT MODAL
// -------------------------------------------------------------------------------------
interface ManualOrderModalProps {
  courses: Course[];
  books: Book[];
  onClose: () => void;
  onSave: (orderData: Partial<Order>) => void;
}

function ManualOrderModal({ courses, books, onClose, onSave }: ManualOrderModalProps) {
  const [itemType, setItemType] = useState<'course' | 'book'>('course');
  const [selectedItemId, setSelectedItemId] = useState<string>(courses[0]?.id || '');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [amount, setAmount] = useState<number>(courses[0]?.price || 0);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'card' | 'cod' | 'manual'>('bkash');
  const [trxId, setTrxId] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [status, setStatus] = useState<'approved' | 'pending'>('approved');

  const selectedItem = itemType === 'course' 
    ? courses.find(c => c.id === selectedItemId) 
    : books.find(b => b.id === selectedItemId);

  const handleItemTypeChange = (type: 'course' | 'book') => {
    setItemType(type);
    if (type === 'course') {
      const firstCourse = courses[0];
      setSelectedItemId(firstCourse?.id || '');
      setAmount(firstCourse?.price || 0);
    } else {
      const firstBook = books[0];
      setSelectedItemId(firstBook?.id || '');
      setAmount(firstBook ? (firstBook.pdfPrice || firstBook.hardcoverPrice || 0) : 0);
    }
  };

  const handleItemSelect = (id: string) => {
    setSelectedItemId(id);
    if (itemType === 'course') {
      const c = courses.find(x => x.id === id);
      if (c) setAmount(c.price);
    } else {
      const b = books.find(x => x.id === id);
      if (b) setAmount(b.pdfPrice || b.hardcoverPrice || 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert('শিক্ষার্থীর নাম লিখুন');
      return;
    }
    if (!selectedItemId) {
      alert('একটি কোর্স বা বই নির্বাচন করুন');
      return;
    }

    onSave({
      userName: userName.trim(),
      userEmail: userEmail.trim().toLowerCase(),
      userPhone: userPhone.trim(),
      itemType,
      itemId: selectedItemId,
      itemTitle: selectedItem ? (selectedItem as any).titleBn || (selectedItem as any).title : 'কোর্স',
      amount: Number(amount) || 0,
      paymentMethod,
      trxId: trxId.trim() || `MANUAL-${Math.floor(1000 + Math.random() * 9000)}`,
      status,
      shippingAddress: shippingAddress.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-[#ece8e0] my-8 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#112734] p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#17A2B8]/20 flex items-center justify-center text-[#17A2B8]">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black font-anek">ম্যানুয়াল ভর্তি ও অর্ডার তৈরি</h3>
              <p className="text-xs text-[#17A2B8]/80">অফলাইন পেমেন্ট বা উপহার হিসেবে ছাত্রকে কোর্স এক্সেস দিন</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#23626F] text-white hover:bg-[#23626F]">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Type Selector */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => handleItemTypeChange('course')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                itemType === 'course' ? 'bg-white text-[#112734] shadow-sm' : 'text-slate-600'
              }`}
            >
              🎓 কোর্স এনরোলমেন্ট
            </button>
            <button
              type="button"
              onClick={() => handleItemTypeChange('book')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                itemType === 'book' ? 'bg-white text-[#112734] shadow-sm' : 'text-slate-600'
              }`}
            >
              📘 কিতাব / বই
            </button>
          </div>

          {/* Select Course / Book */}
          <div>
            <label className="block font-bold text-[#2c3e50] mb-1">
              {itemType === 'course' ? 'কোর্স নির্বাচন করুন *' : 'বই নির্বাচন করুন *'}
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => handleItemSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] font-tiro font-bold bg-white text-xs"
            >
              {itemType === 'course' && courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titleBn} (ফি: ৳{c.price})
                </option>
              ))}
              {itemType === 'book' && books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.titleBn || b.title} (মূল্য: ৳{b.pdfPrice || b.hardcoverPrice || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Student Name */}
          <div>
            <label className="block font-bold text-[#2c3e50] mb-1">শিক্ষার্থীর নাম *</label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="যেমন: হাফেজ মাওলানা আব্দুর রহমান"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] bg-[#fdfcf9] font-tiro text-xs"
            />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#2c3e50] mb-1">মোবাইল নম্বর</label>
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] bg-[#fdfcf9] font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2c3e50] mb-1">ইমেইল এড্রেস</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] bg-[#fdfcf9] text-xs"
              />
            </div>
          </div>

          {/* Amount, Method, Trx */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#2c3e50] mb-1">ফি (টাকা)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] bg-[#fdfcf9] font-bold text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2c3e50] mb-1">পেমেন্ট মেথড</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] bg-white font-bold text-xs"
              >
                <option value="bkash">bKash (বিকাশ)</option>
                <option value="nagad">Nagad (নগদ)</option>
                <option value="rocket">Rocket (রকেট)</option>
                <option value="card">Card / Bank (কার্ড / ব্যাংক)</option>
                <option value="cod">Cash on Delivery (ক্যাশ অন ডেলিভারি)</option>
                <option value="manual">Manual / Offline (ম্যানুয়াল / নগদ)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#2c3e50] mb-1">TrxID</label>
              <input
                type="text"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                placeholder="ঐচ্ছিক"
                className="w-full px-3 py-2 rounded-xl border border-[#ece8e0] bg-[#fdfcf9] font-mono text-xs"
              />
            </div>
          </div>

          {/* Status & Auto-Approve */}
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-emerald-950 block">সরাসরি ভর্তি ও কোর্স এক্সেস নিশ্চিতকরণ</span>
              <span className="text-[10px] text-emerald-800">অর্ডার তৈরির সাথে সাথেই শিক্ষার্থী কোর্স এক্সেস পাবে</span>
            </div>
            <input
              type="checkbox"
              checked={status === 'approved'}
              onChange={(e) => setStatus(e.target.checked ? 'approved' : 'pending')}
              className="w-5 h-5 accent-[#17A2B8] rounded"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#ece8e0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold font-tiro"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#112734] hover:bg-[#23626F] text-white rounded-xl font-extrabold font-tiro shadow-md flex items-center gap-1.5"
            >
              <CheckCircle size={15} />
              <span>ভর্তি সম্পন্ন করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

