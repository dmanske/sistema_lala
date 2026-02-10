import { Service } from '@/core/domain/Service';

export const SERVICE_SEED_DATA: Service[] = [
    { id: "s1", name: "Corte Feminino", duration: 60, price: 120, cost: 0, profitAmount: 120, profitPercentage: 100, commission: 0, netValue: 120, createdAt: new Date().toISOString() },
    { id: "s2", name: "Escova Modelada", duration: 45, price: 80, cost: 0, profitAmount: 80, profitPercentage: 100, commission: 0, netValue: 80, createdAt: new Date().toISOString() },
    { id: "s3", name: "Manicure", duration: 40, price: 45, cost: 5, profitAmount: 40, profitPercentage: 88, commission: 0, netValue: 40, createdAt: new Date().toISOString() },
    { id: "s4", name: "Pedicure", duration: 40, price: 50, cost: 5, profitAmount: 45, profitPercentage: 90, commission: 0, netValue: 45, createdAt: new Date().toISOString() },
    { id: "s5", name: "Coloração", duration: 90, price: 180, cost: 30, profitAmount: 150, profitPercentage: 83, commission: 0, netValue: 150, createdAt: new Date().toISOString() },
    { id: "s6", name: "Design de Sobrancelha", duration: 30, price: 40, cost: 0, profitAmount: 40, profitPercentage: 100, commission: 0, netValue: 40, createdAt: new Date().toISOString() },
];
