'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Save, Plus, Trash2 } from 'lucide-react';

interface WorkingHours {
    start: string;
    end: string;
    interval: number;
}

interface Settings {
    workingHours: WorkingHours;
    whatsappNumber: string;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>({
        workingHours: {
            start: '08:00',
            end: '20:00',
            interval: 60,
        },
        whatsappNumber: '553898276288',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const docRef = doc(db, 'settings', 'general');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setSettings(docSnap.data() as Settings);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'general'), settings);
            alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Erro ao salvar configurações');
        } finally {
            setSaving(false);
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
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
                <p className="mt-2 text-gray-600">Gerencie horários de trabalho e informações de contato</p>
            </div>

            {/* Working Hours */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Clock className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold text-gray-900">Horário de Trabalho</h2>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Horário de Início</label>
                            <Input
                                type="time"
                                value={settings.workingHours.start}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    workingHours: { ...settings.workingHours, start: e.target.value }
                                })}
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Horário de Término</label>
                            <Input
                                type="time"
                                value={settings.workingHours.end}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    workingHours: { ...settings.workingHours, end: e.target.value }
                                })}
                                className="bg-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Intervalo entre agendamentos (minutos)</label>
                        <Input
                            type="number"
                            min="30"
                            max="120"
                            step="30"
                            value={settings.workingHours.interval}
                            onChange={(e) => setSettings({
                                ...settings,
                                workingHours: { ...settings.workingHours, interval: parseInt(e.target.value) }
                            })}
                            className="bg-white"
                        />
                        <p className="text-sm text-gray-500">
                            Define o intervalo mínimo entre cada agendamento (recomendado: 60 minutos)
                        </p>
                    </div>

                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Horários disponíveis:</strong> {settings.workingHours.start} às {settings.workingHours.end}
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                            Os clientes poderão agendar dentro deste período no site.
                        </p>
                    </div>
                </div>
            </div>

            {/* WhatsApp Contact */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-900">WhatsApp</h2>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Número do WhatsApp</label>
                        <Input
                            type="text"
                            value={settings.whatsappNumber}
                            onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                            placeholder="5538XXXXXXXXX"
                            className="bg-white font-mono"
                        />
                        <p className="text-sm text-gray-500">
                            Formato: Código do país + DDD + Número (ex: 553898276288)
                        </p>
                    </div>

                    <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                        <p className="text-sm text-green-800">
                            <strong>Número atual:</strong> {settings.whatsappNumber}
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                            Os clientes serão redirecionados para este número após agendar.
                        </p>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={saveSettings}
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
                >
                    {saving ? (
                        <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5 mr-2" />
                            Salvar Configurações
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
