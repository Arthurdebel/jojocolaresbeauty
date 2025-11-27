'use client';

import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';

export function InstagramFeed() {
    // Instagram username
    const username = 'jojocolaresbeauty';

    // Placeholder posts - em produção, você pode usar a API do Instagram
    // ou um serviço como EmbedSocial, Juicer, etc.
    const posts = [
        { id: 1, image: '/images/portfolio-1.png' },
        { id: 2, image: '/images/portfolio-2.png' },
        { id: 3, image: '/images/portfolio-3.png' },
        { id: 4, image: '/images/hero-bg.png' },
    ];

    return (
        <section className="py-32 bg-secondary/20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-primary uppercase tracking-[0.2em] text-sm font-medium">Siga-nos</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
                        @{username}
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Acompanhe nosso dia a dia, inspirações e transformações no Instagram
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
                    {posts.map((post, index) => (
                        <motion.a
                            key={post.id}
                            href={`https://instagram.com/${username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative aspect-square overflow-hidden bg-secondary"
                        >
                            <img
                                src={post.image}
                                alt={`Instagram post ${post.id}`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </motion.a>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <a
                        href={`https://instagram.com/${username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-all"
                    >
                        <Instagram className="w-4 h-4" />
                        Seguir no Instagram
                    </a>
                </div>
            </div>
        </section>
    );
}
