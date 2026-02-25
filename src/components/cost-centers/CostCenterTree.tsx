'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { CostCenter, CostCenterWithChildren } from '@/core/domain/entities/CostCenter';

interface CostCenterTreeProps {
  costCenters: CostCenterWithChildren[];
  onEdit: (costCenter: CostCenter) => void;
  onDelete: (id: string) => void;
}

export function CostCenterTree({ costCenters, onEdit, onDelete }: CostCenterTreeProps) {
  return (
    <div className="space-y-1">
      {costCenters.map((costCenter) => (
        <CostCenterNode
          key={costCenter.id}
          costCenter={costCenter}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

interface CostCenterNodeProps {
  costCenter: CostCenterWithChildren;
  onEdit: (costCenter: CostCenter) => void;
  onDelete: (id: string) => void;
}

function CostCenterNode({ costCenter, onEdit, onDelete }: CostCenterNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = costCenter.children?.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group"
        style={{ paddingLeft: `${costCenter.level * 24 + 8}px` }}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-6" />
        )}

        <div className="flex-1 flex items-center gap-2">
          <span className="font-medium">{costCenter.name}</span>
          {costCenter.code && (
            <Badge variant="outline" className="text-xs">
              {costCenter.code}
            </Badge>
          )}
          {!costCenter.isActive && (
            <Badge variant="secondary" className="text-xs">
              Inativo
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(costCenter)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(costCenter.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {costCenter.children?.map((child) => (
            <CostCenterNode
              key={child.id}
              costCenter={child}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
