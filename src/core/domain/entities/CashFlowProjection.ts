export type ProjectionScenario = 'OPTIMISTIC' | 'REALISTIC' | 'PESSIMISTIC';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type InflowSource = 'RECEIVABLES' | 'RECURRING' | 'ESTIMATED';
export type OutflowSource = 'PAYABLES' | 'RECURRING' | 'ESTIMATED';

export interface ExpectedInflow {
  source: InflowSource;
  amount: number;
  date: Date;
  description: string;
  confidence: ConfidenceLevel;
}

export interface ExpectedOutflow {
  source: OutflowSource;
  amount: number;
  date: Date;
  description: string;
  confidence: ConfidenceLevel;
}

export interface DailyProjection {
  date: Date;
  openingBalance: number;
  inflows: number;
  outflows: number;
  closingBalance: number;
  minimumRequired: number;
}

export interface CashFlowProjection {
  projectionDate: Date;
  expectedInflows: ExpectedInflow[];
  expectedOutflows: ExpectedOutflow[];
  dailyProjection: DailyProjection[];
  scenario: ProjectionScenario;
}

export interface RecurringExpense {
  id: string;
  tenantId: string;
  description: string;
  amount: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: Date;
  endDate?: Date;
  category: string;
  bankAccountId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
