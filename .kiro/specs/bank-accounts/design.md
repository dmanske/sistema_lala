# Design Document: Bank Accounts Management System

## Overview

The Bank Accounts Management System extends the existing salon management system to track financial accounts where money is received and from where payments are made. This feature integrates with the existing cash movements system, adding account-level tracking to all financial transactions.

The system follows the established architecture patterns:
- Repository pattern for data access
- Use cases for business logic
- Domain models for entities
- Supabase for database with RLS (Row Level Security)
- Multi-tenant architecture with tenant_id filtering
- TypeScript with Next.js 14 App Router

### Key Design Decisions

1. **Non-destructive account management**: Accounts can be deactivated but not deleted if they have movements
2. **Calculated balances**: Current balance is computed from initial_balance + sum of movements, not stored
3. **Mandatory account linking**: All new cash movements must be linked to an active account
4. **Default account migration**: Existing movements will be linked to a "Caixa Geral" default account per tenant
5. **Account types**: Three types supported - Bank (Banco), Card (Cartão), Wallet (Carteira Digital)

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         UI Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Account List │  │   Account    │  │   Payment    │      │
│  │     Page     │  │  Statement   │  │   Dialogs    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Use Cases Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Create     │  │     List     │  │   Get        │      │
│  │   Account    │  │   Accounts   │  │  Statement   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Repository Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         BankAccountRepository Interface              │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      SupabaseBankAccountRepository                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │bank_accounts │  │cash_movements│                         │
│  │    table     │  │    table     │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Integration Points

The Bank Accounts system integrates with existing components:

1. **Cash Movements System**: Extended to include bank_account_id foreign key
2. **Sales Checkout**: Payment dialogs updated to select destination account
3. **Purchases**: Payment forms updated to select source account
4. **Client Credit**: Recharge dialogs updated to select destination account
5. **Manual Cash Movements**: Creation dialogs updated to select account

## Components and Interfaces

### Domain Models

#### BankAccount

```typescript
export interface BankAccount {
  id: string
  tenantId: string
  name: string
  type: 'BANK' | 'CARD' | 'WALLET'
  initialBalance: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### BankAccountWithBalance

```typescript
export interface BankAccountWithBalance extends BankAccount {
  currentBalance: number
}
```

#### AccountStatement

```typescript
export interface AccountMovement {
  id: string
  date: Date
  description: string
  type: 'IN' | 'OUT'
  amount: number
  balanceAfter: number
  method: string
  sourceType: string
}

export interface AccountStatement {
  account: BankAccount
  movements: AccountMovement[]
  summary: {
    initialBalance: number
    totalIn: number
    totalOut: number
    currentBalance: number
  }
}
```

### Repository Interface

```typescript
export interface BankAccountRepository {
  // Create a new bank account
  create(account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>): Promise<BankAccount>
  
  // Update account name and type
  update(id: string, data: { name?: string; type?: 'BANK' | 'CARD' | 'WALLET' }): Promise<BankAccount>
  
  // Deactivate an account (soft delete)
  deactivate(id: string): Promise<void>
  
  // Reactivate an account
  activate(id: string): Promise<void>
  
  // Get account by ID
  getById(id: string): Promise<BankAccount | null>
  
  // List all accounts for current tenant
  list(filters?: { isActive?: boolean }): Promise<BankAccount[]>
  
  // List accounts with calculated current balance
  listWithBalances(filters?: { isActive?: boolean }): Promise<BankAccountWithBalance[]>
  
  // Get account statement with movements
  getStatement(accountId: string, filters?: { startDate?: Date; endDate?: Date }): Promise<AccountStatement>
  
  // Check if account has movements (for deletion validation)
  hasMovements(accountId: string): Promise<boolean>
}
```

### Use Cases

#### CreateBankAccountUseCase

```typescript
export class CreateBankAccountUseCase {
  constructor(private repository: BankAccountRepository) {}
  
  async execute(data: {
    name: string
    type: 'BANK' | 'CARD' | 'WALLET'
    initialBalance?: number
  }): Promise<BankAccount> {
    // Validate name (1-100 characters, not empty/whitespace)
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Account name cannot be empty')
    }
    if (data.name.length > 100) {
      throw new Error('Account name cannot exceed 100 characters')
    }
    
