'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Service, ServiceFormField } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Trash2, Edit2, Plus, X } from 'lucide-react';

export default function AdminServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState({ name: '', price: '', duration: '60', description: '' });
    const [formFields, setFormFields] = useState<ServiceFormField[]>([]);
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
                formFields,
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
            setFormFields(service.formFields || []);
        } else {
            setEditingService(null);
            setFormData({ name: '', price: '', duration: '60', description: '' });
            setFormFields([]);
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
    };

    const addFormField = () => {
        setFormFields([
            ...formFields,
            {
                id: Date.now().toString(),
                label: '',
                type: 'text',
                required: false,
                options: []
            }
        ]);
    };

    const updateFormField = (index: number, field: Partial<ServiceFormField>) => {
        const newFields = [...formFields];
        newFields[index] = { ...newFields[index], ...field };
        setFormFields(newFields);
    };

    const removeFormField = (index: number) => {
        setFormFields(formFields.filter((_, i) => i !== index));
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
                                <span className="font-semibold">A partir de R$ {service.price}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                            <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                                <span>{service.duration} min</span>
                                {service.formFields && service.formFields.length > 0 && (
                                    <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                                        {service.formFields.length} campos extras
                                    </span>
                                )}
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
                <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
                    <div className="space-y-4">
                        <h3 className="font-semibold border-b pb-2">Informações Básicas</h3>
                        <div>
                            <label className="text-sm font-medium">Nome</label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium">Preço Base (R$)</label>
                                <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                                <p className="text-xs text-muted-foreground mt-1">Será exibido como "A partir de..."</p>
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
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="font-semibold">Formulário Personalizado</h3>
                            <Button type="button" size="sm" variant="outline" onClick={addFormField}>
                                <Plus className="h-4 w-4 mr-2" /> Adicionar Campo
                            </Button>
                        </div>

                        {formFields.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhum campo personalizado adicionado.</p>
                        )}

                        {formFields.map((field, index) => (
                            <div key={index} className="bg-secondary/20 p-4 rounded-lg space-y-3 relative group">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                                    onClick={() => removeFormField(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium">Rótulo da Pergunta</label>
                                        <Input
                                            value={field.label}
                                            onChange={e => updateFormField(index, { label: e.target.value })}
                                            placeholder="Ex: Tipo de Cabelo"
                                            className="h-8 text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium">Tipo de Resposta</label>
                                        <select
                                            value={field.type}
                                            onChange={e => updateFormField(index, { type: e.target.value as any })}
                                            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="text">Texto Curto</option>
                                            <option value="textarea">Texto Longo</option>
                                            <option value="select">Seleção</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={`required-${index}`}
                                        checked={field.required}
                                        onChange={e => updateFormField(index, { required: e.target.checked })}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor={`required-${index}`} className="text-xs cursor-pointer">Obrigatório</label>
                                </div>

                                {field.type === 'select' && (
                                    <div>
                                        <label className="text-xs font-medium">Opções (separadas por vírgula)</label>
                                        <Input
                                            value={field.options?.join(', ') || ''}
                                            onChange={e => updateFormField(index, { options: e.target.value.split(',').map(s => s.trim()) })}
                                            placeholder="Ex: Curto, Médio, Longo"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar Serviço'}
                    </Button>
                </form>
            </Modal>
        </div>
    );
}
