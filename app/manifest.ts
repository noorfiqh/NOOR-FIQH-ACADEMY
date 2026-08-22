import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'নূর ফিকহ একাডেমি (Noor Fiqh Academy)',
    short_name: 'Noor Fiqh',
    description: 'অনলাইন ইসলামিক আইন, ফিকহ কোর্স ও নির্ভরযোগ্য ফতোয়া ইনস্টিটিউট।',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#112734',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
