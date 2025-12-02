import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { api } from '../lib/api';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await api.getCurrentUser();
      setIsAuthenticated(true);
      // If authenticated, redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Home" />

      <main className="flex-1 container-main py-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to <span className="text-primary">P</span>
            <span className="text-black">enny</span>
            <span className="text-primary">P</span>
            <span className="text-secondary">als</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Split expenses easily with your friends
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              label="Login to Dashboard"
              onClick={() => router.push('/login')}
              className="px-8"
            />
            <Button
              label="Sign Up"
              onClick={() => router.push('/login')}
              type="secondary"
              className="px-8"
            />
          </div>
        </div>
      </main>

      <Footer year={2025} />
    </div>
  );
}
