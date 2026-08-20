'use client';

import { Course, Book, FatwaQuestion, LiveClass, Order, UserProgress, Certificate, SiteReview, HeroCardSettings, UserProfile, FacultyMember, SiteSettings } from './types';
import { INITIAL_COURSES, INITIAL_BOOKS, INITIAL_FATWAS, INITIAL_LIVE_CLASSES, INITIAL_REVIEWS } from './seed-data';
import { formatImageUrl } from './utils';

export { INITIAL_COURSES, INITIAL_BOOKS, INITIAL_FATWAS, INITIAL_LIVE_CLASSES, INITIAL_REVIEWS };

const STORAGE_KEYS = {
  COURSES: 'nfa_courses_v1',
  BOOKS: 'nfa_books_v1',
  FATWAS: 'nfa_fatwas_v1',
  LIVE_CLASSES: 'nfa_live_v1',
  ORDERS: 'nfa_orders_v1',
  PROGRESS: 'nfa_progress_v1',
  CERTIFICATES: 'nfa_certificates_v1',
  USER: 'nfa_current_user_v1',
  USERS: 'nfa_users_list_v1',
  FACULTY: 'nfa_faculty_v1',
  SETTINGS: 'nfa_settings_v1',
};

export const INITIAL_FACULTY: FacultyMember[] = [
  {
    id: 'fac-1',
    name: 'Mufti Abdullah An-Noor',
    nameBn: 'মুফতী আব্দুল্লাহ আন-নূর',
    designation: 'প্রতিষ্ঠাতা পরিচালক ও প্রধান ফিকহ গবেষক',
    category: 'council',
    categoryLabelBn: 'গবেষণা পরিষদ',
    qualifications: 'উচ্চতর ইফতা (দারুল উলুম দেওবন্দ / আল-আজহার), বিশিষ্ট ইসলামিক আইন গবেষক',
    bio: 'ইসলামিক আধুনিক অর্থনীতি, কর্পোরেট ব্যবসা ও চিকিৎসাবিজ্ঞানের ফিকহি গবেষণায় ১৫+ বছরের অভিজ্ঞতা সম্পন্ন বিশিষ্ট ইসলামিক স্কলার।',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    email: 'noorfiqhaca@gmail.com',
    phone: '+8801855905185',
    order: 1
  },
  {
    id: 'fac-2',
    name: 'Dr. Mufti Muhammad Tariq',
    nameBn: 'ড. মুফতী মুহাম্মাদ তারিক',
    designation: 'শরীয়াহ উপদেষ্টা ও ইসলামিক ফাইন্যান্স কনসালটেন্ট',
    category: 'advisor',
    categoryLabelBn: 'উপদেষ্টা পরিষদ',
    qualifications: 'পিএইচডি ইন ইসলামিক ফাইন্যান্স, সদস্য: ইসলামিক ব্যাংক শরীয়াহ বোর্ড',
    bio: 'আন্তর্জাতিক ইসলামিক ব্যাংকিং কনসালটেন্ট, ফিনটেক ও হালাল বিনিয়োগ শাস্ত্রের বিশেষজ্ঞ প্রশিক্ষক।',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    email: 'tariq.finance@gmail.com',
    phone: '+8801855905185',
    order: 2
  },
  {
    id: 'fac-3',
    name: 'Mawlana Khalid Saifullah',
    nameBn: 'মাওলানা খালিদ সাইফুল্লাহ',
    designation: 'উসূলে ফিকহ বিভাগীয় প্রধান ও সিনিয়র উস্তায',
    category: 'faculty',
    categoryLabelBn: 'শিক্ষকবৃন্দ',
    qualifications: 'উসূলে হাদিস ও পাণ্ডুলিপি বিশারদ, সিনিয়র মুহাদ্দিস',
    bio: 'হানাফী মাযহাব, তুলনামূলক ফিকহ ও প্রাচীন ইসলামিক পাণ্ডুলিপির জটিল মাসআলার প্রাঞ্জল ও পদ্ধতিগত উপস্থাপক।',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    email: 'khalid.usul@gmail.com',
    phone: '+8801855905185',
    order: 3
  },
  {
    id: 'fac-4',
    name: 'Mufti Mahmudur Rahman',
    nameBn: 'মুফতী মাহমুদুর রহমান কাসেমী',
    designation: 'ফতোয়া গবেষক ও ইফতা প্রশিক্ষক',
    category: 'council',
    categoryLabelBn: 'গবেষণা পরিষদ',
    qualifications: 'তাখাসসুস ফিল ফিকহ ওয়াল ইফতা, ঢাকা',
    bio: 'পারিবারিক আইন, উত্তরাধিকার (ফারায়েজ) বণ্টন ও আধুনিক চুক্তি পদ্ধতির ফতোয়া প্রণয়নে বিশেষজ্ঞ।',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    email: 'mahmud.ifta@gmail.com',
    phone: '+8801855905185',
    order: 4
  }
];


