# Requirements Document

## Introduction

This document specifies the requirements for a Bank Accounts Management System (Sistema de Contas Bancárias) for the salon management system (sistema_lala). The system will track financial accounts where money is received and from where payments are made, integrating with sales, purchases, client credit recharges, and manual cash movements.

## Glossary

- **Bank_Account_System**: The bank accounts management subsystem
- **Cash_Movement_System**: The existing cash movements tracking subsystem
- **Account**: A financial account (bank, card, or digital wallet)
- **Tenant**: A salon business using the system (multi-tenant architecture)
- **Statement**: A list of all movements for a specific account showing balance changes
- **Initial_Balance**: The starting balance when an account is created
- **Current_Balance**: The calculated balance based on initial balance plus all movements

## Requirements

### Requirement 1: Bank Account Registration

**User Story:** As a user, I want to register bank accounts, so that I can track where my money is stored and moved.

#### Acceptance Criteria

1. WHEN a user creates a new account, THE Bank_Account_System SHALL store the account name, type, and initial balance
2. THE Bank_Account_System SHALL support three account types: Bank (Banco), Card (Cartão), and Wallet (Carteira Digital)
3. WHEN creating an account, THE Bank_Account_System SHALL require a name between 1 and 100 characters
4. WHEN creating an account, THE Bank_Account_System SHALL default the initial balance to zero if not provided
5. THE Bank_Account_System SHALL associate each account with the current tenant
6. WHEN listing accounts, THE Bank_Account_System SHALL display only accounts belonging to the current tenant

### Requirement 2: Bank Account Modification

**User Story:** As a user, I want to update bank account information, so that I can correct errors or reflect changes in my financial setup.

#### Acceptance Criteria

1. WHEN a user updates an account, THE Bank_Account_System SHALL allow modification of the account name and type
2. THE Bank_Account_System SHALL prevent modification of the initial balance after account creation
3. WHEN a user deactivates an account, THE Bank_Account_System SHALL mark it as inactive without deleting historical data
4. WHEN listing accounts, THE Bank_Account_System SHALL display both active and inactive accounts with clear status indicators
5. THE Bank_Account_System SHALL prevent deletion of accounts that have associated cash movements

### Requirement 3: Account Balance Calculation

**User Story:** As a user, I want to see the current balance of each account, so that I know how much money is available in each location.

#### Acceptance Criteria

1. THE Bank_Account_System SHALL calculate current balance as initial balance plus sum of all associated movements
2. WHEN displaying an account, THE Bank_Account_System SHALL show the calculated current balance
3. WHEN a cash movement is created, THE Bank_Account_System SHALL reflect the balance change immediately
4. FOR ALL accounts, THE Bank_Account_System SHALL calculate balance using movements where type is IN as positive and type is OUT as negative

### Requirement 4: Cash Movement Integration

**User Story:** As a user, I want every cash movement linked to a bank account, so that I can track which account was affected by each transaction.

#### Acceptance Criteria

1. WHEN creating a new cash movement, THE Cash_Movement_System SHALL require a valid bank account ID
2. THE Cash_Movement_System SHALL reject movements with bank account IDs that do not exist
3. THE Cash_Movement_System SHALL reject movements linked to inactive accounts
4. WHEN a cash movement is created, THE Cash_Movement_System SHALL store the bank account ID with the movement record
5. WHEN displaying cash movements, THE Cash_Movement_System SHALL show the associated account name

### Requirement 5: Data Migration for Existing Movements

**User Story:** As a system administrator, I want existing cash movements to be linked to a default account, so that historical data remains consistent with the new account structure.

#### Acceptance Criteria

1. WHEN the system is upgraded, THE Bank_Account_System SHALL create a default account named "Caixa Geral" for each tenant
2. THE Bank_Account_System SHALL set the default account initial balance to zero
3. WHEN the migration runs, THE Cash_Movement_System SHALL link all existing movements without a bank account to the default account
4. THE Bank_Account_System SHALL calculate the default account balance from all migrated movements

### Requirement 6: Account Selection in Sales Checkout

**User Story:** As a user, I want to select which account receives payment when processing a sale, so that money is tracked in the correct location.

#### Acceptance Criteria

1. WHEN processing a sale payment, THE Cash_Movement_System SHALL display a list of active accounts for selection
2. THE Cash_Movement_System SHALL require account selection before completing the payment
3. WHEN a payment is completed, THE Cash_Movement_System SHALL create a cash movement linked to the selected account
4. WHERE multiple payment methods are used, THE Cash_Movement_System SHALL allow different account selection for each payment

