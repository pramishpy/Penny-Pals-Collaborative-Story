import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';
import { Bell } from 'lucide-react';

interface HeaderProps {
    title: string;
    logo?: string;
}

export default function Header({ title, logo }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        fetchCurrentUser();
        fetchUnreadNotifications();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await api.getCurrentUser();
            setCurrentUser(response.user);
        } catch (error) {
            console.error('Failed to fetch current user');
        }
    };

    const fetchUnreadNotifications = async () => {
        try {
            const data = await api.getNotifications();
            if (data.notifications) {
                const unread = data.notifications.filter((n: any) => !n.read).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error('Failed to fetch notifications');
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
        <header className="w-full border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
            <div className="container-main py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold tracking-tight">
                        <span className="text-primary">P</span>
                        <span className="text-foreground">enny</span>
                        {' '}
                        <span className="text-primary">P</span>
                        <span className="text-foreground">als</span>
                    </span>
                </div>
                <nav className="flex gap-8 items-center">
                    <a href="/dashboard" className="font-medium hover:text-primary transition-colors text-foreground">
                        Dashboard
                    </a>
                    <a href="/transactions" className="font-medium hover:text-primary transition-colors text-foreground">
                        Transactions
                    </a>
                    <a href="/wallet" className="font-medium hover:text-primary transition-colors text-foreground">
                        Wallet
                    </a>
                    <a href="/groups" className="font-medium hover:text-primary transition-colors text-foreground">
                        Groups
                    </a>
                    <a href="/notifications" className="font-medium hover:text-primary transition-colors text-foreground flex items-center gap-1 relative">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </a>
                    <div className="relative">
                        <button
                            className="p-2 hover:bg-accent rounded-xl transition-colors flex items-center gap-2 text-foreground"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="text-sm font-medium">{currentUser?.username || 'User'}</span>
                            <span className="text-xl">☰</span>
                        </button>

                        {isMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-popover text-popover-foreground rounded-xl shadow-xl border border-border py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-4 py-3 border-b border-border">
                                        <p className="font-semibold text-sm">{currentUser?.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <a
                                            href="/settings"
                                            className="block px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Settings
                                        </a>
                                    </div>
                                    <div className="border-t border-border py-1">
                                        <button
                                            className="w-full text-left px-4 py-2 hover:bg-destructive/10 hover:text-destructive transition-colors text-destructive text-sm font-medium"
                                            onClick={handleLogout}
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}
