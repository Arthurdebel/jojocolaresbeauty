'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PortfolioItem } from '@/types';
import { motion } from 'framer-motion';

export function Portfolio() {
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const q = query(collection(db, 'portfolio'), orderBy('createdAt', 'desc'), limit(8));
                const snap = await getDocs(q);
                const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as PortfolioItem));
                setPortfolioItems(items);
            } catch (error) {
                console.error('Error fetching portfolio:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, []);

    if (loading) return null;

    if (portfolioItems.length === 0) return null;

    return (
        <section className="py-32 bg-background">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                    <div className="space-y-4 max-w-xl">
                        <span className="text-primary uppercase tracking-[0.2em] text-sm font-medium">Portfólio</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
                            Arte em cada detalhe
                        </h2>
                    </div>
                    <p className="text-muted-foreground max-w-sm text-right md:text-left font-light leading-relaxed">
                        Explore nossa galeria de transformações e inspire-se com a delicadeza e precisão do nosso trabalho.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {portfolioItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className={`group relative overflow-hidden aspect-[3/4] cursor-pointer ${index === 1 || index === 2 ? 'md:mt-12' : ''}`}
                        >
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 grayscale-[20%] group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />

                            <div className="absolute inset-0 p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <span className="text-primary text-xs uppercase tracking-widest mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{item.category}</span>
                                <h3 className="text-white text-2xl font-serif translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">{item.title}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
