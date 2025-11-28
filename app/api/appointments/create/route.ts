import { NextResponse } from 'next/server';
import { sendWhatsAppVCard, sendWhatsAppMessage, ADMIN_PHONE } from '@/lib/whatsapp';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clientName, clientPhone, message } = body;

        // Clean phone number: remove non-numeric chars
        let cleanPhone = clientPhone.replace(/\D/g, '');
        // Ensure country code (assuming BR +55)
        if (cleanPhone.length <= 11) {
            cleanPhone = '55' + cleanPhone;
        }

        // 1. Send Booking Request to Admin (Makeup Artist)
        const adminMessage = `${message}\n\n🔗 *Confirmar Agendamento:*\nhttps://jojocolaresbeauty.vercel.app/admin`;

        await sendWhatsAppMessage({
            number: ADMIN_PHONE,
            message: adminMessage,
            footer: 'Sistema de Agendamento'
        });

        // 2. Send Client vCard to Admin
        await sendWhatsAppVCard({
            number: ADMIN_PHONE,
            name: clientName,
            phone: cleanPhone // Use cleaned phone number for vCard
        });

        // 3. Send Confirmation Receipt to Client
        const clientMessage = `Olá ${clientName}! 👋\n\nRecebemos sua solicitação de agendamento. ✨\n\nNossa equipe irá analisar a disponibilidade e entrará em contato em breve para confirmar todos os detalhes.\n\nObrigado por escolher a Jojo Colares Beauty! 💖`;

        await sendWhatsAppMessage({
            number: cleanPhone, // Use cleaned phone number for sending message
            message: clientMessage,
            footer: 'Enviado de Sistema de Agendamento'
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing booking notification:', error);
        return NextResponse.json({ success: false, error: 'Failed to send notifications' }, { status: 500 });
    }
}
