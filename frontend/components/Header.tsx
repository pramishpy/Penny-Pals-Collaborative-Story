import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';

interface HeaderProps {
    title: string;
    logo?: string;
}

export default function Header({ title, logo }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await api.getCurrentUser();
            setCurrentUser(response.user);
        } catch (error) {
            console.error('Failed to fetch current user');
        }
    };

    const handleLogout = async () => {
        try {
            await api.logout();
            setIsMenuOpen(false);
            router.push('/login');
        } catch (error) {
            console.error('Logout failed');
        }
    };

    return (
        <header className="w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
            <div className="container-main py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                        <span className="text-primary">P</span>
                        <span className="text-black dark:text-white">enny</span>
                        {' '}
                        <span className="text-primary">P</span>
                        <span className="text-secondary">als</span>
                    </span>
                </div>
                <nav className="flex gap-8 items-center">
                    <a href="/dashboard" className="font-semibold hover:text-primary transition text-gray-900 dark:text-white">
                        Dashboard
                    </a>
                    <a href="/transactions" className="font-semibold hover:text-primary transition text-gray-900 dark:text-white">
                        Transactions
                    </a>
                    <a href="/wallet" className="font-semibold hover:text-primary transition text-gray-900 dark:text-white">
                        Wallet
                    </a>
                    <a href="/groups" className="font-semibold hover:text-primary transition text-gray-900 dark:text-white">
                        Groups
                    </a>
                    <div className="relative">
                        <button
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2 text-gray-900 dark:text-white"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="text-sm font-medium">{currentUser?.username || 'User'}</span>
                            <span className="text-2xl">☰</span>
                        </button>

                        {isMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
                                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                                        <p className="font-semibold">{currentUser?.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
                                    </div>
                                    <a
                                        href="/settings"
                                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm text-gray-900 dark:text-white"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Settings
                                    </a>
                                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-red-600 dark:text-red-400 text-sm font-medium"
                                        onClick={handleLogout}
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
