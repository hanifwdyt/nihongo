'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function NavBar() {
  const [user, setUser] = useState<{ name: string; currentLevel: string } | null>(null);
  const [checked, setChecked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
      setChecked(true);
    }
    check();
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const linkClass = (href: string) =>
    `hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors ${
      isActive(href) ? 'text-emerald-600 dark:text-emerald-500' : ''
    }`;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setShowMenu(false);
    router.push('/');
  };

  return (
    <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
      <Link href={user ? '/dashboard' : '/'} className="font-bold text-lg tracking-tight">
        <span className="text-emerald-600">日本語</span>{' '}
        <span className="text-zinc-900 dark:text-zinc-100">Nihongo</span>
      </Link>

      <div className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {checked && user ? (
          <>
            <Link href="/dashboard" className={linkClass('/dashboard')}>
              Dashboard
            </Link>
            <Link href="/kana" className={linkClass('/kana')}>
              Kana
            </Link>
            <Link href={`/learn/${user.currentLevel}`} className={linkClass('/learn')}>
              Learn
            </Link>
            <Link href="/buddy" className={linkClass('/buddy')}>
              Sensei
            </Link>
            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-bold text-emerald-600">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 5L6 8L9 5" />
                </svg>
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl z-50 py-1">
                    <div className="px-3 py-2 text-xs text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                      {user.name}
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setShowMenu(false)}
                      className="block px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/pricing"
                      onClick={() => setShowMenu(false)}
                      className="block px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      Pricing
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : checked ? (
          <>
            <Link href="/kana" className={linkClass('/kana')}>
              Kana
            </Link>
            <Link href="/pricing" className={linkClass('/pricing')}>
              Pricing
            </Link>
            <Link href="/login" className={linkClass('/login')}>
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              Sign Up
            </Link>
          </>
        ) : null}
        <ThemeToggle />
      </div>
    </nav>
  );
}
