import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, CreateProductInput, CreateProductMovementInput, ProductMovement } from '@/core/domain/Product';
import { getProductRepository } from '@/infrastructure/repositories/factory';

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [movements, setMovements] = useState<ProductMovement[]>([]); // Current product movements
    const [loading, setLoading] = useState(true);

    // In a real app, singleton or context
    const repo = useMemo(() => getProductRepository(), []);

    const fetchProducts = useCallback(async (search?: string, lowStock?: boolean) => {
        setLoading(true);
        try {
            const data = await repo.getAll({ search, lowStock });
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [repo]);

    // Memoize repo to ensure stability if it has state, though it's likely stateless
    // However, recreating it is cheap. The real issue is the functions.

    // Memoizing functions to prevent infinite loops in useEffects
    const fetchMovements = useCallback(async (productId: string) => {
        const data = await repo.getMovements(productId);
        setMovements(data);
        return data;
    }, [repo]);

    const getProductMovements = useCallback(async (productId: string) => {
        return await repo.getMovements(productId);
    }, [repo]);

    const addProduct = useCallback(async (input: CreateProductInput) => {
        await repo.create(input);
        await fetchProducts();
    }, [repo, fetchProducts]);

    const updateProduct = useCallback(async (id: string, input: Partial<Product>) => {
        await repo.update(id, input);
        await fetchProducts();
    }, [repo, fetchProducts]);

    const deleteProduct = useCallback(async (id: string) => {
        await repo.delete(id);
        await fetchProducts();
    }, [repo, fetchProducts]);

    const addMovement = useCallback(async (input: CreateProductMovementInput) => {
        await repo.addMovement(input);
        await fetchProducts(); // Refresh stock
        // Note: This updates the global 'products' list, which triggers re-render of ProductProfilePage
        // and subsequently re-runs its effect to find product and fetch movements.
    }, [repo, fetchProducts]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return {
        products,
        movements,
        loading,
        fetchProducts,
        fetchMovements,
        getProductMovements,
        addProduct,
        updateProduct,
        deleteProduct,
        addMovement
    };
}
