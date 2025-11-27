'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Service } from '@/types';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ServicesDisplay() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const snap = await getDocs(collection(db, 'services'));
                const servicesData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Service));
                setServices(servicesData);
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    if (loading) {
        return (
            <section className="py-32 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="mt-4 text-muted-foreground">Carregando serviços...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-32 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20 space-y-4">
                    <span className="text-primary uppercase tracking-[0.2em] text-sm font-medium">Nossos Serviços</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Menu de Beleza</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="group relative bg-white border border-border p-1 hover:border-primary/30 transition-colors duration-500"
                        >
                            <Link href={`/agendar?service=${service.id}`} className="block">
                                <div className="flex h-full flex-col md:flex-row gap-6 p-6 items-center md:items-start">
                                    <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 overflow-hidden rounded-full md:rounded-none">
                                        {service.imageUrl ? (
                                            <img
                                                src={service.imageUrl}
                                                alt={service.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-secondary flex items-center justify-center text-4xl font-serif font-bold text-primary">
                                                {service.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-center md:text-left space-y-3">
                                        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-2">
                                            <h3 className="text-xl font-serif font-medium group-hover:text-primary transition-colors">{service.name}</h3>
                                            <span className="text-lg font-medium text-muted-foreground whitespace-nowrap">A partir de R$ {service.price}</span>
                                        </div>
                                        <p className="text-muted-foreground text-sm leading-relaxed font-light">{service.description}</p>
                                        <div className="pt-2">
                                            <span className="inline-flex items-center text-xs uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
                                                Agendar <ArrowRight className="w-3 h-3 ml-2" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {services.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Nenhum serviço disponível no momento.</p>
                        <p className="text-sm text-muted-foreground mt-2">Entre em contato para mais informações.</p>
                    </div>
                )}

                {services.length > 0 && (
                    <div className="text-center mt-16">
                        <Link href="/agendar">
                            <button className="text-sm uppercase tracking-[0.2em] border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-all">
                                Ver Menu Completo
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
