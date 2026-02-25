'use client';

import { Badge } from '@/components/ui/badge';
import { AccountPayableStatus } from '@/core/domain/entities/AccountPayable';
import { Clock, AlertCircle, CheckCircle2, XCircle, Ban } from 'lucide-react';

interface AccountPayableStatusBadgeProps {
  status: AccountPayableStatus;
  isOverdue?: boolean;
  className?: string;
}

export function AccountPayableStatusBadge({
  status,
  isOverdue,
  className,
}: AccountPayableStatusBadgeProps) {
  const getStatusConfig = () => {
    if (isOverdue && status !== 'PAID' && status !== 'CANCELLED') {
      return {
        label: 'Vencida',
        variant: 'destructive' as const,
        icon: AlertCircle,
        className: '',
      };
    }

    switch (status) {
      case 'PENDING':
        return {
          label: 'Pendente',
          variant: 'secondary' as const,
          icon: Clock,
          className: '',
        };
      case 'PARTIAL':
        return {
          label: 'Parcial',
          variant: 'default' as const,
          icon: AlertCircle,
          className: '',
        };
      case 'PAID':
        return {
          label: 'Pago',
          variant: 'default' as const,
          icon: CheckCircle2,
          className: 'bg-green-500/20 text-green-400 border-green-500/30',
        };
      case 'OVERDUE':
        return {
          label: 'Vencida',
          variant: 'destructive' as const,
          icon: AlertCircle,
          className: '',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelada',
          variant: 'outline' as const,
          icon: Ban,
          className: '',
        };
      default:
        return {
          label: status,
          variant: 'secondary' as const,
          icon: XCircle,
          className: '',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} ${className || ''}`}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
