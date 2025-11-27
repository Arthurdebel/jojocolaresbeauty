'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function About() {
    const [aboutData, setAboutData] = useState({
        title: 'JoJo Colares',
        description: 'Acredito que a beleza é uma forma de arte e expressão pessoal. Com anos de dedicação ao universo da estética, minha missão vai além de aplicar maquiagem ou modelar fios; é sobre revelar a confiança que já existe em você.\n\nEspecialista em realçar traços naturais com sofisticação, busco em cada atendimento criar uma experiência única, onde o cuidado e a técnica se encontram para entregar resultados impecáveis e duradouros.',
        image: '/images/portfolio-2.png'
    });

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                const docSnap = await getDoc(doc(db, 'settings', 'landingPage'));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setAboutData({
                        title: data.about?.title || aboutData.title,
                        description: data.about?.description || aboutData.description,
                        image: data.about?.image || aboutData.image
                    });
                }
            } catch (error) {
                console.error('Error fetching about data:', error);
            }
        };

        fetchAboutData();
    }, []);

    return (
        <section className="py-32 bg-secondary/20 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* Image Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="flex-1 relative"
                    >
                        <div className="relative z-10 aspect-[4/5] overflow-hidden max-w-md mx-auto">
                            <img
                                src={aboutData.image}
                                alt={aboutData.title}
                                className="object-cover w-full h-full hover:scale-105 transition-transform duration-1000"
                            />
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -top-10 -left-10 w-full h-full border border-primary/30 z-0 hidden md:block" />
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl z-0" />
                    </motion.div>

                    {/* Text Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="flex-1 space-y-8 text-center lg:text-left"
                    >
                        <div className="space-y-4">
                            <span className="text-primary uppercase tracking-[0.2em] text-sm font-medium">Sobre a Profissional</span>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">{aboutData.title}</h2>
                        </div>

                        <div className="space-y-6 text-muted-foreground text-lg font-light leading-relaxed">
                            {aboutData.description.split('\n\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>

                        <div className="pt-4">
                            <Link href="/agendar">
                                <Button variant="outline" className="h-12 px-8 border-primary text-primary hover:bg-primary hover:text-white rounded-none transition-all duration-300 uppercase tracking-widest text-xs">
                                    Conheça meu trabalho
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
