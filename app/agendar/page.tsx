'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Service, Appointment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format, isSameDay, startOfDay, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, Calendar, Clock, User, MapPin, CreditCard, Scissors } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function AgendarPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);

    // Form fields
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientCity, setClientCity] = useState('');
    const [clientState, setClientState] = useState('');
    const [serviceType, setServiceType] = useState<'studio' | 'domicilio'>('studio');
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'dinheiro'>('pix');
    const [formAnswers, setFormAnswers] = useState<Record<string, string>>({});

    const [loading, setLoading] = useState(false);
    const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '18:00' });

    // Fetch services and settings
    useEffect(() => {
        getDocs(collection(db, 'services')).then(snap => {
            setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
        });

        // Load working hours from settings
        getDoc(doc(db, 'settings', 'general')).then(docSnap => {
            if (docSnap.exists()) {
                const settings = docSnap.data();
                console.log('⚙️ Settings loaded:', settings);
                if (settings.workingHours) {
                    const hours = {
                        start: settings.workingHours.start || '09:00',
                        end: settings.workingHours.end || '18:00'
                    };
                    console.log('⏰ Working hours set to:', hours);
                    setWorkingHours(hours);
                }
            } else {
                console.log('⚠️ No settings found, using defaults');
            }
        });
    }, []);

    // Calculate totals
    const totalDuration = selectedServices.reduce((acc, s) => acc + s.duration, 0);
    const basePrice = selectedServices.reduce((acc, s) => acc + s.price, 0);

    // Fetch slots when date changes
    useEffect(() => {
        console.log('🔍 Fetch slots effect triggered', { selectedDate, totalDuration });

        if (!selectedDate || totalDuration === 0) {
            console.log('⚠️ No date or duration, clearing slots');
            setAvailableSlots(prev => prev.length > 0 ? [] : prev);
            return;
        }

        const fetchSlots = async () => {
            try {
                const dateStr = format(selectedDate, 'yyyy-MM-dd');
                console.log('📅 Fetching slots for:', dateStr);

                const q = query(
                    collection(db, 'appointments'),
                    where('date', '==', dateStr),
                    where('status', 'in', ['pending', 'confirmed'])
                );
                const snap = await getDocs(q);
                const appointments = snap.docs.map(d => d.data() as Appointment);
                console.log('📋 Found appointments:', appointments.length);

                // Parse working hours
                const startHour = parseInt(workingHours.start.split(':')[0]);
                const endHour = parseInt(workingHours.end.split(':')[0]);
                console.log('⏰ Working hours:', { startHour, endHour });

                // Generate all slots based on working hours
                const allSlots: string[] = [];
                for (let i = startHour; i < endHour; i++) {
                    allSlots.push(`${i.toString().padStart(2, '0')}:00`);
                }
                console.log('🕐 All slots:', allSlots);

                // Filter occupied slots
                const occupied = new Set<string>();
                appointments.forEach(app => {
                    const appStartHour = parseInt(app.time.split(':')[0]);
                    const durationHours = Math.ceil(app.totalDuration / 60);
                    for (let i = 0; i < durationHours; i++) {
                        occupied.add(`${(appStartHour + i).toString().padStart(2, '0')}:00`);
                    }
                });
                console.log('🚫 Occupied slots:', Array.from(occupied));

                // Check consecutive availability for current selection
                const requiredSlots = Math.ceil(totalDuration / 60);
                console.log('⏱️ Required consecutive slots:', requiredSlots);

                const available = allSlots.filter(slot => {
                    const slotHour = parseInt(slot.split(':')[0]);
                    // Check if this slot and next (requiredSlots - 1) slots are free
                    for (let i = 0; i < requiredSlots; i++) {
                        const checkSlot = `${(slotHour + i).toString().padStart(2, '0')}:00`;
                        if (occupied.has(checkSlot) || slotHour + i >= endHour) return false;
                    }
                    return true;
                });

                console.log('✅ Available slots:', available);
                setAvailableSlots(available);
            } catch (error) {
                console.error('❌ Error fetching slots:', error);
                setAvailableSlots([]);
            }
        };

        fetchSlots();
    }, [selectedDate, totalDuration, workingHours]);

    const toggleService = (service: Service) => {
        if (selectedServices.find(s => s.id === service.id)) {
            setSelectedServices(selectedServices.filter(s => s.id !== service.id));
            // Remove answers for this service
            const newAnswers = { ...formAnswers };
            service.formFields?.forEach(field => {
                delete newAnswers[`${service.id}_${field.id}`];
            });
            setFormAnswers(newAnswers);
        } else {
            setSelectedServices([...selectedServices, service]);
        }
        setSelectedTime(null);
        setSelectedDate(null);
    };

    const handleAnswerChange = (serviceId: string, fieldId: string, value: string) => {
        setFormAnswers(prev => ({
            ...prev,
            [`${serviceId}_${fieldId}`]: value
        }));
    };

    const validateForms = () => {
        for (const service of selectedServices) {
            if (service.formFields) {
                for (const field of service.formFields) {
                    if (field.required && !formAnswers[`${service.id}_${field.id}`]) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    const handleBooking = async () => {
        if (!selectedDate || !selectedTime || !clientName || !clientPhone || !clientCity || !clientState) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (!validateForms()) {
            alert('Por favor, preencha todos os campos obrigatórios dos serviços selecionados.');
            return;
        }

        setLoading(true);

        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const appointmentData = {
                clientName,
                phone: clientPhone,
                city: clientCity,
                state: clientState,
                services: selectedServices,
                totalDuration,
                totalPrice: 0, // Price is calculated by attendant
                basePrice,
                date: dateStr,
                time: selectedTime,
                status: 'pending' as const,
                serviceType,
                paymentMethod,
                formAnswers,
                createdAt: Date.now(),
            };

            await addDoc(collection(db, 'appointments'), appointmentData);

            // Construct message for Admin (same format as before)
            const servicesText = selectedServices.map(s => {
                let text = `  • ${s.name} (${s.duration}min)`;
                if (s.formFields && s.formFields.length > 0) {
                    s.formFields.forEach(field => {
                        const answer = formAnswers[`${s.id}_${field.id}`];
                        if (answer) {
                            text += `\n    - ${field.label}: ${answer}`;
                        }
                    });
                }
                return text;
            }).join('\n');

            const message = `🌸 *SOLICITAÇÃO DE AGENDAMENTO* 🌸

📋 *DADOS DO CLIENTE*
Nome: ${clientName}
WhatsApp: ${clientPhone}
Localização: ${clientCity} - ${clientState}

💅 *SERVIÇOS SOLICITADOS*
${servicesText}

📅 *DATA E HORÁRIO*
Data: ${format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
Horário: ${selectedTime}
Duração Total: ${Math.ceil(totalDuration / 60)}h

📍 *LOCAL DO ATENDIMENTO*
${serviceType === 'studio' ? '🏠 Studio' : '🚗 Domicílio'}
${serviceType === 'domicilio' ? '\n⚠️ *Áreas de atendimento a consultar*' : ''}

💳 *FORMA DE PAGAMENTO*
${paymentMethod === 'pix' ? '💰 PIX' : paymentMethod === 'cartao' ? '💳 Cartão' : '💵 Dinheiro'}

💰 *VALORES*
*A confirmar com a atendente*

---
✨ Aguardando confirmação do agendamento!`;

            // Call API to send notifications
            await fetch('/api/appointments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientName,
                    clientPhone,
                    message
                })
            });

            // Show success feedback
            setLoading(false);
            // Reset form or redirect to success page
            // For now, we'll use a custom UI state instead of alert
            const successMessage = document.createElement('div');
            successMessage.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;">
                    <div style="background: white; padding: 2rem; border-radius: 1rem; text-align: center; max-width: 90%; width: 400px;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                        <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; color: #1a1a1a;">Solicitação Enviada!</h2>
                        <p style="color: #666; margin-bottom: 1.5rem;">Recebemos seu agendamento. Em breve entraremos em contato pelo WhatsApp para confirmar.</p>
                        <button onclick="window.location.reload()" style="background: #000; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: bold; cursor: pointer; width: 100%;">Entendido</button>
                    </div>
                </div>
            `;
            document.body.appendChild(successMessage);

        } catch (error) {
            console.error(error);
            alert('Erro ao agendar. Por favor, tente novamente.');
            setLoading(false);
        }
    };

    const filterDate = (date: Date) => {
        const today = startOfDay(new Date());
        return isAfter(date, today) || isSameDay(date, today);
    };

    return (
        <div className="min-h-screen py-20 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-primary">Agende seu Horário</h1>
                    <p className="text-muted-foreground text-lg font-light">Preencha o formulário abaixo para solicitar seu agendamento</p>
                </div>

                <div className="space-y-12">
                    {/* Step 1: Services */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold font-serif">1</div>
                            <h3 className="text-xl font-serif font-semibold">Escolha os serviços</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {services.map(service => (
                                <Card
                                    key={service.id}
                                    className={`cursor-pointer transition-all duration-300 border ${selectedServices.find(s => s.id === service.id)
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'border-border hover:border-primary/30 hover:bg-secondary/20'
                                        }`}
                                    onClick={() => toggleService(service)}
                                >
                                    <CardContent className="p-4 flex items-center gap-4">
                                        {service.imageUrl ? (
                                            <img src={service.imageUrl} className="w-16 h-16 rounded-full object-cover shadow-sm" alt={service.name} />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-xl font-serif">
                                                {service.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg font-serif">{service.name}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                                            <div className="text-sm font-medium mt-1 text-primary">A partir de R$ {service.price} • {service.duration} min</div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${selectedServices.find(s => s.id === service.id) ? 'bg-primary border-primary' : 'border-muted-foreground'
                                            }`}>
                                            {selectedServices.find(s => s.id === service.id) && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {services.length === 0 && <p className="text-muted-foreground text-center py-8 col-span-full">Carregando serviços...</p>}
                        </div>
                    </motion.div>

                    {/* Step 2: Personal Info & Service Type */}
                    <AnimatePresence>
                        {selectedServices.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold font-serif">2</div>
                                    <h3 className="text-xl font-serif font-semibold">Seus dados</h3>
                                </div>

                                <Card className="border border-primary/10">
                                    <CardContent className="p-6 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <User className="w-4 h-4 text-primary" />
                                                    Nome Completo *
                                                </label>
                                                <Input
                                                    value={clientName}
                                                    onChange={e => setClientName(e.target.value)}
                                                    placeholder="Seu nome completo"
                                                    className="bg-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">WhatsApp *</label>
                                                <Input
                                                    value={clientPhone}
                                                    onChange={e => setClientPhone(e.target.value)}
                                                    placeholder="55 (21) 99999-9999"
                                                    className="bg-white"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    * Digite o número completo com código do país (55) e DDD.
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                    Estado *
                                                </label>
                                                <Input
                                                    value={clientState}
                                                    onChange={e => setClientState(e.target.value)}
                                                    placeholder="Ex: SP"
                                                    className="bg-white"
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-sm font-medium">Cidade *</label>
                                                <Input
                                                    value={clientCity}
                                                    onChange={e => setClientCity(e.target.value)}
                                                    placeholder="Sua cidade"
                                                    className="bg-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-primary/10">
                                            <label className="text-sm font-medium mb-3 block">Tipo de Atendimento *</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setServiceType('studio')}
                                                    className={`p-4 rounded-lg border-2 transition-all ${serviceType === 'studio'
                                                        ? 'border-primary bg-primary/5 shadow-md'
                                                        : 'border-border hover:border-primary/30'
                                                        }`}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-2">🏠</div>
                                                        <div className="font-semibold">Studio</div>
                                                        <div className="text-xs text-muted-foreground mt-1">Valor padrão</div>
                                                    </div>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setServiceType('domicilio')}
                                                    className={`p-4 rounded-lg border-2 transition-all ${serviceType === 'domicilio'
                                                        ? 'border-primary bg-primary/5 shadow-md'
                                                        : 'border-border hover:border-primary/30'
                                                        }`}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-2">🚗</div>
                                                        <div className="font-semibold">Domicílio</div>
                                                        <div className="text-xs text-primary mt-1">+ Taxa de Deslocamento</div>
                                                    </div>
                                                </button>
                                            </div>
                                            {serviceType === 'domicilio' && (
                                                <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded">
                                                    ⚠️ Áreas de atendimento a consultar pelo WhatsApp
                                                </p>
                                            )}
                                        </div>

                                        {/* Dynamic Service Forms */}
                                        {selectedServices.map(service => (
                                            service.formFields && service.formFields.length > 0 && (
                                                <div key={service.id} className="pt-4 border-t border-primary/10">
                                                    <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                                                        <Scissors className="w-4 h-4" />
                                                        Detalhes: {service.name}
                                                    </h4>
                                                    <div className="space-y-4">
                                                        {service.formFields.map(field => (
                                                            <div key={field.id} className="space-y-2">
                                                                <label className="text-sm font-medium">
                                                                    {field.label} {field.required && '*'}
                                                                </label>
                                                                {field.type === 'select' ? (
                                                                    <select
                                                                        value={formAnswers[`${service.id}_${field.id}`] || ''}
                                                                        onChange={e => handleAnswerChange(service.id, field.id, e.target.value)}
                                                                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    >
                                                                        <option value="">Selecione...</option>
                                                                        {field.options?.map(opt => (
                                                                            <option key={opt} value={opt}>{opt}</option>
                                                                        ))}
                                                                    </select>
                                                                ) : field.type === 'textarea' ? (
                                                                    <textarea
                                                                        value={formAnswers[`${service.id}_${field.id}`] || ''}
                                                                        onChange={e => handleAnswerChange(service.id, field.id, e.target.value)}
                                                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    />
                                                                ) : (
                                                                    <Input
                                                                        value={formAnswers[`${service.id}_${field.id}`] || ''}
                                                                        onChange={e => handleAnswerChange(service.id, field.id, e.target.value)}
                                                                        className="bg-white"
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        ))}

                                        <div className="pt-4 border-t border-primary/10">
                                            <label className="text-sm font-medium mb-3 flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-primary" />
                                                Forma de Pagamento *
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {(['pix', 'cartao', 'dinheiro'] as const).map(method => (
                                                    <button
                                                        key={method}
                                                        type="button"
                                                        onClick={() => setPaymentMethod(method)}
                                                        className={`p-3 rounded-lg border-2 transition-all text-sm ${paymentMethod === method
                                                            ? 'border-primary bg-primary/5 font-semibold'
                                                            : 'border-border hover:border-primary/30'
                                                            }`}
                                                    >
                                                        {method === 'pix' ? '💰 PIX' : method === 'cartao' ? '💳 Cartão' : '💵 Dinheiro'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Step 3: Date */}
                    <AnimatePresence>
                        {selectedServices.length > 0 && clientName && clientPhone && clientCity && clientState && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold font-serif">3</div>
                                    <h3 className="text-xl font-serif font-semibold">Escolha a data</h3>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={(date) => { setSelectedDate(date); setSelectedTime(null); }}
                                        filterDate={filterDate}
                                        inline
                                        locale={ptBR}
                                        dateFormat="dd/MM/yyyy"
                                        minDate={new Date()}
                                        calendarClassName="!font-sans"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Step 4: Time */}
                    <AnimatePresence>
                        {selectedDate && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold font-serif">4</div>
                                    <h3 className="text-xl font-serif font-semibold">Escolha o horário</h3>
                                </div>

                                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                    {availableSlots.map(time => (
                                        <Button
                                            key={time}
                                            variant={selectedTime === time ? 'primary' : 'outline'}
                                            onClick={() => setSelectedTime(time)}
                                            className={`h-12 text-lg ${selectedTime === time ? 'shadow-md scale-105' : 'hover:border-primary/50'}`}
                                        >
                                            {time}
                                        </Button>
                                    ))}
                                    {availableSlots.length === 0 && (
                                        <div className="col-span-full text-center py-8 bg-amber-50 border border-amber-200 rounded-lg">
                                            <p className="text-amber-800 font-medium">Nenhum horário disponível nesta data</p>
                                            <p className="text-sm text-amber-600 mt-2">
                                                Duração necessária: {Math.ceil(totalDuration / 60)}h consecutivas
                                            </p>
                                            <p className="text-xs text-amber-600 mt-1">
                                                Tente outra data ou entre em contato pelo WhatsApp
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Step 5: Confirm */}
                    <AnimatePresence>
                        {selectedTime && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold font-serif">5</div>
                                    <h3 className="text-xl font-serif font-semibold">Confirmar Agendamento</h3>
                                </div>

                                <Card className="border border-primary/10 shadow-xl overflow-hidden bg-white/50 backdrop-blur-sm">
                                    <CardContent className="p-0 md:flex">
                                        <div className="bg-secondary/30 p-8 md:w-1/3 space-y-6 border-r border-primary/10">
                                            <h4 className="font-serif font-semibold text-lg mb-4">Resumo</h4>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Calendar className="w-5 h-5 text-primary" />
                                                    <span>{selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Clock className="w-5 h-5 text-primary" />
                                                    <span>{selectedTime} • {Math.ceil(totalDuration / 60)}h</span>
                                                </div>
                                                <div className="space-y-2 pt-4 border-t border-primary/10">
                                                    {selectedServices.map(s => (
                                                        <div key={s.id} className="flex justify-between text-sm">
                                                            <span>{s.name}</span>
                                                            <span className="font-medium">A partir de R$ {s.price}</span>
                                                        </div>
                                                    ))}
                                                    {serviceType === 'domicilio' && (
                                                        <div className="flex justify-between text-sm text-amber-700">
                                                            <span>Taxa Domicílio</span>
                                                            <span className="font-medium">A consultar</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex justify-between font-bold text-lg pt-4 border-t border-primary/10">
                                                    <span>Total</span>
                                                    <span className="text-primary text-sm font-normal">A combinar</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 md:w-2/3 space-y-6">
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <p className="text-sm text-blue-800">
                                                    <strong>📱 Próximo passo:</strong> Você será redirecionado para o WhatsApp para confirmar seu agendamento com nossa equipe.
                                                </p>
                                            </div>

                                            <Button
                                                className="w-full text-lg h-14 rounded-xl shadow-lg hover:shadow-xl transition-all bg-primary text-primary-foreground hover:bg-primary/90"
                                                onClick={handleBooking}
                                                disabled={loading}
                                            >
                                                {loading ? 'Processando...' : 'Enviar Solicitação via WhatsApp'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
