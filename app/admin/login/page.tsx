'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Mail, Lock } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/admin/dashboard');
        } catch (err: unknown) {
            console.error(err);
            setError('Email ou senha incorretos. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
                        <Sparkles className="h-8 w-8 text-amber-400" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-white">JoJo Colares</h1>
                    <p className="mt-2 text-gray-400">Painel Administrativo</p>
                </div>

                {/* Login Card */}
                <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm">
                    <h2 className="mb-6 text-center text-2xl font-bold text-white">Entrar</h2>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="pl-10 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-amber-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-10 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-amber-500"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold text-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
                                    Entrando...
                                </div>
                            ) : (
                                'Entrar'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-400">
                        <a href="/admin/setup" className="hover:text-amber-400 transition-colors">
                            Criar primeira conta admin
                        </a>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-gray-500">
                    © {new Date().getFullYear()} JoJo Colares. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}
