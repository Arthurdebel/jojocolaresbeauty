'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Testimonial } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Trash2, Edit2, Plus, MessageSquareQuote } from 'lucide-react';

export default function AdminTestimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
    const [formData, setFormData] = useState({ name: '', role: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTestimonials(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Testimonial)));
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = {
                name: formData.name,
                role: formData.role,
                text: formData.text,
                createdAt: editingItem?.createdAt || Date.now(),
            };

            if (editingItem) {
                await updateDoc(doc(db, 'testimonials', editingItem.id), data);
            } else {
                await addDoc(collection(db, 'testimonials'), data);
            }
            closeModal();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar depoimento');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir?')) {
            await deleteDoc(doc(db, 'testimonials', id));
        }
    };

    const openModal = (item?: Testimonial) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                role: item.role,
                text: item.text,
            });
        } else {
            setEditingItem(null);
            setFormData({ name: '', role: '', text: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Depoimentos</h1>
                    <p className="mt-2 text-gray-600">Gerencie o que os clientes dizem</p>
                </div>
                <Button onClick={() => openModal()}><Plus className="mr-2 h-4 w-4" /> Novo Depoimento</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((item) => (
                    <Card key={item.id} className="relative group hover:shadow-md transition-shadow">
                        <CardContent className="p-6 space-y-4">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openModal(item)}>
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => handleDelete(item.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <MessageSquareQuote className="h-8 w-8 text-primary/20" />

                            <p className="text-gray-600 italic">"{item.text}"</p>

                            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {item.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">{item.role}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {testimonials.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed border-gray-200 rounded-xl">
                        <MessageSquareQuote className="h-12 w-12 mb-4 text-gray-300" />
                        <p>Nenhum depoimento cadastrado.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Editar Depoimento' : 'Novo Depoimento'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Nome do Cliente</label>
                        <Input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Papel / Descrição</label>
                        <Input
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            placeholder="Ex: Noiva, Cliente Mensal"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Depoimento</label>
                        <textarea
                            value={formData.text}
                            onChange={e => setFormData({ ...formData, text: e.target.value })}
                            rows={4}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </form>
            </Modal>
        </div>
    );
}
