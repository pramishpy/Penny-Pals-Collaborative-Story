import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import TransactionRow from '../components/TransactionRow';
import ExpenseModal from '../components/ExpenseModal';
import { api } from '../lib/api';

export default function Transactions() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterDate, setFilterDate] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterGroup, setFilterGroup] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await api.getTransactions();
            if (data.transactions) setTransactions(data.transactions);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExpenseAdded = () => {
        fetchTransactions();
    };

    const filteredTransactions = transactions.filter(tx => {
        const matchesDate = !filterDate || tx.date.startsWith(filterDate);
        // Basic category matching based on title keywords since we don't have explicit categories yet
        // This could be improved if backend returns category
        const matchesCategory = !filterCategory || tx.title.toLowerCase().includes(filterCategory.toLowerCase());
        // Group filtering would require group name in transaction data, assuming it might be there or we filter by title for now
        // Ideally backend should provide group name. For now, we'll skip strict group filtering or match title
        const matchesGroup = !filterGroup || (tx.groupName && tx.groupName.toLowerCase().includes(filterGroup.toLowerCase()));

        return matchesDate && matchesCategory && matchesGroup;
    });

    const handleExport = () => {
        const csvContent = [
            ['Date', 'Title', 'Paid By', 'Amount', 'Owed Amount', 'Status'],
            ...filteredTransactions.map(tx => [
                tx.date,
                `"${tx.title}"`,
                `"${tx.paidBy}"`,
                tx.amount,
                tx.owedAmount,
                tx.isOwed ? 'Owed to you' : 'You owe'
            ])
        ].map(e => e.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'transactions.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background transition-colors">
            <Header title="Transactions" />

            <main className="flex-1 container-main py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h2 className="text-3xl font-bold text-foreground">All Transactions</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <span>Download CSV</span>
                        </button>
                        <Button
                            label="Add Expense"
                            type="primary"
                            icon="+"
                            onClick={() => setIsModalOpen(true)}
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="input-field"
                        placeholder="Filter by Date"
                    />
                    <input
                        type="text"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="input-field"
                        placeholder="Filter by Category (e.g. Food)"
                    />
                    <input
                        type="text"
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value)}
                        className="input-field"
                        placeholder="Filter by Group"
                    />
                </div>

                <Card title="Transaction History">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="mt-4 text-muted-foreground">Loading transactions...</p>
                        </div>
                    ) : filteredTransactions.length > 0 ? (
                        <div className="divide-y divide-border">
                            {filteredTransactions.map((tx) => (
                                <TransactionRow
                                    key={tx.id}
                                    icon={tx.icon}
                                    title={tx.title}
                                    paidBy={tx.paidBy}
                                    amount={tx.amount}
                                    owedAmount={tx.owedAmount}
                                    isOwed={tx.isOwed}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
                            <p className="text-muted-foreground text-lg mb-2">No transactions found</p>
                            <p className="text-muted-foreground/80">Try adjusting your filters or add a new expense.</p>
                        </div>
                    )}
                </Card>
            </main>

            <Footer year={2025} />

            <ExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleExpenseAdded}
            />
        </div>
    );
}
