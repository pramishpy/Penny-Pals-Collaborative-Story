import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import TransactionRow from '../components/TransactionRow';
import ExpenseModal from '../components/ExpenseModal';
import { api } from '../lib/api';

export default function Transactions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.getTransactions();
      if (data.transactions) setTransactions(data.transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = () => {
    fetchTransactions();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Transactions" />

      <main className="flex-1 container-main py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">All Transactions</h2>
          <div className="flex gap-2">
            <Button 
              label="Add Expense" 
              type="primary" 
              icon="+" 
              onClick={() => setIsModalOpen(true)}
            />
            <Button label="Export" type="secondary" icon="📋" />
          </div>
        </div>

        <Card title="All Transactions">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading transactions...</p>
            </div>
          ) : transactions.length > 0 ? (
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
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-2">No transactions yet</p>
              <p className="text-gray-500">Add your first expense to get started!</p>
            </div>
          )}
        </Card>
      </main>

      <Footer year={2025} />
      
      <ExpenseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleExpenseAdded}
      />
    </div>
  );
}
