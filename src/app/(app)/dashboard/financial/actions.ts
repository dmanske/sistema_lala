'use server';

import { GetFinancialInsights } from "@/core/usecases/dashboard/GetFinancialInsights";

export async function getFinancialInsights(period: string) {
  return await GetFinancialInsights(period);
}
