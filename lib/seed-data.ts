import { Course, Book, FatwaQuestion, LiveClass, SiteReview } from './types';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'fiqh-ibadat-mastery',
    title: 'Comprehensive Fiqh of Ibadat (তাহারা ও সালাত থেকে হজ)',
    titleBn: 'তাহারা, সালাত, সাওম, যাকাত ও হজের পূর্ণাঙ্গ ফিকহ প্রশিক্ষণ',
    category: 'ibadat',
    categoryLabelBn: 'ইবাদত ও তাহরাত',
    shortDescription: 'সহিহ সুন্নাহ ও নির্ভরযোগ্য ফিকহি মূলনীতির আলোকে দৈনন্দিন ইবাদতের মাসআলা-মাসায়েল ও বিশুদ্ধ প্রশিক্ষণ।',
    description: `এই কোর্সে দৈনন্দিন তাহরাত (পবিত্রতা), সালাত (নামাজ), সাওম (রোজা), যাকাত হিসাব ও বিতরণ এবং হজের মৌলিক ও সূক্ষ্ম মাসআলাগুলো দলীলসহ সহজ-সরল প্রাঞ্জল ভাষায় শেখানো হবে। 
    
কোর্সটিতে রয়েছে:
- অযু, গোসল, তায়াম্মুম ও মহিলাদের বিশেষ মাসআলা
- নামাজের আরকান, ওয়াজিবাত, সুন্নাত ও সাহু সেজদার বিধান
- নামাজের আধুনিক চিকিৎসা ও ভ্রমণের বিধান (মুসাফিরের নামাজ)
- আধুনিক জাকাত ক্যালকুলেশন (শেয়ার, গোল্ড, প্রভিডেন্ট ফান্ড, ক্রিপ্টো)
- সাওমের আধুনিক চিকিৎসা সংক্রান্ত মাসআলা (ইনহেলার, ইনজেকশন, ড্রপ)`,
    price: 1200,
    originalPrice: 2000,
    thumbnail: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80',
    previewVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    badge: 'সবচেয়ে জনপ্রিয়',
    level: 'All Levels',
    levelBn: 'সকল স্তরের জন্য',
    duration: '১৬ সপ্তাহ (২৪ ঘণ্টা)',
    totalLessons: 18,
    rating: 4.9,
    totalStudents: 1450,
    hasCertificate: true,
    instructor: {
      id: 'mufti-abdullah-noor',
      name: 'Mufti Abdullah Al-Noor',
      nameBn: 'মুফতী আব্দুল্লাহ আন-নূর',
      title: 'Senior Fiqh Researcher & Muhaddith',
      roleBn: 'প্রধান ফিকহ গবেষক ও মুফতী, নূর ফিকহ একাডেমি',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'দারুল উলুম দেওবন্দ ও আল-আজহার বিশ্ববিদ্যালয় থেকে ইফতা ও ইসলামিক আইনশাস্ত্রে উচ্চতর ডিগ্রিধারী। গত ১৫ বছর ধরে ইসলামিক বিচার ব্যবস্থা ও ফিকহি গবেষণায় নিয়োজিত।',
      institution: 'Darul Uloom Deoband / Al-Azhar'
    },
    objectives: [
      'বিশুদ্ধভাবে তাহরাত ও নামাজ আদায়ের সকল খুঁটিনাটি বিধান জানা',
      'দৈনন্দিন ভুলত্রুটি ও সাহু সেজদার সঠিক সমাধান শেখা',
      'আধুনিক যুগে যাকাতের নিখুঁত হিসাব বের করতে পারা',
      'রমজান ও নফল রোজার সমকালীন মেডিকেল মাসআলা সমাধান করা',
      'কোর্স শেষে নূর ফিকহ একাডেমি ভেরিফায়েড সার্টিফিকেট লাভ'
    ],
    requirements: [
      'ইসলামিক বিধান শেখার আন্তরিক আগ্রহ',
      'স্মার্টফোন বা কম্পিউটার ও ইন্টারনেট সংযোগ'
    ],
    lessons: [
      {
        id: 'l1-taharah-intro',
        title: '১. তাহরাত ও পবিত্রতার গুরুত্ব এবং পানির প্রকারভেদ',
        titleBn: 'তাহরাত ও পবিত্রতার মূলনীতি',
        description: 'বিশুদ্ধ পানি, অপবিত্রতা দূরীকরণের সঠিক নিয়ম ও নাপাকির প্রকারভেদ।',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '৪৫ মিনিট',
        isFreePreview: true
      },
      {
        id: 'l2-wudu-ghusl',
        title: '২. অযু ও গোসলের ফরজ, সুন্নত এবং সাধারণ ভুলত্রুটি',
        titleBn: 'অযু ও গোসলের পূর্ণাঙ্গ পদ্ধতি',
        description: 'অযুর মাকরূহাত ও গোসল ভঙ্গের কারণসমূহ বিস্তারিত ব্যাখ্যা।',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '৫০ মিনিট',
        isFreePreview: false
      },
      {
        id: 'l3-salah-fard-wajib',
        title: '৩. সালাতের ফরজ, ওয়াজিব ও সাহু সেজদার নিয়ম',
        titleBn: 'নামাজের রুকনসমূহ',
        description: 'নামাজে যেসকল কারণে নামাজ নষ্ট হয় এবং কখন সাহু সেজদা আবশ্যক হয়।',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '৫৫ মিনিট',
        isFreePreview: false
      },
      {
        id: 'l4-traveler-sick-salah',
        title: '৪. মুসাফির ও অসুস্থ ব্যক্তির নামাজের সহজ বিধান',
        titleBn: 'কসর ও জম সংক্রান্ত মাসআলা',
        description: 'ভ্রমণে দূরত্ব নির্ধারণ ও অসুস্থ ব্যক্তির বসে বা ইশারায় নামাজ আদায়ের পদ্ধতি।',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '৪০ মিনিট',
        isFreePreview: false
      },
      {
        id: 'l5-zakat-calculation',
        title: '৫. আধুনিক যাকাত হিসাব: স্বর্ণ, ক্যাশ, প্রভিডেন্ট ফান্ড ও ব্যবসা',
        titleBn: 'যাকাতের আধুনিক হিসাবরক্ষণ',
        description: 'নিসাব নির্ধারণ, ঋণ বাদ দেওয়া ও যাকাত বণ্টনের সঠিক খাত।',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '৬০ মিনিট',
        isFreePreview: false
      },
      {
        id: 'l6-sawm-modern-issues',
        title: '৬. রোজা ও সমকালীন চিকিৎসা সংক্রান্ত ফিকহ',
        titleBn: 'সাওমের আধুনিক সমাধান',
        description: 'স্যালাইন, টিকা, ব্লাড টেস্ট, ডেন্টাল ট্রিটমেন্টে রোজার বিধান।',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '৪৮ মিনিট',
        isFreePreview: false
      }
    ],
    status: 'published'
  },
  {
    id: 'islamic-finance-muamalat',
    title: 'Islamic Finance, Halal Earning & Modern Muamalat',
    titleBn: 'ইসলামিক অর্থনীতি, হালাল উপার্জন ও আধুনিক ব্যবসা-বাণিজ্যের ফিকহ',
    category: 'muamalat',
    categoryLabelBn: 'মুয়ামালাত ও ইসলামিক ফাইন্যান্স',
    shortDescription: 'ব্যবসা-বাণিজ্য, চাকরি, ফ্রিল্যান্সিং, শেয়ার মার্কেট, ই-কমার্স ও ক্রিপ্টোকারেন্সির হালাল-হারাম বিচার।',
    description: `আধুনিক যুগে কীভাবে আপনার উপার্জনকে ১০০% হালাল রাখবেন এবং রিবা (সুদ), কিমার (জুয়া), গারার (অনিশ্চয়তা) থেকে মুক্ত থাকবেন তার বিস্তারিত ফিকহি বিশ্লেষণ।
    
কোর্সের মূল বিষয়বস্তু:
- বাই ও বিক্রির মৌলিক শর্ত ও অবৈধ চুক্তির রূপ
- ফ্রিল্যান্সিং ও অনলাইন সার্ভিসের হালাল-হারামের নীতিমালা
- শেয়ার বাজারে বিনিয়োগের শরীয়াহ স্ক্রীনিং ক্রাইটেরিয়া
- ড্রপশিপিং, এফিলিয়েট মার্কেটিং ও এমএলএম এর বিধান
- ইসলামিক ব্যাংকিং ও প্রচলিত সুদী ঋণের পার্থক্য`,
    price: 1500,
    originalPrice: 2500,
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    badge: 'ক্যারিয়ার ও ব্যবসা',
    level: 'Intermediate',
    levelBn: 'মধ্যবর্তী স্তর',
    duration: '১২ সপ্তাহ (১৮ ঘণ্টা)',
    totalLessons: 14,
    rating: 4.95,
    totalStudents: 980,
    hasCertificate: true,
    instructor: {
      id: 'dr-muhammad-tariq',
      name: 'Dr. Mufti Muhammad Tariq',
      nameBn: 'ড. মুফতী মুহাম্মাদ তারিক',
      title: 'PhD in Islamic Economics, Shariah Advisor',
      roleBn: 'শরীয়াহ উপদেষ্টা ও গবেষক',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      bio: 'ইসলামিক ফাইন্যান্স ও আধুনিক ব্যবসায়িক চুক্তিতে আন্তর্জাতিক খ্যাতিসম্পন্ন শরীয়াহ বোর্ডের সদস্য।',
      institution: 'International Islamic University'
    },
    objectives: [
      'ব্যবসা ও চুক্তির শরয়ী শর্তাবলি রপ্ত করা',
      'সুদ, জুয়া ও ধোঁকা থেকে ব্যবসা ও বিনিয়োগ সুরক্ষিত রাখা',
      'শেয়ার মার্কেট ও আধুনিক ডিজিটাল পেমেন্টের বিধান জানা',
      'হালাল উপার্জনের বরকত ও আর্থিক জীবনের ভারসাম্য রক্ষা'
    ],
    requirements: ['মৌলিক দ্বীনি চেতনা', 'ব্যবসা বা আর্থিক কর্মকাণ্ডের প্রতি আগ্রহ'],
    lessons: [
      {
        id: 'm1-riba-types',
        title: '১. সুদের স্বরূপ ও আধুনিক ব্যাংকিংয়ের বিকল্প',
        titleBn: 'সুদের প্রকারভেদ ও ভয়াবহতা',
        description: 'রিবা আল-ফদল ও রিবা আন-নাসিয়া এবং আধুনিক ঋণ ব্যবস্থা।',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '৫০ মিনিট',
        isFreePreview: true
      },
      {
        id: 'm2-freelancing-ecom',
        title: '২. ফ্রিল্যান্সিং, ড্রপশিপিং ও ই-কমার্সে হালাল-হারাম',
        titleBn: 'অনলাইন ব্যবসার শরয়ী বিধিবিধান',
        description: 'মালিকানা ছাড়া বিক্রি ও অনলাইন সার্ভিসের চুক্তি।',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '৪৫ মিনিট',
        isFreePreview: false
      },
      {
        id: 'm3-stocks-investing',
        title: '৩. শেয়ার বাজার বিনিয়োগ ও শরীয়াহ ফিল্টারিং',
        titleBn: 'স্টক মার্কেট ও মিউচুয়াল ফান্ড',
        description: 'হালাল স্টক বাছাইয়ের আন্তর্জাতিক মানদণ্ড (AAOIFI Standard)।',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '৫৫ মিনিট',
        isFreePreview: false
      }
    ],
    status: 'published'
  },
  {
    id: 'nikah-family-fiqh',
    title: 'Fiqh of Marriage, Family & Inheritance (নিকাহ, তালাক ও মিরাস)',
    titleBn: 'বিবাহ, দাম্পত্য অধিকার, তালাক ও ফারায়েজ (উত্তরাধিকার বন্টন)',
    category: 'family',
    categoryLabelBn: 'পারিবারিক ও সামাজিক ফিকহ',
    shortDescription: 'একটি সুখী ইসলামিক পরিবার গঠনের আইনি ভিত্তি, মোহরানা, ভরণপোষণ এবং কোরআনিক ফারায়েজ বণ্টন।',
    description: `পরিবার একটি সমাজ ও সভ্যতার মেরুদণ্ড। এই কোর্সে বিস্তারিত আলোচনা রয়েছে:
- পাত্র-পাত্রী নির্বাচন ও শরীয়াহসম্মত বিয়ের প্রস্তাব
- মোহরানার সঠিক বিধান ও স্ত্রীর অধিকার
- দাম্পত্য কলহের শরয়ী সমাধান ও তালাকের ভুল ধারণা খণ্ডন
- কোরআন ও সুন্নাহ মোতাবেক ফারায়েজ (উত্তরাধিকার সম্পত্তি) বণ্টনের হাতে-কলমে হিসাব।`,
    price: 999,
    originalPrice: 1600,
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    badge: 'পারিবারিক জীবন',
    level: 'Beginner',
    levelBn: 'প্রাথমিক থেকে উচ্চতর',
    duration: '১০ সপ্তাহ (১৫ ঘণ্টা)',
    totalLessons: 12,
    rating: 4.88,
    totalStudents: 820,
    hasCertificate: true,
    instructor: {
      id: 'mufti-abdullah-noor',
      name: 'Mufti Abdullah Al-Noor',
      nameBn: 'মুফতী আব্দুল্লাহ আন-নূর',
      title: 'Senior Fiqh Researcher & Muhaddith',
      roleBn: 'প্রধান ফিকহ গবেষক ও মুফতী, নূর ফিকহ একাডেমি',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'দারুল উলুম দেওবন্দ ও আল-আজহার বিশ্ববিদ্যালয় থেকে ইফতা ও ইসলামিক আইনশাস্ত্রে উচ্চতর ডিগ্রিধারী।',
      institution: 'Darul Uloom Deoband / Al-Azhar'
    },
    objectives: [
      'সুন্নাহসম্মত বিয়ে ও দেনমোহরের হিসাব স্পষ্ট করা',
      'দাম্পত্য জীবনের অধিকার ও দায়িত্ব বোঝা',
      'তালাকের কুফল ও শরীয়াহসম্মত বিকল্প পথ জানা',
      'উত্তরাধিকার সম্পত্তি ফারায়েজ নিয়মে বন্টন শেখা'
    ],
    requirements: ['প্রাপ্তবয়স্ক যে কোনো মুসলিম ভাই ও বোন'],
    lessons: [
      {
        id: 'f1-nikah-rukn',
        title: '১. নিকাহের রুকন, প্রস্তাব ও মোহর নির্ধারণ',
        titleBn: 'বিয়ের আইনি ও শরয়ী শর্ত',
        description: 'অভিভাবকের সম্মতি, সাক্ষী এবং মোহরে ফাতেমীর তাৎপর্য।',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '৪০ মিনিট',
        isFreePreview: true
      },
      {
        id: 'f2-farayez-math',
        title: '২. ফারায়েজের গাণিতিক হিসাব ও অংশীদার বণ্টন',
        titleBn: 'সম্পত্তি বণ্টন ও ওয়ারিশগণের অংশ',
        description: 'জাবিল ফুরুদ ও আসাবা শ্রেণির হিসাব প্রণালী।',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '৬০ মিনিট',
        isFreePreview: false
      }
    ],
    status: 'published'
  },
  {
    id: 'usul-al-fiqh-foundations',
    title: 'Usul al-Fiqh & Methodology of Ijtihad (উসূলে ফিকহ ও ফতোয়া শাস্ত্র)',
    titleBn: 'উসূলে ফিকহ ও ইজতিহাদ নীতিবিজ্ঞান পরিচিতি',
    category: 'usul',
    categoryLabelBn: 'উসূলে ফিকহ ও শাস্ত্রীয় জ্ঞান',
    shortDescription: 'কোরআন ও হাদিস থেকে কীভাবে ফিকহি হুকুম আহরণ করা হয় তার গভীর শাস্ত্রীয় মূলনীতি ও ফিকহ শাস্ত্রের ইতিহাস।',
    description: `উসূলে ফিকহ হলো ইসলামিক আইনের মেথোডোলজি। 
    
আলোচিত বিষয়:
- আল-আম, আল-খাস, মুতলাক, মুকাইয়াদ, নাসিখ ও মানসুখ
- কিয়াস, ইজমা, ইস্তিহসান ও মাসলাহা মুরসালাহ
- চার ইমামের ফিকহি পদ্ধতি ও মতভেদের পেছনের যৌক্তিক কারণ
- সমকালীন আধুনিক সমস্যায় ফতোয়া প্রদানের উসূল।`,
    price: 1800,
    originalPrice: 3000,
    thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d0279c6d?auto=format&fit=crop&w=1200&q=80',
    badge: 'উচ্চতর পাঠ্যক্রম',
    level: 'Advanced',
    levelBn: 'উচ্চতর স্তর',
    duration: '২০ সপ্তাহ (৩০ ঘণ্টা)',
    totalLessons: 20,
    rating: 4.98,
    totalStudents: 540,
    hasCertificate: true,
    instructor: {
      id: 'allama-khalid-saifullah',
      name: 'Mawlana Khalid Saifullah',
      nameBn: 'মাওলানা খালিদ সাইফুল্লাহ',
      title: 'Usool Specialist & Academic Dean',
      roleBn: 'উসূলে ফিকহ বিশেষজ্ঞ ও ডিন',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      bio: 'উসূলে ফিকহ ও প্রাচীন আরবি পাণ্ডুলিপি গবেষক। বহু ফিকহি সংকলনের রচয়িতা।',
      institution: 'Noor Fiqh Research Institute'
    },
    objectives: [
      'কোরআন-হাদিসের ভাষাগত ও আইনি অর্থ অনুধাবন',
      'ইজতিহাদ ও মুজতাহিদের শর্তাবলি জানা',
      'ফিকহি মতভেদের প্রতি উদার ও সহনশীল মনোভাব অর্জন'
    ],
    requirements: ['মৌলিক আরবি ভাষা ও দ্বীনি শিক্ষার ধারণা থাকা আবশ্যক'],
    lessons: [
      {
        id: 'u1-intro-sources',
        title: '১. উসূলে ফিকহের সংজ্ঞা, ইতিহাস ও মৌলিক উৎসসমূহ',
        titleBn: 'উসূলে ফিকহের সূচনা',
        description: 'কোরআন, সুন্নাহ, ইজমা ও কিয়াসের প্রামাণিকতা।',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '৫৫ মিনিট',
        isFreePreview: true
      }
    ],
    status: 'published'
  }
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'fiqh-al-muyassar-bn',
    title: 'আল-ফিকহুল মুয়াসসার (সহজ ফিকহ শিক্ষা সমগ্র)',
    titleBn: 'আল-ফিকহুল মুয়াসসার - দৈনন্দিন জীবনের পূর্ণাঙ্গ ফিকহ সংকলন',
    author: 'Mufti Abdullah Al-Noor',
    authorBn: 'মুফতী আব্দুল্লাহ আন-নূর',
    category: 'Fiqh Encyclopedia',
    categoryBn: 'ফিকহ কোষ ও গাইড',
    description: 'দৈনন্দিন জীবনের ইবাদত, লেনদেন ও পারিবারিক বিধিবিধান সংক্রান্ত সহজ ভাষায় রচিত প্রমাণপঞ্জিসহ প্রামাণ্য গ্রন্থ। শিক্ষার্থী ও সাধারণ পাঠকদের জন্য অবশ্যপাঠ্য।',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    hasPdf: true,
    pdfPrice: 180,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewPdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    hasHardcover: true,
    hardcoverPrice: 420,
    inStock: true,
    pages: 420,
    language: 'Bengali (with Arabic Matn)',
    publisher: 'Noor Fiqh Academy Publications',
    authorBio: 'মুফতী আব্দুল্লাহ আন-নূর - প্রধান গবেষক ও ইসলামিক আইন বিশেষজ্ঞ।',
    status: 'published',
    rating: 4.95
  },
  {
    id: 'contemporary-fiqh-solutions',
    title: 'সমকালীন ফিকহি জিজ্ঞাসা ও আধুনিক সমাধান',
    titleBn: 'সমকালীন ফিকহি জিজ্ঞাসা ও আধুনিক সমাধান (১ম খণ্ড)',
    author: 'Research Board, Noor Fiqh Academy',
    authorBn: 'গবেষণা পরিষদ, নূর ফিকহ একাডেমি',
    category: 'Fatwa & Research',
    categoryBn: 'ফতোয়া ও গবেষণা',
    description: 'ডিজিটাল ব্যাংকিং, কৃত্রিম বুদ্ধিমত্তা, প্লাস্টিক সার্জারি, অর্গান ট্রান্সপ্লান্টেশন ও অনলাইন বিজনেসের শরয়ী দৃষ্টিকোণ ও ফিকহি সিদ্ধান্তসমূহ।',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    hasPdf: true,
    pdfPrice: 200,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewPdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    hasHardcover: true,
    hardcoverPrice: 480,
    inStock: true,
    pages: 360,
    language: 'Bengali',
    publisher: 'Noor Fiqh Academy Publications',
    authorBio: 'নূর ফিকহ একাডেমির ইফতা ও গবেষণা বিভাগের যৌথ সংকলন।',
    status: 'published',
    rating: 4.9
  },
  {
    id: 'farayez-calculator-guide',
    title: 'সহজ ফারায়েজ শিক্ষা ও সম্পত্তি বণ্টনের গাণিতিক নিয়মাবলী',
    titleBn: 'সহজ ফারায়েজ শিক্ষা ও সম্পত্তি বণ্টনের নির্দেশিকা',
    author: 'Mawlana Khalid Saifullah',
    authorBn: 'মাওলানা খালিদ সাইফুল্লাহ',
    category: 'Inheritance Law',
    categoryBn: 'ফারায়েজ ও আইন',
    description: 'উত্তরাধিকার সম্পত্তি বণ্টনের কোরআনিক হিসাব, চার্ট এবং ব্যবহারিক উদাহরণ সংবলিত হ্যান্ডবুক।',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d0279c6d?auto=format&fit=crop&w=800&q=80',
    hasPdf: true,
    pdfPrice: 120,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewPdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    hasHardcover: true,
    hardcoverPrice: 280,
    inStock: true,
    pages: 190,
    language: 'Bengali',
    publisher: 'Noor Fiqh Academy Publications',
    status: 'published',
    rating: 4.85
  }
];

