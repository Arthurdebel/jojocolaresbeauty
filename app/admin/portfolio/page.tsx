'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { PortfolioItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Trash2, Edit2, Plus, Image as ImageIcon } from 'lucide-react';

export default function AdminPortfolio() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
    const [formData, setFormData] = useState({ title: '', category: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'portfolio'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PortfolioItem)));
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageUrl = editingItem?.imageUrl || '';
            if (imageFile) {
                const storageRef = ref(storage, `portfolio/${Date.now()}_${imageFile.name}`);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            if (!imageUrl) {
                alert('Por favor, envie uma imagem.');
                setLoading(false);
                return;
            }

            const data = {
                title: formData.title,
                category: formData.category,
                imageUrl,
                createdAt: editingItem?.createdAt || Date.now(),
            };

            if (editingItem) {
                await updateDoc(doc(db, 'portfolio', editingItem.id), data);
            } else {
                await addDoc(collection(db, 'portfolio'), data);
            }
            closeModal();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar item do portfólio');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir?')) {
            await deleteDoc(doc(db, 'portfolio', id));
        }
    };

    const openModal = (item?: PortfolioItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                category: item.category,
            });
        } else {
            setEditingItem(null);
            setFormData({ title: '', category: '' });
        }
        setImageFile(null);
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
                    <h1 className="text-3xl font-bold text-gray-900">Portfólio</h1>
                    <p className="mt-2 text-gray-600">Gerencie as imagens da galeria</p>
                </div>
                <Button onClick={() => openModal()}><Plus className="mr-2 h-4 w-4" /> Novo Item</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {items.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                        <div className="aspect-[3/4] relative group">
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                <Button variant="secondary" size="sm" onClick={() => openModal(item)}>
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-bold text-lg truncate">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                        </CardContent>
                    </Card>
                ))}
                {items.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed border-gray-200 rounded-xl">
                        <ImageIcon className="h-12 w-12 mb-4 text-gray-300" />
                        <p>Nenhum item no portfólio.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Editar Item' : 'Novo Item'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Título</label>
                        <Input
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Noiva Clássica"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Categoria</label>
                        <Input
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            placeholder="Ex: Maquiagem"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Imagem</label>
                        <Input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} accept="image/*" />
                        {editingItem?.imageUrl && !imageFile && (
                            <img src={editingItem.imageUrl} alt="Current" className="mt-2 h-20 w-20 object-cover rounded-md" />
                        )}
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </form>
            </Modal>
        </div>
    );
}
