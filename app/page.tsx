'use client';

import { Hero } from '@/components/landing/hero';
import { Portfolio } from '@/components/landing/portfolio';
import { About } from '@/components/landing/about';
import { Testimonials } from '@/components/landing/testimonials';
import { ServicesDisplay } from '@/components/landing/services-display';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function Home() {
  const handleWhatsApp = () => {
    window.location.href = "https://wa.me/553898276288?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio.";
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Hero />
      <About />
      <ServicesDisplay />
      <Portfolio />
      <Testimonials />

      {/* Final CTA Section */}
      <section className="py-32 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/hero-bg.png')] bg-cover bg-center mix-blend-overlay" />

        <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6">Pronta para realçar sua beleza?</h2>
            <p className="text-white/70 text-lg md:text-xl font-light max-w-2xl mx-auto mb-10">
              Agende seu horário online ou entre em contato diretamente pelo WhatsApp para um atendimento personalizado.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="h-14 px-10 text-lg rounded-none bg-primary text-white hover:bg-white hover:text-foreground transition-all duration-300 uppercase tracking-widest w-full md:w-auto"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Agendar via WhatsApp
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