export const INITIAL_FATWAS: FatwaQuestion[] = [
  {
    id: 'fatwa-01',
    trackingCode: 'NFA-2026-101',
    questionTitle: 'চোখে ড্রপ বা নাকের স্প্রে ব্যবহার করলে কি রোজা ভেঙে যাবে?',
    questionBody: 'আসসালামু আলাইকুম। আমার অ্যালার্জির কারণে প্রতিদিন চোখে ড্রপ এবং নাকে বিশেষ স্প্রে দিতে হয়। রমজান মাসে দিনের বেলায় এগুলো ব্যবহার করলে কি রোজা ভেঙে যাবে?',
    category: 'taharah',
    categoryBn: 'রোজা ও চিকিৎসা ফিকহ',
    askedByName: 'মুহাম্মদ তানভীর আহমেদ',
    isPrivate: false,
    status: 'answered',
    answerText: `ওয়া আলাইকুমুস সালাম ওয়া রাহমাতুল্লাহ।

১. **চোখে ড্রপ দেওয়া:** চোখে ড্রপ দিলে যদি গলায় ওষুধের স্বাদ বা তিক্ততাও অনুভব হয়, তবুও আধুনিক ও প্রাচীন নির্ভরযোগ্য ফিকহবিদদের মতে রোজা ভাঙবে না। কারণ চোখ সরাসরি খাদ্যনালী বা পাকস্থলীতে পৌঁছানোর স্বাভাবিক প্রবেশদ্বার (মানফায) নয়।

২. **নাকের স্প্রে:** নাকের স্প্রে যদি এমন হয় যা শ্বাসনালী দিয়ে সরাসরি পাকস্থলীতে বা গলায় তরল ওষুধের ফোঁটা প্রবেশ করায়, তবে তা ব্যবহার করলে রোজা ভেঙে যাবে। তবে যদি কেবল গ্যাসীয় বাতাস বা অত্যন্ত সূক্ষ্ম ভেপার থাকে যা খাদ্যনালীতে না গিয়ে কেবল ফুসফুসের শ্বাসনালী উন্মুক্ত করে, তবে জরুরি প্রয়োজনে রোজা ভঙ্গ হবে না বলে কোনো কোনো ফকিহ মত দিয়েছেন। তবে সতর্কতামূলকভাবে রাতে ব্যবহার করা উত্তম।`,
    answeredByScholar: {
      name: 'মুফতী আব্দুল্লাহ আন-নূর',
      title: 'প্রধান ফিকহ গবেষক, নূর ফিকহ একাডেমি'
    },
    references: ['ফাতহুল কাদীর ২/২৫৭', 'রদ্দুল মুহতার ২/৩৯৫', 'ইসলামিক ফিকহ একাডেমি (মক্কা) সিদ্ধান্ত নং ৪৩'],
    viewsCount: 1420,
    helpfulCount: 380,
    createdAt: '2026-08-10'
  },
  {
    id: 'fatwa-02',
    trackingCode: 'NFA-2026-102',
    questionTitle: 'অনলাইনে ড্রপশিপিং (Dropshipping) ব্যবসা করার শরয়ী নিয়ম কী?',
    questionBody: 'আমি আলিএক্সপ্রেস বা অন্য সাপ্লায়ারের পণ্য ওয়েবসাইটে ডিসপ্লে করে বিক্রি করি। কাস্টমার অর্ডার দিলে সাপ্লায়ার সরাসরি পাঠিয়ে দেয়। এটি কি বায় ক্বাবল আল-ক্বাবদ (দখলের পূর্বে বিক্রি) এর মধ্যে পড়বে?',
    category: 'muamalat',
    categoryBn: 'মুয়ামালাত ও ই-কমার্স',
    askedByName: 'আব্দুল হাকিম',
    isPrivate: false,
    status: 'answered',
    answerText: `ওয়া আলাইকুমুস সালাম।
ড্রপশিপিং ব্যবসার সাধারণ পদ্ধতি হলো—বিক্রেতা যে পণ্যের মালিক নন বা যার উপর তার কোনো কবজা (দখল) নেই, তা সরাসরি বিক্রি করে ফেলা। ইসলামের দৃষ্টিতে নিজের অধিকারে বা দায়িত্বে আসার আগে সুনির্দিষ্ট পণ্য বিক্রি করা নিষিদ্ধ (হাদিস: 'লা তাবি' মা লাইসা ইনদাক')।

**হালাল উপায়ে করার সঠিক পদ্ধতি:**
১. **ওয়াকালাহ (Agency / ব্রোকার পদ্ধতি):** আপনি কাস্টমারকে বলবেন আপনি পণ্যের মালিক নন, বরং সাপ্লায়ারের প্রতিনিধি বা মধ্যস্থতাকারী হিসেবে নির্দিষ্ট কমিশন বা ফি নিয়ে পণ্য এনে দিচ্ছেন।
২. **সালাম চুক্তি (Salam Contract):** পণ্যের গুণগত বিবরণ সুনির্দিষ্ট করে অগ্রিম মূল্য গ্রহণ করে নির্দিষ্ট সময়ে ডেলিভারি নিশ্চিত করা।
৩. পণ্য আগে নিজের গুদামে বা দায়িত্বপ্রাপ্ত লজিস্টিক্সে রিসিভ করে তারপর কাস্টমারকে পাঠানো।`,
    answeredByScholar: {
      name: 'ড. মুফতী মুহাম্মাদ তারিক',
      title: 'শরীয়াহ উপদেষ্টা, নূর ফিকহ একাডেমি'
    },
    references: ['সহিহ বুখারি ২১৪৫', 'আল-মাবসূত লিস-সারাখসী ১২/১৪০', 'মাজাল্লাতুল আহকাম আল-আদলিয়্যা'],
    viewsCount: 2150,
    helpfulCount: 620,
    createdAt: '2026-08-12'
  },
  {
    id: 'fatwa-03',
    trackingCode: 'NFA-2026-103',
    questionTitle: 'স্বর্ণালংকারের যাকাত কি বর্তমান বাজার মূল্যে দিতে হবে নাকি ক্রয় মূল্যে?',
    questionBody: 'আমার স্ত্রীর কিছু স্বর্ণালংকার আছে যা ৫ বছর আগে কেনা হয়েছিল। এখন যাকাত দেওয়ার সময় তৎকালীন ক্রয় মূল্য ধরতে হবে নাকি বর্তমান বিক্রয় মূল্য?',
    category: 'ibadat',
    categoryBn: 'যাকাত ও সম্পদ',
    askedByName: 'মাহমুদুল হাসান',
    isPrivate: false,
    status: 'answered',
    answerText: `যাকাত বর্ষপূর্তির দিনে ওই স্বর্ণের বর্তমান বাজার মূল্যে (Current Market Value / Selling Price) যাকাত হিসাব করতে হবে। পূর্বে কত টাকায় কেনা হয়েছিল তা ধর্তব্য নয়। স্বর্ণ যদি ৭.৫ তোলা (৮৭.৪৮ গ্রাম) বা তার সমপরিমাণ হয় (অথবা নগদ অর্থ মিলিয়ে নিসাব পূর্ণ হয়), তবে তার মোট মূল্যের ২.৫% যাকাত আদায় করা ফরজ।`,
    answeredByScholar: {
      name: 'মুফতী আব্দুল্লাহ আন-নূর',
      title: 'প্রধান ফিকহ গবেষক'
    },
    references: ['বাদায়েউস সানায়ে ২/১৬', 'ফাতাওয়া হিন্দিয়া ১/১৭৯'],
    viewsCount: 1890,
    helpfulCount: 450,
    createdAt: '2026-08-14'
  }
];

