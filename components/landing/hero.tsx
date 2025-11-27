'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Hero() {
    const [heroData, setHeroData] = useState({
        title: 'Realce Sua Essência',
        subtitle: 'Uma experiência de beleza única, onde cada detalhe é pensado para revelar a sua melhor versão com sofisticação e naturalidade.',
        backgroundImage: '/images/hero-bg.png'
    });

    useEffect(() => {
        const fetchHeroData = async () => {
            try {
                const docSnap = await getDoc(doc(db, 'settings', 'landingPage'));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setHeroData({
                        title: data.hero?.title || heroData.title,
                        subtitle: data.hero?.subtitle || heroData.subtitle,
                        backgroundImage: data.hero?.backgroundImage || heroData.backgroundImage
                    });
                }
            } catch (error) {
                console.error('Error fetching hero data:', error);
            }
        };

        fetchHeroData();
    }, []);

    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Parallax Effect */}
            <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, ease: "easeOut" }}
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url(${heroData.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 text-center text-white space-y-8 px-4 max-w-5xl mx-auto flex flex-col items-center">
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="uppercase tracking-[0.3em] text-sm md:text-base font-light text-white/80"
                >
                    Estúdio de Beleza Exclusivo
                </motion.span>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                    className="text-6xl md:text-8xl lg:text-9xl font-serif font-medium tracking-tight leading-none"
                >
                    {heroData.title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-lg md:text-xl font-light text-white/80 max-w-2xl leading-relaxed"
                >
                    {heroData.subtitle}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="pt-8"
                >
                    <Link href="/agendar">
                        <Button
                            size="lg"
                            className="h-14 px-10 text-lg rounded-none bg-white text-black hover:bg-primary hover:text-white transition-all duration-500 font-medium tracking-wide border border-transparent hover:border-white/20"
                        >
                            Agendar Horário
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
            >
                <span className="text-[10px] uppercase tracking-widest">Descubra</span>
                <div className="w-px h-12 bg-white/30" />
            </motion.div>
        </section>
    );
}