    // Validate type
    if (!['BANK', 'CARD', 'WALLET'].includes(data.type)) {
      throw new Error('Invalid account type')
    }
    
    return this.repository.create({
      name: data.name.trim(),
      type: data.type,
      initialBalance: data.initialBalance || 0,
      isActive: true
    })
  }
}
```

#### UpdateBankAccountUseCase

```typescript
export class UpdateBankAccountUseCase {
  constructor(private repository: BankAccountRepository) {}
  
  async execute(id: string, data: {
    name?: string
    type?: 'BANK' | 'CARD' | 'WALLET'
  }): Promise<BankAccount> {
    // Validate name if provided
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('Account name cannot be empty')
      }
      if (data.name.length > 100) {
        throw new Error('Account name cannot exceed 100 characters')
      }
    }
    
    // Validate type if provided
    if (data.type && !['BANK', 'CARD', 'WALLET'].includes(data.type)) {
      throw new Error('Invalid account type')
    }
    
    return this.repository.update(id, {
      name: data.name?.trim(),
      type: data.type
    })
  }
}
```

#### DeactivateBankAccountUseCase

```typescript
export class DeactivateBankAccountUseCase {
  constructor(private repository: BankAccountRepository) {}
  
  async execute(id: string): Promise<void> {
    // Check if account exists
    const account = await this.repository.getById(id)
    if (!account) {
      throw new Error('Account not found')
    }
    
    // Deactivate (movements can exist, we just mark as inactive)
    await this.repository.deactivate(id)
  }
}
```

#### ListBankAccountsUseCase

```typescript
export class ListBankAccountsUseCase {
  constructor(private repository: BankAccountRepository) {}
  
  async execute(filters?: { isActive?: boolean }): Promise<BankAccountWithBalance[]> {
    return this.repository.listWithBalances(filters)
  }
}
```

#### GetAccountStatementUseCase

```typescript
export class GetAccountStatementUseCase {
  constructor(private repository: BankAccountRepository) {}
  
  async execute(accountId: string, filters?: {
    startDate?: Date
    endDate?: Date
  }): Promise<AccountStatement> {
    return this.repository.getStatement(accountId, filters)
  }
}
```

### Updated Cash Movement Components

#### Updated CashMovement Domain Model

```typescript
export interface CashMovement {
  id: string
  tenantId: string
  bankAccountId: string  // NEW: Required field
  type: 'IN' | 'OUT'
  amount: number
  method: 'CASH' | 'PIX' | 'CARD' | 'TRANSFER' | 'WALLET'
  sourceType: 'SALE' | 'REFUND' | 'PURCHASE' | 'MANUAL' | 'CREDIT'
  sourceId?: string | null
  description?: string
  occurredAt: Date
  createdBy?: string
  createdAt: Date
}
```

#### Updated CashMovementRepository Interface

```typescript
export interface CashMovementRepository {
  create(movement: Omit<CashMovement, 'id' | 'createdAt' | 'tenantId'>): Promise<CashMovement>
  
  list(filters?: {
    startDate?: Date
    endDate?: Date
    type?: 'IN' | 'OUT'
    method?: string
    bankAccountId?: string  // NEW: Filter by account
  }): Promise<CashMovement[]>
  
  getSummary(filters?: {
    startDate?: Date
    endDate?: Date
    bankAccountId?: string  // NEW: Filter by account
  }): Promise<{ totalIn: number; totalOut: number; balance: number }>
}
```

## Data Models

### Database Schema

#### New Table: bank_accounts

```sql
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('BANK', 'CARD', 'WALLET')),
  initial_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices for performance
CREATE INDEX idx_bank_accounts_tenant ON bank_accounts(tenant_id);
CREATE INDEX idx_bank_accounts_tenant_active ON bank_accounts(tenant_id, is_active);

-- RLS policies
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bank_accounts_all" ON bank_accounts
  FOR ALL
  USING (tenant_id = auth.tenant_id())
  WITH CHECK (tenant_id = auth.tenant_id());

-- Grants
GRANT ALL ON bank_accounts TO authenticated;
GRANT ALL ON bank_accounts TO service_role;

-- Trigger for updated_at
CREATE TRIGGER trigger_updated_at 
  BEFORE UPDATE ON bank_accounts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();
