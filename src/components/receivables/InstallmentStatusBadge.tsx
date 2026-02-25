import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { InstallmentStatus } from '@/core/domain/entities/SaleInstallment';

interface InstallmentStatusBadgeProps {
  status: InstallmentStatus;
  isOverdue?: boolean;
  daysOverdue?: number;
}

export function InstallmentStatusBadge({ 
  status, 
  isOverdue = false,
  daysOverdue = 0 
}: InstallmentStatusBadgeProps) {
  if (status === 'RECEIVED') {
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Recebido
      </Badge>
    );
  }

  if (isOverdue) {
    return (
      <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
        <AlertCircle className="w-3 h-3 mr-1" />
        Vencida {daysOverdue > 0 && `(${daysOverdue}d)`}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
      <Clock className="w-3 h-3 mr-1" />
      Pendente
    </Badge>
  );
}
