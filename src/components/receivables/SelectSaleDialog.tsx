'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { formatBrazilDate } from '@/lib/utils/dateUtils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface Sale {
  id: string;
  total: number;
  customer_name: string;
  created_at: string;
}

interface SelectSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sales: Sale[];
  onSelect: (sale: { id: string; total: number }) => void;
}

export function SelectSaleDialog({
  open,
  onOpenChange,
  sales,
  onSelect,
}: SelectSaleDialogProps) {
  const handleSelect = (sale: Sale) => {
    onSelect({ id: sale.id, total: sale.total });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selecionar Venda para Parcelar</DialogTitle>
        </DialogHeader>

        {sales.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma venda disponível para parcelar.
            <br />
            Todas as vendas já possuem parcelas criadas.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{formatBrazilDate(new Date(sale.created_at), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{sale.customer_name}</TableCell>
                  <TableCell>{formatCurrency(sale.total)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleSelect(sale)}
                    >
                      Parcelar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
