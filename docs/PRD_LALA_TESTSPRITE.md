# Product Requirements Document (PRD) - Lala System

**Version:** 2.2
**Date:** 2026-02-12
**Status:** In Development - Financial System Overhaul

## 1. Product Overview
Lala System is a production-ready SaaS management platform for beauty salons, designed to streamline operations including scheduling, client management, inventory control, and financial transactions. Built with Next.js 15, TypeScript, and Supabase backend.

**Core Value Proposition:**
- **Efficiency:** Unified interface for scheduling, sales, and financial management with 5 calendar views and drag & drop support.
- **Control:** Strict inventory tracking via movement history, automatic stock updates, and comprehensive cash ledger.
- **Security:** Multi-tenant architecture with Row Level Security (RLS) ensuring complete data isolation between salons.
- **Flexibility:** Split payments, credit system, debt tracking (Fiado), and refund management.

## 2. Target Audience (User Personas)

### 2.1. The Administrator (Owner)
- **Goal:** Full control over the business, financial reports, and inventory management.
- **Key Actions:** View dashboard analytics, manage products/suppliers, track cash movements, analyze revenue and profit margins, monitor stock levels.

### 2.2. The Receptionist / Professional
- **Goal:** Efficiently manage the daily schedule and process client payments.
- **Key Actions:** Create/manage appointments with drag & drop, register clients, process checkout with split payments, handle refunds, manage client credit.

### 2.3. The Multi-Location Owner
- **Goal:** Manage multiple salon locations with complete data isolation.
- **Key Actions:** Each tenant (salon) operates independently with isolated data, users, and financial records.

## 3. User Stories & Acceptance Criteria

### 3.1. Client Management
**User Story:** As a User, I want to register and manage clients with complete history tracking.
- **Acceptance Criteria 1:** User can create/edit clients with Name, Birth Date, Phone, WhatsApp, City, Notes, and Photo.
- **Acceptance Criteria 2:** System requires "Name" and "City" as mandatory fields.
- **Acceptance Criteria 3:** Client profile displays 4 tabs: Overview (summary), History (appointments), Credit (balance movements), Products (purchase history).
- **Acceptance Criteria 4:** Upon saving, client is created with "ACTIVE" status and zero credit balance.
- **Acceptance Criteria 5:** Client photos are uploaded to Supabase Storage in tenant-isolated folders.
- **Acceptance Criteria 6:** System displays visual debt indicators (red badge) when client has negative balance (Fiado).
- **Acceptance Criteria 7:** Search and filter by status (ACTIVE, INACTIVE, ATTENTION).
- **Acceptance Criteria 8:** The created client is ONLY visible to the current Tenant.

### 3.2. Appointment Scheduling
**User Story:** As a User, I want to schedule services with flexible calendar views and drag & drop support.
- **Acceptance Criteria 1:** User can select Client, Professional, and one or more Services with quantity.
- **Acceptance Criteria 2:** System provides 5 calendar views: Day, Day Full, Week, Week Full, Month.
- **Acceptance Criteria 3:** Drag & drop support with 30-minute time snapping.
- **Acceptance Criteria 4:** System blocks times marked as "BLOCKED" (prevents new appointments).
- **Acceptance Criteria 5:** System ALLOWS overbooking (multiple appointments at same time) as per business rule.
- **Acceptance Criteria 6:** Appointment statuses: PENDING, CONFIRMED, CANCELED, NO_SHOW, DONE, BLOCKED.
- **Acceptance Criteria 7:** Service lines store price and duration snapshots for historical accuracy.
- **Acceptance Criteria 8:** Professional color coding for visual identification in calendar.
- **Acceptance Criteria 9:** The ID generated for the appointment must be a valid UUID.
- **Acceptance Criteria 10:** User can create new client inline during appointment creation via modal dialog.
- **Acceptance Criteria 11:** Newly created client is automatically selected in appointment form.