export const INITIAL_LIVE_CLASSES: LiveClass[] = [
  {
    id: 'live-fiqh-session-01',
    title: 'সমকালীন চিকিৎসা ও অপারেশন সংক্রান্ত বিশেষ ফিকহি ওয়ার্কশপ',
    titleBn: 'সমকালীন চিকিৎসা ও সার্জারি বিষয়ক বিশেষ ফিকহি সেমিনার',
    description: 'অর্গান ডোনেশন, আইভিএফ (টেস্টটিউব বেবি), রক্ত আদান-প্রদান ও লাইফ সাপোর্ট সংক্রান্ত জটিল মাসআলার সমাধান।',
    instructor: 'মুফতী আব্দুল্লাহ আন-নূর ও আমন্ত্রিত চিকিৎসক প্যানেল',
    startTime: '2026-08-25T20:30:00+06:00',
    duration: '২.৫ ঘণ্টা',
    price: 350,
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    meetingLink: 'https://zoom.us/j/noorfiqhacademy',
    platform: 'Zoom',
    status: 'upcoming',
    enrolledStudentsCount: 310,
    targetCapacity: 500,
    registeredUserIds: []
  },
  {
    id: 'live-fiqh-session-02',
    title: 'রমজানুল মুবারক প্রস্তুতি ও তারাবীহ-ইতিকাফের মাসআলা',
    titleBn: 'রমজানের পূর্ণাঙ্গ ফিকহি গাইডলাইন ও প্রশ্নোত্তর পর্ব',
    description: 'চাঁদ দেখা, সেহরি-ইফতারের সময়সূচি ও খতমে তারাবীর বিধান।',
    instructor: 'মাওলানা খালিদ সাইফুল্লাহ',
    startTime: '2026-08-30T19:00:00+06:00',
    duration: '২ ঘণ্টা',
    price: 0, // Free workshop
    thumbnail: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
    meetingLink: 'https://youtube.com/live/noorfiqh',
    platform: 'YouTube Live',
    status: 'upcoming',
    enrolledStudentsCount: 890,
    targetCapacity: 1000,
    registeredUserIds: []
  }
];

