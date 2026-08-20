'use client';

import React, { useState, useEffect } from 'react';
import { AppStore } from '@/lib/store';

export default function PrivacyPolicyPage() {
  const [privacyText, setPrivacyText] = useState('');

  useEffect(() => {
    const settings = AppStore.getSettings();
    setPrivacyText(settings.privacyPolicyText || '');

    const handleSettingsUpdate = (e: any) => {
      if (e.detail?.privacyPolicyText) {
        setPrivacyText(e.detail.privacyPolicyText);
      }
    };
    window.addEventListener('noorfiqh_settings_updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('noorfiqh_settings_updated', handleSettingsUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfcf9] font-sans text-[#2c3e50] py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-[#ece8e0] card-natural-shadow space-y-6">
        <h1 className="text-3xl font-black text-[#112734] font-anek">গোপনীয়তা নীতি (Privacy Policy)</h1>
        <p className="text-xs text-[#8a817c] font-tiro">সর্বশেষ আপডেট: জানুয়ারি ২০২৫</p>

        <div className="space-y-4 text-sm text-[#5a524d] leading-relaxed whitespace-pre-line font-tiro">
          {privacyText}
        </div>
      </div>
    </div>
  );
}
