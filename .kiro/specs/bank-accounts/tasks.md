# Implementation Plan: Bank Accounts Management System

## Overview

This implementation plan breaks down the Bank Accounts Management System into discrete, incremental tasks. Each task builds on previous work, with testing integrated throughout to catch errors early. The implementation follows the repository pattern with use cases, integrating with the existing Supabase-based architecture.

## Tasks

- [ ] 1. Database schema and migration setup
  - [ ] 1.1 Create bank_accounts table migration
    - Create migration file with bank_accounts table definition
    - Include all columns: id, tenant_id, name, type, initial_balance, is_active, created_at, updated_at
    - Add CHECK constraints for type validation
    - Create indices for tenant_id and tenant_id + is_active
    - Set up RLS policies for tenant isolation
    - Add trigger for updated_at timestamp
    - _Requirements: 1.1, 1.2, 1.5, 12.4_
  
  - [ ] 1.2 Add bank_account_id column to cash_movements
    - Create migration to add nullable bank_account_id column
    - Add foreign key constraint to bank_accounts table
    - Create index on bank_account_id + occurred_at
    - _Requirements: 4.1, 4.4_
  
  - [ ] 1.3 Create default account migration
    - Create migration to insert "Caixa Geral" account for each tenant
    - Set initial_balance to 0 and is_active to true
    - Update existing cash_movements to link to default account
    - Make bank_account_id NOT NULL after linking
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 2. Domain models and types
  - [ ] 2.1 Create BankAccount domain model
    - Create src/core/domain/BankAccount.ts
    - Define BankAccount interface with all fields
    - Define BankAccountWithBalance interface
    - Define AccountMovement and AccountStatement interfaces
    - Export all types
    - _Requirements: 1.1, 1.2, 3.2, 10.3_
  
  - [ ] 2.2 Update CashMovement domain model
    - Update src/core/domain/CashMovement.ts
    - Add bankAccountId field (required)
    - Update type definitions
    - _Requirements: 4.1, 4.4_

- [ ] 3. Repository interface and implementation
  - [ ] 3.1 Create BankAccountRepository interface
    - Create src/core/repositories/BankAccountRepository.ts
    - Define all repository methods: create, update, deactivate, activate, getById, list, listWithBalances, getStatement, hasMovements
    - Add TypeScript types for all parameters and return values
    - _Requirements: 1.1, 2.1, 2.3, 3.2, 10.1_
  
  - [ ] 3.2 Implement SupabaseBankAccountRepository
    - Create src/infrastructure/repositories/supabase/SupabaseBankAccountRepository.ts
    - Implement create method with tenant_id injection
    - Implement update method (name and type only)
    - Implement deactivate and activate methods
    - Implement getById method
    - Implement list method with optional isActive filter
    - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 12.3_
  
  - [ ] 3.3 Implement balance calculation methods
    - Implement listWithBalances method with balance calculation query
    - Implement getStatement method with movements join
    - Calculate balance after each transaction for statement
    - Implement summary calculation (initial, totalIn, totalOut, current)
    - Add date filtering support for getStatement
    - _Requirements: 3.1, 3.4, 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ] 3.4 Implement hasMovements validation method
    - Query cash_movements table for account_id
    - Return boolean indicating if movements exist
    - _Requirements: 2.5_
  
  - [ ]* 3.5 Write property test for balance calculation
    - **Property 10: Balance Calculation Correctness**
    - **Validates: Requirements 3.1, 3.4, 3.2**
  
  - [ ]* 3.6 Write property test for account creation round trip
    - **Property 1: Account Creation Round Trip**
    - **Validates: Requirements 1.1**

