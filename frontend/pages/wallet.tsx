import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import { api } from '../lib/api';

export default function Wallet() {
  const [balance, setBalance] = useState('$0.00');
  const [cardNumber] = useState('3456');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const data = await api.getWallet();
      if (data.balance) setBalance(data.balance);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadBalance = async () => {
    try {
      const amount = prompt('Enter amount to load:');
      if (amount) {
        const result = await api.loadBalance(parseFloat(amount));
        alert('Balance loaded successfully');
        // Update balance in UI immediately
        if (result.balance) {
          setBalance(result.balance);
        } else {
          // Fallback: refetch wallet data
          const data = await api.getWallet();
          if (data.balance) setBalance(data.balance);
        }
      }
    } catch (error) {
      alert('Failed to load balance');
      console.error('Failed to load balance:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Wallet" />

      <main className="flex-1 container-main py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Current Balance: <span className="text-primary">{loading ? '...' : balance}</span>
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <Card title="Your Wallet">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-8 text-white shadow-lg mb-6">
                <p className="text-sm opacity-75 mb-4">VIRTUAL</p>
                <p className="text-4xl tracking-widest mb-4">• • • {cardNumber}</p>
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
                  <p className="text-2xl font-bold">$450.50</p>
                </div>
                <hr />
                <div>
                  <p className="text-gray-600 text-sm">You are Owed</p>
                  <p className="text-2xl font-bold text-green-500">$89.27</p>
                </div>
                <hr />
                <div>
                  <p className="text-gray-600 text-sm">You Owe</p>
                  <p className="text-2xl font-bold text-red-500">$100.00</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer year={2025} />
    </div>
  );
}