### 3.3. Sales & Checkout
**User Story:** As a User, I want to finalize appointments with flexible payment options, visual progress tracking, and automatic inventory updates.
- **Acceptance Criteria 1:** User can convert Appointment into Sale via "Checkout" button.
- **Acceptance Criteria 2:** User can add/remove products during checkout with quantity adjustment.
- **Acceptance Criteria 3:** Checkout displays 3-step progress: Items → Payment → Completed.
- **Acceptance Criteria 4:** User can select multiple payment methods (Split Payment): PIX, Card, Cash, Transfer, Credit, Fiado.
- **Acceptance Criteria 5:** Payment dialog shows formatted currency values (R$ 1.234,56) with input masks.
- **Acceptance Criteria 6:** User can edit previously added payments before finalizing.
- **Acceptance Criteria 7:** If "Cash" is selected, system calculates "Change" (Troco) based on amount given.
- **Acceptance Criteria 8:** "Credit" payment deducts from client's credit balance (wallet).
- **Acceptance Criteria 9:** "Fiado" (debt) creates negative client balance and excludes from cash ledger.
- **Acceptance Criteria 10:** Upon finalization:
    - Appointment status changes to "DONE"
    - Sale status changes to "PAID"
    - Product stock automatically decremented via ProductMovement
    - Cash movements automatically created for PIX/Card/Cash/Transfer with descriptive labels
    - Client credit balance updated if Credit or Fiado used
    - Celebration animation shown for 3 seconds
    - User remains on step 3 (Completed) to review payment details
- **Acceptance Criteria 11:** System prevents duplicate payments on already-paid sales.
- **Acceptance Criteria 12:** User can refund sales, which reverses stock and creates negative cash movement.
- **Acceptance Criteria 13:** Refunded sales can be re-paid with new payment methods.
- **Acceptance Criteria 14:** Paid appointments show discrete green checkmark indicator in agenda views.

### 3.4. Multi-Tenant Isolation (Critical)
**User Story:** As a System, I must ensure complete data isolation so that one salon cannot see another's data.
- **Acceptance Criteria 1:** A user logged in to Tenant A MUST NOT see Clients, Appointments, Sales, Products, or any data from Tenant B.
- **Acceptance Criteria 2:** Row Level Security (RLS) policies enforce tenant_id filtering on ALL database queries.
- **Acceptance Criteria 3:** Any database insertion MUST automatically include the `tenant_id` of the authenticated user.
- **Acceptance Criteria 4:** File uploads (Client Photos) stored in tenant-specific folders in Supabase Storage.
- **Acceptance Criteria 5:** Repository factory pattern ensures all data access respects tenant context.

### 3.5. Inventory Management
**User Story:** As a User, I want accurate stock tracking with complete audit trail.
- **Acceptance Criteria 1:** ProductMovement records are the single source of truth for stock changes.
- **Acceptance Criteria 2:** Product.currentStock is a read-only cache updated automatically.
- **Acceptance Criteria 3:** Movement types: IN (purchases, adjustments) and OUT (sales, usage, adjustments).
- **Acceptance Criteria 4:** Each movement tracks: quantity, reason, reference (purchase/sale/adjustment), unit cost, supplier.
- **Acceptance Criteria 5:** Low stock alerts when currentStock ≤ minStock.
- **Acceptance Criteria 6:** Stock automatically reduced on sale payment, restored on refund.

### 3.6. Cash Management & Bank Accounts
**User Story:** As a User, I want complete financial tracking with bank account integration and automatic ledger entries.
- **Acceptance Criteria 1:** Cash ledger tracks all IN/OUT movements with method, amount, source, bank account, and date.
- **Acceptance Criteria 2:** Automatic entries created from: Sales (IN), Purchases (OUT), Refunds (OUT), Manual Credit (IN).
- **Acceptance Criteria 3:** Payment methods tracked: CASH, PIX, CARD, TRANSFER, WALLET.
- **Acceptance Criteria 4:** Fiado and Credit payments excluded from cash ledger (internal balance only).
- **Acceptance Criteria 5:** Date filtering and period summaries (total in, total out, balance).
- **Acceptance Criteria 6:** Manual transaction entry for adjustments and external movements.
- **Acceptance Criteria 7:** User can register bank accounts (banks, cards, digital wallets) to track where money is stored.
- **Acceptance Criteria 8:** Every cash movement is linked to a specific bank account.
- **Acceptance Criteria 9:** User can view account statement showing all movements and balance for each account.
- **Acceptance Criteria 10:** Cash page shows account information in all movements and allows filtering by account.
- **Acceptance Criteria 11:** Enhanced navigation with month/year controls and custom date range picker.
- **Acceptance Criteria 12:** Payment grouping shows multiple payments from same sale as expandable group.
- **Acceptance Criteria 13:** Advanced filters by type, method, source, account, and text search.
- **Acceptance Criteria 14:** Export functionality to PDF and Excel/CSV with account breakdown.
- **Acceptance Criteria 15:** Summary cards show totals by payment method and by bank account.

