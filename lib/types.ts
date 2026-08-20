export interface Course {
  id: string;
  title: string;
  titleBn: string;
  category: string;
  categoryLabelBn: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  previewVideoUrl?: string;
  badge?: string;
  level: string;
  levelBn: string;
  duration: string;
  totalLessons: number;
  instructor: {
    id: string;
    name: string;
    nameBn: string;
    title: string;
    roleBn: string;
    avatar: string;
    bio: string;
    institution?: string;
  };
  objectives: string[];
  requirements?: string[];
  lessons: Lesson[];
  status?: 'published' | 'draft';
  rating: number;
  totalStudents: number;
  hasCertificate?: boolean;
  certificateTemplateUrl?: string;
  createdAt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  titleBn?: string;
  description?: string;
  videoUrl?: string;
  duration: string;
  isFreePreview?: boolean;
  pdfNotesUrl?: string;
  notes?: string;
  resources?: { name: string; url: string; size?: string }[];
  quiz?: Quiz;
}

export interface Book {
  id: string;
  title: string;
  titleBn: string;
  author: string;
  authorBn: string;
  category: string;
  categoryBn: string;
  description: string;
  coverImage: string;
  gallery?: string[];
  hasPdf: boolean;
  pdfPrice: number;
  pdfUrl?: string;
  previewPdfUrl?: string;
  hasHardcover: boolean;
  hardcoverPrice: number;
  inStock: boolean;
  pages: number;
  language: string;
  publisher: string;
  tableOfContents?: { chapter: string; page: number }[];
  authorBio?: string;
  status?: 'published' | 'draft';
  rating: number;
  createdAt?: string;
}

export interface FatwaQuestion {
  id: string;
  trackingCode: string;
  questionTitle: string;
  questionDetail?: string;
  questionBody?: string;
  category: string;
  categoryBn: string;
  askerName?: string;
  askedByName?: string;
  askerEmail?: string;
  askedByEmail?: string;
  askerPhone?: string;
  askedByPhone?: string;
  isPrivate: boolean;
  status: 'answered' | 'pending' | 'rejected';
  answer?: string;
  answerText?: string;
  answeredBy?: string;
  answeredByScholar?: {
    name: string;
    title: string;
  };
  references?: string | string[];
  viewsCount?: number;
  helpfulCount?: number;
  createdAt: string;
}

export interface LiveClass {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  instructor: string;
  instructorAvatar?: string;
  startTime: string;
  duration: string;
  price: number;
  thumbnail: string;
  meetingLink: string;
  platform: 'Zoom' | 'Google Meet' | 'YouTube Live';
  status: 'upcoming' | 'live' | 'completed';
  enrolledStudentsCount: number;
  targetCapacity?: number;
  registeredUserIds?: string[];
  createdAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  itemType: 'course' | 'book' | 'live_class';
  itemId: string;
  itemTitle: string;
  amount: number;
  purchaseType?: 'pdf' | 'hardcover' | 'full_access';
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'card' | 'cod' | 'manual';
  trxId?: string;
  paymentPhone?: string;
  shippingAddress?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface UserProgress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  completedLessonIds?: string[];
  completedQuizzes: string[];
  lastAccessedLessonId?: string;
  progressPercentage: number;
  isCompleted: boolean;
  certificateId?: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  courseId?: string;
  lessonId?: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'written';
  question: string;
  questionBn?: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  marks: number;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  batch?: string;
  grade?: string;
  issueDate: string;
  verificationUrl: string;
  qrCodeUrl?: string;
  certificateCopyUrl?: string;
  customPdfUrl?: string;
}

export interface SiteReview {
  id: string;
  name: string;
  nameBn?: string;
  role: string;
  location?: string;
  avatar?: string;
  rating: number;
  content: string;
  courseTitle?: string;
  createdAt?: string;
}

export interface HeroCardSettings {
  enabled: boolean;
  arabicSymbol?: string;
  iconImage?: string;
  badgeText: string;
  title: string;
  subtitle: string;
  features: string[];
  buttonText: string;
  buttonLink: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'student' | 'admin' | 'scholar';
  joinedAt: string;
  isSuperAdmin?: boolean;
}

export interface FacultyMember {
  id: string;
  name: string;
  nameBn: string;
  designation: string;
  category: 'council' | 'faculty' | 'advisor';
  categoryLabelBn?: string;
  bio: string;
  qualifications?: string;
  avatar: string;
  email?: string;
  phone?: string;
  order?: number;
  createdAt?: string;
}

export interface AboutCard {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  badge?: string;
}

export interface AboutPageSettings {
  titleBn: string;
  subtitleBn: string;
  cards: AboutCard[];
}

export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

export interface SiteSettings {
  siteName: string;
  siteNameBn: string;
  tagline: string;
  logoType?: 'symbol' | 'image';
  logoImageUrl?: string;
  logoSymbol?: string;
  logoSubtitle?: string;
  facebookUrl: string;
  whatsappNumber: string;
  email: string;
  phone: string;
  address: string;
  heroTitleBn: string;
  heroSubtitleBn: string;
  primaryColor: string;
  accentColor: string;
  heroBgImage?: string;
  heroBgOpacity?: number;
  heroCard?: HeroCardSettings;
  aboutPage?: AboutPageSettings;
  privacyPolicyText?: string;
  termsText?: string;
  faqs?: FaqItem[];
  metaPixelId?: string;
  gaMeasurementId?: string;
  gtmId?: string;
  certificateTemplateUrl?: string;
  notificationEnabled?: boolean;
  notificationBadgeText?: string;
  notificationText?: string;
  notificationLink?: string;
  notificationTimerEnabled?: boolean;
  notificationTimerEnd?: string;
  orderNotificationEnabled?: boolean;
  orderNotificationEmail?: string;
  formSubmitEndpoint?: string;
}




