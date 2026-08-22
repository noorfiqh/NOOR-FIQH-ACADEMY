'use client';

import React, { useEffect } from 'react';
import { AppStore } from '@/lib/store';

export function StoreSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Start global Firestore realtime listeners across all collections
    const cleanup = AppStore.initGlobalSync();
    return () => {
      cleanup();
    };
  }, []);

  return <>{children}</>;
}
