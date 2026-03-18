'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, Pencil, Trash2, FolderOpen, Folder } from 'lucide-react';
import { useState } from 'react';
import type { CostCenter, CostCenterWithChildren } from '@/core/domain/entities/CostCenter';

interface CostCenterTreeProps {
  costCenters: CostCenterWithChildren[];
  onEdit: (costCenter: CostCenter) => void;
  onDelete: (id: string) => void;
}

export function CostCenterTree({ costCenters, onEdit, onDelete }: CostCenterTreeProps) {
  return (
    <div className="divide-y divide-slate-50">
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

const levelColors = [
  'text-blue-600 bg-blue-50',
  'text-indigo-600 bg-indigo-50',
  'text-violet-600 bg-violet-50',
];

function CostCenterNode({ costCenter, onEdit, onDelete }: CostCenterNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = costCenter.children?.length > 0;
  const level = costCenter.level ?? 0;
  const colorClass = levelColors[Math.min(level, levelColors.length - 1)];

  return (
    <div>
      <div
        className="flex items-center gap-2 px-5 py-3 hover:bg-slate-50/60 group transition-colors"
        style={{ paddingLeft: `${level * 28 + 20}px` }}
      >
        {/* Expand toggle */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <div className="w-6 shrink-0" />
        )}

        {/* Icon */}
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
          {hasChildren && isExpanded
            ? <FolderOpen className="h-3.5 w-3.5" />
            : <Folder className="h-3.5 w-3.5" />
          }
        </div>

        {/* Name + code */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className={`font-semibold text-sm ${level === 0 ? 'text-slate-800' : 'text-slate-600'} truncate`}>
            {costCenter.name}
          </span>
          {costCenter.code && (
            <Badge variant="outline" className="text-xs font-mono shrink-0 bg-white">
              {costCenter.code}
            </Badge>
          )}
          {!costCenter.isActive && (
            <Badge variant="secondary" className="text-xs shrink-0 bg-slate-100 text-slate-500">
              Inativo
            </Badge>
          )}
        </div>

        {/* Actions (hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
            onClick={() => onEdit(costCenter)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
            onClick={() => onDelete(costCenter.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="border-l border-slate-100 ml-[44px]">
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
