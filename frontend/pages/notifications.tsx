import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Card from '../components/Card';
import { api } from '../lib/api';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface Notification {
    id: string;
    message: string;
    created_at: string;
    read: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await api.getNotifications();
            if (data.notifications) setNotifications(data.notifications);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await api.markNotificationRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header title="Notifications" />

            <main className="flex-1 container-main py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
                </div>

                <Card title="Recent Activity">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600">Loading notifications...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-border">
                            {notifications.map((notification) => {
                                let Icon = Info;
                                let iconColor = 'text-blue-500';
                                let bgColor = 'bg-blue-500/10';

                                switch (notification.type) {
                                    case 'success':
                                        Icon = CheckCircle;
                                        iconColor = 'text-green-500';
                                        bgColor = 'bg-green-500/10';
                                        break;
                                    case 'warning':
                                        Icon = AlertTriangle;
                                        iconColor = 'text-yellow-500';
                                        bgColor = 'bg-yellow-500/10';
                                        break;
                                    case 'error':
                                        Icon = XCircle;
                                        iconColor = 'text-red-500';
                                        bgColor = 'bg-red-500/10';
                                        break;
                                }

                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-4 flex items-start gap-4 hover:bg-accent/50 transition cursor-pointer ${!notification.read ? 'bg-primary/5' : ''}`}
                                        onClick={() => !notification.read && markAsRead(notification.id)}
                                    >
                                        <div className={`p-2 rounded-full ${bgColor} ${iconColor}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-foreground ${!notification.read ? 'font-semibold' : ''}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg mb-2">No notifications</p>
                            <p className="text-muted-foreground/80">You're all caught up!</p>
                        </div>
                    )}
                </Card>
            </main>

            <Footer year={2025} />
        </div>
    );
}