### Requirement 7: Account Selection in Purchase Payments

**User Story:** As a user, I want to select which account is used when paying suppliers, so that I can track where the money came from.

#### Acceptance Criteria

1. WHEN recording a purchase payment, THE Cash_Movement_System SHALL display a list of active accounts for selection
2. THE Cash_Movement_System SHALL require account selection before completing the payment
3. WHEN a purchase payment is recorded, THE Cash_Movement_System SHALL create a cash movement linked to the selected account

### Requirement 8: Account Selection in Client Credit Recharges

**User Story:** As a user, I want to select which account receives money when a client recharges credit, so that I can track the deposit location.

#### Acceptance Criteria

1. WHEN processing a client credit recharge, THE Cash_Movement_System SHALL display a list of active accounts for selection
2. THE Cash_Movement_System SHALL require account selection before completing the recharge
3. WHEN a credit recharge is completed, THE Cash_Movement_System SHALL create a cash movement linked to the selected account

### Requirement 9: Account Selection in Manual Cash Movements

**User Story:** As a user, I want to select which account is affected when creating manual cash movements, so that I can track expenses and transfers correctly.

#### Acceptance Criteria

1. WHEN creating a manual cash movement, THE Cash_Movement_System SHALL display a list of active accounts for selection
2. THE Cash_Movement_System SHALL require account selection before creating the movement
3. WHEN a manual movement is created, THE Cash_Movement_System SHALL link it to the selected account

### Requirement 10: Account Statement View

**User Story:** As a user, I want to view a statement for each account, so that I can see all transactions and balance changes over time.

#### Acceptance Criteria

1. WHEN viewing an account statement, THE Bank_Account_System SHALL display all cash movements linked to that account
2. THE Bank_Account_System SHALL display movements in chronological order with most recent first
3. FOR ALL movements in the statement, THE Bank_Account_System SHALL show date, description, type (IN/OUT), amount, and balance after transaction
4. WHEN displaying a statement, THE Bank_Account_System SHALL show a summary with initial balance, total IN, total OUT, and current balance
5. WHEN a user filters by date period, THE Bank_Account_System SHALL display only movements within the selected period and recalculate the summary

### Requirement 11: Account List Display

**User Story:** As a user, I want to see a list of all my bank accounts with their current balances, so that I can quickly understand my financial position.

#### Acceptance Criteria

1. THE Bank_Account_System SHALL display all accounts for the current tenant
2. FOR ALL accounts in the list, THE Bank_Account_System SHALL show name, type, current balance, and active status
3. THE Bank_Account_System SHALL format currency values using Brazilian format (R$ 1.234,56)
4. WHEN displaying the account list, THE Bank_Account_System SHALL sort accounts with active accounts first, then by name

### Requirement 12: Multi-Tenant Data Isolation

**User Story:** As a system architect, I want bank accounts isolated by tenant, so that each salon only sees their own financial data.

#### Acceptance Criteria

1. THE Bank_Account_System SHALL filter all account queries by the current tenant ID
2. THE Bank_Account_System SHALL prevent users from accessing accounts belonging to other tenants
3. WHEN creating an account, THE Bank_Account_System SHALL automatically assign the current tenant ID
4. THE Bank_Account_System SHALL enforce tenant isolation at the database level using row-level security

### Requirement 13: Database Function Updates

**User Story:** As a developer, I want existing database functions updated to accept bank account IDs, so that the integration is seamless.

#### Acceptance Criteria

1. THE Cash_Movement_System SHALL update the pay_sale RPC function to accept and require a bank_account_id parameter
2. THE Cash_Movement_System SHALL update the create_purchase_with_movements function to accept and require a bank_account_id parameter
3. THE Cash_Movement_System SHALL update the add_client_credit function to accept and require a bank_account_id parameter
4. WHEN these functions are called without a bank_account_id, THE Cash_Movement_System SHALL return a validation error

### Requirement 14: Account Validation Rules

**User Story:** As a user, I want the system to prevent invalid operations, so that my financial data remains accurate.

#### Acceptance Criteria

1. THE Bank_Account_System SHALL reject account creation with empty or whitespace-only names
2. THE Bank_Account_System SHALL reject account creation with invalid account types
3. THE Bank_Account_System SHALL reject cash movements linked to non-existent accounts
4. THE Bank_Account_System SHALL reject cash movements linked to inactive accounts
5. THE Bank_Account_System SHALL prevent account deletion when movements exist for that account
