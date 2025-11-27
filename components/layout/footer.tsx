'use client';

import { useState, useEffect } from 'react';
import { Instagram, Facebook, Mail } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function Footer() {
    const [contactInfo, setContactInfo] = useState({
        address: 'Rua da Beleza, 123 - Jardins',
        city: 'São Paulo - SP',
        email: 'contato@jojocolares.com.br',
        instagram: '',
        facebook: ''
    });
    const [whatsapp, setWhatsapp] = useState('(38) 98276-288');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch landing page settings for address/email
                const landingSnap = await getDoc(doc(db, 'settings', 'landingPage'));
                if (landingSnap.exists()) {
                    const data = landingSnap.data();
                    if (data.contact) {
                        setContactInfo({
                            address: data.contact.address || contactInfo.address,
                            city: data.contact.city || contactInfo.city,
                            email: data.contact.email || contactInfo.email,
                            instagram: data.contact.instagram || '',
                            facebook: data.contact.facebook || ''
                        });
                    }
                }

                // Fetch general settings for WhatsApp
                const generalSnap = await getDoc(doc(db, 'settings', 'general'));
                if (generalSnap.exists()) {
                    const data = generalSnap.data();
                    if (data.whatsappNumber) {
                        // Format whatsapp number for display
                        const raw = data.whatsappNumber.replace(/\D/g, '');
                        if (raw.length >= 10) {
                            // Simple formatting for BR numbers
                            const ddd = raw.substring(2, 4);
                            const part1 = raw.substring(4, 9);
                            const part2 = raw.substring(9);
                            setWhatsapp(`(${ddd}) ${part1}-${part2}`);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching footer data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <footer className="bg-secondary/30 pt-20 pb-10 border-t border-primary/10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 text-center md:text-left">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-serif font-bold text-foreground">JoJo Colares</h3>
                        <p className="text-muted-foreground font-light max-w-xs mx-auto md:mx-0">
                            Realçando sua beleza natural com sofisticação e exclusividade.
                        </p>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Contato</h4>
                        <div className="space-y-2 text-muted-foreground font-light">
                            <p>{contactInfo.address}</p>
                            <p>{contactInfo.city}</p>
                            <p>{whatsapp}</p>
                            <p>{contactInfo.email}</p>
                        </div>
                    </div>

                    {/* Social */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Redes Sociais</h4>
                        <div className="flex justify-center md:justify-start gap-4">
                            {contactInfo.instagram && (
                                <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all">
                                    <Instagram className="w-4 h-4" />
                                </a>
                            )}
                            {contactInfo.facebook && (
                                <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all">
                                    <Facebook className="w-4 h-4" />
                                </a>
                            )}
                            <a href={`mailto:${contactInfo.email}`} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all">
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-light uppercase tracking-wider">
                    <p>&copy; {new Date().getFullYear()} JoJo Colares. Todos os direitos reservados.</p>
                    <p>CNPJ: 00.000.000/0001-00</p>
                </div>
            </div>
        </footer>
    );
}
