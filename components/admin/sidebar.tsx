'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    Briefcase,
    Settings,
    LogOut,
    Sparkles,
    Palette,
    Image,
    MessageSquareQuote
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Agendamentos', href: '/admin/appointments', icon: Calendar },
    { name: 'Serviços', href: '/admin/services', icon: Briefcase },
    { name: 'Portfólio', href: '/admin/portfolio', icon: Image },
    { name: 'Depoimentos', href: '/admin/testimonials', icon: MessageSquareQuote },
    { name: 'Personalização', href: '/admin/customize', icon: Palette },
    { name: 'Configurações', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/admin/login');
    };

    return (
        <div className="flex h-screen w-64 flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            {/* Logo */}
            <div className="flex h-20 items-center justify-center border-b border-gray-700 px-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-amber-400" />
                    <span className="text-xl font-serif font-bold">JoJo Admin</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-6">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive
                                ? 'bg-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/20'
                                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="border-t border-gray-700 p-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 transition-all hover:bg-red-500/20 hover:text-red-400"
                >
                    <LogOut className="h-5 w-5" />
                    Sair
                </button>
            </div>
        </div>
    );
}