```

#### Updated Table: cash_movements

```sql
-- Add bank_account_id column
ALTER TABLE cash_movements 
ADD COLUMN bank_account_id UUID REFERENCES bank_accounts(id);

-- Create index for performance
CREATE INDEX idx_cash_movements_bank_account ON cash_movements(bank_account_id, occurred_at DESC);

-- After migration, make it required
ALTER TABLE cash_movements 
ALTER COLUMN bank_account_id SET NOT NULL;
```

### Migration Strategy

#### Step 1: Create bank_accounts table

Create the new table with all indices and RLS policies.

#### Step 2: Add nullable bank_account_id to cash_movements

Add the column as nullable initially to allow existing data to remain valid.

#### Step 3: Create default accounts

For each tenant, create a default account named "Caixa Geral":

```sql
INSERT INTO bank_accounts (tenant_id, name, type, initial_balance, is_active)
SELECT 
  id as tenant_id,
  'Caixa Geral' as name,
  'BANK' as type,
  0 as initial_balance,
  true as is_active
FROM tenants;
```

#### Step 4: Link existing movements to default account

```sql
UPDATE cash_movements cm
SET bank_account_id = ba.id
FROM bank_accounts ba
WHERE cm.tenant_id = ba.tenant_id
  AND ba.name = 'Caixa Geral'
  AND cm.bank_account_id IS NULL;
```

#### Step 5: Make bank_account_id required

```sql
ALTER TABLE cash_movements 
ALTER COLUMN bank_account_id SET NOT NULL;
```

### Updated Database Functions

#### Updated pay_sale RPC

```sql
CREATE OR REPLACE FUNCTION pay_sale(
    p_sale_id UUID,
    p_payments JSONB,
    p_bank_account_id UUID,  -- NEW: Required parameter
    p_stock_items JSONB DEFAULT '[]'::JSONB,
    p_credit_debit JSONB DEFAULT NULL,
    p_change_amount NUMERIC DEFAULT 0
)
RETURNS VOID AS $$
DECLARE
    v_payment JSONB;
    v_item JSONB;
    v_sale RECORD;
    v_tenant_id UUID;
    v_method TEXT;
    v_amount NUMERIC;
BEGIN
    -- Validate bank account exists and is active
    IF NOT EXISTS (
        SELECT 1 FROM bank_accounts 
        WHERE id = p_bank_account_id 
        AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Invalid or inactive bank account';
    END IF;

    -- ... existing sale logic ...

    -- Insert cash movements with bank_account_id
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments) LOOP
        v_method := (v_payment->>'method')::TEXT;
        v_amount := (v_payment->>'amount')::NUMERIC;

        -- ... existing payment logic ...

        IF LOWER(v_method) IN ('cash', 'pix', 'card', 'transfer', 'wallet') THEN
            INSERT INTO cash_movements (
                tenant_id,
                bank_account_id,  -- NEW
                type,
                amount,
                method,
                source_type,
                source_id,
                description,
                occurred_at,
                created_by
            )
            VALUES (
                v_tenant_id,
                p_bank_account_id,  -- NEW
                'IN',
                v_amount,
                UPPER(v_method),
                'SALE',
                p_sale_id,
                'Venda #' || substring(p_sale_id::text, 1, 8),
                now(),
                auth.uid()
            );
        END IF;
    END LOOP;

    -- ... rest of existing logic ...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Similar updates needed for:
- `create_purchase_with_movements` function
- `add_client_credit` function
- `refund_sale` function

### UI Components

#### AccountSelector Component

```typescript
interface AccountSelectorProps {
  value: string | null
  onChange: (accountId: string) => void
  disabled?: boolean
}

export function AccountSelector({ value, onChange, disabled }: AccountSelectorProps) {
  const [accounts, setAccounts] = useState<BankAccountWithBalance[]>([])
  
  useEffect(() => {
    // Load active accounts with balances
    loadAccounts()
  }, [])
  
  return (
    <Select value={value || ''} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione a conta" />
      </SelectTrigger>
      <SelectContent>
        {accounts.map(account => (
          <SelectItem key={account.id} value={account.id}>
            {account.name} - {formatCurrency(account.currentBalance)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

#### BankAccountsList Component

Displays all accounts with current balances, sorted by active status then name.

#### AccountStatementView Component

Shows detailed statement for a single account with date filtering.

### Currency Formatting

All currency values must use Brazilian format:

```typescript
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Account Creation Round Trip

