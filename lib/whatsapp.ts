export const WHATSAPP_API_KEY = '1KK2GjrAIUUTn3VDPzhhqc1jTrOGcW';
// TODO: Replace with the actual sender number connected to whaply.top
export const WHATSAPP_SENDER = '5521977108169';
export const ADMIN_PHONE = '5521979485161';
export const WHATSAPP_API_URL = 'https://whaply.top';

interface SendVCardParams {
    number: string;
    name: string;
    phone: string;
}

interface SendMessageParams {
    number: string;
    message: string;
    footer?: string;
}

export async function sendWhatsAppVCard(params: SendVCardParams) {
    const body = {
        api_key: WHATSAPP_API_KEY,
        sender: WHATSAPP_SENDER,
        number: params.number,
        name: params.name,
        phone: params.phone
    };

    try {
        const response = await fetch(`${WHATSAPP_API_URL}/send-vcard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return await response.json();
    } catch (error) {
        console.error('Error sending WhatsApp vCard:', error);
        throw error;
    }
}

export async function sendWhatsAppMessage(params: SendMessageParams) {
    const body = {
        api_key: WHATSAPP_API_KEY,
        sender: WHATSAPP_SENDER,
        number: params.number,
        message: params.message,
        footer: params.footer
    };

    try {
        const response = await fetch(`${WHATSAPP_API_URL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return await response.json();
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
}
