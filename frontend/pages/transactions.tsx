import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import TransactionRow from '../components/TransactionRow';
import { api } from '../lib/api';

export default function Transactions() {
  const [transactions, setTransactions] = useState([
    {
      id: '1',
      icon: '🛒',
      title: 'Weekend Groceries',
      paidBy: 'You paid',
      amount: '$85.50',
      owedAmount: '$42.75',
      isOwed: false,
    },
    {
      id: '2',
      icon: '🍽️',
      title: 'Dinner at the Bistro Cafe',
      paidBy: 'Alex paid',
      amount: '$60.50',
      owedAmount: '$30.00',
      isOwed: true,
    },
    {
      id: '3',
      icon: '🎬',
      title: 'Movie Tickets',
      paidBy: 'You paid',
      amount: '$52.50',
      owedAmount: '$25.75',
      isOwed: false,
    },
    {
      id: '4',
      icon: '☕',
      title: 'Coffee and Bagels',
      paidBy: 'Sam paid',
      amount: '$60.00',
      owedAmount: '$30.00',
      isOwed: true,
    },
    {
      id: '5',
      icon: '🌐',
      title: 'Internet',
      paidBy: 'Alex paid',
      amount: '$85.50',
      owedAmount: '$40.00',
      isOwed: true,
    },
  ]);

  useEffect(() => {
    // Fetch transactions from backend
    const fetchTransactions = async () => {
      try {
        const data = await api.getTransactions();
        if (data.transactions) setTransactions(data.transactions);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Transactions" />

      <main className="flex-1 container-main py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">All Transactions</h2>
          <div className="flex gap-2">
            <Button label="Export" type="secondary" icon="📋" />
          </div>
        </div>

        <Card title="All Transactions">
          <div className="divide-y">
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                icon={tx.icon}
                title={tx.title}
                paidBy={tx.paidBy}
                amount={tx.amount}
                owedAmount={tx.owedAmount}
                isOwed={tx.isOwed}
              />
            ))}
          </div>
        </Card>
      </main>

      <Footer year={2025} />
    </div>
  );
}
