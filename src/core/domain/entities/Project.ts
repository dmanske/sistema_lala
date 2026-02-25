export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  code?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}
