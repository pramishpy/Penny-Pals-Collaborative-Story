import React from 'react';

interface FooterProps {
  year?: number;
}

export default function Footer({ year }: FooterProps) {
  return (
    <footer className="w-full border-t border-gray-200 bg-gray-50">
      <div className="container-main py-8">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <a href="#" className="text-gray-600 hover:text-gray-800">
              f
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-800">
              in
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-800">
              ▶
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-800">
              📷
            </a>
          </div>
          <p className="text-gray-600 text-sm">
            All rights reserved @ {year || new Date().getFullYear()} | PennyPals
          </p>
        </div>
      </div>
    </footer>
  );
}
