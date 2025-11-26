import React from 'react';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

interface FooterProps {
    year?: number;
}

export default function Footer({ year }: FooterProps) {
    return (
        <footer className="w-full border-t border-border bg-muted/30 mt-auto">
            <div className="container-main py-8">
                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Facebook size={20} />
                        </a>
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Instagram size={20} />
                        </a>
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Linkedin size={20} />
                        </a>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        All rights reserved @ {year || new Date().getFullYear()} | PennyPals
                    </p>
                </div>
            </div>
        </footer>
    );
}
