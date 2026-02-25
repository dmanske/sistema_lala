'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCostCenters } from '@/app/(app)/settings/cost-centers/actions';

interface CostCenterSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CostCenterSelector({
  value,
  onValueChange,
  placeholder = 'Selecione um centro de custos',
  className,
}: CostCenterSelectorProps) {
  const { data: costCenters, isLoading } = useQuery({
    queryKey: ['cost-centers'],
    queryFn: getCostCenters,
  });

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Carregando..." />
        </SelectTrigger>
      </Select>
    );
  }

  const activeCostCenters = costCenters?.filter((cc) => cc.isActive) || [];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">Nenhum</SelectItem>
        {activeCostCenters.map((cc) => (
          <SelectItem key={cc.id} value={cc.id}>
            {cc.name} {cc.code && `(${cc.code})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
