import React from 'react';

interface ButtonProps {
  label: string;
  onClick?: () => void;
  type?: 'primary' | 'secondary';
  className?: string;
  icon?: string;
  disabled?: boolean;
}

export default function Button({
  label,
  onClick,
  type = 'primary',
  className = '',
  icon,
  disabled,
}: ButtonProps) {
  const baseClass =
    type === 'primary' ? 'btn-primary' : 'btn-secondary';

  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${className}`}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
}
