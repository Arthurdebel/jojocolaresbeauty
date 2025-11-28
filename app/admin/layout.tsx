'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AdminSidebar } from '@/components/admin/sidebar';
import { Menu } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setIsSidebarOpen(false); // Close sidebar on route change
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setLoading(false);
            if (!user && pathname !== '/admin/login' && pathname !== '/admin/setup') {
                router.push('/admin/login');
            }
            if (user && pathname === '/admin/login') {
                router.push('/admin/dashboard');
            }
        });
        return () => unsubscribe();
    }, [pathname, router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    // Don't show sidebar on login/setup pages
    if (pathname === '/admin/login' || pathname === '/admin/setup') {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <AdminSidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <AdminSidebar className="absolute left-0 top-0 h-full shadow-xl" />
                </div>
            )}

            <main className="flex-1 overflow-y-auto flex flex-col">
                {/* Mobile Header */}
                <div className="md:hidden p-4 bg-white border-b flex items-center justify-between sticky top-0 z-40">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6 text-gray-700" />
                    </button>
                    <span className="font-serif font-bold text-lg text-gray-900">JoJo Admin</span>
                    <div className="w-8" /> {/* Spacer for centering */}
                </div>

                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
