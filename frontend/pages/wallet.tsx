import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import { api } from '../lib/api';

interface WalletData {
  balance: string;
  card_last_four: string;
  total_spent: string;
  total_owed_by_others: string;
  total_owed_to_others: string;
}

export default function Wallet() {
  const [walletData, setWalletData] = useState<WalletData>({
    balance: '$0.00',
    card_last_four: '3456',
    total_spent: '$0.00',
    total_owed_by_others: '$0.00',
    total_owed_to_others: '$0.00'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const data = await api.getWallet();
      setWalletData({
        balance: data.balance || '$0.00',
        card_last_four: data.card_last_four || '3456',
        total_spent: data.total_spent || '$0.00',
        total_owed_by_others: data.total_owed_by_others || '$0.00',
        total_owed_to_others: data.total_owed_to_others || '$0.00'
      });
    } catch (err) {
      setError('Failed to fetch wallet data');
      console.error('Failed to fetch wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadBalance = async () => {
    try {
      const amount = prompt('Enter amount to load:');
      if (amount) {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          setError('Please enter a valid amount');
          return;
        }
        await api.loadBalance(parsedAmount);
        setError('');
        // Refetch wallet data after loading balance
        await fetchWallet();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load balance');
      console.error('Failed to load balance:', err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Wallet" />

      <main className="flex-1 container-main py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Current Balance: <span className="text-primary">{loading ? '...' : walletData.balance}</span>
          </h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading wallet...</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <Card title="Your Wallet">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-8 text-white shadow-lg mb-6">
                  <p className="text-sm opacity-75 mb-4">VIRTUAL</p>
                  <p className="text-4xl tracking-widest mb-4">• • • {walletData.card_last_four}</p>
                  <div className="flex justify-end">
                    <svg
                      width="40"
                      height="24"
                      viewBox="0 0 40 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" fill="red" />
                      <circle cx="22" cy="12" r="10" fill="orange" />
                    </svg>
                  </div>
                </div>

                <Button
                  label="Load balance to your wallet"
                  onClick={handleLoadBalance}
                  type="secondary"
                  className="w-full"
                />
              </Card>
            </div>

            <div>
              <Card title="Quick Stats">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 text-sm">Total Spent</p>
                    <p className="text-2xl font-bold">{walletData.total_spent}</p>
                  </div>
                  <hr />
                  <div>
                    <p className="text-gray-600 text-sm">Others Owe You</p>
                    <p className="text-2xl font-bold text-green-500">{walletData.total_owed_by_others}</p>
                  </div>
                  <hr />
                  <div>
                    <p className="text-gray-600 text-sm">You Owe Others</p>
                    <p className="text-2xl font-bold text-red-500">{walletData.total_owed_to_others}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer year={2025} />
    </div>
  );
}
