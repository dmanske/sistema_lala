'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProjectionScenario } from '@/core/domain/entities/CashFlowProjection';

interface ScenarioSelectorProps {
  value: ProjectionScenario;
  onChange: (value: ProjectionScenario) => void;
}

export function ScenarioSelector({ value, onChange }: ScenarioSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="scenario">Cenário:</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="scenario" className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="OPTIMISTIC">
            Otimista (100%)
          </SelectItem>
          <SelectItem value="REALISTIC">
            Realista (85%)
          </SelectItem>
          <SelectItem value="PESSIMISTIC">
            Pessimista (70%)
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