### 3.7. Credit System
**User Story:** As a User, I want to manage client credit balances for prepayment and debt tracking.
- **Acceptance Criteria 1:** Clients can have positive balance (prepaid credit) or negative balance (debt/Fiado).
- **Acceptance Criteria 2:** Credit can be added manually with payment method tracking (CASH, PIX, CARD, WALLET).
- **Acceptance Criteria 3:** Credit movements show complete history with type (CREDIT/DEBIT), amount, origin, and date.
- **Acceptance Criteria 4:** Credit can be used as payment method in checkout (deducts from balance).
- **Acceptance Criteria 5:** Fiado creates negative balance (debt) visible with red indicator.
- **Acceptance Criteria 6:** Credit balance displayed in client profile with movement history.

### 3.8. Dashboard & Analytics
**User Story:** As a User, I want business insights and performance metrics.
- **Acceptance Criteria 1:** Revenue statistics: total revenue, average ticket, estimated profit.
- **Acceptance Criteria 2:** Critical stock alerts for products at or below minimum stock.
- **Acceptance Criteria 3:** Top services by revenue and frequency.
- **Acceptance Criteria 4:** Product revenue and profit tracking.
- **Acceptance Criteria 5:** Period filtering: current month, previous month, all time.
- **Acceptance Criteria 6:** Real-time data updates from sales and inventory.

## 4. Functional Requirements

### 4.1. Inventory Logic
- **Stock Movement:** Stock is ONLY updated via `ProductMovement` records (source of truth).
- **Current Stock:** The `product.currentStock` field is a read-only cache updated atomically after every movement.
- **Movement Types:** IN (purchases, positive adjustments), OUT (sales, usage, negative adjustments).
- **Reference Tracking:** Each movement links to source (PURCHASE, APPOINTMENT, ADJUSTMENT, REFUND).
- **Low Stock:** System flags products where `currentStock <= minStock` with visual alerts.
- **Audit Trail:** Complete movement history with date, quantity, reason, unit cost, and supplier.

### 4.2. Financial Logic
- **Pricing:** Service price can be overridden at Checkout (stored in service line snapshot).
- **Totals:** `Total = (Services + Products) - Discount`.
- **Split Payments:** Multiple payment methods in single sale, sum must equal total.
- **Payment Dialog:** Currency-formatted inputs with masks, edit capability for added payments.
- **Cash Change:** Automatic calculation when cash given > amount due, displayed in payment summary.
- **Credit Payment:** Deducts from client's positive credit balance.
- **Fiado (Debt):** Creates negative client balance, excluded from cash ledger, marked with red indicator.
- **Cash Ledger:** Automatic entries for PIX, Card, Cash, Transfer with descriptive labels including customer/supplier name, change amount, and bank account.
- **Bank Accounts:** Every cash movement is linked to a bank account (bank, card, or digital wallet).
- **Account Selection:** User selects destination/source account for each payment method.
- **Account Balances:** Real-time balance calculation from initial balance + movements.
- **Account Statements:** Complete movement history per account with balance tracking.
- **Refunds:** Reverse stock movements, create negative cash entries, allow re-payment.
- **Duplicate Prevention:** System blocks payment processing on already-paid sales.

### 4.3. Appointment Logic
- **Overbooking:** ALLOWED - Multiple appointments can exist at same time slot.
- **Time Blocks:** RESTRICTIVE - Appointments with status "BLOCKED" prevent new bookings at that time.
- **Service Lines:** Normalized structure with price/duration snapshots for historical accuracy.
- **Status Flow:** PENDING → CONFIRMED → DONE (or CANCELED/NO_SHOW).
- **Drag & Drop:** 30-minute time snapping, visual feedback, conflict detection.

