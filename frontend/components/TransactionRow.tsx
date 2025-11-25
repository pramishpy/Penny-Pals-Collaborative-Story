import React from 'react';

interface TransactionRowProps {
  icon: string;
  title: string;
  paidBy: string;
  amount: string;
  owedAmount: string;
  isOwed: boolean;
}

export default function TransactionRow({
  icon,
  title,
  paidBy,
  amount,
  owedAmount,
  isOwed,
}: TransactionRowProps) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition">
      <div className="text-3xl">{icon}</div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-800">{title}</h4>
        <p className="text-sm text-gray-500">
          {paidBy ? `${paidBy} paid: ${amount}` : `You paid: ${amount}`}
        </p>
      </div>
      <div className="text-right">
        <p className={`font-bold ${isOwed ? 'text-red-500' : 'text-green-500'}`}>
          {isOwed ? 'You owe:' : 'You are owed:'} {owedAmount}
        </p>
      </div>
    </div>
  );
}
