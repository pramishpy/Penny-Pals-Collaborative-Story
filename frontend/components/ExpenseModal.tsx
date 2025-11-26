import React, { useState, useEffect } from 'react';
import Button from './Button';
import { api } from '../lib/api';

interface GroupMember {
  id: string;
  username: string;
  name: string;
}

interface GroupData {
  id: string;
  name: string;
  members?: GroupMember[];
}

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExpenseModal({ isOpen, onClose, onSuccess }: ExpenseModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-select all members when group changes
    if (selectedGroup) {
      const group = groups.find(g => g.id === selectedGroup);
      if (group && group.members) {
        setSelectedParticipants(new Set(group.members.map(m => m.id)));
      }
    }
  }, [selectedGroup, groups]);

  const fetchGroups = async () => {
    try {
      const data = await api.getGroups();
      if (data.groups) {
        setGroups(data.groups);
        if (data.groups.length > 0) {
          setSelectedGroup(data.groups[0].id);
        }
      }
    } catch (error) {
      setError('Failed to fetch groups');
    }
  };

  const currentGroup = groups.find(g => g.id === selectedGroup);
  const groupMembers = currentGroup?.members || [];

  const toggleParticipant = (memberId: string) => {
    const newSelected = new Set(selectedParticipants);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedParticipants(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !amount || parseFloat(amount) <= 0) {
      setError('Please enter valid title and amount');
      return;
    }

    if (!selectedGroup) {
      setError('Please select a group');
      return;
    }

    if (selectedParticipants.size === 0) {
      setError('Please select at least one participant');
      return;
    }

    setLoading(true);
    try {
      const expenseAmount = parseFloat(amount);
      
      await api.addExpense({
        title: title.trim(),
        amount: expenseAmount,
        group_id: selectedGroup,
        participants: Array.from(selectedParticipants)
      });

      setTitle('');
      setAmount('');
      setSelectedGroup('');
      setSelectedParticipants(new Set());
      setError('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Add New Expense</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dinner, Groceries, Movie tickets"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="groupSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Group
              </label>
              <select
                id="groupSelect"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedGroup && groupMembers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Split Between ({selectedParticipants.size})
                </label>
                <div className="space-y-2 border rounded-lg p-3 max-h-32 overflow-y-auto">
                  {groupMembers.map(member => (
                    <label key={member.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.has(member.id)}
                        onChange={() => toggleParticipant(member.id)}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {selectedParticipants.size > 0 && amount && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Per person:</strong> ${(parseFloat(amount) / selectedParticipants.size).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

