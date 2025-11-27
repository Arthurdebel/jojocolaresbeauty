'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Testimonial } from '@/types';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export function Testimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'), limit(3));
                const snap = await getDocs(q);
                const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Testimonial));
                setTestimonials(items);
            } catch (error) {
                console.error('Error fetching testimonials:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    if (loading) return null;

    if (testimonials.length === 0) return null;

    return (
        <section className="py-24 bg-secondary/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-primary uppercase tracking-[0.2em] text-sm font-medium">Depoimentos</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">O que dizem nossas clientes</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                            className="bg-background p-8 md:p-10 rounded-none border border-border/50 relative group hover:border-primary/30 transition-colors duration-500"
                        >
                            <Quote className="w-10 h-10 text-primary/20 mb-6 group-hover:text-primary/40 transition-colors" />
                            <p className="text-muted-foreground font-light text-lg leading-relaxed mb-8 italic font-serif">
                                "{item.text}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-serif font-bold">
                                    {item.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-medium text-foreground tracking-wide">{item.name}</h4>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{item.role}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </section>
    );
}
