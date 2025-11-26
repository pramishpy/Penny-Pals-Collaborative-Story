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

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (window.confirm(`Are you sure you want to delete "${groupName}"? This will also delete all expenses in this group.`)) {
      try {
        await api.deleteGroup(groupId);
        fetchGroups();
      } catch (error) {
        console.error('Failed to delete group:', error);
      }
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {groups.map((group) => (
              <div
                key={group.id}
                className="rounded-2xl p-6 text-white hover:shadow-lg transition transform hover:scale-105 min-h-[200px] flex flex-col justify-between relative"
                style={{ background: group.color }}
              >
                {/* Delete button - top right */}
                <button
                  onClick={() => handleDeleteGroup(group.id, group.name)}
                  className="absolute top-4 right-4 text-white hover:opacity-70 transition text-xl"
                  title="Delete group"
                >
                  ✕
                </button>

                {/* Add Members button - top left with plus icon */}
                <button
                  onClick={() => openAddMembersModal(group)}
                  className="absolute top-4 left-4 text-white hover:opacity-70 transition text-2xl font-light"
                  title="Add members"
                >
                  +
                </button>

                <div className="pt-6">
                  <h3 className="text-2xl font-bold">{group.name}</h3>
                </div>

                <div>
                  <p className={`text-3xl font-bold ${group.isOwed ? 'text-green-300' : 'text-red-400'}`}>
                    {group.amount}
                  </p>
                </div>

                {/* Members display at bottom */}
                <div className="text-xs text-white text-opacity-75">
                  <p className="mb-1">Members: {group.members?.length || 0}</p>
                  <div className="flex flex-wrap gap-1">
                    {group.members && group.members.length > 0 ? (
                      group.members.slice(0, 3).map((member) => (
                        <span key={member.id} className="bg-white bg-opacity-20 px-2 py-1 rounded">
                          {member.name.split(' ')[0]}
                        </span>
                      ))
                    ) : null}
                    {group.members && group.members.length > 3 && (
                      <span className="bg-white bg-opacity-20 px-2 py-1 rounded">+{group.members.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-100 rounded-2xl mb-12">
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
