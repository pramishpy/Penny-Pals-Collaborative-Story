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
        <div className="mb-12">
          <h2 className="text-4xl font-bold">
            Current Balance: <span className="text-blue-600 font-extrabold">{loading ? '...' : walletData.balance}</span>
          </h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
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
          <div className="flex flex-col gap-12">
            {/* Top section - Button and Stats on left, Card on right */}
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Left side - Button and Stats */}
              <div className="flex-1 flex flex-col gap-8">
                {/* Quick Stats */}
                <Card title="Quick Stats">
                  <div className="space-y-6">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{walletData.total_spent}</p>
                    </div>
                    <hr className="border-gray-200" />
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Others Owe You</p>
                      <p className="text-3xl font-bold text-green-500 mt-1">{walletData.total_owed_by_others}</p>
                    </div>
                    <hr className="border-gray-200" />
                    <div>
                      <p className="text-gray-600 text-sm font-medium">You Owe Others</p>
                      <p className="text-3xl font-bold text-red-500 mt-1">{walletData.total_owed_to_others}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right side - Wallet Card - Larger and offset */}
              <div className="flex-1 flex items-start justify-end">
                <div className="w-full max-w-lg">
                  {/* Single flat card - credit card proportions */}
                  <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 rounded-lg p-6 text-white shadow-xl" style={{ aspectRatio: '1.586 / 1' }}>
                    <div className="flex flex-col h-full justify-between overflow-hidden">
                      <div>
                        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-3 py-0.5 inline-block w-fit">
                          <p className="text-xs font-semibold tracking-wider">VIRTUAL</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-2xl tracking-widest font-light leading-tight">•••• •••• •••• {walletData.card_last_four}</p>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-white text-opacity-75 mb-0.5">CARDHOLDER</p>
                          <p className="text-xs font-semibold uppercase">User</p>
                        </div>
                        <div className="flex -space-x-3">
                          <div className="w-8 h-8 rounded-full bg-red-600 shadow-lg"></div>
                          <div className="w-8 h-8 rounded-full bg-orange-500 shadow-lg"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Centered Load Button Below */}
            <div className="flex justify-center">
              <Button
                label="Load balance to your wallet"
                onClick={handleLoadBalance}
                type="secondary"
                className="w-full max-w-xs py-3"
              />
            </div>
          </div>
        )}
      </main>

      <Footer year={2025} />
    </div>
  );
}
