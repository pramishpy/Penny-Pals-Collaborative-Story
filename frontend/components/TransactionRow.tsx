import React from 'react';

interface TransactionRowProps {
  icon: string;
  title: string;
  paidBy: string;
  amount: string;
  owedAmount?: string;
  isOwed?: boolean;
}

export default function TransactionRow({ icon, title, paidBy, amount, owedAmount, isOwed }: TransactionRowProps) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground">Paid by {paidBy}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-foreground">{amount}</p>
        {owedAmount && (
          <p className={`text-xs font-medium ${isOwed ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
            {isOwed ? 'you are owed' : 'you owe'} {owedAmount}
          </p>
        )}
      </div>
    </div>
  );
}
