import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
}

interface GroupMember {
  id: string;
  username: string;
  name: string;
}

interface Props {
  groupId: string;
  groupName: string;
  currentMembers: GroupMember[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMembersModal({
  groupId,
  groupName,
  currentMembers,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableUsers();
    }
  }, [isOpen]);

  const fetchAvailableUsers = async () => {
    try {
      const data = await api.getAllUsers();
      // Filter out users that are already members
      const currentMemberIds = new Set(currentMembers.map(m => m.id));
      const available = data.users.filter((u: User) => !currentMemberIds.has(u.id));
      setUsers(available);
    } catch (err) {
      setError('Failed to load users');
    }
  };

  const toggleMember = (userId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedMembers(newSelected);
  };

  const handleAddMembers = async () => {
    if (selectedMembers.size === 0) {
      setError('Please select at least one member');
      return;
    }

    try {
      setLoading(true);
      await api.addMembersToGroup(groupId, Array.from(selectedMembers));
      setSelectedMembers(new Set());
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-2">Add Members</h2>
        <p className="text-gray-600 mb-6">Add members to <strong>{groupName}</strong></p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No available users to add</p>
          ) : (
            users.map(user => (
              <label key={user.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMembers.has(user.id)}
                  onChange={() => toggleMember(user.id)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <div className="ml-3 flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAddMembers}
            disabled={loading || selectedMembers.size === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
          >
            {loading ? 'Adding...' : `Add (${selectedMembers.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}
