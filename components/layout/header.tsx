'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    return (
        <motion.header
            className={`fixed top-0 z-50 w-full transition-colors duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-border' : 'bg-transparent'
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                <Link href="/" className={`text-2xl font-serif font-bold tracking-tighter transition-colors ${isScrolled ? 'text-foreground' : 'text-white'}`}>
                    JoJo Colares
                </Link>
                <nav className="flex items-center gap-8">
                    <Link href="/agendar">
                        <Button
                            variant={isScrolled ? "primary" : "secondary"}
                            size="sm"
                            className={`rounded-none px-6 uppercase tracking-widest text-xs font-medium ${!isScrolled && 'bg-white text-black hover:bg-white/90'}`}
                        >
                            Agendar
                        </Button>
                    </Link>
                </nav>
            </div>
        </motion.header>
    );
}