### 4.4. Multi-Tenant Architecture
- **Tenant Creation:** Automatic on signup via stored procedure (atomic transaction).
- **Profile Linking:** Each user has profile with tenant_id reference.
- **RLS Policies:** Database-level enforcement on all tables (SELECT, INSERT, UPDATE, DELETE).
- **Repository Pattern:** Factory-based instantiation ensures tenant context in all queries.
- **Storage Isolation:** Client photos stored in `{tenant_id}/clients/{client_id}/` folders.

## 5. Technical Specifications

### 5.1. Technology Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, Shadcn/ui components, Glassmorphism design
- **Backend:** Supabase (PostgreSQL 15+)
- **Auth:** Supabase Auth with SSR (@supabase/ssr)
- **Storage:** Supabase Storage (tenant-isolated buckets)
- **Validation:** Zod schemas for all domain entities
- **Forms:** React Hook Form with Zod resolvers
- **State:** React Context API (AuthProvider)
- **Notifications:** Sonner (toast notifications)
- **Date Handling:** date-fns, date-fns-tz (timezone support)

### 5.2. Architecture
- **Pattern:** Clean Architecture (Domain → UseCases → Repositories → Infrastructure)
- **Layers:**
  - `src/core/domain/` - Entity types and Zod schemas
  - `src/core/usecases/` - Business logic and orchestration
  - `src/core/repositories/` - Repository interfaces
  - `src/infrastructure/repositories/` - Supabase implementations
  - `src/app/` - Next.js pages and routes
  - `src/components/` - React components (UI, feature-specific)
  - `src/lib/` - Utilities and Supabase clients

### 5.3. Database
- **Tables:** 18 tables (tenants, profiles, clients, professionals, services, products, product_movements, suppliers, purchases, purchase_items, appointments, sales, sale_items, sale_payments, cash_movements, credit_movements, appointment_series, bank_accounts)
- **Security:** Row Level Security (RLS) policies on ALL tables
- **Stored Procedures:** pay_sale, refund_sale, create_purchase, add_client_credit, create_purchase_with_movements (atomic operations)
- **Triggers:** updated_at auto-update on all tables
- **ID Format:** UUID (v4) for all entities
- **Indexes:** Optimized for tenant_id filtering, bank_account_id joins, and common queries

### 5.4. Authentication & Authorization
- **Method:** Supabase Auth (email/password)
- **Session:** Server-side with cookie-based tokens
- **Middleware:** Route protection and token refresh (`src/lib/supabase/middleware.ts`)
- **Context:** Global AuthProvider exposes user, profile, role, tenantId
- **Signup Flow:** Creates user → tenant → profile (atomic via RPC)
- **Logout:** Server action destroys session

### 5.5. Security
- **RLS Policies:** Enforce tenant_id on all data access
- **Middleware:** Redirects unauthenticated users to /login
- **Storage Rules:** Tenant-isolated folders with RLS
- **SQL Injection:** Prevented via Supabase client parameterization
- **XSS:** React auto-escaping, no dangerouslySetInnerHTML
- **CSRF:** Next.js built-in protection

## 6. Assumptions & Constraints
- Users must be authenticated to access any part of the system (except Login/Signup).
- The system defaults to Portuguese (BRL currency, DD/MM/YYYY dates, Brazilian phone format).
- Offline mode is NOT supported (requires active internet connection).
- Overbooking is intentionally allowed (business rule for flexibility).
- Stock movements are immutable (audit trail integrity).
- Refunds can only be processed on paid sales.
- Client deletion blocked if they have appointment/sale history.
- Supplier deletion blocked if they have linked purchases.

## 7. Implemented Modules

### 7.1. Authentication ✅
- Login with email/password
- Signup with automatic tenant creation
- SSR session management
- Middleware route protection
- Logout functionality

### 7.2. Client Management ✅
- CRUD operations (Create, Read, Update, Delete)
- Search by name/phone
- Filter by status (ACTIVE, INACTIVE, ATTENTION)
- 4-tab profile: Overview, History, Credit, Products
- Photo upload to Supabase Storage
- Credit balance tracking with debt indicators
- Pagination (10 items per page)

