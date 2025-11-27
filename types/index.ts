export interface Service {
    id: string;
    name: string;
    price: number;
    duration: number; // in minutes
    description?: string;
    imageUrl?: string;
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
    hairType?: string; // obrigatório se penteado selecionado
    paymentMethod: 'pix' | 'cartao' | 'dinheiro';
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
