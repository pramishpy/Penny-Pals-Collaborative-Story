import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import GroupCard from '../components/GroupCard';
import GroupModal from '../components/GroupModal';
import ExpenseModal from '../components/ExpenseModal';
import { api } from '../lib/api';

export default function Dashboard() {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [balance, setBalance] = useState('$0.00');
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboard();
      if (data.balance) setBalance(data.balance);
      if (data.groups) setGroups(data.groups);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataUpdated = () => {
    fetchDashboard();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Dashboard" />

      <main className="flex-1 container-main py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Overall, You are owed <span className="text-primary">{balance}</span>
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your groups...</p>
          </div>
        ) : groups.length > 0 ? (
          <div className="grid grid-cols-4 gap-6">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                title={group.name || group.title}
                amount={group.amount}
                color={group.color}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-100 rounded-2xl">
            <p className="text-gray-600 text-lg mb-4">No groups yet</p>
            <p className="text-gray-500">Create your first group to get started!</p>
          </div>
        )}

        <div className="mt-12 text-center flex gap-4 justify-center">
          <Button
            label="Add Expense"
            icon="+"
            type="primary"
            className="inline-block"
            onClick={() => setIsExpenseModalOpen(true)}
          />
          <Button
            label="Add a Group"
            icon="+"
            type="secondary"
            className="inline-block"
            onClick={() => setIsGroupModalOpen(true)}
          />
        </div>
      </main>

      <Footer year={2025} />
      
      <GroupModal 
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSuccess={handleDataUpdated}
      />
      
      <ExpenseModal 
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={handleDataUpdated}
      />
    </div>
  );
}
