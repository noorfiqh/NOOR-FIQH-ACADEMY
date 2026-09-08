'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  gaId?: string;
}

export function GoogleAnalytics({ gaId = 'G-L14M0HQP0R' }: GoogleAnalyticsProps) {
  // Prevent loading external analytics script in local development / sandboxed preview environments
  if (!gaId || process.env.NODE_ENV !== 'production') return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        crossOrigin="anonymous"
        onError={() => {
          // Gracefully suppress unhandled script error in sandboxed or ad-blocked environments
        }}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        onError={() => {
          // Gracefully ignore initialization failure
        }}
        dangerouslySetInnerHTML={{
          __html: `
            try {
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            } catch (e) {
              // Ignore analytics execution error
            }
          `,
        }}
      />
    </>
  );
}
