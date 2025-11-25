import React from 'react';

interface HeaderProps {
  title: string;
  logo?: string;
}

export default function Header({ title, logo }: HeaderProps) {
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
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <span className="text-2xl">☰</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
