'use client';

import { useEffect, useRef, useState } from 'react';
import { usePageContext } from '@/hooks/usePageContext';
import FloatingCompanion from './FloatingCompanion';

function PageContextTracker() {
  usePageContext();
  return null;
}

export default function CompanionProvider() {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'guest'>('loading');
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    async function check() {
      try {
        const res = await fetch('/api/auth/me');
        setAuthState(res.ok ? 'authenticated' : 'guest');
      } catch {
        setAuthState('guest');
      }
    }
    check();
  }, []);

  if (authState === 'loading') return null;

  return (
    <>
      {authState === 'authenticated' && <PageContextTracker />}
      <FloatingCompanion isGuest={authState === 'guest'} />
    </>
  );
}