export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'usr-admin-noor',
    name: 'মুফতী আব্দুল্লাহ আন-নূর (এডমিন)',
    email: 'noorfiqhaca@gmail.com',
    phone: '+8801855905185',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'admin',
    isSuperAdmin: true,
    joinedAt: '2025-10-01'
  },
  {
    uid: 'usr-scholar-1',
    name: 'মুফতী হাফিজুর রহমান কাসেমী',
    email: 'scholar@noorfiqh.com',
    phone: '+8801855905185',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    role: 'scholar',
    joinedAt: '2025-11-15'
  },
  {
    uid: 'usr-student-1',
    name: 'মুহাম্মদ মাহমুদুল হাসান',
    email: 'student@noorfiqh.com',
    phone: '01712345678',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    joinedAt: '2026-01-15'
  },
  {
    uid: 'usr-student-2',
    name: 'তারেক জামিল',
    email: 'tariq.ahmed@gmail.com',
    phone: '01911223344',
    role: 'student',
    joinedAt: '2026-02-01'
  },
  {
    uid: 'usr-student-3',
    name: 'ফাতিমা তুয জোহরা',
    email: 'fatima.zohra@gmail.com',
    phone: '01688776655',
    role: 'student',
    joinedAt: '2026-02-10'
  }
];


export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Noor Fiqh Academy',
  siteNameBn: 'নূর ফিকহ একাডেমি',
  tagline: 'জ্ঞান ও ফিকহের আলোয় জীবন পরিচালনা',
  logoType: 'symbol',
  logoImageUrl: '',
  logoSymbol: 'ن',
  logoSubtitle: 'NOOR FIQH ACADEMY',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61591404045439',
  whatsappNumber: '+8801855905185',
  email: 'noorfiqhaca@gmail.com',
  phone: '+8801855905185',
  address: 'Global Online Islamic Campus & Research Center, Dhaka, Bangladesh',
  heroTitleBn: 'সহিহ ইলম ও সমকালীন ফিকহের বিশুদ্ধ আলোকবর্তিকা',
  heroSubtitleBn: 'দৈনন্দিন ইবাদত, ব্যবসা-বাণিজ্য, পরিবার ও আধুনিক জীবনের প্রতিটি ক্ষেত্রে কোরআন ও সুন্নাহর প্রামাণ্য দিকনির্দেশনা শিখুন অভিজ্ঞ মুফতী ও ফিকহ বিশেষজ্ঞদের সান্নিধ্যে।',
  primaryColor: '#064e3b',
  accentColor: '#d97706',
  heroBgImage: '',
  heroBgOpacity: 25,
  heroCard: {
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
  },
  aboutPage: {
    titleBn: 'সহিহ সুন্নাহ ও নির্ভরযোগ্য ফিকহের আলোকবর্তিকা',
    subtitleBn: 'নূর ফিকহ একাডেমি অনলাইনে বিশুদ্ধ ইসলামী জ্ঞান বা \'ফরজে আইন ইলম\' অর্জনের একটি নির্ভরযোগ্য ও বিশ্বস্ত প্রতিষ্ঠান। বর্তমান ব্যস্ততার যুগে সর্বস্তরের মুসলিমদের জন্য ঘরে বসেেই শরীয়তের প্রয়োজনীয় জ্ঞান অর্জনের পথকে সুগম করার মহান ব্রত নিয়ে এই একাডেমির যাত্রা শুরু হয়েছে। প্রখ্যাত ইসলামী স্কলার মুফতী আম্মার বিন নূর-এর সুদক্ষ পরিচালনা ও প্রত্যক্ষ তত্ত্বাবধানে একাডেমিটি পরিচালিত হচ্ছে।\n\nআমরা বিশ্বাস করি, বিশুদ্ধ জ্ঞানই হলো আমলের পূর্বশর্ত। তাই কুরআন, সুন্নাহ এবং ফিকহী মাসায়েলের সঠিক ও নির্ভুল শিক্ষা অত্যন্ত সহজ ও সাবলীলভাবে সাধারণ মানুষের দোরগোড়ায় পৌঁছে দেওয়াই আমাদের মূল লক্ষ্য।',
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
  },
  notificationEnabled: true,
  notificationBadgeText: 'ভর্তি চলছে',
  notificationText: 'নূর ফিকহ একাডেমি নতুন ব্যাচ: ইবাদত ও সমকালীন ফিকহ মাস্টারকোর্স',
  notificationTimerEnabled: true,
  notificationTimerEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  privacyPolicyText: `১. তথ্যের সংগ্রহ ও ব্যবহার: নূর ফিকহ একাডেমিতে কোর্স ভর্তি, ফতোয়া জিজ্ঞাসা এবং কিতাব ক্রয়ের সময় আপনার নাম, মোবাইল নম্বর, ইমেইল এবং ডেলিভারি ঠিকানা প্রয়োজন অনুযায়ী সংগ্রহ করা হয়। আপনার সংগৃহীত তথ্য শুধুমাত্র একাডেমি পরিষেবা ও যোগাযোগ রক্ষার্থে ব্যবহৃত হবে।

২. ফতোয়া ও ব্যক্তিগত গোপনীয়তা: যেসব ফতোয়া প্রশ্নকারী "ব্যক্তিগত" হিসেবে জমা দেন, তা কোনো অবস্থাতেই পাবলিক আর্কাইভে প্রকাশ করা হয় না। শুধুমাত্র মুফতী প্যানেল ও সংশ্লিষ্ট প্রশ্নকারীই তা দেখতে পারবেন।

৩. আর্থিক লেনদেনের নিরাপত্তা: বিকাশ, নগদ বা ব্যাংক লেনদেনের তথ্যাদি সম্পূর্ণ নিরাপদে যাচাই করা হয় এবং কোনো সংবেদনশীল ব্যাংক পাসওয়ার্ড বা পিন কোড আমরা সংরক্ষণ করি না।`,
  termsText: `১. কোর্স ও কন্টেন্ট স্বত্বাধিকার: নূর ফিকহ একাডেমির সকল লেকচার ভিডিও, গবেষণা নোট এবং প্রকাশনার স্বত্বাধিকার সংরক্ষিত। অনুমতি ব্যতীত কোনো পাঠ্য উপাদান বাণিজ্যিক উদ্দেশ্যে পুনঃপ্রচার বা বিক্রি সম্পূর্ণ নিষিদ্ধ।

২. সনদপত্র প্রদান নীতিমালা: সার্টিফিকেট পাওয়ার জন্য প্রতিটি শিক্ষার্থীকে নির্ধারিত পাঠ্যক্রম সম্পন্ন করা এবং ন্যূনতম ৭০% নম্বর পেয়ে কুইজ/মূল্যায়ন পরীক্ষায় উত্তীর্ণ হতে হবে।

৩. রিফান্ড ও বাতিল নীতি: কোর্স শুরুর ৩ দিনের মধ্যে যুক্তিসঙ্গত কারণ সাপেক্ষে রিফান্ডের আবেদন করা যাবে। হার্ডকভার বই ক্ষতিগ্রস্ত অবস্থায় পৌঁছালে দ্রুত পরিবর্তন করে দেওয়া হবে।`,
  faqs: [
    {
      id: 'faq-1',
      q: 'নূর ফিকহ একাডেমির কোর্সগুলো কি সম্পূর্ণ অনলাইনভিত্তিক?',
      a: 'হ্যাঁ, আমাদের সকল কোর্স অনলাইনভিত্তিক। আপনি বিশ্বের যেকোনো প্রান্ত থেকে কম্পিউটার, ল্যাপটপ বা স্মার্টফোনের মাধ্যমে আপনার সুবিধাজনক সময়ে লাইভ ক্লাস ও প্রি-রেকর্ডেড লেকচারে অংশ নিতে পারবেন।'
    },
    {
      id: 'faq-2',
      q: 'পেমেন্ট করার পর কিভাবে কোর্সে এক্সেস পাবো?',
      a: 'বিকাশ, নগদ বা রকেটের মাধ্যমে পেমেন্ট করে ট্রানজেকশন আইডি (TrxID) প্রদান করার পর আমাদের অ্যাডমিন টিম ১-২ ঘণ্টার মধ্যে যাচাই করে আপনার একাউন্ট সক্রিয় করে দেবে। এরপর লগইন করে সাথে সাথে ড্যাশবোর্ডে পাঠ্যসূচি দেখা যাবে।'
    },
    {
      id: 'faq-3',
      q: 'কোর্স শেষে কি সার্টিফিকেট প্রদান করা হবে?',
      a: 'হ্যাঁ, প্রতিটি কোর্সের সকল লেকচার ও মূল্যায়ন পরীক্ষা সফলভাবে সম্পন্ন করার পর নূর ফিকহ একাডেমি কর্তৃক ইউনিক ট্র্যাকিং নম্বরযুক্ত ভেরিফায়েড ডিজিটাল সনদপত্র দেওয়া হবে, যা আমাদের ওয়েবসাইটে যেকোনো সময় যাচাই করা সম্ভব।'
    },
    {
      id: 'faq-4',
      q: 'ফতোয়া বা মাসআলা জিজ্ঞাসা করতে কি কোনো ফি দিতে হয়?',
      a: 'না, সাধারণ ফতোয়া ও দ্বীনি মাসআলা জিজ্ঞাসা সম্পূর্ণ ফ্রি। আমাদের ওয়েবসাইটে প্রশ্ন জমা দিয়ে ট্র্যাকিং কোড সংরক্ষণ করলেই মুফতী সাহেবের স্বাক্ষরিত উত্তর পাওয়া যাবে।'
    },
    {
      id: 'faq-5',
      q: 'মুদ্রিত হার্ডকভার বই কীভাবে সংগ্রহ করব?',
      a: 'আমাদের প্রকাশনা শাখা থেকে বই অর্ডার করলে সারা দেশে ক্যাশ অন ডেলিভারি (কুরিয়ার সার্ভিস)-এর মাধ্যমে ২-৩ দিনের মধ্যে আপনার ঠিকানায় বই পৌঁছে দেওয়া হবে।'
    }
  ],
  metaPixelId: '',
  gaMeasurementId: '',
  gtmId: '',
  orderNotificationEnabled: true,
  orderNotificationEmail: 'noorfiqhaca@gmail.com',
  formSubmitEndpoint: ''
};


