import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { api } from '../lib/api';

const publicPages = ['/login', '/'];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [router.pathname]);

  const checkAuth = async () => {
    try {
      // Try to get current user
      const data = await api.getCurrentUser();
      if (data?.user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // If not authenticated and not on a public page, redirect to login
        if (!publicPages.includes(router.pathname)) {
          router.push('/login');
        }
      }
    } catch (error) {
      setIsAuthenticated(false);
      // If not authenticated and not on a public page, redirect to login
      if (!publicPages.includes(router.pathname)) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show nothing while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Allow access to public pages
  if (publicPages.includes(router.pathname)) {
    return <Component {...pageProps} />;
  }

  // Require authentication for other pages
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting to login...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return <Component {...pageProps} />;
}
