'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Upload, Image as ImageIcon, Type, Palette } from 'lucide-react';

interface LandingPageSettings {
    hero: {
        title: string;
        subtitle: string;
        backgroundImage: string;
    };
    about: {
        title: string;
        description: string;
        image: string;
    };
    contact: {
        address: string;
        city: string;
        email: string;
        instagram: string;
        facebook: string;
    };
    branding: {
        businessName: string;
        tagline: string;
        cnpj: string;
    };
}

export default function CustomizePage() {
    const [settings, setSettings] = useState<LandingPageSettings>({
        hero: {
            title: 'Realce sua Beleza Natural',
            subtitle: 'Maquiagem profissional, design de sobrancelhas e muito mais',
            backgroundImage: '/images/hero-bg.png',
        },
        about: {
            title: 'JoJo Colares',
            description: 'Acredito que a beleza é uma forma de arte e expressão pessoal. Com anos de dedicação ao universo da estética, minha missão vai além de aplicar maquiagem ou modelar fios; é sobre revelar a confiança que já existe em você.',
            image: '/images/portfolio-2.png',
        },
        contact: {
            address: 'Rua da Beleza, 123 - Jardins',
            city: 'São Paulo - SP',
            email: 'contato@jojocolares.com.br',
            instagram: 'https://instagram.com/jojocolares',
            facebook: 'https://facebook.com/jojocolares',
        },
        branding: {
            businessName: 'JoJo Colares',
            tagline: 'Beleza e Estilo',
            cnpj: '00.000.000/0001-00',
        },
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const docRef = doc(db, 'settings', 'landingPage');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setSettings(docSnap.data() as LandingPageSettings);
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
            await setDoc(doc(db, 'settings', 'landingPage'), settings);
            alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (file: File, section: 'hero' | 'about') => {
        setUploadingImage(section);
        try {
            const storageRef = ref(storage, `landing-page/${section}/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            if (section === 'hero') {
                setSettings({ ...settings, hero: { ...settings.hero, backgroundImage: url } });
            } else {
                setSettings({ ...settings, about: { ...settings.about, image: url } });
            }

            alert('Imagem enviada com sucesso!');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erro ao enviar imagem');
        } finally {
            setUploadingImage(null);
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
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Personalizar Landing Page</h1>
                <p className="mt-2 text-gray-600">Customize o conteúdo e imagens da página inicial</p>
            </div>

            {/* Branding */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Type className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold text-gray-900">Marca e Identidade</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Nome do Negócio</label>
                        <Input
                            value={settings.branding.businessName}
                            onChange={(e) => setSettings({
                                ...settings,
                                branding: { ...settings.branding, businessName: e.target.value }
                            })}
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Slogan</label>
                        <Input
                            value={settings.branding.tagline}
                            onChange={(e) => setSettings({
                                ...settings,
                                branding: { ...settings.branding, tagline: e.target.value }
                            })}
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">CNPJ</label>
                        <Input
                            value={settings.branding.cnpj}
                            onChange={(e) => setSettings({
                                ...settings,
                                branding: { ...settings.branding, cnpj: e.target.value }
                            })}
                            className="bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <ImageIcon className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold text-gray-900">Seção Hero (Topo)</h2>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Título Principal</label>
                        <Input
                            value={settings.hero.title}
                            onChange={(e) => setSettings({
                                ...settings,
                                hero: { ...settings.hero, title: e.target.value }
                            })}
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Subtítulo</label>
                        <Input
                            value={settings.hero.subtitle}
                            onChange={(e) => setSettings({
                                ...settings,
                                hero: { ...settings.hero, subtitle: e.target.value }
                            })}
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Imagem de Fundo</label>
                        <div className="flex gap-2">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file, 'hero');
                                }}
                                className="bg-white"
                                disabled={uploadingImage === 'hero'}
                            />
                            {uploadingImage === 'hero' && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    Enviando...
                                </div>
                            )}
                        </div>
                        {settings.hero.backgroundImage && (
                            <img
                                src={settings.hero.backgroundImage}
                                alt="Hero background"
                                className="mt-2 h-32 w-full object-cover rounded-lg"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Palette className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold text-gray-900">Seção Sobre</h2>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Título</label>
                        <Input
                            value={settings.about.title}
                            onChange={(e) => setSettings({
                                ...settings,
                                about: { ...settings.about, title: e.target.value }
                            })}
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Descrição</label>
                        <textarea
                            value={settings.about.description}
                            onChange={(e) => setSettings({
                                ...settings,
                                about: { ...settings.about, description: e.target.value }
                            })}
                            rows={4}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Imagem</label>
                        <div className="flex gap-2">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file, 'about');
                                }}
                                className="bg-white"
                                disabled={uploadingImage === 'about'}
                            />
                            {uploadingImage === 'about' && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    Enviando...
                                </div>
                            )}
                        </div>
                        {settings.about.image && (
                            <img
                                src={settings.about.image}
                                alt="About"
                                className="mt-2 h-32 w-32 object-cover rounded-lg"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-900">Informações de Contato</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Endereço</label>
                        <Input
                            value={settings.contact.address}
                            onChange={(e) => setSettings({
                                ...settings,
                                contact: { ...settings.contact, address: e.target.value }
                            })}
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Cidade/Estado</label>
                        <Input
                            value={settings.contact.city}
                            onChange={(e) => setSettings({
                                ...settings,
                                contact: { ...settings.contact, city: e.target.value }
                            })}
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <Input
                            type="email"
                            value={settings.contact.email}
                            onChange={(e) => setSettings({
                                ...settings,
                                contact: { ...settings.contact, email: e.target.value }
                            })}
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Instagram</label>
                        <Input
                            value={settings.contact.instagram}
                            onChange={(e) => setSettings({
                                ...settings,
                                contact: { ...settings.contact, instagram: e.target.value }
                            })}
                            className="bg-white"
                            placeholder="https://instagram.com/..."
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Facebook</label>
                        <Input
                            value={settings.contact.facebook}
                            onChange={(e) => setSettings({
                                ...settings,
                                contact: { ...settings.contact, facebook: e.target.value }
                            })}
                            className="bg-white"
                            placeholder="https://facebook.com/..."
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
                <Button
                    variant="outline"
                    onClick={loadSettings}
                >
                    Cancelar Alterações
                </Button>
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
                            Salvar Todas as Alterações
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
