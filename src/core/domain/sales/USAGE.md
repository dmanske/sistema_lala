
# Guia de Integração: Módulo de Vendas

Este documento explica como utilizar o núcleo de Vendas implementado no frontend (Next.js components).

## Como usar na UI

### 1. Inicializar Repositórios (Simulação de Injeção de Dependência)
Como estamos usando `localStorage` e funções diretas, você pode instanciar os repositórios diretamente ou criar um Hook/Context.

```typescript
// ex: src/hooks/useSales.ts
import { LocalStorageSaleRepository } from '@/infrastructure/repositories/sales/LocalStorageSaleRepository';
import { LocalStorageStockMovementRepository } from '@/infrastructure/repositories/stock/LocalStorageStockMovementRepository';
import { createSaleUseCase } from '@/core/usecases/sales/createSale';
import { paySaleUseCase } from '@/core/usecases/sales/paySale';

const saleRepo = new LocalStorageSaleRepository();
const stockRepo = new LocalStorageStockMovementRepository();

export function useSales() {
  const createSale = async (customerId?: string, appointmentId?: string) => {
    return await createSaleUseCase(saleRepo, {
      tenantId: 'default',
      customerId,
      appointmentId,
      createdBy: 'currentUser', // Obter do auth context
    });
  };

  const paySale = async (saleId: string, method: 'pix'|'card', amount: number) => {
    return await paySaleUseCase(saleRepo, stockRepo, {
      saleId,
      method,
      amount,
      paidAt: new Date(),
      createdBy: 'currentUser',
    });
  };

  return { createSale, paySale };
}
```

### 2. Ciclo de Vida da Venda
1. **Começar Venda**: Chame `createSale` ao abrir o modal de checkout ou ao clicar em "Nova Venda".
2. **Adicionar Itens**: Use `upsertSaleItemsUseCase` passando o array atualizado de itens do carrinho. O repositório recalcula o total automaticamente.
3. **Pagamento**: Chame `paySale`. Isso valida o total, registra o pagamento e **baixa o estoque** automaticamente se houver produtos.
4. **Histórico**: Use `getCustomerProductHistoryUseCase` na tab de perfil do cliente para mostrar compras anteriores.

## Pontos de Extensão para Supabase

A arquitetura usa **Repository Pattern**. Para migrar para o Supabase:

1. **Crie novas implementações**:
   - `src/infrastructure/repositories/sales/SupabaseSaleRepository.ts`
   - `src/infrastructure/repositories/stock/SupabaseStockMovementRepository.ts`
   
2. **Implemente a interface**:
   Ambos devem implementar `SaleRepository` e `StockMovementRepository` respectivamente. O contrato das interfaces (métodos e tipos de retorno) deve ser IDÊNTICO.

3. **Troque a injeção**:
   No seu hook `useSales` ou container de injeção de dependência, troque:
   ```typescript
   // DE:
   const saleRepo = new LocalStorageSaleRepository();
   // PARA:
   const saleRepo = new SupabaseSaleRepository(supabaseClient);
   ```

O restante da aplicação (Use Cases, UI, Validações) **não precisará ser alterado**, pois dependem apenas da Interface e não da implementação concreta.