### 7.3. Appointment Scheduling ✅
- 5 calendar views (Day, Day Full, Week, Week Full, Month)
- Drag & drop with 30-min snapping
- Create/edit/cancel appointments
- Time blocking (BLOCKED status)
- Overbooking support
- Professional color coding
- Service line normalization
- Paid appointment indicators (discrete green checkmark)

### 7.4. Sales & Checkout ✅
- Convert appointment to sale
- Add/remove products during checkout
- 3-step progress indicator (Items → Payment → Completed)
- Split payment (multiple methods) with currency formatting
- Edit added payments before finalizing
- Cash change calculation with visual display
- Credit payment from wallet
- Fiado (debt) tracking
- Automatic stock reduction
- Celebration animation on completion
- Refund with stock reversal
- Re-payment of refunded sales
- Duplicate payment prevention
- Descriptive cash movement labels

### 7.5. Inventory Management ✅
- Product CRUD
- Stock movement history (IN/OUT)
- Low stock alerts
- Automatic movements from purchases/sales
- Movement reference tracking
- Unit cost tracking

### 7.6. Purchases & Suppliers ✅
- Supplier CRUD with contact/fiscal info
- Purchase master-detail
- Multiple items per purchase
- Automatic stock IN movements
- Purchase history by supplier
- Deletion validation

### 7.7. Services & Professionals ✅
- Service CRUD (name, duration, cost, price, commission)
- Professional CRUD (name, color, commission, contact)
- Status management (ACTIVE/INACTIVE)
- Commission percentage tracking

### 7.8. Cash Management ✅
- Complete cash ledger (IN/OUT)
- Automatic entries from sales/purchases/refunds
- Manual transaction entry
- Date filtering
- Period summaries (total in, out, balance)
- Payment method tracking

### 7.9. Bank Accounts System 🚧 (In Development)
- Bank account registration (banks, cards, wallets)
- Account types: Bank, Card, Digital Wallet
- Initial balance tracking
- Account activation/deactivation
- Account statement with movement history
- Real-time balance calculation
- Integration with all payment flows
- Account selection in checkout/purchases/credit
- Migration of existing data to default account

### 7.10. Enhanced Cash Page 🚧 (In Development)
- Enhanced date navigation (month/year controls)
- Custom date range picker with calendar
- Payment grouping (multiple payments from same sale)
- Transaction details modal with links
- Advanced filters (type, method, source, account, text search)
- Export to PDF with account breakdown
- Export to Excel/CSV
- Summary by payment method
- Summary by bank account
- Account column in movement list

### 7.11. Credit System ✅
- Add credit manually
- Credit movement history
- Automatic balance calculation
- Credit usage in checkout
- Origin tracking (CASH, PIX, CARD, WALLET)
- Debt (Fiado) tracking

### 7.12. Dashboard ✅
- Revenue statistics (total, average, profit)
- Critical stock alerts
- Top services (revenue, frequency)
- Product revenue/profit
- Period filtering

### 7.13. Multi-Tenant Infrastructure ✅
- Tenant creation on signup
- RLS policies on all tables
- Repository factory pattern
- Storage isolation
- Complete data separation

## 8. Not Implemented (Future Enhancements)

- Service detail page/profile
- Recurring appointments (series)
- Notifications/reminders (email, SMS, WhatsApp)
- Barcode scanning for products
- Product categories/tags
- Professional-specific schedules/availability
- Detailed financial reports (PDF export)
- WhatsApp integration for appointment reminders
- Installment payments (parcelamento)
- Invoice generation (NF-e)
- Mobile app (React Native)
- Advanced analytics (charts, trends)
- Loyalty program
- Online booking portal for clients
- Inventory forecasting
- Supplier performance tracking

## 9. Deployment & Configuration

### 9.1. Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 9.2. Database Setup
1. Run `supabase/schema.sql` to create tables
2. Enable RLS policies on all tables
3. Create storage bucket for client photos
4. Deploy stored procedures (pay_sale, refund_sale, create_purchase)

### 9.3. Deployment
- Platform: Vercel (recommended)
- Build command: `npm run build`
- Output directory: `.next`
- Node version: 20+

## 10. Success Metrics

