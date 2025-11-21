"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Moon, Sun, Search, PenTool, Github, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleDarkMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-cream/80 dark:bg-dark/80 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <h1 className="text-xl font-bold font-mono tracking-tighter group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
              Taemni&apos;s Blog
            </h1>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
             {/* Navigation Links (Hidden on small mobile) */}
            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-400">
              <Link 
                href="/tags" 
                className={`hover:text-black dark:hover:text-white transition-colors ${pathname.startsWith('/tags') ? 'text-black dark:text-white' : ''}`}
              >
                Tags
              </Link>
              <Link 
                href="/series" 
                className={`hover:text-black dark:hover:text-white transition-colors ${pathname.startsWith('/series') ? 'text-black dark:text-white' : ''}`}
              >
                Series
              </Link>
              {isLoggedIn && (
                <Link 
                  href="/write" 
                  className={`hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 ${pathname === '/write' ? 'text-black dark:text-white' : ''}`}
                >
                  <PenTool size={14} /> Write
                </Link>
              )}
            </nav>

            {/* Logout Button (로그인 시에만 표시) */}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
                  text-gray-600 dark:text-gray-400 
                  hover:text-red-600 dark:hover:text-red-400
                  hover:bg-red-50 dark:hover:bg-red-950/30
                  transition-all"
                aria-label="Logout"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            )}

            <Link 
              href="/search"
              className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                pathname.startsWith('/search') 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              aria-label="Search"
            >
              <Search size={20} />
            </Link>
            
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
              aria-label="Toggle Dark Mode"
            >
              {mounted ? (
                resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />
              ) : (
                <div className="w-5 h-5" /> // Placeholder to prevent layout shift
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="grow w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-auto bg-cream dark:bg-dark transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 dark:text-gray-500 text-sm">
          <div className="flex justify-center gap-4 mb-4">
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors"><Github size={18} /></a>
          </div>
          <p>© {new Date().getFullYear()} Taemni&apos;s Blog. Built with Next.js & Tailwind.</p>
        </div>
      </footer>
    </div>
  );
};
