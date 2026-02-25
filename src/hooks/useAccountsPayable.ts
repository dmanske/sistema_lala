'use client';

import { useState, useCallback } from 'react';
import { SupabaseAccountPayableRepository } from '@/infrastructure/repositories/supabase/SupabaseAccountPayableRepository';
import { CreateAccountPayable } from '@/core/usecases/accounts-payable/CreateAccountPayable';
import { RegisterPayment } from '@/core/usecases/accounts-payable/RegisterPayment';
import { ListAccountsPayable } from '@/core/usecases/accounts-payable/ListAccountsPayable';
import { GetAccountsPayableSummary } from '@/core/usecases/accounts-payable/GetAccountsPayableSummary';
import {
  AccountPayableWithDetails,
  CreateAccountPayableInput,
  AccountPayableSummary,
} from '@/core/domain/entities/AccountPayable';
import { CreateAccountPayablePaymentInput } from '@/core/domain/entities/AccountPayablePayment';
import { AccountPayableFilters } from '@/core/repositories/AccountPayableRepository';

const repository = new SupabaseAccountPayableRepository();
const createAccountPayableUseCase = new CreateAccountPayable(repository);
const registerPaymentUseCase = new RegisterPayment(repository);
const listAccountsPayableUseCase = new ListAccountsPayable(repository);
const getSummaryUseCase = new GetAccountsPayableSummary(repository);

export function useAccountsPayable() {
  const [accounts, setAccounts] = useState<AccountPayableWithDetails[]>([]);
  const [summary, setSummary] = useState<AccountPayableSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async (filters?: AccountPayableFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await listAccountsPayableUseCase.execute(filters);
      setAccounts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch accounts payable';
      setError(message);
      console.error('Error fetching accounts payable:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await getSummaryUseCase.execute();
      setSummary(data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  }, []);

  const createAccount = useCallback(
    async (input: CreateAccountPayableInput) => {
      try {
        setLoading(true);
        setError(null);
        await createAccountPayableUseCase.execute(input);
        await fetchAccounts();
        await fetchSummary();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create account payable';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAccounts, fetchSummary]
  );

  const updateAccount = useCallback(
    async (id: string, input: Partial<CreateAccountPayableInput>) => {
      try {
        setLoading(true);
        setError(null);
        await repository.update(id, input as any);
        await fetchAccounts();
        await fetchSummary();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update account payable';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAccounts, fetchSummary]
  );

  const deleteAccount = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        await repository.delete(id);
        await fetchAccounts();
        await fetchSummary();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete account payable';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAccounts, fetchSummary]
  );

  const registerPayment = useCallback(
    async (input: CreateAccountPayablePaymentInput) => {
      try {
        setLoading(true);
        setError(null);
        await registerPaymentUseCase.execute(input);
        await fetchAccounts();
        await fetchSummary();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to register payment';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAccounts, fetchSummary]
  );

  const getOverdue = useCallback(async () => {
    try {
      return await repository.getOverdue();
    } catch (err) {
      console.error('Error fetching overdue accounts:', err);
      return [];
    }
  }, []);

  const getDueSoon = useCallback(async (days: number = 7) => {
    try {
      return await repository.getDueSoon(days);
    } catch (err) {
      console.error('Error fetching due soon accounts:', err);
      return [];
    }
  }, []);

  return {
    accounts,
    summary,
    loading,
    error,
    fetchAccounts,
    fetchSummary,
    createAccount,
    updateAccount,
    deleteAccount,
    registerPayment,
    getOverdue,
    getDueSoon,
  };
}
