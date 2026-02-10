import { Client } from '@/core/domain/Client';

export const CLIENT_SEED_DATA: Client[] = [
    {
        id: '1',
        name: 'Ana Silva',
        birthDate: '1990-05-15',
        phone: '(11) 99999-9999',
        whatsapp: '(11) 99999-9999',
        city: 'São Paulo',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        creditBalance: 0,
        hasHistory: true, // Cannot delete
        notes: 'Cliente fiel, gosta de café sem açúcar.',
    },
    {
        id: '2',
        name: 'Bruno Souza',
        birthDate: '1985-08-20',
        phone: '(21) 98888-8888',
        whatsapp: '(21) 98888-8888',
        city: 'Rio de Janeiro',
        status: 'INACTIVE',
        createdAt: new Date().toISOString(),
        creditBalance: 0,
        hasHistory: false, // Can delete
        notes: 'Mudou de cidade.',
    },
    {
        id: '3',
        name: 'Carla Dias',
        birthDate: '1995-12-10',
        phone: '(31) 97777-7777',
        whatsapp: '(31) 97777-7777',
        city: 'Belo Horizonte',
        status: 'ATTENTION',
        createdAt: new Date().toISOString(),
        creditBalance: 50,
        hasHistory: true, // Cannot delete
        notes: 'Atrasou último pagamento.',
    },
];
