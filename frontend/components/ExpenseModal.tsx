import React, { useState, useEffect } from 'react';
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

type SplitType = 'equal' | 'unequal' | 'percentage';

export default function ExpenseModal({ isOpen, onClose, onSuccess }: ExpenseModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
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
        const memberIds = new Set(group.members.map(m => m.id));
        setSelectedParticipants(memberIds);
        // Reset custom splits
        setCustomSplits({});
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
      // Remove from custom splits if deselected
      const newSplits = { ...customSplits };
      delete newSplits[memberId];
      setCustomSplits(newSplits);
    } else {
      newSelected.add(memberId);
    }
    setSelectedParticipants(newSelected);
  };

  const handleCustomSplitChange = (memberId: string, value: string) => {
    setCustomSplits(prev => ({
      ...prev,
      [memberId]: value
    }));
  };

  const calculateSplits = () => {
    const participants = Array.from(selectedParticipants);
    if (participants.length === 0) return {};

    const totalAmount = parseFloat(amount) || 0;
    const splits: Record<string, number> = {};

    if (splitType === 'equal') {
      const splitAmount = totalAmount / participants.length;
      participants.forEach(id => {
        splits[id] = splitAmount;
      });
    } else if (splitType === 'unequal') {
      participants.forEach(id => {
        splits[id] = parseFloat(customSplits[id]) || 0;
      });
    } else if (splitType === 'percentage') {
      participants.forEach(id => {
        const percentage = parseFloat(customSplits[id]) || 0;
        splits[id] = (totalAmount * percentage) / 100;
      });
    }

    return splits;
  };

  const validateSplits = () => {
    const splits = calculateSplits();
    const totalSplit = Object.values(splits).reduce((a, b) => a + b, 0);
    const totalAmount = parseFloat(amount);

    if (Math.abs(totalSplit - totalAmount) > 0.01) {
      if (splitType === 'percentage') {
        return `Total percentage must equal 100% (Current: ${(totalSplit / totalAmount * 100).toFixed(1)}%)`;
      }
      return `Total split amount ($${totalSplit.toFixed(2)}) must equal expense amount ($${totalAmount.toFixed(2)})`;
    }
    return null;
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

    if (splitType !== 'equal') {
      const validationError = validateSplits();
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setLoading(true);
    try {
      const expenseAmount = parseFloat(amount);
      const finalSplits = calculateSplits();

      await api.addExpense({
        title: title.trim(),
        amount: expenseAmount,
        group_id: selectedGroup,
        participants: Array.from(selectedParticipants),
        split_type: splitType,
        splits: finalSplits
      });

      setTitle('');
      setAmount('');
      setSelectedGroup('');
      setSelectedParticipants(new Set());
      setCustomSplits({});
      setSplitType('equal');
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="card p-8 max-w-md w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Add New Expense</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Expense Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dinner, Groceries"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="groupSelect" className="block text-sm font-medium text-foreground mb-2">
                Group
              </label>
              <select
                id="groupSelect"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="input-field"
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
                <label className="block text-sm font-medium text-foreground mb-2">
                  Split Type
                </label>
                <div className="flex gap-2 mb-4">
                  {(['equal', 'unequal', 'percentage'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSplitType(type)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${splitType === type
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-muted-foreground border-border hover:bg-muted'
                        }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>

                <label className="block text-sm font-medium text-foreground mb-2">
                  Participants ({selectedParticipants.size})
                </label>
                <div className="space-y-2 border border-border rounded-xl p-3 max-h-48 overflow-y-auto bg-muted/20">
                  {groupMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg">
                      <label className="flex items-center cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={selectedParticipants.has(member.id)}
                          onChange={() => toggleParticipant(member.id)}
                          className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                        <span className="ml-3 text-sm font-medium text-foreground">{member.name}</span>
                      </label>

                      {selectedParticipants.has(member.id) && splitType !== 'equal' && (
                        <div className="ml-4 w-24">
                          <input
                            type="number"
                            step={splitType === 'percentage' ? '1' : '0.01'}
                            placeholder={splitType === 'percentage' ? '%' : '$'}
                            value={customSplits[member.id] || ''}
                            onChange={(e) => handleCustomSplitChange(member.id, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedParticipants.size > 0 && amount && splitType === 'equal' && (
              <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
                <p className="text-sm text-primary">
                  <strong>Per person:</strong> ${(parseFloat(amount) / selectedParticipants.size).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

