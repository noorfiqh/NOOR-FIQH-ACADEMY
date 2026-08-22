import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { StoreSyncProvider } from '@/components/StoreSyncProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { SeoSchema } from '@/components/SeoSchema';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#112734',
};

export const metadata: Metadata = {
  title: {
    default: 'নূর ফিকহ একাডেমি (Noor Fiqh Academy) - অনলাইন ইসলামিক আইন ও ফতোয়া ইনস্টিটিউট',
    template: '%s | নূর ফিকহ একাডেমি'
  },
  description: 'নূর ফিকহ একাডেমি (Noor Fiqh Academy) - সহিহ সুন্নাহ ও নির্ভরযোগ্য ফিকহি মূলনীতির আলোকে ইবাদত, মুয়ামালাত, পারিবারিক আইন ও আধুনিক জীবনের ফতোয়া ও অনলাইন কোর্স।',
  keywords: [
    'Noor Fiqh Academy',
    'নূর ফিকহ একাডেমি',
    'Islamic Fiqh Course',
    'ফতোয়া ও মাসআলা',
    'ইসলামিক ফাইন্যান্স',
    'ফারায়েজ শিক্ষা',
    'তাহারা ও সালাত',
    'অনলাইন মাদ্রাসা কোর্স',
    'Islamic Jurisprudence Bangladesh'
  ],
  authors: [{ name: 'Noor Fiqh Academy', url: 'https://www.facebook.com/profile.php?id=61591404045439' }],
  creator: 'Noor Fiqh Academy',
  publisher: 'Noor Fiqh Academy',
  openGraph: {
    title: 'নূর ফিকহ একাডেমি (Noor Fiqh Academy) | জ্ঞান ও ফিকহের আলোয় জীবন পরিচালনা',
    description: 'কোরআন ও সহিহ সুন্নাহর আলোকে প্রামাণ্য ফিকহ কোর্স, নির্ভরযোগ্য ফতোয়া পরামর্শ ও অনলাইন সার্টিফিকেট।',
    url: 'https://noorfiqhacademy.com',
    siteName: 'Noor Fiqh Academy',
    locale: 'bn_BD',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Noor Fiqh Academy Banner'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'নূর ফিকহ একাডেমি (Noor Fiqh Academy)',
    description: 'অনলাইন ইসলামিক ফিকহ ও সমকালীন মাসআলা সমাধান একাডেমি।',
    images: ['https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://noorfiqhacademy.com',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Anek+Bangla:wght@400;500;600;700;800&family=Noto+Serif+Bengali:wght@400;500;600;700;800&family=Tiro+Bangla:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
        <SeoSchema />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-[#fcfdfd] text-slate-900 selection:bg-[#17A2B8] selection:text-slate-950" suppressHydrationWarning>
        <AuthProvider>
          <StoreSyncProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <FloatingWhatsApp />
          </StoreSyncProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
