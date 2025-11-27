import { Instagram, Facebook, Mail } from 'lucide-react';

export function Footer() {
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
                            <p>Rua da Beleza, 123 - Jardins</p>
                            <p>São Paulo - SP</p>
                            <p>(11) 99999-9999</p>
                            <p>contato@jojocolares.com.br</p>
                        </div>
                    </div>

                    {/* Social */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Redes Sociais</h4>
                        <div className="flex justify-center md:justify-start gap-4">
                            <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all">
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
