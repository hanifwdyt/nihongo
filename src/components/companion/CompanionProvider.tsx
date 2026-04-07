'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { usePageContext } from '@/hooks/usePageContext';
import FloatingCompanion from './FloatingCompanion';

function PageContextTracker() {
  usePageContext();
  return null;
}

export default function CompanionProvider() {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'guest'>('loading');
  const pathname = usePathname();

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch('/api/auth/me');
        setAuthState(res.ok ? 'authenticated' : 'guest');
      } catch {
        setAuthState('guest');
      }
    }
    check();
  }, [pathname]);

  if (authState === 'loading') return null;

  return (
    <>
      {authState === 'authenticated' && <PageContextTracker />}
      <FloatingCompanion isGuest={authState === 'guest'} />
    </>
  );
}
