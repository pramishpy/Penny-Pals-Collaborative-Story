import React from 'react';

interface GroupCardProps {
  id: string;
  title: string;
  amount: string;
  color: string;
  isOwed: boolean;
  onDelete?: (id: string, name: string) => void;
}

export default function GroupCard({ id, title, amount, color, isOwed, onDelete }: GroupCardProps) {
  return (
    <div
      className={`rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg transition transform hover:scale-105 min-h-[200px] flex flex-col justify-between relative`}
      style={{ background: color }}
    >
      {/* Delete button - top right */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id, title);
          }}
          className="absolute top-4 right-4 text-white hover:opacity-70 transition text-xl"
          title="Delete group"
        >
          ✕
        </button>
      )}

      <h3 className="text-2xl font-bold pr-8">{title}</h3>
      <p className={`text-3xl font-bold ${isOwed ? 'text-red-400' : 'text-green-300'}`}>
        {amount}
      </p>
    </div>
  );
}