- [ ] 4. Use cases implementation
  - [ ] 4.1 Implement CreateBankAccountUseCase
    - Create src/core/usecases/CreateBankAccountUseCase.ts
    - Validate name (not empty, not whitespace-only, max 100 chars)
    - Validate type (BANK, CARD, or WALLET)
    - Default initial balance to 0 if not provided
    - Call repository.create
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 14.1, 14.2_
  
  - [ ]* 4.2 Write property tests for CreateBankAccountUseCase
    - **Property 2: Valid Account Types**
    - **Property 3: Account Name Validation**
    - **Property 4: Default Initial Balance**
    - **Validates: Requirements 1.2, 1.3, 1.4, 14.1, 14.2**
  
  - [ ] 4.3 Implement UpdateBankAccountUseCase
    - Create src/core/usecases/UpdateBankAccountUseCase.ts
    - Validate name if provided (not empty, not whitespace-only, max 100 chars)
    - Validate type if provided
    - Call repository.update (only name and type)
    - _Requirements: 2.1, 2.2_
  
  - [ ]* 4.4 Write property test for update preserving initial balance
    - **Property 6: Account Update Preserves Initial Balance**
    - **Validates: Requirements 2.2**
  
  - [ ] 4.5 Implement DeactivateBankAccountUseCase
    - Create src/core/usecases/DeactivateBankAccountUseCase.ts
    - Check if account exists
    - Call repository.deactivate
    - _Requirements: 2.3_
  
  - [ ]* 4.6 Write property test for soft delete
    - **Property 7: Soft Delete Preserves Data**
    - **Validates: Requirements 2.3**
  
  - [ ] 4.7 Implement ListBankAccountsUseCase
    - Create src/core/usecases/ListBankAccountsUseCase.ts
    - Call repository.listWithBalances
    - Support optional isActive filter
    - _Requirements: 2.4, 3.2, 11.2_
  
  - [ ]* 4.8 Write property test for list includes all statuses
    - **Property 8: List Includes All Statuses**
    - **Validates: Requirements 2.4**
  
  - [ ] 4.9 Implement GetAccountStatementUseCase
    - Create src/core/usecases/GetAccountStatementUseCase.ts
    - Call repository.getStatement
    - Support date filtering
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 4.10 Write property tests for statement functionality
    - **Property 17: Statement Contains All Account Movements**
    - **Property 18: Statement Chronological Ordering**
    - **Property 20: Statement Summary Correctness**
    - **Property 21: Statement Date Filtering**
    - **Validates: Requirements 10.1, 10.2, 10.4, 10.5**

- [ ] 5. Update cash movement system
  - [ ] 5.1 Update CashMovementRepository interface
    - Update src/core/repositories/CashMovementRepository.ts
    - Add bankAccountId parameter to create method (required)
    - Add bankAccountId filter to list method
    - Add bankAccountId filter to getSummary method
    - _Requirements: 4.1, 4.4_
  
  - [ ] 5.2 Update SupabaseCashMovementRepository implementation
    - Update src/infrastructure/repositories/supabase/SupabaseCashMovementRepository.ts
    - Update create method to require and store bankAccountId
    - Add validation for bankAccountId (exists and is active)
    - Update list method to support bankAccountId filter
    - Update getSummary method to support bankAccountId filter
    - Update mapFromDb to include bankAccountId
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 5.3 Write property tests for movement validation
    - **Property 11: Movement Requires Valid Account**
    - **Property 12: Movement Stores Account Reference**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 14.3, 14.4**

- [ ] 6. Update database RPC functions
  - [ ] 6.1 Update pay_sale function
    - Update supabase migration for pay_sale RPC
    - Add p_bank_account_id UUID parameter (required)
    - Validate bank account exists and is active
    - Pass bank_account_id when inserting cash_movements
    - _Requirements: 13.1, 13.4_
  
  - [ ] 6.2 Update create_purchase_with_movements function
    - Update supabase migration for create_purchase_with_movements RPC
    - Add p_bank_account_id UUID parameter (required)
    - Validate bank account exists and is active
    - Pass bank_account_id when inserting cash_movements
    - _Requirements: 13.2, 13.4_
  
  - [ ] 6.3 Update add_client_credit function
    - Update supabase migration for add_client_credit RPC
    - Add p_bank_account_id UUID parameter (required)
    - Validate bank account exists and is active
    - Pass bank_account_id when inserting cash_movements
    - _Requirements: 13.3, 13.4_
  
  - [ ]* 6.4 Write unit tests for RPC parameter validation
    - Test calling each RPC without bank_account_id parameter
    - Verify validation error is returned
    - **Property 25: RPC Functions Reject Missing Account ID**
    - **Validates: Requirements 13.4**

