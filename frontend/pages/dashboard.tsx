import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import GroupCard from '../components/GroupCard';
import { api } from '../lib/api';

export default function Dashboard() {
  const [balance, setBalance] = useState('$89.27');
  const [groups, setGroups] = useState([
    {
      id: '1',
      title: 'Trip to Miami',
      amount: '$15.18',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      id: '2',
      title: 'APT 169',
      amount: '$15.18',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      id: '3',
      title: 'Johns Birthday',
      amount: '$15.18',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      id: '4',
      title: 'Restaurant',
      amount: '$15.18',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
  ]);

  useEffect(() => {
    // Fetch dashboard data from backend
    const fetchDashboard = async () => {
      try {
        const data = await api.getDashboard();
        if (data.balance) setBalance(data.balance);
        if (data.groups) setGroups(data.groups);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Dashboard" />

      <main className="flex-1 container-main py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Overall, You are owed <span className="text-primary">{balance}</span>
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              title={group.title}
              amount={group.amount}
              color={group.color}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            label="Add a Group"
            icon="+"
            type="secondary"
            className="inline-block"
          />
        </div>
      </main>

      <Footer year={2025} />
    </div>
  );
}
