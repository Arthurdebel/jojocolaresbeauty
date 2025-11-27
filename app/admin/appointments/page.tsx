'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Appointment } from '@/types';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, DollarSign, Phone, CheckCircle, XCircle, Trash2, Filter } from 'lucide-react';

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const apps = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Appointment));
            setAppointments(apps);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredAppointments = filterStatus === 'all'
        ? appointments
        : appointments.filter(a => a.status === filterStatus);

    const updateStatus = async (appointment: Appointment, status: 'confirmed' | 'cancelled' | 'pending') => {
        await updateDoc(doc(db, 'appointments', appointment.id), { status });

        if (status === 'confirmed' || status === 'cancelled') {
            const date = format(parseISO(appointment.date), "dd 'de' MMMM", { locale: ptBR });
            const services = appointment.services.map(s => s.name).join(', ');

            let message = '';
            if (status === 'confirmed') {
                message = `Olá ${appointment.clientName}! Seu agendamento para *${services}* no dia *${date}* às *${appointment.time}* foi *CONFIRMADO*! Estamos ansiosos para te atender. ✨`;
            } else {
                message = `Olá ${appointment.clientName}. Informamos que seu agendamento para *${services}* no dia *${date}* às *${appointment.time}* foi *CANCELADO*. Caso queira reagendar, entre em contato.`;
            }

            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/${appointment.phone}?text=${encodedMessage}`, '_blank');
        }
    };

    const deleteAppointment = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este agendamento?')) {
            await deleteDoc(doc(db, 'appointments', id));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Confirmado';
            case 'pending': return 'Pendente';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
                    <p className="mt-2 text-gray-600">Gerencie todos os agendamentos dos clientes</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2">
                <Filter className="ml-2 h-5 w-5 text-gray-400" />
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${filterStatus === 'all' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Todos ({appointments.length})
                </button>
                <button
                    onClick={() => setFilterStatus('pending')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${filterStatus === 'pending' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Pendentes ({appointments.filter(a => a.status === 'pending').length})
                </button>
                <button
                    onClick={() => setFilterStatus('confirmed')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${filterStatus === 'confirmed' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Confirmados ({appointments.filter(a => a.status === 'confirmed').length})
                </button>
                <button
                    onClick={() => setFilterStatus('cancelled')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${filterStatus === 'cancelled' ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Cancelados ({appointments.filter(a => a.status === 'cancelled').length})
                </button>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
                {filteredAppointments.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                        <Calendar className="mx-auto h-16 w-16 text-gray-300" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">Nenhum agendamento encontrado</h3>
                        <p className="mt-2 text-gray-600">
                            {filterStatus === 'all'
                                ? 'Não há agendamentos cadastrados ainda.'
                                : `Não há agendamentos com status "${getStatusText(filterStatus)}".`}
                        </p>
                    </div>
                ) : (
                    filteredAppointments.map((appointment) => (
                        <div
                            key={appointment.id}
                            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-4">
                                    {/* Client Info */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                                            {appointment.clientName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{appointment.clientName}</h3>
                                            <a
                                                href={`https://wa.me/${appointment.phone}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary"
                                            >
                                                <Phone className="h-4 w-4" />
                                                {appointment.phone}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Appointment Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            <span className="font-medium">
                                                {format(parseISO(appointment.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Clock className="h-5 w-5 text-primary" />
                                            <span className="font-medium">{appointment.time} • {appointment.totalDuration / 60}h</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <DollarSign className="h-5 w-5 text-primary" />
                                            <span className="font-medium">A partir de R$ {appointment.basePrice || appointment.totalPrice}</span>
                                        </div>
                                    </div>

                                    {/* Services */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-2">Serviços:</p>
                                        <div className="flex flex-col gap-2">
                                            {appointment.services?.map((service, idx) => (
                                                <div key={idx} className="bg-primary/5 rounded-lg p-3">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-medium text-primary">{service.name}</span>
                                                        <span className="text-xs text-gray-500">{service.duration}min</span>
                                                    </div>
                                                    {/* Display Form Answers for this service */}
                                                    {service.formFields && service.formFields.length > 0 && appointment.formAnswers && (
                                                        <div className="mt-2 space-y-1 pl-2 border-l-2 border-primary/20">
                                                            {service.formFields.map(field => {
                                                                const answer = appointment.formAnswers?.[`${service.id}_${field.id}`];
                                                                if (!answer) return null;
                                                                return (
                                                                    <div key={field.id} className="text-sm">
                                                                        <span className="text-gray-500 text-xs uppercase tracking-wider">{field.label}:</span>
                                                                        <span className="ml-2 text-gray-800">{answer}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Actions */}
                                <div className="ml-6 flex flex-col items-end gap-4">
                                    <span className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold ${getStatusColor(appointment.status)}`}>
                                        {getStatusText(appointment.status)}
                                    </span>

                                    <div className="flex gap-2">
                                        {appointment.status === 'pending' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateStatus(appointment, 'confirmed')}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Confirmar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => updateStatus(appointment, 'cancelled')}
                                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Cancelar
                                                </Button>
                                            </>
                                        )}
                                        {appointment.status === 'confirmed' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => updateStatus(appointment, 'cancelled')}
                                                className="border-red-300 text-red-600 hover:bg-red-50"
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Cancelar
                                            </Button>
                                        )}
                                        {appointment.status === 'cancelled' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => updateStatus(appointment, 'pending')}
                                            >
                                                Reabrir
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => deleteAppointment(appointment.id)}
                                            className="border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
