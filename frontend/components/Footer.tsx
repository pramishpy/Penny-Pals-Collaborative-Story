import React from 'react';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

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
                            <Facebook size={20} />
                        </a>
                        <a href="#" className="text-gray-600 hover:text-gray-800">
                            <Instagram size={20} />
                        </a>
                        <a href="#" className="text-gray-600 hover:text-gray-800">
                            <Linkedin size={20} />
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
