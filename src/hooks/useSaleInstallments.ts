import { useState, useCallback } from 'react';
import { SupabaseSaleInstallmentRepository } from '@/infrastructure/repositories/supabase/SupabaseSaleInstallmentRepository';
import { CreateInstallmentSale } from '@/core/usecases/sales/CreateInstallmentSale';
import { RegisterReceipt } from '@/core/usecases/sales/RegisterReceipt';
import { ListReceivables } from '@/core/usecases/sales/ListReceivables';
import { GetReceivablesSummary } from '@/core/usecases/sales/GetReceivablesSummary';
import type { CreateInstallmentSaleInput } from '@/core/domain/types/InstallmentSale';
import type { RegisterReceiptInput } from '@/core/domain/entities/SaleInstallment';
import type { ListReceivablesInput } from '@/core/usecases/sales/ListReceivables';

const repository = new SupabaseSaleInstallmentRepository();
const createInstallmentSaleUseCase = new CreateInstallmentSale(repository);
const registerReceiptUseCase = new RegisterReceipt(repository);
const listReceivablesUseCase = new ListReceivables(repository);
const getSummaryUseCase = new GetReceivablesSummary(repository);

export function useSaleInstallments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInstallmentSale = useCallback(async (input: CreateInstallmentSaleInput) => {
    setLoading(true);
    setError(null);
    try {
      const ids = await createInstallmentSaleUseCase.execute(input);
      return ids;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create installment sale';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerReceipt = useCallback(async (input: RegisterReceiptInput) => {
    setLoading(true);
    setError(null);
    try {
      const movementId = await registerReceiptUseCase.execute(input);
      return movementId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register receipt';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listReceivables = useCallback(async (input?: ListReceivablesInput) => {
    setLoading(true);
    setError(null);
    try {
      const receivables = await listReceivablesUseCase.execute(input);
      return receivables;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list receivables';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getSummaryUseCase.execute();
      return summary;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get summary';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const installment = await repository.getById(id);
      return installment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get installment';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBySaleId = useCallback(async (saleId: string) => {
    setLoading(true);
    setError(null);
    try {
      const installments = await repository.getBySaleId(saleId);
      return installments;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get installments';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createInstallmentSale,
    registerReceipt,
    listReceivables,
    getSummary,
    getById,
    getBySaleId,
  };
}
