'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Appointment, Service } from '@/types';
import { StatCard } from '@/components/admin/stat-card';
import { Calendar, Clock, DollarSign, Briefcase, CheckCircle, XCircle } from 'lucide-react';
import { format, isToday, parseISO, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        todayAppointments: 0,
        pendingAppointments: 0,
        confirmedAppointments: 0,
        totalServices: 0,
        monthlyRevenue: 0,
    });
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch all appointments
            const appointmentsSnap = await getDocs(collection(db, 'appointments'));
            const appointments = appointmentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));

            // Fetch services
            const servicesSnap = await getDocs(collection(db, 'services'));
            const services = servicesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Service));

            // Calculate stats
            const today = format(new Date(), 'yyyy-MM-dd');
            const todayAppts = appointments.filter(a => a.date === today && a.status !== 'cancelled');
            const pending = appointments.filter(a => a.status === 'pending');
            const confirmed = appointments.filter(a => a.status === 'confirmed');

            // Get upcoming appointments (future dates, not cancelled)
            const upcoming = appointments
                .filter(a => {
                    const apptDate = parseISO(a.date);
                    // Check if date is today or future
                    const todayDate = new Date();
                    todayDate.setHours(0, 0, 0, 0);
                    return apptDate >= todayDate && a.status !== 'cancelled';
                })
                .sort((a, b) => {
                    const dateA = parseISO(a.date + 'T' + a.time);
                    const dateB = parseISO(b.date + 'T' + b.time);
                    return dateA.getTime() - dateB.getTime();
                });

            setStats({
                todayAppointments: todayAppts.length,
                pendingAppointments: pending.length,
                confirmedAppointments: confirmed.length,
                totalServices: services.length,
                monthlyRevenue: confirmed.reduce((sum, a) => sum + (a.totalPrice || 0), 0),
            });

            setUpcomingAppointments(upcoming);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    // Group appointments by date
    const groupedAppointments = upcomingAppointments.reduce((groups, appointment) => {
        const date = appointment.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(appointment);
        return groups;
    }, {} as Record<string, Appointment[]>);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">Visão geral do seu negócio</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Agendamentos Hoje"
                    value={stats.todayAppointments}
                    icon={<Calendar className="h-6 w-6" />}
                    color="blue"
                />
                <StatCard
                    title="Pendentes"
                    value={stats.pendingAppointments}
                    icon={<Clock className="h-6 w-6" />}
                    color="amber"
                />
                <StatCard
                    title="Confirmados"
                    value={stats.confirmedAppointments}
                    icon={<CheckCircle className="h-6 w-6" />}
                    color="green"
                />
                <StatCard
                    title="Serviços Ativos"
                    value={stats.totalServices}
                    icon={<Briefcase className="h-6 w-6" />}
                    color="purple"
                />
            </div>

            {/* Upcoming Appointments */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Próximos Agendamentos</h2>

                {upcomingAppointments.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Nenhum agendamento próximo</p>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedAppointments).map(([date, appointments]) => (
                            <div key={date}>
                                <h3 className="text-lg font-bold text-primary mb-3 capitalize flex items-center gap-2 border-b pb-2">
                                    <Calendar className="w-5 h-5" />
                                    {format(parseISO(date), "dd 'de' MMMM - EEEE", { locale: ptBR })}
                                </h3>
                                <div className="space-y-3 pl-4 border-l-2 border-primary/10">
                                    {appointments.map((appointment) => (
                                        <div
                                            key={appointment.id}
                                            className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:border-primary/50 hover:shadow-md bg-white"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-2 w-2 rounded-full ${appointment.status === 'confirmed' ? 'bg-green-500' :
                                                        appointment.status === 'pending' ? 'bg-amber-500' :
                                                            'bg-gray-400'
                                                        }`} />
                                                    <h3 className="font-semibold text-gray-900">{appointment.clientName}</h3>
                                                </div>
                                                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1 font-medium">
                                                        <Clock className="h-4 w-4 text-primary" />
                                                        {appointment.time}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-4 w-4" />
                                                        R$ {appointment.totalPrice}
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {appointment.services?.map((service, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                                        >
                                                            {service.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    appointment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {appointment.status === 'confirmed' ? 'Confirmado' :
                                                        appointment.status === 'pending' ? 'Pendente' :
                                                            'Cancelado'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <a
                    href="/admin/appointments"
                    className="group rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition-all hover:border-primary hover:bg-primary/5"
                >
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary" />
                    <h3 className="mt-4 font-semibold text-gray-900">Ver Todos Agendamentos</h3>
                    <p className="mt-2 text-sm text-gray-600">Gerencie todos os agendamentos</p>
                </a>

                <a
                    href="/admin/services"
                    className="group rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition-all hover:border-primary hover:bg-primary/5"
                >
                    <Briefcase className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary" />
                    <h3 className="mt-4 font-semibold text-gray-900">Gerenciar Serviços</h3>
                    <p className="mt-2 text-sm text-gray-600">Adicione ou edite serviços</p>
                </a>

                <a
                    href="/admin/settings"
                    className="group rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition-all hover:border-primary hover:bg-primary/5"
                >
                    <Clock className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary" />
                    <h3 className="mt-4 font-semibold text-gray-900">Configurar Horários</h3>
                    <p className="mt-2 text-sm text-gray-600">Defina sua disponibilidade</p>
                </a>
            </div>
        </div>
    );
}
