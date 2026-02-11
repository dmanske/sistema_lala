import { useState, useEffect, useCallback } from 'react';
import { Service, CreateServiceInput } from '@/core/domain/Service';
import { getServiceRepository } from '@/infrastructure/repositories/factory';

export function useServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    // In a real app, this should be a singleton or provided via context/DI
    const repo = getServiceRepository();

    const fetchServices = useCallback(async (search?: string) => {
        setLoading(true);
        try {
            const data = await repo.getAll({ search });
            setServices(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const addService = async (input: CreateServiceInput) => {
        await repo.create(input);
        await fetchServices();
    };

    const updateService = async (id: string, input: Partial<Service>) => {
        await repo.update(id, input);
        await fetchServices();
    };

    const deleteService = async (id: string) => {
        await repo.delete(id);
        await fetchServices();
    };

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    return { services, loading, fetchServices, addService, updateService, deleteService };
}
