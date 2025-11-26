import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import GroupCard from '../components/GroupCard';
import GroupModal from '../components/GroupModal';
import AddMembersModal from '../components/AddMembersModal';
import { api } from '../lib/api';

interface GroupMember {
  id: string;
  username: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  amount: string;
  color: string;
  members?: GroupMember[];
}

export default function Groups() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
  const [balance, setBalance] = useState('$0.00');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await api.getGroups();
      if (data.balance) setBalance(data.balance);
      if (data.groups) setGroups(data.groups);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupAdded = () => {
    fetchGroups();
  };

  const openAddMembersModal = (group: Group) => {
    setSelectedGroup(group);
    setIsAddMembersModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Groups" />

      <main className="flex-1 container-main py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Overall, You are owed <span className="text-primary">{balance}</span>
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12 mb-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your groups...</p>
          </div>
        ) : groups.length > 0 ? (
          <div className="space-y-6 mb-8">
            {groups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{group.amount}</p>
                  </div>
                  <button
                    onClick={() => openAddMembersModal(group)}
                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-medium text-sm"
                  >
                    + Add Members
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Members:</p>
                  <div className="flex flex-wrap gap-2">
                    {group.members && group.members.length > 0 ? (
                      group.members.map((member) => (
                        <span
                          key={member.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {member.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No members yet</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-100 rounded-2xl mb-8">
            <p className="text-gray-600 text-lg mb-4">No groups yet</p>
            <p className="text-gray-500">Create your first group to get started!</p>
          </div>
        )}

        <div className="text-center">
          <Button
            label="Create a Group"
            onClick={() => setIsCreateModalOpen(true)}
            icon="+"
            type="secondary"
            className="inline-block"
          />
        </div>
      </main>

      <Footer year={2025} />
      
      <GroupModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleGroupAdded}
      />

      {selectedGroup && (
        <AddMembersModal
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          currentMembers={selectedGroup.members || []}
          isOpen={isAddMembersModalOpen}
          onClose={() => {
            setIsAddMembersModalOpen(false);
            setSelectedGroup(null);
          }}
          onSuccess={handleGroupAdded}
        />
      )}
    </div>
  );
}
