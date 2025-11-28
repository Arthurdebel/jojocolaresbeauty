import { NextResponse } from 'next/server';
import { sendWhatsAppMessage, ADMIN_PHONE } from '@/lib/whatsapp';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clientName, clientPhone, status, date, time, services } = body;

        let clientMessage = '';
        let adminMessage = '';

        if (status === 'confirmed') {
            clientMessage = `Olá ${clientName}! ✨\n\nSeu agendamento para *${services}* no dia *${date}* às *${time}* foi *CONFIRMADO*! 😍\n\nEstamos ansiosos para te atender!\n\n📍 Endereço: [Inserir Endereço do Studio]\nCaso tenha dúvidas, pode responder esta mensagem.`;

            adminMessage = `✅ Agendamento Confirmado!\n\nCliente: ${clientName}\nData: ${date} às ${time}\nServiços: ${services}\n\nNotificação enviada para a cliente.`;
        } else if (status === 'cancelled') {
            clientMessage = `Olá ${clientName}. 😔\n\nInformamos que seu agendamento para *${services}* no dia *${date}* às *${time}* precisou ser *CANCELADO*.\n\nCaso queira reagendar ou entender o motivo, por favor entre em contato conosco.`;

            adminMessage = `❌ Agendamento Cancelado.\n\nCliente: ${clientName}\nData: ${date} às ${time}\n\nNotificação enviada para a cliente.`;
        } else {
            return NextResponse.json({ success: true, message: 'No notification needed for this status' });
        }

        // Notify Client
        if (clientPhone) {
            await sendWhatsAppMessage({
                number: clientPhone,
                message: clientMessage,
                footer: 'Enviado de Sistema de Agendamento'
            });
        }

        // Notify Admin (Confirmation of action)
        await sendWhatsAppMessage({
            number: ADMIN_PHONE,
            message: adminMessage,
            footer: 'Sistema de Agendamento'
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending status update notification:', error);
        return NextResponse.json({ success: false, error: 'Failed to send notifications' }, { status: 500 });
    }
}
