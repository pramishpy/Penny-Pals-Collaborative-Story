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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="card p-8 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Add Members</h2>
        <p className="text-muted-foreground mb-6">Add members to <strong>{groupName}</strong></p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No available users to add</p>
          ) : (
            users.map(user => (
              <label key={user.id} className="flex items-center p-3 border border-border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selectedMembers.has(user.id)}
                  onChange={() => toggleMember(user.id)}
                  className="w-4 h-4 text-primary rounded cursor-pointer"
                />
                <div className="ml-3 flex-1">
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleAddMembers}
            disabled={loading || selectedMembers.size === 0}
            className="flex-1 btn-primary"
          >
            {loading ? 'Adding...' : `Add (${selectedMembers.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}