- **User Adoption:** Number of active tenants (salons)
- **Engagement:** Daily active users, appointments created per day
- **Revenue:** Total sales processed through the system
- **Efficiency:** Average time to complete checkout
- **Accuracy:** Stock discrepancy rate (should be near 0%)
- **Satisfaction:** User feedback and support ticket volume


## 11. Changelog

### Version 2.2 (2026-02-12) - Financial System Overhaul 🚧 IN DEVELOPMENT

**Bank Accounts System (NEW):**
- Complete bank account management (CRUD operations)
- Account types: Bank (Banco), Card (Cartão), Digital Wallet (Carteira)
- Initial balance tracking with real-time balance calculation
- Account activation/deactivation (soft delete)
- Account statement view with complete movement history
- Integration with all payment flows (sales, purchases, credit, manual)
- Account selection required for every cash movement
- Migration strategy for existing data (default "Caixa Geral" account)
- New page: `/contas` (account list) and `/contas/[id]` (account statement)

**Enhanced Cash Page (NEW):**
- Improved date navigation with month/year controls and arrows
- Custom date range picker with calendar interface
- Quick filters: Hoje, Ontem, 7 Dias, 30 Dias, Mês Atual, Ano Atual
- Payment grouping: Multiple payments from same sale shown as expandable group
- Transaction details modal with complete information and links
- Advanced filters: type (IN/OUT), method, source, account, text search
- Filter combination with AND logic and result counter
- Export to PDF with account breakdown and summary
- Export to Excel/CSV with all columns including account
- Summary card by payment method (bar/pie chart)
- Summary card by bank account with balances
- Account column in all movement displays

**Database Changes:**
- New table: `bank_accounts` (id, tenant_id, name, type, initial_balance, is_active)
- Updated table: `cash_movements` (added bank_account_id foreign key)
- Updated RPC functions: `pay_sale`, `create_purchase_with_movements`, `add_client_credit` (now require bank_account_id)
- Migration scripts for existing data

**Technical Implementation:**
- New domain models: BankAccount, BankAccountWithBalance, AccountStatement
- New use cases: CreateBankAccount, UpdateBankAccount, DeactivateBankAccount, ListBankAccounts, GetAccountStatement
- New repository: BankAccountRepository with Supabase implementation
- New components: AccountSelector, BankAccountsList, BankAccountDialog, AccountStatementView
- Updated components: PaymentDialog, PurchaseForm, RegisterCreditDialog, NewTransactionDialog, CashList
- New utilities: groupMovements, filterMovements, aggregateByMethod, aggregateByAccount, exportToPDF, exportToCSV
- New dependencies: jspdf, jspdf-autotable, papaparse, recharts

**User Experience:**
- Seamless account selection in all payment flows
- Visual account information throughout the system
- Comprehensive filtering and search capabilities
- Professional export functionality for reporting
- Clear financial overview with multiple summary views

### Version 2.1 (2026-02-12) - Enhanced Checkout & Payment Experience

**Appointment Form Improvements:**
- Added inline client creation modal during appointment scheduling
- New `ClientDialog` component for quick client registration
- Seamless flow: create client → auto-select → continue appointment
- Eliminated need to open new tab for client creation
- Automatic client list refresh after creation
- Optimized state management to prevent infinite loops

**Technical Implementation:**
- Created reusable `ClientDialog` component (`src/components/clients/ClientDialog.tsx`)
- Integrated modal into `AppointmentForm` with version-based refresh pattern
- Added `clientsVersion` state to trigger controlled reloads
- Callback system to auto-select newly created client

**User Experience:**
- Click "Novo Cliente" button opens modal overlay
- Fill client form without leaving appointment context
- On save, client is automatically selected in appointment
- Toast confirmation of successful creation and selection
- No page navigation or context loss

**Checkout Improvements:**
- Added 3-step progress indicator (Items → Payment → Completed)
- Implemented celebration animation on payment completion (3-second overlay)
- Changed flow to keep user on step 3 after payment for review
- Auto-detect paid sales and skip directly to step 3
- Added discrete paid indicator (green checkmark) on agenda appointment cards

**Payment Dialog Enhancements:**
- Complete currency formatting (R$ 1.234,56) throughout interface
- Input masks for monetary values with comma as decimal separator
- Edit capability for added payments (pencil icon)
- Visual highlighting of payment being edited
- Larger, more readable input fields (56px height)
- Prevent finalization while editing a payment
- Auto-formatted initial values

