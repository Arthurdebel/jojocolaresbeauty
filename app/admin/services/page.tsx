'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Service } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Trash2, Edit2, Plus } from 'lucide-react';

export default function AdminServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState({ name: '', price: '', duration: '60', description: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'services'), (snapshot) => {
            setServices(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageUrl = editingService?.imageUrl || '';
            if (imageFile) {
                const storageRef = ref(storage, `services/${Date.now()}_${imageFile.name}`);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            const data = {
                name: formData.name,
                price: Number(formData.price),
                duration: Number(formData.duration),
                description: formData.description,
                imageUrl,
            };

            if (editingService) {
                await updateDoc(doc(db, 'services', editingService.id), data);
            } else {
                await addDoc(collection(db, 'services'), data);
            }
            closeModal();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar serviço');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir?')) {
            await deleteDoc(doc(db, 'services', id));
        }
    };

    const openModal = (service?: Service) => {
        if (service) {
            setEditingService(service);
            setFormData({
                name: service.name,
                price: service.price.toString(),
                duration: service.duration.toString(),
                description: service.description || '',
            });
        } else {
            setEditingService(null);
            setFormData({ name: '', price: '', duration: '60', description: '' });
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Gerenciar Serviços</h1>
                <Button onClick={() => openModal()}><Plus className="mr-2 h-4 w-4" /> Novo Serviço</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                    <Card key={service.id}>
                        <CardContent className="p-4">
                            {service.imageUrl && (
                                <img src={service.imageUrl} alt={service.name} className="w-full h-40 object-cover rounded-md mb-4" />
                            )}
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{service.name}</h3>
                                <span className="font-semibold">R$ {service.price}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                            <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                                <span>{service.duration} min</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => openModal(service)}>
                                    <Edit2 className="h-4 w-4 mr-2" /> Editar
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700" onClick={() => handleDelete(service.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {services.length === 0 && (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        Nenhum serviço cadastrado.
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingService ? 'Editar Serviço' : 'Novo Serviço'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Nome</label>
                        <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium">Preço (R$)</label>
                            <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium">Duração (min)</label>
                            <Input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} required />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Descrição</label>
                        <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Imagem</label>
                        <Input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} accept="image/*" />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </form>
            </Modal>
        </div>
    );
}
