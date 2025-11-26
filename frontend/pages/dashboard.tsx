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

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (window.confirm(`Are you sure you want to delete "${groupName}"? This will also delete all expenses in this group.`)) {
      try {
        await api.deleteGroup(groupId);
        fetchDashboard();
      } catch (error) {
        console.error('Failed to delete group:', error);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header title="Dashboard" />

      <main className="flex-1 container-main py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Overall, You are owed <span className="text-primary">{balance}</span>
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your groups...</p>
          </div>
        ) : groups.length > 0 ? (
          <Card title="Your Groups">
            <div className="space-y-3">
              {groups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ background: group.color }}
                    ></div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{group.name}</h4>
                      {group.members && group.members.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {group.members.map(m => m.name).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${group.isOwed ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      {group.amount}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {group.isOwed ? 'owed to you' : 'you owe'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-2xl">
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">No groups yet</p>
            <p className="text-gray-500 dark:text-gray-400">Create your first group to get started!</p>
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
