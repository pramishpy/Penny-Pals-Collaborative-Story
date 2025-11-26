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
    <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition">
      <div className="flex items-center gap-4 flex-1">
        <div className="text-4xl">{icon}</div>
        <div>
          <h4 className="font-bold text-gray-900 text-lg">{title}</h4>
          <p className="text-sm text-gray-600">
            {paidBy} paid: <span className="font-semibold">{amount}</span>
          </p>
        </div>
      </div>
      <div className="text-right whitespace-nowrap">
        <p className="text-xs text-gray-500 mb-1">
          {isOwed ? 'You owe :' : 'You are owed:'}
        </p>
        <p className={`text-lg font-bold ${isOwed ? 'text-red-500' : 'text-green-500'}`}>
          {owedAmount}
        </p>
      </div>
    </div>
  );
}