// Safe LocalStorage Helper
function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

export const AppStore = {
  // Courses
  getCourses: (): Course[] => {
    const list = getLocal<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    return list.map(c => ({
      ...c,
      thumbnail: formatImageUrl(c.thumbnail),
      instructor: c.instructor ? { ...c.instructor, avatar: formatImageUrl(c.instructor.avatar) } : c.instructor
    }));
  },
  getCourseById: (id: string): Course | undefined => {
    const courses = AppStore.getCourses();
    return courses.find(c => c.id === id);
  },
  saveCourse: (course: Course): void => {
    const formatted: Course = {
      ...course,
      thumbnail: formatImageUrl(course.thumbnail),
      instructor: course.instructor ? { ...course.instructor, avatar: formatImageUrl(course.instructor.avatar) } : course.instructor
    };
    const courses = AppStore.getCourses();
    const index = courses.findIndex(c => c.id === course.id);
    if (index >= 0) {
      courses[index] = formatted;
    } else {
      courses.unshift(formatted);
    }
    setLocal(STORAGE_KEYS.COURSES, courses);
  },
  createCourse: (courseData: Omit<Course, 'id' | 'rating' | 'totalStudents'> & { rating?: number; totalStudents?: number }): Course => {
    const courses = AppStore.getCourses();
    const newCourse: Course = {
      ...courseData,
      thumbnail: formatImageUrl(courseData.thumbnail),
      instructor: courseData.instructor ? { ...courseData.instructor, avatar: formatImageUrl(courseData.instructor.avatar) } : courseData.instructor,
      id: 'course-' + Date.now(),
      rating: courseData.rating || 4.9,
      totalStudents: courseData.totalStudents || 120
    };
    courses.unshift(newCourse);
    setLocal(STORAGE_KEYS.COURSES, courses);
    return newCourse;
  },
  deleteCourse: (id: string): void => {
    const courses = AppStore.getCourses().filter(c => c.id !== id);
    setLocal(STORAGE_KEYS.COURSES, courses);
  },

  // Books
  getBooks: (): Book[] => {
    const list = getLocal<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    return list.map(b => ({
      ...b,
      coverImage: formatImageUrl(b.coverImage),
      gallery: b.gallery?.map(g => formatImageUrl(g))
    }));
  },
  getBookById: (id: string): Book | undefined => {
    return AppStore.getBooks().find(b => b.id === id);
  },
  saveBook: (book: Book): void => {
    const formatted: Book = {
      ...book,
      coverImage: formatImageUrl(book.coverImage),
      gallery: book.gallery?.map(g => formatImageUrl(g))
    };
    const books = AppStore.getBooks();
    const index = books.findIndex(b => b.id === book.id);
    if (index >= 0) {
      books[index] = formatted;
    } else {
      books.unshift(formatted);
    }
    setLocal(STORAGE_KEYS.BOOKS, books);
  },
  deleteBook: (id: string): void => {
    const books = AppStore.getBooks().filter(b => b.id !== id);
    setLocal(STORAGE_KEYS.BOOKS, books);
  },

  // Fatwas & Fiqh Consultation
  getFatwas: (): FatwaQuestion[] => {
    return getLocal<FatwaQuestion[]>(STORAGE_KEYS.FATWAS, INITIAL_FATWAS);
  },
  getFatwaById: (id: string): FatwaQuestion | undefined => {
    return AppStore.getFatwas().find(f => f.id === id || f.trackingCode === id);
  },
  getFatwaByTrackingCode: (code: string): FatwaQuestion | undefined => {
    return AppStore.getFatwas().find(f => f.trackingCode.toUpperCase() === code.toUpperCase());
  },
  createFatwa: (fatwa: Omit<FatwaQuestion, 'id' | 'trackingCode' | 'createdAt' | 'viewsCount' | 'helpfulCount' | 'status'>): FatwaQuestion => {
    const fatwas = AppStore.getFatwas();
    const randomCode = `NFA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newFatwa: FatwaQuestion = {
      ...fatwa,
      id: 'fatwa-' + Date.now(),
      trackingCode: randomCode,
      status: 'pending',
      viewsCount: 1,
      helpfulCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    fatwas.unshift(newFatwa);
    setLocal(STORAGE_KEYS.FATWAS, fatwas);
    return newFatwa;
  },
  addFatwaQuestion: (fatwa: Omit<FatwaQuestion, 'id' | 'trackingCode' | 'createdAt' | 'viewsCount' | 'helpfulCount' | 'status'>): FatwaQuestion => {
    return AppStore.createFatwa(fatwa);
  },
  answerFatwa: (fatwaId: string, answerData: { answer: string; references?: string; answeredBy?: string }): void => {
    const fatwas = AppStore.getFatwas();
    const index = fatwas.findIndex(f => f.id === fatwaId);
    if (index >= 0) {
      fatwas[index] = {
        ...fatwas[index],
        status: 'answered',
        answer: answerData.answer,
        references: answerData.references,
        answeredBy: answerData.answeredBy || 'মুফতী পরিষদ, নূর ফিকহ একাডেমি'
      };
      setLocal(STORAGE_KEYS.FATWAS, fatwas);
    }
  },
  updateFatwa: (fatwa: FatwaQuestion): void => {
    const fatwas = AppStore.getFatwas();
    const index = fatwas.findIndex(f => f.id === fatwa.id);
    if (index >= 0) {
      fatwas[index] = fatwa;
      setLocal(STORAGE_KEYS.FATWAS, fatwas);
    }
  },
  deleteFatwa: (id: string): void => {
    const fatwas = AppStore.getFatwas().filter(f => f.id !== id);
    setLocal(STORAGE_KEYS.FATWAS, fatwas);
  },

  // Live Classes
  getLiveClasses: (): LiveClass[] => {
    const list = getLocal<LiveClass[]>(STORAGE_KEYS.LIVE_CLASSES, INITIAL_LIVE_CLASSES);
    return list.map(cls => ({
      ...cls,
      thumbnail: formatImageUrl(cls.thumbnail),
      instructorAvatar: formatImageUrl(cls.instructorAvatar)
    }));
  },
  saveLiveClass: (cls: LiveClass): void => {
    const formatted: LiveClass = {
      ...cls,
      thumbnail: formatImageUrl(cls.thumbnail),
      instructorAvatar: formatImageUrl(cls.instructorAvatar)
    };
    const list = AppStore.getLiveClasses();
    const idx = list.findIndex(c => c.id === cls.id);
    if (idx >= 0) list[idx] = formatted;
    else list.unshift(formatted);
    setLocal(STORAGE_KEYS.LIVE_CLASSES, list);
  },
  deleteLiveClass: (id: string): void => {
    const list = AppStore.getLiveClasses().filter(c => c.id !== id);
    setLocal(STORAGE_KEYS.LIVE_CLASSES, list);
  },
  registerForLiveClass: (classId: string, userId: string): boolean => {
    const list = AppStore.getLiveClasses();
    const cls = list.find(c => c.id === classId);
    if (!cls) return false;
    const registered = cls.registeredUserIds || [];
    if (!registered.includes(userId)) {
      registered.push(userId);
      cls.registeredUserIds = registered;
      cls.enrolledStudentsCount = (cls.enrolledStudentsCount || 0) + 1;
      setLocal(STORAGE_KEYS.LIVE_CLASSES, list);
      return true;
    }
    return false;
  },

  // Orders & Enrollment
  getOrders: (): Order[] => {
    return getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
  },
  getUserOrders: (userId: string): Order[] => {
    return AppStore.getOrders().filter(o => o.userId === userId);
  },
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>): Order => {
    const orders = AppStore.getOrders();
    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    setLocal(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  },
  updateOrderStatus: (orderId: string, status: 'approved' | 'rejected' | 'pending'): void => {
    const orders = AppStore.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index >= 0) {
      orders[index].status = status;
      setLocal(STORAGE_KEYS.ORDERS, orders);

      // Auto-unlock course progress if approved
      if (status === 'approved' && orders[index].itemType === 'course') {
        AppStore.initUserProgress(orders[index].userId, orders[index].itemId);
      }

      // Auto-register live class if approved
      if (status === 'approved' && orders[index].itemType === 'live_class') {
        AppStore.registerForLiveClass(orders[index].itemId, orders[index].userId);
      }
    }
  },

  // User Progress
  getUserProgress: (userId: string, courseId?: string): UserProgress[] => {
    const all = getLocal<UserProgress[]>(STORAGE_KEYS.PROGRESS, []);
    let userProgs = all.filter(p => p.userId === userId);

    if (courseId) {
      userProgs = userProgs.filter(p => p.courseId === courseId);
    }

    // Sanity check progress percentages against actual course lesson counts
    userProgs.forEach(p => {
      const course = AppStore.getCourseById(p.courseId);
      if (course) {
        const total = course.lessons?.length || 1;
        const completedCount = p.completedLessons?.length || p.completedLessonIds?.length || 0;
        if (completedCount >= total || p.isCompleted) {
          p.progressPercentage = 100;
          p.isCompleted = true;
        } else if (completedCount > 0) {
          p.progressPercentage = Math.min(100, Math.round((completedCount / total) * 100));
        }
      }
    });

    return userProgs;
  },
  initUserProgress: (userId: string, courseId: string): UserProgress => {
    const all = getLocal<UserProgress[]>(STORAGE_KEYS.PROGRESS, []);
    const existing = all.find(p => p.userId === userId && p.courseId === courseId);
    if (existing) return existing;

    const newProgress: UserProgress = {
      userId,
      courseId,
      completedLessons: [],
      completedLessonIds: [],
      completedQuizzes: [],
      progressPercentage: 0,
      isCompleted: false,
      updatedAt: new Date().toISOString()
    };
    all.unshift(newProgress);
    setLocal(STORAGE_KEYS.PROGRESS, all);
    return newProgress;
  },
  markLessonComplete: (userId: string, courseId: string, lessonId: string, totalLessons?: number): UserProgress => {
    const all = getLocal<UserProgress[]>(STORAGE_KEYS.PROGRESS, []);
    let prog = all.find(p => p.userId === userId && p.courseId === courseId);
    const course = AppStore.getCourseById(courseId);
    const actualTotal = totalLessons || (course?.lessons?.length && course.lessons.length > 0 ? course.lessons.length : 1);

    if (!prog) {
      prog = {
        userId,
        courseId,
        completedLessons: [],
        completedLessonIds: [],
        completedQuizzes: [],
        progressPercentage: 0,
        isCompleted: false,
        updatedAt: new Date().toISOString()
      };
      all.push(prog);
    }
    if (!prog.completedLessons) prog.completedLessons = [];
    if (!prog.completedLessonIds) prog.completedLessonIds = [];

    if (!prog.completedLessons.includes(lessonId)) {
      prog.completedLessons.push(lessonId);
    }
    if (!prog.completedLessonIds.includes(lessonId)) {
      prog.completedLessonIds.push(lessonId);
    }

    const doneCount = prog.completedLessons.length;
    prog.progressPercentage = Math.min(100, Math.round((doneCount / actualTotal) * 100));
    if (doneCount >= actualTotal || prog.progressPercentage >= 100) {
      prog.progressPercentage = 100;
      prog.isCompleted = true;
    }
    prog.updatedAt = new Date().toISOString();
    setLocal(STORAGE_KEYS.PROGRESS, all);

    if (prog.isCompleted && course) {
      AppStore.issueCertificate(userId, 'শিক্ষার্থী', courseId, course.titleBn);
    }

    return prog;
  },

  completeCourseFully: (userId: string, courseId: string, userName?: string): UserProgress => {
    const all = getLocal<UserProgress[]>(STORAGE_KEYS.PROGRESS, []);
    let prog = all.find(p => p.userId === userId && p.courseId === courseId);
    const course = AppStore.getCourseById(courseId);
    const lessonIds = course?.lessons?.map(l => l.id) || ['l1'];

    if (!prog) {
      prog = {
        userId,
        courseId,
        completedLessons: lessonIds,
        completedLessonIds: lessonIds,
        completedQuizzes: [],
        progressPercentage: 100,
        isCompleted: true,
        updatedAt: new Date().toISOString()
      };
      all.push(prog);
    } else {
      prog.completedLessons = Array.from(new Set([...(prog.completedLessons || []), ...lessonIds]));
      prog.completedLessonIds = Array.from(new Set([...(prog.completedLessonIds || []), ...lessonIds]));
      prog.progressPercentage = 100;
      prog.isCompleted = true;
      prog.updatedAt = new Date().toISOString();
    }

    setLocal(STORAGE_KEYS.PROGRESS, all);

    if (course) {
      AppStore.issueCertificate(userId, userName || 'শিক্ষার্থী', courseId, course.titleBn);
    }

    return prog;
  },

  // Certificates
  getCertificates: (userId?: string): Certificate[] => {
    const initialCerts: Certificate[] = [
      {
        id: 'cert-1',
        certificateNumber: 'NFA-2025-0891',
        userId: 'student-demo',
        userName: 'আব্দুর রহমান',
        courseId: 'course-fiqh-usul',
        courseTitle: 'উচ্চতর উসূলে ফিকহ ও কাওয়াইদে ফিকহিয়্যাহ',
        grade: 'Mumtaz (Distinction)',
        issueDate: '১৫ জানুয়ারি, ২০২৫',
        verificationUrl: '/verify-certificate?id=NFA-2025-0891'
      }
    ];
    const all = getLocal<Certificate[]>(STORAGE_KEYS.CERTIFICATES, initialCerts);
    if (userId) return all.filter(c => c.userId === userId);
    return all;
  },
  getCertificateById: (certNumberOrId: string): Certificate | undefined => {
    return AppStore.getCertificates().find(c => c.id === certNumberOrId || c.certificateNumber === certNumberOrId);
  },
  getCertificateByNumber: (certNum: string): Certificate | undefined => {
    return AppStore.getCertificates().find(c => c.certificateNumber.toUpperCase() === certNum.toUpperCase());
  },
  issueCertificate: (userId: string, userName: string, courseId: string, courseTitle: string, batch?: string, grade?: string, certificateCopyUrl?: string): Certificate => {
    const certs = AppStore.getCertificates();
    const existing = certs.find(c => c.userId === userId && c.courseId === courseId);
    
    const course = AppStore.getCourseById(courseId);
    const settings = AppStore.getSettings();
    const templateCopyUrl = certificateCopyUrl || course?.certificateTemplateUrl || settings?.certificateTemplateUrl || undefined;

    if (existing) {
      if (templateCopyUrl && !existing.certificateCopyUrl) {
        existing.certificateCopyUrl = templateCopyUrl;
        existing.customPdfUrl = templateCopyUrl;
        AppStore.saveCertificate(existing);
      }
      return existing;
    }

    let prefix = 'FIQH';
    const lowerId = courseId.toLowerCase();
    const lowerTitle = courseTitle.toLowerCase();
    if (lowerId.includes('usul') || lowerTitle.includes('উসূলে ফিকহ')) prefix = 'USUL';
    else if (lowerId.includes('inheritance') || lowerTitle.includes('ফারায়েজ')) prefix = 'FARA';
    else if (lowerId.includes('muamalat') || lowerTitle.includes('লেনদেন')) prefix = 'MUAM';
    else if (lowerId.includes('fatwa') || lowerTitle.includes('ফতোয়া')) prefix = 'FATW';
    else if (lowerId.includes('hadith') || lowerTitle.includes('হাদিস')) prefix = 'HAD';

    const courseCertsCount = certs.filter(c => c.courseId === courseId).length;
    const seqNum = String(courseCertsCount + 1).padStart(3, '0');
    const batchName = batch || 'B1';
    const year = new Date().getFullYear();

    const certNum = `${prefix}-${batchName}-${year}-${seqNum}`;
    const newCert: Certificate = {
      id: 'cert-' + Date.now(),
      certificateNumber: certNum,
      userId,
      userName,
      courseId,
      courseTitle,
      batch: batchName,
      grade: grade || 'Distinction (Mumtaz)',
      issueDate: new Date().toISOString().split('T')[0],
      verificationUrl: `/verify-certificate?id=${certNum}`,
      certificateCopyUrl: templateCopyUrl,
      customPdfUrl: templateCopyUrl
    };
    certs.unshift(newCert);
    setLocal(STORAGE_KEYS.CERTIFICATES, certs);
    return newCert;
  },
  saveCertificate: (cert: Certificate): void => {
    const certs = AppStore.getCertificates();
    const idx = certs.findIndex(c => c.id === cert.id);
    if (idx >= 0) {
      certs[idx] = cert;
    } else {
      certs.unshift(cert);
    }
    setLocal(STORAGE_KEYS.CERTIFICATES, certs);
  },
  deleteCertificate: (id: string): void => {
    const certs = AppStore.getCertificates().filter(c => c.id !== id);
    setLocal(STORAGE_KEYS.CERTIFICATES, certs);
  },

  // Site Reviews
  getReviews: (): SiteReview[] => {
    return getLocal<SiteReview[]>(STORAGE_KEYS.SETTINGS + '_reviews', INITIAL_REVIEWS);
  },
  saveReview: (review: SiteReview): void => {
    const reviews = AppStore.getReviews();
    const idx = reviews.findIndex(r => r.id === review.id);
    if (idx >= 0) reviews[idx] = review;
    else reviews.unshift(review);
    setLocal(STORAGE_KEYS.SETTINGS + '_reviews', reviews);
  },
  deleteReview: (id: string): void => {
    const reviews = AppStore.getReviews().filter(r => r.id !== id);
    setLocal(STORAGE_KEYS.SETTINGS + '_reviews', reviews);
  },
  deleteOrder: (id: string): void => {
    const orders = AppStore.getOrders().filter(o => o.id !== id);
    setLocal(STORAGE_KEYS.ORDERS, orders);
  },

  // Users & Roles Management
  getUsers: (): UserProfile[] => {
    return getLocal<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  getUserById: (uid: string): UserProfile | undefined => {
    return AppStore.getUsers().find(u => u.uid === uid);
  },
  getUserByEmail: (email: string): UserProfile | undefined => {
    return AppStore.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  saveUser: (user: UserProfile): void => {
    const users = AppStore.getUsers();
    const idx = users.findIndex(u => u.uid === user.uid || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.unshift(user);
    }
    setLocal(STORAGE_KEYS.USERS, users);
  },
  updateUserRole: (userIdOrEmail: string, newRole: 'student' | 'scholar' | 'admin'): UserProfile | null => {
    const users = AppStore.getUsers();
    const idx = users.findIndex(u => u.uid === userIdOrEmail || u.email.toLowerCase() === userIdOrEmail.toLowerCase());
    if (idx >= 0) {
      // If super admin email, protect from demoting super admin
      if (users[idx].email.toLowerCase() === 'noorfiqhaca@gmail.com' && newRole !== 'admin') {
        return users[idx]; // Cannot demote super admin
      }
      users[idx] = { ...users[idx], role: newRole };
      setLocal(STORAGE_KEYS.USERS, users);
      return users[idx];
    }
    return null;
  },
  deleteUser: (userId: string): void => {
    const users = AppStore.getUsers();
    const target = users.find(u => u.uid === userId);
    if (target?.email.toLowerCase() === 'noorfiqhaca@gmail.com') {
      return; // Cannot delete super admin
    }
    const filtered = users.filter(u => u.uid !== userId);
    setLocal(STORAGE_KEYS.USERS, filtered);
  },

  // Faculty & Research Council Management
  getFaculty: (): FacultyMember[] => {
    const list = getLocal<FacultyMember[]>(STORAGE_KEYS.FACULTY, INITIAL_FACULTY);
    return list.map(member => {
      let phone = member.phone;
      if (!phone || phone.includes('01788876206') || phone.includes('017XXXXXXXX')) {
        phone = '+8801855905185';
      }
      return {
        ...member,
        phone,
        avatar: formatImageUrl(member.avatar)
      };
    });
  },
  saveFacultyMember: (member: FacultyMember): void => {
    const formatted: FacultyMember = {
      ...member,
      avatar: formatImageUrl(member.avatar)
    };
    const list = AppStore.getFaculty();
    const idx = list.findIndex(m => m.id === member.id);
    if (idx >= 0) {
      list[idx] = formatted;
    } else {
      list.push(formatted);
    }
    setLocal(STORAGE_KEYS.FACULTY, list);
  },
  deleteFacultyMember: (id: string): void => {
    const list = AppStore.getFaculty().filter(m => m.id !== id);
    setLocal(STORAGE_KEYS.FACULTY, list);
  },

  // Site Settings
  getSettings: (): SiteSettings => {
    const settings = getLocal<SiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    if (settings.whatsappNumber === '+8801788876206' || settings.whatsappNumber === '8801788876206' || !settings.whatsappNumber) {
      settings.whatsappNumber = '+8801855905185';
    }
    if (settings.phone === '+8801788876206' || settings.phone === '8801788876206' || !settings.phone) {
      settings.phone = '+8801855905185';
    }
    settings.logoImageUrl = formatImageUrl(settings.logoImageUrl);
    settings.heroBgImage = formatImageUrl(settings.heroBgImage);
    if (settings.heroCard) {
      settings.heroCard.iconImage = formatImageUrl(settings.heroCard.iconImage);
    }
    return settings;
  },
  saveSettings: (settings: SiteSettings): void => {
    const formatted: SiteSettings = {
      ...settings,
      logoImageUrl: formatImageUrl(settings.logoImageUrl),
      heroBgImage: formatImageUrl(settings.heroBgImage),
      heroCard: settings.heroCard ? {
        ...settings.heroCard,
        iconImage: formatImageUrl(settings.heroCard.iconImage)
      } : settings.heroCard
    };
    setLocal(STORAGE_KEYS.SETTINGS, formatted);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('noorfiqh_settings_updated', { detail: formatted }));
    }
  }
};


