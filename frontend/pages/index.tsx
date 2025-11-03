import React from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';

export default function Home() {
  const router = useRouter();

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
              label="Go to Dashboard"
              onClick={() => router.push('/dashboard')}
              className="px-8"
            />
            <Button
              label="Get Started"
              onClick={() => router.push('/groups')}
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