- [ ] 7. Checkpoint - Ensure backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. UI components - Account selector
  - [ ] 8.1 Create AccountSelector component
    - Create src/components/bank-accounts/AccountSelector.tsx
    - Use shadcn/ui Select component
    - Load active accounts with balances
    - Display account name and current balance
    - Format currency using Brazilian format (R$ 1.234,56)
    - Handle loading and error states
    - _Requirements: 6.1, 11.3_
  
  - [ ]* 8.2 Write unit tests for AccountSelector
    - Test rendering with accounts
    - Test selection handling
    - Test currency formatting
    - Test loading and error states

- [ ] 9. UI components - Account list and management
  - [ ] 9.1 Create BankAccountsList component
    - Create src/components/bank-accounts/BankAccountsList.tsx
    - Display table with columns: name, type, current balance, status
    - Format currency using Brazilian format
    - Sort by active status first, then by name
    - Add actions: edit, deactivate/activate
    - Use glassmorphism design from existing components
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [ ] 9.2 Create BankAccountDialog component
    - Create src/components/bank-accounts/BankAccountDialog.tsx
    - Form for create/edit with fields: name, type, initial balance (create only)
    - Use react-hook-form for validation
    - Validate name length and required fields
    - Display validation errors
    - _Requirements: 1.1, 1.2, 1.3, 2.1_
  
  - [ ]* 9.3 Write unit tests for account list and dialog
    - Test list rendering and sorting
    - Test dialog validation
    - Test create and update flows

- [ ] 10. UI components - Account statement
  - [ ] 10.1 Create AccountStatementView component
    - Create src/components/bank-accounts/AccountStatementView.tsx
    - Display account details at top
    - Add date range filter (start date, end date)
    - Display movements table with columns: date, description, type, amount, balance after
    - Format dates and currency using Brazilian format
    - Display summary card: initial balance, total IN, total OUT, current balance
    - Use glassmorphism design
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 10.2 Add charts to AccountStatementView (OPTIONAL)
    - Add balance evolution line chart (saldo ao longo do tempo)
    - Add IN vs OUT bar chart by period (entradas vs saídas)
    - Add movement type distribution pie chart (tipos de movimentação)
    - Use recharts library (already installed for cash-improvements)
    - Charts respect date filter
    - Responsive design
    - _Enhancement: Visual analytics for account performance_
  
  - [ ]* 10.3 Write unit tests for statement view
    - Test rendering with movements
    - Test date filtering
    - Test summary calculation display
    - Test chart rendering (if implemented)

- [ ] 11. Pages - Bank accounts management
  - [ ] 11.1 Create bank accounts list page
    - Create src/app/(app)/contas/page.tsx
    - Use BankAccountsList component
    - Add "New Account" button to open dialog
    - Handle create, update, deactivate actions
    - Show success/error toasts
    - _Requirements: 1.1, 2.1, 2.3, 11.1_
  
  - [ ] 11.2 Create account detail/statement page
    - Create src/app/(app)/contas/[id]/page.tsx
    - Use AccountStatementView component
    - Load account data and statement
    - Handle loading and error states
    - Add back button to list
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 12. Update payment flows - Sales checkout
  - [ ] 12.1 Update PaymentDialog component
    - Update src/components/sales/PaymentDialog.tsx (or equivalent)
    - Add AccountSelector for each payment method
    - Make account selection required
    - Pass bank_account_id to pay_sale RPC
    - Handle validation errors
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 12.2 Write integration tests for checkout with account selection
    - Test payment flow with account selection
    - Test validation when account not selected
    - **Property 14: Payment Operations Require Account Selection**
    - **Property 15: Payment Creates Movement with Account Link**
    - **Validates: Requirements 6.2, 6.3**

