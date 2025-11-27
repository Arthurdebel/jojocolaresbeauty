'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSetup() {
    const [email, setEmail] = useState('jojo@admin.com');
    const [password, setPassword] = useState('jojo123');
    const [message, setMessage] = useState('');

    const handleCreate = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setMessage('Usuário criado com sucesso! Agora faça login.');
        } catch (error: any) {
            setMessage('Erro: ' + error.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Criar Admin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                    <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" />
                    <Button onClick={handleCreate} className="w-full">Criar Usuário</Button>
                    {message && <p className="text-center text-sm">{message}</p>}
                </CardContent>
            </Card>
        </div>
    );
}