export const INITIAL_REVIEWS: SiteReview[] = [
  {
    id: 'rev-1',
    name: 'Mawlana Farhan Sadik',
    nameBn: 'মাওলানা ফারহান সাদিক',
    role: 'Imam & Khatib',
    location: 'Dhaka',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    content: 'নূর ফিকহ একাডেমির তাহরাত ও সালাত কোর্সটি প্রতিটি দ্বীনপিপাসু মানুষের জন্য আলোর দিশারি। মুফতী সাহেবের সহজ উপস্থাপনা ও দলীলভিত্তিক আলোচনা অতুলনীয়।',
    courseTitle: 'Comprehensive Fiqh of Ibadat',
    createdAt: '2026-08-01'
  },
  {
    id: 'rev-2',
    name: 'Engr. Rakibul Islam',
    nameBn: 'প্রকৌশলী রাকিবুল ইসলাম',
    role: 'Software Engineer & Trader',
    location: 'Chittagong',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    content: 'ইসলামিক ফাইন্যান্স কোর্সটি করার পর আমার অনলাইন ব্যবসার বহু ভুল শুধরে নিতে পেরেছি। আলহামদুলিল্লাহ, এখন ১০০% হালাল উপায়ে উপার্জনের মানসিক শান্তি পেয়েছি।',
    courseTitle: 'Islamic Finance & Modern Muamalat',
    createdAt: '2026-08-05'
  },
  {
    id: 'rev-3',
    name: 'Umm Ayman',
    nameBn: 'উম্মে আয়মান',
    role: 'Homemaker & Student',
    location: 'Sylhet',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    content: 'পারিবারিক ফিকহ কোর্সটিতে দেনমোহর ও দাম্পত্য অধিকার সম্পর্কে যে গভীর দিকনির্দেশনা পেয়েছি তা আমাদের পারিবারিক জীবনে এক নতুন বরকত এনে দিয়েছে।',
    courseTitle: 'Fiqh of Marriage & Family',
    createdAt: '2026-08-08'
  }
];
