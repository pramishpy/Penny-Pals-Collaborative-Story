import React, { useState } from 'react';

interface HeaderProps {
  title: string;
  logo?: string;
}

export default function Header({ title, logo }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-gray-200">
      <div className="container-main py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">
            <span className="text-primary">P</span>
            <span className="text-black">enny</span>
            {' '}
            <span className="text-primary">P</span>
            <span className="text-secondary">als</span>
          </span>
        </div>
        <nav className="flex gap-8 items-center">
          <a href="/dashboard" className="font-semibold hover:text-primary transition">
            Dashboard
          </a>
          <a href="/transactions" className="font-semibold hover:text-primary transition">
            Transactions
          </a>
          <a href="/wallet" className="font-semibold hover:text-primary transition">
            Wallet
          </a>
          <a href="/groups" className="font-semibold hover:text-primary transition">
            Groups
          </a>
          <div className="relative">
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="text-2xl">☰</span>
            </button>
            
            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <a 
                    href="/settings" 
                    className="block px-4 py-2 hover:bg-gray-100 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </a>
                  <a 
                    href="/account" 
                    className="block px-4 py-2 hover:bg-gray-100 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Account
                  </a>
                  <hr className="my-2 border-gray-200" />
                  <button 
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition text-red-600"
                    onClick={() => {
                      setIsMenuOpen(false);
                      
                      window.location.href = '/logout';
                    }}
                  >
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
