import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
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
  description?: string;
  amount: string;
  color: string;
  members?: GroupMember[];
  isOwed?: boolean;
}

export default function Groups() {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
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
    <div className="flex flex-col min-h-screen bg-background transition-colors">
      <Header title="Groups" />

      <main className="flex-1 container-main py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">Your Groups</h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading groups...</p>
          </div>
        ) : groups.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-3xl p-8 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-h-[320px] flex flex-col justify-between relative border border-white/10 w-full"
                  style={{ background: group.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  {/* Delete button - top right */}
                  <button
                    onClick={() => handleDeleteGroup(group.id, group.name)}
                    className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
                    title="Delete group"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  {/* Add Members button - top left with plus icon */}
                  <button
                    onClick={() => openAddMembersModal(group)}
                    className="absolute top-4 left-4 text-white hover:opacity-70 transition text-2xl font-light"
                    title="Add members"
                  >
                    +
                  </button>

                  <div className="pt-8">
                    <h3 className="text-2xl font-bold mb-1">{group.name}</h3>
                    <p className="text-white/80 text-sm line-clamp-2">{group.description}</p>
                  </div>

                  <div>
                    <p className={`text-4xl font-bold ${group.isOwed ? 'text-green-400' : 'text-red-400'}`}>
                      {group.amount}
                    </p>
                    <p className="text-xs text-white/70 uppercase tracking-wider font-medium">
                      {group.isOwed ? 'You are owed' : 'You owe'}
                    </p>
                  </div>

                  {/* Members display at bottom */}
                  <div className="mt-4">
                    <p className="text-xs text-white/70 mb-1 uppercase tracking-wider font-medium">Members</p>
                    <div className="flex -space-x-2 overflow-hidden">
                      {group.members && group.members.length > 0 ? (
                        group.members.slice(0, 4).map((member) => (
                          <div key={member.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white/20 bg-white/20 flex items-center justify-center text-xs font-bold text-white uppercase">
                            {member.name.charAt(0)}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-white/50 italic">No members yet</span>
                      )}
                      {group.members && group.members.length > 4 && (
                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white/20 bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                          +{group.members.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <Button
                label="Create New Group"
                onClick={() => setIsGroupModalOpen(true)}
                type="primary"
                icon="+"
                className="px-8 py-3 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              />
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
            <div className="text-6xl mb-6">👥</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No groups yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Create a group to start sharing expenses with friends, roommates, or family.</p>
            <Button
              label="Create Your First Group"
              onClick={() => setIsGroupModalOpen(true)}
              type="primary"
              icon="+"
            />
          </div>
        )}
      </main>

      <Footer year={2025} />

      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSuccess={fetchGroups}
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
          onSuccess={fetchGroups}
        />
      )}
    </div>
  );
}
