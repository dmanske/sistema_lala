import { useState, useEffect, useCallback, useMemo } from 'react';
import { UsageProduct, CreateUsageProductInput, UsageProductLog, CreateUsageProductLogInput } from '@/core/domain/UsageProduct';
import { getUsageProductRepository } from '@/infrastructure/repositories/factory';

export function useUsageProducts() {
    const [products, setProducts] = useState<UsageProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const repo = useMemo(() => getUsageProductRepository(), []);

    const fetchProducts = useCallback(async (search?: string) => {
        setLoading(true);
        try {
            const data = await repo.getAll({ search });
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [repo]);

    const addProduct = useCallback(async (input: CreateUsageProductInput) => {
        await repo.create(input);
        await fetchProducts();
    }, [repo, fetchProducts]);

    const updateProduct = useCallback(async (id: string, input: Partial<UsageProduct>) => {
        await repo.update(id, input);
        await fetchProducts();
    }, [repo, fetchProducts]);

    const deleteProduct = useCallback(async (id: string) => {
        await repo.delete(id);
        await fetchProducts();
    }, [repo, fetchProducts]);

    const addLog = useCallback(async (input: CreateUsageProductLogInput) => {
        const log = await repo.addLog(input);
        await fetchProducts(); // refresh consumption
        return log;
    }, [repo, fetchProducts]);

    const getLogsByAppointment = useCallback(async (appointmentId: string) => {
        return repo.getLogsByAppointment(appointmentId);
    }, [repo]);

    const getLogsByClient = useCallback(async (clientId: string) => {
        return repo.getLogsByClient(clientId);
    }, [repo]);

    const getLastFormulaForClient = useCallback(async (clientId: string) => {
        return repo.getLastFormulaForClient(clientId);
    }, [repo]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    return {
        products, loading, fetchProducts,
        addProduct, updateProduct, deleteProduct,
        addLog, getLogsByAppointment, getLogsByClient, getLastFormulaForClient,
    };
}