- [ ] 13. Update payment flows - Purchases
  - [ ] 13.1 Update purchase payment form
    - Update purchase payment component
    - Add AccountSelector for payment
    - Make account selection required
    - Pass bank_account_id to create_purchase_with_movements RPC
    - Handle validation errors
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ]* 13.2 Write integration tests for purchase payment with account
    - Test purchase payment flow with account selection
    - Test validation when account not selected

- [ ] 14. Update payment flows - Client credit recharge
  - [ ] 14.1 Update credit recharge dialog
    - Update client credit recharge component
    - Add AccountSelector for recharge
    - Make account selection required
    - Pass bank_account_id to add_client_credit RPC
    - Handle validation errors
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ]* 14.2 Write integration tests for credit recharge with account
    - Test credit recharge flow with account selection
    - Test validation when account not selected

- [ ] 15. Update payment flows - Manual cash movements
  - [ ] 15.1 Update manual cash movement dialog
    - Update manual cash movement component
    - Add AccountSelector for movement
    - Make account selection required
    - Pass bank_account_id when creating movement
    - Handle validation errors
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ]* 15.2 Write integration tests for manual movements with account
    - Test manual movement flow with account selection
    - Test validation when account not selected

- [ ] 16. Update cash movements display
  - [ ] 16.1 Update cash movements list to show account
    - Update cash movements table component
    - Add "Account" column showing account name
    - Add filter by account dropdown
    - Update queries to include account data
    - _Requirements: 4.5_
  
  - [ ] 16.2 Update cash summary to support account filtering
    - Update cash summary component
    - Add account filter dropdown
    - Update getSummary call with bankAccountId filter
    - Display filtered summary
  
  - [ ]* 16.3 Add financial analytics to client profile page (OPTIONAL)
    - Update src/app/(app)/clients/[id]/page.tsx or create new tab
    - Add "Analytics" or enhance "Visão Geral" tab
    - Add spending over time line chart (gastos ao longo do tempo)
    - Add most consumed services bar chart (serviços mais consumidos)
    - Add spending distribution pie chart (serviços vs produtos)
    - Add credit balance evolution chart (evolução do saldo de crédito)
    - Use recharts library
    - All charts respect client data only
    - _Enhancement: Visual analytics for client spending patterns_
  
  - [ ]* 16.4 Add financial analytics to supplier profile page (OPTIONAL)
    - Update src/app/(app)/suppliers/[id]/page.tsx
    - Add purchases over time line chart (compras ao longo do tempo)
    - Add most purchased products bar chart (produtos mais comprados)
    - Add total spending evolution chart (evolução do gasto total)
    - Use recharts library
    - All charts respect supplier data only
    - _Enhancement: Visual analytics for supplier relationship_

- [ ] 17. Navigation and routing
  - [ ] 17.1 Add bank accounts to navigation menu
    - Update navigation component
    - Add "Contas" menu item linking to /contas
    - Use appropriate icon (e.g., Wallet or Building)
    - Position appropriately in menu structure

- [ ] 18. Final checkpoint - Integration testing
  - [ ] 18.1 Test complete user flows
    - Create new bank account
    - Process sale with account selection
    - Record purchase with account selection
    - Add client credit with account selection
    - Create manual movement with account selection
    - View account statement
    - Filter cash movements by account
    - Deactivate account
    - Verify inactive account cannot receive new movements
  
  - [ ] 18.2 Test migration with existing data
    - Run migrations on test database with existing cash movements
    - Verify default "Caixa Geral" account created
    - Verify all existing movements linked to default account
    - Verify balance calculations are correct
  
  - [ ] 18.3 Ensure all tests pass
    - Run all unit tests
    - Run all property-based tests
    - Run all integration tests
    - Verify test coverage meets goals (80% code coverage)
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties across random inputs
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end user flows
- Migration testing ensures data integrity during upgrade
