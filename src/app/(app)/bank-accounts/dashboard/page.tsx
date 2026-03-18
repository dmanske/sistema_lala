'use client';

import { Suspense } from 'react';
import { BankAccountsDashboard } from '@/components/bank-accounts/BankAccountsDashboard';
import { Loader2 } from 'lucide-react';

export default function BankAccountsDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto p-6 max-w-6xl">
        <Suspense fallback={
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        }>
          <BankAccountsDashboard />
        </Suspense>
      </div>
    </div>
  );
}