**Backend Improvements:**
- Added duplicate payment prevention in `pay_sale` RPC function
- Enhanced cash movement descriptions with customer/supplier names
- Standardized description format across all payment types
- Include change amount in cash movement descriptions

**Bug Fixes:**
- Fixed payment summary showing incorrect totals from duplicate payments
- Corrected initial value formatting in payment dialog (was showing 5000 instead of 50,00)


### Version 2.2 (2026-02-12) - Bank Accounts System Enhancements

**Enhanced Bank Account Management:**
- Added visual customization: color picker and icon/emoji selector
- Implemented account favoriting system with star indicator
- Added custom display ordering for accounts
- Extended account fields: description, credit limit, bank details (name, agency, account number)
- Created rich card-based UI replacing simple table view
- Added comprehensive filtering: active/inactive status and search by name/bank

**Visual Improvements:**
- Color-coded account cards with customizable hex colors
- Emoji/icon support for quick visual identification
- Preview of account appearance while editing
- Glassmorphism design with backdrop blur effects
- Responsive grid layout (3 columns desktop, 2 tablet, 1 mobile)
- Skeleton loading states for better perceived performance

**Financial Overview Dashboard:**
- Summary cards showing total balance, positive balances, and negative balances
- Pie chart visualization of balance distribution across accounts
- Real-time balance calculations
- Account count indicators per category
- Color-coded positive (green) and negative (red) balances

**Database Schema Updates:**
- Added `color` field (VARCHAR(7), default '#3B82F6') for visual customization
- Added `icon` field (VARCHAR(50), default '🏦') for emoji/icon storage
- Added `description` field (TEXT) for account notes
- Added `credit_limit` field (DECIMAL(10,2)) for credit cards
- Added `bank_name`, `agency`, `account_number` fields for banking details
- Added `is_favorite` field (BOOLEAN, default FALSE) for primary account marking
- Added `display_order` field (INTEGER, default 0) for custom sorting
- Created performance indexes on `display_order` and `is_favorite`
- Auto-populated existing accounts with type-appropriate colors and icons

**Account Form Enhancements:**
- Interactive color picker with preset palette and custom color input
- Icon picker with 15 preset emojis (banks, cards, wallets, money symbols)
- Live preview of account appearance during creation/editing
- Conditional credit limit field (only for CARD type)
- Collapsible banking details section
- Favorite toggle with visual star indicator
- Form validation for all new fields

**List View Features:**
- Card-based layout with account color as border accent
- Prominent display of current balance with color coding
- Quick actions: View Dashboard, Edit, Activate/Deactivate
- Favorite indicator (star) on cards
- Bank details display when available
- Empty state with helpful messaging
- Search across account name and bank name
- Filter buttons for All/Active/Inactive accounts

**Technical Implementation:**
- Created `ColorPicker` component with preset colors and custom input
- Created `IconPicker` component with emoji grid selection
- Created `BankAccountCard` component for rich card display
- Updated domain models to include all new fields
- Extended repository interfaces with new methods
- Updated use cases to handle extended input data
- Implemented smart defaults based on account type
- Added RLS policy fixes for proper tenant isolation

**User Experience:**
- Accounts sorted by: favorite first, then custom order, then name
- Visual consistency with existing cash page design
- Intuitive color and icon selection
- Immediate visual feedback on all interactions
- Mobile-optimized touch targets and layouts
- Accessible color contrast and keyboard navigation

**Migration & Data Integrity:**
- Safe migration with IF NOT EXISTS clauses
- Preserved all existing account data
- Auto-assigned colors based on account type (Bank=blue, Card=red, Wallet=green)
- Auto-assigned icons based on account type (Bank=🏦, Card=💳, Wallet=💰)
- Set "Caixa Geral" as default favorite account
- Established logical display order for existing accounts

**Next Steps (Planned):**
- Dashboard individual por conta com gráficos e estatísticas
- Transferências entre contas
- Exportação de extratos (PDF, Excel, CSV)
- Metas e alertas de saldo
- Conciliação bancária
- Integração melhorada em vendas e compras
