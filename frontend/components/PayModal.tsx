import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface PayModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    maxAmount: number;
}

export default function PayModal({ isOpen, onClose, onSuccess, maxAmount }: PayModalProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            setAmount('');
            setSelectedUser('');
            setError('');
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            const [usersData, currentUserData] = await Promise.all([
                api.getAllUsers(),
                api.getCurrentUser()
            ]);

            const currentUserId = currentUserData.user?.id;
            const filteredUsers = (usersData.users || []).filter((u: any) => u.id !== currentUserId);

            setUsers(filteredUsers);
        } catch (err) {
            console.error('Failed to fetch users');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const amountNum = parseFloat(amount);
            if (amountNum <= 0) throw new Error('Amount must be greater than 0');
            if (amountNum > maxAmount) throw new Error('Insufficient funds in wallet');
            if (!selectedUser) throw new Error('Please select a user to pay');

            await api.payUser(selectedUser, amountNum);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="card p-8 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-foreground">Pay a Friend</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Select User</label>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="input-field"
                            required
                        >
                            <option value="">Choose a friend...</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.username})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Amount ($)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                max={maxAmount}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="input-field pl-8"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-right">
                            Available Balance: ${maxAmount.toFixed(2)}
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 btn-secondary">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Pay Now'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
