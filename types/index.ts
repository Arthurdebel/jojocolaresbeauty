export interface ServiceFormField {
    id: string;
    label: string;
    type: 'text' | 'select' | 'textarea';
    required: boolean;
    options?: string[]; // for select type
}

export interface Service {
    id: string;
    name: string;
    price: number;
    duration: number; // in minutes
    description?: string;
    imageUrl?: string;
    formFields?: ServiceFormField[];
}

export interface Appointment {
    id: string;
    clientName: string;
    phone: string;
    city: string;
    state: string;
    services: Service[];
    totalDuration: number; // in minutes
    totalPrice: number;
    basePrice: number; // preço sem taxa de domicílio
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    status: 'pending' | 'confirmed' | 'cancelled';
    serviceType: 'studio' | 'domicilio';
    paymentMethod: 'pix' | 'cartao' | 'dinheiro';
    formAnswers?: Record<string, string>; // answers to dynamic service forms: { "serviceId_fieldId": "answer" }
    createdAt: number; // timestamp
}

export interface PortfolioItem {
    id: string;
    title: string;
    category: string;
    imageUrl: string;
    createdAt?: number;
}

export interface Testimonial {
    id: string;
    name: string;
    role: string;
    text: string;
    createdAt?: number;
}
