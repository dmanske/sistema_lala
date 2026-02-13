"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Store, TrendingUp, TrendingDown, Calendar, Package, ExternalLink } from "lucide-react";
import { getProductSuppliers, ProductSupplierInfo } from "@/core/usecases/products/getProductSuppliers";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductSuppliersTabProps {
  productId: string;
}

export function ProductSuppliersTab({ productId }: ProductSuppliersTabProps) {
  const [suppliers, setSuppliers] = useState<ProductSupplierInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      const data = await getProductSuppliers(productId);
      setSuppliers(data);
      setLoading(false);
    };

    fetchSuppliers();
  }, [productId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="py-12 text-center">
          <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Store className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Nenhum fornecedor encontrado</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">
            Este produto ainda não foi comprado de nenhum fornecedor.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="h-5 w-5 text-orange-600" />
            Fornecedores ({suppliers.length})
          </CardTitle>
          <CardDescription>
            Histórico de compras e comparação de preços por fornecedor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suppliers.map((supplier) => (
              <div
                key={supplier.supplierId}
                className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <Store className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{supplier.supplierName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {supplier.purchaseCount} {supplier.purchaseCount === 1 ? 'compra' : 'compras'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase block mb-1">
                          Total Comprado
                        </span>
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <Package className="h-3.5 w-3.5 text-slate-500" />
                          {supplier.totalQuantity}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground uppercase block mb-1">
                          Última Compra
                        </span>
                        <div className="font-medium text-slate-700 text-sm">
                          {new Date(supplier.lastPurchaseDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground uppercase block mb-1">
                          Último Preço
                        </span>
                        <div className="font-bold text-orange-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(supplier.lastPurchasePrice)}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground uppercase block mb-1">
                          Preço Médio
                        </span>
                        <div className="font-bold text-slate-700">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(supplier.averagePrice)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-1 text-xs">
                        <TrendingDown className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-muted-foreground">Menor:</span>
                        <span className="font-semibold text-green-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(supplier.minPrice)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="h-3.5 w-3.5 text-red-600" />
                        <span className="text-muted-foreground">Maior:</span>
                        <span className="font-semibold text-red-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(supplier.maxPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link href={`/suppliers/${supplier.supplierId}`}>
                      <Button variant="outline" size="sm" className="w-full rounded-lg">
                        <ExternalLink className="h-3.5 w-3.5 mr-2" />
                        Ver Perfil
                      </Button>
                    </Link>
                    <Link href={`/purchases/new?supplierId=${supplier.supplierId}&productId=${productId}`}>
                      <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700 rounded-lg">
                        Nova Compra
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