*For any* valid account data (name, type, initial balance), creating an account and then retrieving it should return an account with the same name, type, and initial balance.

**Validates: Requirements 1.1**

### Property 2: Valid Account Types

*For any* account creation attempt, the system should accept only 'BANK', 'CARD', or 'WALLET' as valid types, and reject all other type values.

**Validates: Requirements 1.2, 14.2**

### Property 3: Account Name Validation

*For any* account creation or update attempt, the system should reject names that are empty, contain only whitespace, or exceed 100 characters, and accept names between 1 and 100 characters.

**Validates: Requirements 1.3, 14.1**

### Property 4: Default Initial Balance

*For any* account created without specifying an initial balance, the account should have an initial balance of zero.

**Validates: Requirements 1.4**

### Property 5: Tenant Association

*For any* account created, the account should be automatically associated with the current tenant ID.

**Validates: Requirements 1.5, 12.3**

### Property 6: Account Update Preserves Initial Balance

*For any* account, updating the account name or type should not modify the initial balance value.

**Validates: Requirements 2.2**

### Property 7: Soft Delete Preserves Data

*For any* account, deactivating it should mark it as inactive but the account should still exist and be retrievable with all its original data.

**Validates: Requirements 2.3**

### Property 8: List Includes All Statuses

*For any* tenant with both active and inactive accounts, listing all accounts should return both active and inactive accounts.

**Validates: Requirements 2.4**

### Property 9: Deletion Prevention with Movements

*For any* account that has associated cash movements, attempting to delete the account should be prevented or rejected.

**Validates: Requirements 2.5, 14.5**

### Property 10: Balance Calculation Correctness

*For any* account with associated cash movements, the current balance should equal the initial balance plus the sum of all IN movements minus the sum of all OUT movements.

**Validates: Requirements 3.1, 3.4, 3.2**

### Property 11: Movement Requires Valid Account

*For any* cash movement creation attempt, the system should require a bank account ID and reject movements with missing, non-existent, or inactive account IDs.

**Validates: Requirements 4.1, 4.2, 4.3, 14.3, 14.4**

### Property 12: Movement Stores Account Reference

*For any* cash movement created with a bank account ID, retrieving that movement should return the same bank account ID.

**Validates: Requirements 4.4**

### Property 13: Movement Display Includes Account

*For any* cash movement, displaying it should include the associated account name.

**Validates: Requirements 4.5**

### Property 14: Payment Operations Require Account Selection

*For any* payment operation (sale, purchase, credit recharge, manual movement), attempting to complete the operation without selecting a bank account should be rejected.

**Validates: Requirements 6.2, 7.2, 8.2, 9.2**

### Property 15: Payment Creates Movement with Account Link

*For any* completed payment operation (sale, purchase, credit recharge, manual movement), a cash movement should be created that is linked to the selected bank account.

**Validates: Requirements 6.3, 7.3, 8.3, 9.3**

### Property 16: Multiple Payments Allow Different Accounts

*For any* sale with multiple payment methods, each payment should be able to specify a different bank account, and each resulting cash movement should be linked to its respective account.

**Validates: Requirements 6.4**

### Property 17: Statement Contains All Account Movements

*For any* account, retrieving its statement should return all cash movements that are linked to that account and no movements from other accounts.

**Validates: Requirements 10.1**

### Property 18: Statement Chronological Ordering

*For any* account statement, the movements should be ordered by date with the most recent movement first.

**Validates: Requirements 10.2**

### Property 19: Statement Movement Completeness

*For any* movement in an account statement, it should include date, description, type (IN/OUT), amount, and balance after transaction.

**Validates: Requirements 10.3**

### Property 20: Statement Summary Correctness

*For any* account statement, the summary should show initial balance, total IN (sum of all IN movements), total OUT (sum of all OUT movements), and current balance (initial + total IN - total OUT).

**Validates: Requirements 10.4**

### Property 21: Statement Date Filtering

*For any* account statement with date filters applied, only movements within the specified date range should be included, and the summary should be recalculated based on those filtered movements.

**Validates: Requirements 10.5**

### Property 22: Account List Completeness

