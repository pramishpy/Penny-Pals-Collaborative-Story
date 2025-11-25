import React from 'react';

interface GroupCardProps {
  title: string;
  amount: string;
  color: string;
  onClick?: () => void;
}

export default function GroupCard({ title, amount, color, onClick }: GroupCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg transition transform hover:scale-105 min-h-[200px] flex flex-col justify-between`}
      style={{ background: color }}
    >
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="text-2xl font-bold text-green-300">{amount}</p>
    </div>
  );
}
