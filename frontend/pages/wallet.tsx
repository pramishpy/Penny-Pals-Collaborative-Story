import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import { api } from '../lib/api';

interface WalletData {
  balance: string;
  card_last_four: string;
  total_spent: string;
  total_owed_by_others: string;
  total_owed_to_others: string;
  bank_account?: string;
}

export default function Wallet() {
  const [walletData, setWalletData] = useState<WalletData>({
    balance: '$0.00',
    card_last_four: '3456',
    total_spent: '$0.00',
    total_owed_by_others: '$0.00',
    total_owed_to_others: '$0.00'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isLinkBankOpen, setIsLinkBankOpen] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  // Success modal states
  const [isAddMoneySuccess, setIsAddMoneySuccess] = useState(false);
  const [isLinkBankSuccess, setIsLinkBankSuccess] = useState(false);

  useEffect(() => {
    fetchWalletData();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.getCurrentUser();
      setCurrentUser(response.user);
    } catch (error) {
      console.error('Failed to fetch user');
    }
  };

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const data = await api.getWallet();
      setWalletData({
        balance: data.balance || '$0.00',
        card_last_four: data.card_last_four || '3456',
        total_spent: data.total_spent || '$0.00',
        total_owed_by_others: data.total_owed_by_others || '$0.00',
        total_owed_to_others: data.total_owed_to_others || '$0.00',
        bank_account: data.bank_account || ''
      });
    } catch (err) {
      setError('Failed to fetch wallet data');
      console.error('Failed to fetch wallet:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleLoadBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedAmount = parseFloat(amountToAdd);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        alert('Please enter a valid amount');
        return;
      }
      await api.loadBalance(parsedAmount);
      setAmountToAdd('');
      setIsAddMoneyOpen(false);
      await fetchWalletData(); // Refresh data
      setIsAddMoneySuccess(true);
      // Optionally keep alert or replace with modal
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to load balance');
    }
  };

  const handleLinkBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (bankAccount.length < 4) {
        alert('Please enter a valid account number');
        return;
      }
      await api.linkBank(bankAccount);
      setBankAccount('');
      setIsLinkBankOpen(false);
      await fetchWalletData(); // Refresh data
      setIsLinkBankSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to link bank account');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors">
      <Header title="Wallet" />

      <main className="flex-1 container-main py-8">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-foreground">
            Current Balance: <span className="text-primary font-extrabold">{loading ? '...' : walletData.balance}</span>
          </h2>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mt-4">
              {error}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading wallet...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:gap-12">
            {/* Top section - Button and Stats on left, Card on right */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
              {/* Left side - Button and Stats */}
              <div className="flex-1 flex flex-col gap-8">
                {/* Quick Stats */}
                <Card title="Quick Stats">
                  <div className="space-y-6">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Total Spent</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{walletData.total_spent}</p>
                    </div>
                    <hr className="border-border" />
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Others Owe You</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{walletData.total_owed_by_others}</p>
                    </div>
                    <hr className="border-border" />
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">You Owe Others</p>
                      <p className="text-3xl font-bold text-destructive mt-1">{walletData.total_owed_to_others}</p>
                    </div>
                    <hr className="border-border" />
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Linked Bank</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {walletData.bank_account ? `•••• ${walletData.bank_account}` : 'Not Linked'}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right side - Wallet Card - Larger and offset */}
              <div className="flex-1 flex items-start justify-end">
                <div className="w-full max-w-xl">
                  {/* Single flat card - larger and slightly more square */}
                  <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-8 text-white shadow-2xl transform hover:scale-[1.02] transition-transform duration-300" style={{ aspectRatio: '1.5 / 1' }}>
                    <div className="flex flex-col h-full justify-between overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-1">
                          <p className="text-sm font-bold tracking-widest">PENNYPALS</p>
                        </div>
                        <div className="text-3xl">💳</div>
                      </div>

                      <div className="my-8">
                        <p className="text-4xl tracking-widest font-light leading-tight font-mono">•••• •••• •••• {walletData.card_last_four}</p>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-white/80 mb-1 tracking-wider">CARDHOLDER</p>
                          <p className="text-lg font-bold uppercase tracking-wide">{currentUser?.name || 'User'}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="text-xs text-white/80 mb-1 tracking-wider">EXPIRES</p>
                          <p className="text-lg font-bold">12/28</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                label="Add Money"
                onClick={() => setIsAddMoneyOpen(true)}
                type="primary"
                icon="+"
                className="w-full sm:w-auto min-w-[200px] py-3"
              />
              <Button
                label="Link Bank Account"
                onClick={() => setIsLinkBankOpen(true)}
                type="secondary"
                icon="🏦"
                className="w-full sm:w-auto min-w-[200px] py-3"
                disabled={!!walletData.bank_account}
              />
            </div>
          </div>
        )}
      </main>

      <Footer year={2025} />

      {/* Add Money Modal */}
      {isAddMoneyOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="card p-8 max-w-sm w-full mx-4 shadow-2xl bg-background">
            <h3 className="text-xl font-bold mb-4 text-foreground">Add Money to Wallet</h3>
            <form onSubmit={handleLoadBalance}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amountToAdd}
                  onChange={(e) => setAmountToAdd(e.target.value)}
                  className="input-field"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsAddMoneyOpen(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Add Funds</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Bank Modal */}
      {isLinkBankOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="card p-8 max-w-sm w-full mx-4 shadow-2xl bg-background">
            <h3 className="text-xl font-bold mb-4 text-foreground">Link Bank Account</h3>
            <form onSubmit={handleLinkBank}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Account Number</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="input-field"
                  placeholder="Enter account number"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsLinkBankOpen(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Link Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modals */}
      {isAddMoneySuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="card p-8 max-w-sm w-full mx-4 shadow-2xl bg-background">
            <h3 className="text-xl font-bold mb-4 text-foreground">Success</h3>
            <p className="text-foreground mb-4">Funds added successfully!</p>
            <button onClick={() => setIsAddMoneySuccess(false)} className="flex-1 btn-primary">Close</button>
          </div>
        </div>
      )}
      {isLinkBankSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="card p-8 max-w-sm w-full mx-4 shadow-2xl bg-background">
            <h3 className="text-xl font-bold mb-4 text-foreground">Success</h3>
            <p className="text-foreground mb-4">Bank account linked successfully!</p>
            <button onClick={() => setIsLinkBankSuccess(false)} className="flex-1 btn-primary">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
