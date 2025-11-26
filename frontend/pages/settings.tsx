import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Card from '../components/Card';
import { api } from '../lib/api';

interface NotificationPreferences {
  expenseReminders: boolean;
  groupUpdates: boolean;
  paymentNotifications: boolean;
}

interface Settings {
  theme: 'light' | 'dark';
  currency: string;
  pushNotificationsEnabled: boolean;
  notificationPreferences: NotificationPreferences;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

export default function Settings() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    currency: 'USD',
    pushNotificationsEnabled: true,
    notificationPreferences: {
      expenseReminders: true,
      groupUpdates: true,
      paymentNotifications: true,
    },
  });

  useEffect(() => {
    fetchCurrentUser();
    loadSettingsFromStorage();
  }, []);

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (settings.theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.getCurrentUser();
      setCurrentUser(response.user);
    } catch (error) {
      console.error('Failed to fetch current user');
    } finally {
      setLoading(false);
    }
  };

  const loadSettingsFromStorage = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setSettings(prev => ({ ...prev, theme: savedTheme }));
    }
    
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      setSettings(prev => ({ ...prev, currency: savedCurrency }));
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setSettings(prev => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);
    showSaveMessage('Theme preference saved');
  };

  const handleCurrencyChange = (currency: string) => {
    setSettings(prev => ({ ...prev, currency }));
    localStorage.setItem('currency', currency);
    showSaveMessage('Currency preference saved');
  };

  const handleNotificationToggle = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      pushNotificationsEnabled: enabled,
      notificationPreferences: {
        expenseReminders: enabled,
        groupUpdates: enabled,
        paymentNotifications: enabled,
      },
    }));
    showSaveMessage('Notification preferences updated');
  };

  const handleNotificationPreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: value,
      },
    }));
    showSaveMessage('Notification preference updated');
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed');
    }
  };

  const showSaveMessage = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const selectedCurrency = CURRENCIES.find(c => c.code === settings.currency) || CURRENCIES[0];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header title="Settings" />

      <main className="flex-1 container-main py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
            Settings
          </h1>

          {saveMessage && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg">
              {saveMessage}
            </div>
          )}

          <Card title="Theme Settings" className="mb-6 dark:bg-gray-800 dark:text-white">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose your preferred theme for the application
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    settings.theme === 'light'
                      ? 'border-primary bg-primary/10 dark:bg-primary/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">☀️</div>
                    <div className="font-semibold">Light Mode</div>
                  </div>
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    settings.theme === 'dark'
                      ? 'border-primary bg-primary/10 dark:bg-primary/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🌙</div>
                    <div className="font-semibold">Dark Mode</div>
                  </div>
                </button>
              </div>
            </div>
          </Card>

          <Card title="Currency Preference" className="mb-6 dark:bg-gray-800 dark:text-white">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select your default currency for displaying amounts
              </p>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Currency
                </label>
                <select
                  id="currency"
                  value={settings.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} ({currency.symbol}) - {currency.name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Current selection: {selectedCurrency.code} {selectedCurrency.symbol}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Account" className="mb-6 dark:bg-gray-800 dark:text-white">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : currentUser ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Username</span>
                      <span className="text-sm text-gray-900 dark:text-white">{currentUser.username}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</span>
                      <span className="text-sm text-gray-900 dark:text-white">{currentUser.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</span>
                      <span className="text-sm text-gray-900 dark:text-white">{currentUser.name}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
                      <span className="text-sm text-green-600 dark:text-green-400 font-semibold">Logged In</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-gray-400">Unable to load user information</p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Push Notifications" className="mb-6 dark:bg-gray-800 dark:text-white">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Enable Notifications</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Master toggle for all notification types
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pushNotificationsEnabled}
                      onChange={(e) => handleNotificationToggle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              {settings.pushNotificationsEnabled && (
                <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Expense Reminders</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified about upcoming expense deadlines
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notificationPreferences.expenseReminders}
                        onChange={(e) => handleNotificationPreferenceChange('expenseReminders', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Group Updates</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive notifications when groups are updated
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notificationPreferences.groupUpdates}
                        onChange={(e) => handleNotificationPreferenceChange('groupUpdates', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Payment Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified about payment requests and settlements
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notificationPreferences.paymentNotifications}
                        onChange={(e) => handleNotificationPreferenceChange('paymentNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>

      <Footer year={2025} />
    </div>
  );
}
