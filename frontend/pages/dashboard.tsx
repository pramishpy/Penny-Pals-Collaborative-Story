import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Card from '../components/Card';
import ExpenseModal from '../components/ExpenseModal';
import GroupModal from '../components/GroupModal';
import PayModal from '../components/PayModal';
import Button from '../components/Button';
import { api } from '../lib/api';
import { Bell, X } from 'lucide-react';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [recentNotification, setRecentNotification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashRes, walletRes, notifRes] = await Promise.all([
        api.getDashboard(),
        api.getWallet(),
        api.getNotifications()
      ]);
      setDashboardData(dashRes);
      setWalletData(walletRes);

      if (notifRes.notifications && notifRes.notifications.length > 0) {
        setRecentNotification(notifRes.notifications[0]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissNotification = () => {
    setRecentNotification(null);
    // Optionally mark as read in backend
  };

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors">
      <Header title="Dashboard" />

      <main className="flex-1 container-main py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Welcome & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back!</h1>
                <p className="text-muted-foreground">Here's what's happening with your finances.</p>
              </div>
              <div className="flex gap-3">
                <Button label="New Group" onClick={() => setIsGroupModalOpen(true)} type="secondary" icon="+" />
                <Button label="Add Expense" onClick={() => setIsExpenseModalOpen(true)} type="primary" icon="+" />
              </div>
            </div>

            {/* Recent Notification Banner */}
            {recentNotification && (
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-4 relative animate-in slide-in-from-top-2 duration-300">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 pr-8">
                  <p className="font-semibold text-foreground text-sm">New Notification</p>
                  <p className="text-foreground/80 text-sm mt-1">{recentNotification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(recentNotification.created_at).toLocaleTimeString()}</p>
                </div>
                <button
                  onClick={handleDismissNotification}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Balance & Pay Now */}
              <div className="space-y-8">
                <Card title="Your Balance">
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-2">Total Balance</p>
                    <h2 className="text-5xl font-extrabold text-primary mb-6">{walletData?.balance || '$0.00'}</h2>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/10">
                        <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase mb-1">Owed to you</p>
                        <p className="text-xl font-bold text-green-700 dark:text-green-300">{walletData?.total_owed_by_others || '$0.00'}</p>
                      </div>
                      <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                        <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase mb-1">You owe</p>
                        <p className="text-xl font-bold text-red-700 dark:text-red-300">{walletData?.total_owed_to_others || '$0.00'}</p>
                      </div>
                    </div>

                    <Button
                      label="Pay Someone Now"
                      onClick={() => setIsPayModalOpen(true)}
                      type="primary"
                      className="w-full py-4 text-lg shadow-lg shadow-primary/20"
                    />
                  </div>
                </Card>
              </div>

              {/* Right Column: Expense Visualization */}
              <div className="lg:col-span-2">
                <Card title="Expense Summary">
                  <div className="h-[300px] flex items-end justify-around gap-4 px-4 pb-4 pt-8 bg-muted/20 rounded-xl border border-border/50">
                    {/* Mock Graph Bars - In a real app, use a chart lib */}
                    {/* We'll generate some visual bars based on dummy data or simple logic if available */}
                    {[
                      { label: 'Mon', h: '40%' },
                      { label: 'Tue', h: '60%' },
                      { label: 'Wed', h: '30%' },
                      { label: 'Thu', h: '80%' },
                      { label: 'Fri', h: '50%' },
                      { label: 'Sat', h: '90%' },
                      { label: 'Sun', h: '45%' },
                    ].map((bar, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 w-full h-full justify-end group">
                        <div
                          className="w-full max-w-[40px] bg-primary/20 group-hover:bg-primary transition-all duration-500 rounded-t-lg relative"
                          style={{ height: bar.h }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs py-1 px-2 rounded font-bold">
                            {bar.h}
                          </div>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-between items-center text-sm text-muted-foreground">
                    <p>Spending activity this week</p>
                    <a href="/transactions" className="text-primary hover:underline font-medium">View detailed report →</a>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer year={2025} />

      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSuccess={fetchData}
      />

      <PayModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        onSuccess={fetchData}
        maxAmount={parseFloat((walletData?.balance || '$0').replace('$', '').replace(',', ''))}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
