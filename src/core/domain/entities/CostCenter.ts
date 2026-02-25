export interface CostCenter {
  id: string;
  tenantId: string;
  name: string;
  code?: string;
  parentId?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CostCenterWithChildren extends CostCenter {
  children: CostCenterWithChildren[];
  level: number;
}