*For any* account in the list, it should display name, type, current balance, and active status.

**Validates: Requirements 11.2**

### Property 23: Currency Formatting

*For any* currency value displayed, it should be formatted using Brazilian format (R$ with thousands separator as dot and decimal separator as comma).

**Validates: Requirements 11.3**

### Property 24: Account List Sorting

*For any* list of accounts, active accounts should appear before inactive accounts, and within each group, accounts should be sorted alphabetically by name.

**Validates: Requirements 11.4**

### Property 25: RPC Functions Reject Missing Account ID

*For any* call to pay_sale, create_purchase_with_movements, or add_client_credit functions without a bank_account_id parameter, the function should return a validation error.

**Validates: Requirements 13.4**

## Error Handling

### Validation Errors

The system should provide clear, actionable error messages for validation failures:

- **Empty account name**: "Account name cannot be empty"
- **Name too long**: "Account name cannot exceed 100 characters"
- **Invalid account type**: "Invalid account type. Must be BANK, CARD, or WALLET"
- **Missing account ID**: "Bank account selection is required"
- **Non-existent account**: "Selected bank account does not exist"
- **Inactive account**: "Cannot create movements for inactive account"
- **Account has movements**: "Cannot delete account with existing movements. Deactivate instead."

### Database Errors

Database-level errors should be caught and translated to user-friendly messages:

- **Foreign key violation**: "Invalid account reference"
- **Unique constraint violation**: "An account with this name already exists"
- **RLS policy violation**: "Access denied to this account"

### Transaction Handling

All operations that modify multiple tables (e.g., creating movements with account updates) should be wrapped in database transactions to ensure data consistency. If any part of the operation fails, all changes should be rolled back.

## Testing Strategy

### Dual Testing Approach

The system will use both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of account creation, update, and deactivation
- Edge cases like empty names, maximum length names, boundary values
- Error conditions and validation failures
- Integration between components (repository, use cases, UI)
- Migration scripts and data transformation

**Property-Based Tests** focus on:
- Universal properties that hold across all inputs
- Balance calculation correctness across random movements
- Validation rules across random invalid inputs
- Data integrity across random operations
- Round-trip properties (create → retrieve, serialize → deserialize)

### Property-Based Testing Configuration

**Library**: Use `fast-check` for TypeScript property-based testing

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: bank-accounts, Property {number}: {property_text}`
- Generators for: accounts, movements, dates, currency amounts, tenant IDs

**Example Property Test Structure**:

```typescript
import fc from 'fast-check'

// Feature: bank-accounts, Property 10: Balance Calculation Correctness
test('account balance equals initial balance plus IN minus OUT movements', () => {
  fc.assert(
    fc.property(
      fc.record({
        initialBalance: fc.float({ min: 0, max: 100000 }),
        movements: fc.array(fc.record({
          type: fc.constantFrom('IN', 'OUT'),
          amount: fc.float({ min: 0.01, max: 10000 })
        }))
      }),
      ({ initialBalance, movements }) => {
        // Create account with initial balance
        const account = createAccount({ initialBalance })
        
        // Create movements
        movements.forEach(m => createMovement(account.id, m))
        
        // Calculate expected balance
        const totalIn = movements
          .filter(m => m.type === 'IN')
          .reduce((sum, m) => sum + m.amount, 0)
        const totalOut = movements
          .filter(m => m.type === 'OUT')
          .reduce((sum, m) => sum + m.amount, 0)
        const expectedBalance = initialBalance + totalIn - totalOut
        
        // Verify
        const actualBalance = getAccountBalance(account.id)
        expect(actualBalance).toBeCloseTo(expectedBalance, 2)
      }
    ),
    { numRuns: 100 }
  )
})
```

### Test Coverage Goals

- **Unit test coverage**: Minimum 80% code coverage
- **Property test coverage**: All 25 correctness properties implemented
- **Integration test coverage**: All UI flows (create account, view statement, select account in payment)
- **Migration test coverage**: Verify default account creation and movement linking

### Testing Phases

1. **Unit Testing**: Test individual components in isolation
2. **Property Testing**: Verify universal properties across random inputs
3. **Integration Testing**: Test component interactions and UI flows
4. **Migration Testing**: Verify data migration scripts on test data
5. **Manual Testing**: User acceptance testing of UI and workflows
