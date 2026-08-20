import React from 'react';

interface SeoSchemaProps {
  type?: 'Organization' | 'Course' | 'Book' | 'FAQPage';
  data?: any;
}

export function SeoSchema({ type = 'Organization', data }: SeoSchemaProps) {
  const baseOrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Noor Fiqh Academy',
    alternateName: 'নূর ফিকহ একাডেমি',
    url: 'https://noorfiqhacademy.com',
    logo: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=400&q=80',
    description: 'Noor Fiqh Academy is an online Islamic institution for classical Islamic jurisprudence, contemporary fatwa consultations, and digital education.',
    sameAs: [
      'https://www.facebook.com/profile.php?id=61591404045439'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+8801855905185',
      contactType: 'Customer Support',
      email: 'noorfiqhaca@gmail.com',
      availableLanguage: ['Bengali', 'Arabic', 'English']
    }
  };

  let schemaContent = baseOrganizationSchema;

  if (type === 'Course' && data) {
    schemaContent = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: data.titleBn || data.title,
      description: data.shortDescription || data.description,
      provider: {
        '@type': 'Organization',
        name: 'Noor Fiqh Academy',
        sameAs: 'https://www.facebook.com/profile.php?id=61591404045439'
      },
      offers: {
        '@type': 'Offer',
        price: data.price,
        priceCurrency: 'BDT',
        category: 'Paid'
      }
    } as any;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaContent) }}
    />
  );
}
