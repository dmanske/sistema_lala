"use client";

import { AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FinancialAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  value?: number;
  action?: {
    label: string;
    href: string;
  };
}

interface FinancialAlertsProps {
  alerts: FinancialAlert[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function FinancialAlerts({ alerts }: FinancialAlertsProps) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon = {
          error: AlertCircle,
          warning: AlertTriangle,
          info: Info,
          success: CheckCircle,
        }[alert.type];

        const variant = {
          error: 'destructive',
          warning: 'default',
          info: 'default',
          success: 'default',
        }[alert.type] as 'default' | 'destructive';

        const colorClasses = {
          error: 'border-red-200 bg-red-50',
          warning: 'border-amber-200 bg-amber-50',
          info: 'border-blue-200 bg-blue-50',
          success: 'border-emerald-200 bg-emerald-50',
        }[alert.type];

        return (
          <Alert key={alert.id} variant={variant} className={colorClasses}>
            <Icon className="h-4 w-4" />
            <AlertTitle className="font-semibold">{alert.title}</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>
                {alert.message}
                {alert.value !== undefined && ` (${formatCurrency(alert.value)})`}
              </span>
              {alert.action && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={alert.action.href}>
                    {alert.action.label}
                  </Link>
                </Button>
              )}
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
