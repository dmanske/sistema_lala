# Implementation Plan: Cash Page Improvements

## Overview

This implementation plan breaks down the Cash Page improvements into 6 phases following the timeline from requirements. Each phase builds incrementally on previous work, with testing integrated throughout. The plan follows the existing Next.js 14 App Router architecture with server/client component patterns and the repository/use case structure.

**IMPORTANT**: This spec assumes the Bank Accounts System (bank-accounts) has been fully implemented first. All cash movements will have an associated bank account, and this implementation will integrate account information throughout.

## Tasks

- [ ] 1. Phase 1: Enhanced Date Navigation
  - [ ] 1.1 Create DateNavigator component replacing DateFilter
    - Create `src/components/cash/DateNavigator.tsx` as client component
    - Implement month/year display with clear formatting (e.g., "Janeiro 2026")
    - Add Previous/Next month navigation buttons with icons
    - Use `useRouter` and `useSearchParams` for URL manipulation
    - _Requirements: AC1.1, AC1.2_

  - [ ] 1.2 Implement quick filter buttons with visual feedback
    - Add filter buttons: Hoje, Ontem, 7 Dias, 30 Dias, Mês Atual, Ano Atual
    - Implement active filter highlighting (different background/border)
    - Calculate date ranges using date-fns functions
    - Update URL params on filter selection
    - _Requirements: AC1.4, AC1.5_

  - [ ] 1.3 Integrate date range picker with calendar
    - Add "Selecionar Período" button that opens calendar dialog
    - Use shadcn/ui Calendar component (react-day-picker)
    - Implement date range selection (start and end dates)
    - Display selected custom range clearly (e.g., "15/01 - 20/01/2026")
    - Add "Aplicar" button to confirm selection
    - _Requirements: AC1.3, AC5.1, AC5.2, AC5.3, AC5.4, AC5.5_

  - [ ]* 1.4 Write unit tests for DateNavigator
    - Test quick filter buttons update URL correctly
    - Test month navigation updates period display
    - Test custom date range selection
    - Test active filter visual feedback
    - _Requirements: AC1.1, AC1.2, AC1.4, AC1.5_

  - [ ] 1.5 Update cash page to use DateNavigator
    - Replace DateFilter import with DateNavigator in `src/app/(app)/cash/page.tsx`
    - Pass current start/end dates as props
    - Verify URL params flow correctly
    - _Requirements: AC1.1, AC1.2_

- [ ] 2. Phase 2: Payment Grouping
  - [ ] 2.1 Create grouping utility function
    - Create `src/lib/cash/groupMovements.ts`
    - Implement algorithm to group movements by sourceId
    - Only group SALE and PURCHASE types with multiple payments
    - Return mixed array of MovementGroup and CashMovement objects
    - Sort by date (most recent first)
    - _Requirements: AC2.1, AC2.6_

  - [ ]* 2.2 Write property test for grouping logic
    - **Property 1: Movement Grouping Consistency**
    - **Validates: Requirements AC2.1, AC2.6**
    - Generate random movements with shared sourceIds
    - Verify movements with same sourceId are grouped
    - Verify single movements remain ungrouped
    - Verify all movements are preserved (no loss)

  - [ ] 2.3 Create CashMovementGroup component
    - Create `src/components/cash/CashMovementGroup.tsx` as client component
    - Implement expandable group header showing customer/supplier, total, expand icon
    - Implement collapsed/expanded states
    - Display child rows when expanded with indentation
    - Show change amount when applicable (change > 0)
    - Apply visual distinction (border, background color)
    - _Requirements: AC2.1, AC2.2, AC2.3, AC2.4, AC2.5_

  - [ ] 2.4 Fetch customer/supplier names for groups
    - Add helper function to fetch customer name by sale ID
    - Add helper function to fetch supplier name by purchase ID
    - Handle missing data gracefully ("Cliente não encontrado")
    - Cache fetched names to avoid repeated queries
    - _Requirements: AC2.2, AC3.3_

  - [ ]* 2.5 Write property test for change display
    - **Property 2: Change Display Condition**
    - **Validates: Requirements AC2.4**
    - Generate movements with various change amounts
    - Verify change is displayed when > 0
    - Verify change is not displayed when 0 or undefined

  - [ ] 2.6 Refactor CashList to handle grouped movements
    - Update `src/components/cash/CashList.tsx` to accept grouped data
    - Render CashMovementGroup for grouped items
    - Render regular rows for single movements
    - Add "Conta" column showing bank account name
    - Include account info in movement display
    - Maintain existing table structure and styling
    - _Requirements: AC2.1, AC2.6, AC4.1 (account integration)_

  - [ ]* 2.7 Write unit tests for CashMovementGroup
    - Test expand/collapse toggle
    - Test group header displays correct information
    - Test child rows render when expanded
    - Test change display logic
    - _Requirements: AC2.1, AC2.2, AC2.3, AC2.4_

- [ ] 3. Checkpoint - Verify grouping and navigation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Phase 3: Transaction Details and Context
  - [ ] 4.1 Create CashMovementDetailsDialog component
    - Create `src/components/cash/CashMovementDetailsDialog.tsx` as client component
    - Use shadcn/ui Dialog component
    - Display complete transaction information (date/time, method, amount, customer/supplier)
    - Show items sold/purchased if applicable
    - Display notes/observations
    - Add clickable link to original sale/purchase using Next.js Link
    - _Requirements: AC3.1, AC3.2, AC3.4_

  - [ ] 4.2 Add "Ver Detalhes" button to movement rows
    - Update CashList row rendering to include details button
    - Add onClick handler to open details dialog
    - Pass selected movement to dialog
    - _Requirements: AC3.1_

  - [ ] 4.3 Enhance movement descriptions with customer/supplier names
    - Create utility function to enrich descriptions
    - Fetch customer/supplier name based on sourceId and sourceType
    - Update description format to include name (e.g., "Venda - João Silva")
    - Handle missing names gracefully
    - _Requirements: AC3.3_

  - [ ]* 4.4 Write property test for description enrichment
    - **Property 3: Description Enrichment**
    - **Validates: Requirements AC3.3**
    - Generate movements with sourceIds
    - Verify enriched descriptions contain customer/supplier names
    - Verify movements without sourceId remain unchanged

  - [ ]* 4.5 Write unit tests for CashMovementDetailsDialog
    - Test dialog opens/closes correctly
    - Test all required information is displayed
    - Test link navigation to sale/purchase
    - Test handling of missing data
    - _Requirements: AC3.1, AC3.2, AC3.4_

- [ ] 5. Phase 4: Advanced Filters
  - [ ] 5.1 Create CashFilters component
    - Create `src/components/cash/CashFilters.tsx` as client component
    - Implement filter state management (type, method, source, searchText, bankAccountId)
    - Create UI with dropdown/button groups for each filter dimension
    - Add AccountSelector dropdown for filtering by account (from bank-accounts system)
    - Add text search input with debounce (300ms)
    - Display result counter showing filtered count
    - Add "Limpar Filtros" button
    - _Requirements: AC4.1, AC4.2, AC4.3, AC4.4, AC4.6, bank-accounts integration_

  - [ ] 5.2 Implement filtering logic
    - Create `src/lib/cash/filterMovements.ts`
    - Implement type filter (ALL, IN, OUT)
    - Implement method filter (ALL, CASH, PIX, CARD, TRANSFER, WALLET)
    - Implement source filter (ALL, SALE, REFUND, PURCHASE, MANUAL)
    - Implement account filter (ALL, or specific account ID)
    - Implement text search (case-insensitive, searches description)
    - Combine filters with AND logic
    - Use useMemo for performance optimization
    - _Requirements: AC4.1, AC4.2, AC4.3, AC4.4, AC4.5, bank-accounts integration_

  - [ ]* 5.3 Write property tests for filtering
    - **Property 4: Type Filter Correctness**
    - **Validates: Requirements AC4.1**
    - **Property 5: Method Filter Correctness**
    - **Validates: Requirements AC4.2**
    - **Property 6: Source Filter Correctness**
    - **Validates: Requirements AC4.3**
    - **Property 7: Text Search Correctness**
    - **Validates: Requirements AC4.4**
    - **Property 8: Combined Filter Correctness**
    - **Validates: Requirements AC4.5**
    - **Property 9: Filter Count Accuracy**
    - **Validates: Requirements AC4.6**
    - Generate random movements and filter states
    - Verify filtered results match filter criteria
    - Verify combined filters work correctly
    - Verify count matches filtered results

  - [ ] 5.4 Integrate filters with CashList
    - Update cash page to include CashFilters component
    - Pass movements to filters
    - Update CashList to display filtered movements
    - Ensure grouping works with filtered data
    - _Requirements: AC4.1, AC4.2, AC4.3, AC4.4, AC4.5, AC4.6_

  - [ ]* 5.5 Write unit tests for CashFilters
    - Test each filter dimension independently
    - Test text search with debounce
    - Test clear filters functionality
    - Test result counter updates
    - _Requirements: AC4.1, AC4.2, AC4.3, AC4.4, AC4.6_

- [ ] 6. Checkpoint - Verify filtering functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Phase 5: Export Functionality
  - [ ] 7.1 Install export dependencies
    - Add jspdf, jspdf-autotable, papaparse to package.json
    - Add @types/papaparse to devDependencies
    - Run npm install
    - _Requirements: AC6.1, AC6.2_

  - [ ] 7.2 Create ExportButton component
    - Create `src/components/cash/ExportButton.tsx` as client component
    - Add dropdown menu with PDF and Excel/CSV options
    - Implement lazy loading for export libraries (dynamic imports)
    - Add loading state during export generation
    - Trigger browser download on completion
    - _Requirements: AC6.1, AC6.2_

  - [ ] 7.3 Implement PDF export
    - Create `src/lib/cash/exportToPDF.ts`
    - Use jspdf and jspdf-autotable
    - Include company logo (if available)
    - Add period header (e.g., "Período: 01/01/2026 - 31/01/2026")
    - Add summary section (total in, total out, balance)
    - Add summary by account (breakdown per bank account)
    - Add movement list table with all columns including account
    - Format currency values correctly (R$ 1.234,56)
    - _Requirements: AC6.3, AC6.4, bank-accounts integration_

  - [ ] 7.4 Implement CSV export
    - Create `src/lib/cash/exportToCSV.ts`
    - Use papaparse to generate CSV
    - Include all columns: date, time, description, method, source, type, amount, account
    - Use semicolon as delimiter (Brazilian standard)
    - Format dates as DD/MM/YYYY
    - Format amounts with comma as decimal separator
    - _Requirements: AC6.3, AC6.5, bank-accounts integration_

  - [ ]* 7.5 Write property test for export data consistency
    - **Property 10: Export Data Consistency**
    - **Validates: Requirements AC6.3**
    - Generate random movements and filter states
    - Export filtered data
    - Verify exported data matches filtered movements
    - Verify no data loss or duplication

  - [ ]* 7.6 Write unit tests for export functionality
    - Test PDF generation produces valid output
    - Test CSV generation produces valid output
    - Test export includes correct period and summary
    - Test export respects active filters
    - Test large dataset handling
    - _Requirements: AC6.3, AC6.4, AC6.5_

  - [ ] 7.7 Add ExportButton to CashHeader
    - Update `src/components/cash/CashHeader.tsx`
    - Add ExportButton next to transaction buttons
    - Pass filtered movements, summary, and period as props
    - _Requirements: AC6.1_

- [ ] 8. Phase 6: Payment Method Summary and Account Summary
  - [ ] 8.1 Install chart library
    - Add recharts to package.json
    - Run npm install
    - _Requirements: AC7.3_

  - [ ] 8.2 Create PaymentMethodSummary component
    - Create `src/components/cash/PaymentMethodSummary.tsx` as client component
    - Create card component with glassmorphism styling
    - Display list of payment methods with totals
    - Add simple bar chart or pie chart using recharts
    - Respect filtered movements (receives filtered data as prop)
    - _Requirements: AC7.1, AC7.2, AC7.3, AC7.4_

  - [ ] 8.3 Create AccountSummary component
    - Create `src/components/cash/AccountSummary.tsx` as client component
    - Create card component with glassmorphism styling
    - Display list of bank accounts with totals (IN, OUT, balance)
    - Add simple bar chart showing balance per account
    - Respect filtered movements (receives filtered data as prop)
    - Link to account statement page (/contas/[id])
    - _Requirements: bank-accounts integration, AC7.4_

  - [ ] 8.4 Implement aggregation logic
    - Create `src/lib/cash/aggregateByMethod.ts`
    - Group movements by payment method
    - Calculate total for each method (sum of IN movements)
    - Return sorted by total (highest first)
    - _Requirements: AC7.2_

  - [ ] 8.5 Implement account aggregation logic
    - Create `src/lib/cash/aggregateByAccount.ts`
    - Group movements by bank account
    - Calculate total IN, total OUT, and balance for each account
    - Return sorted by balance (highest first)
    - _Requirements: bank-accounts integration_

  - [ ]* 8.6 Write property test for aggregation
    - **Property 11: Payment Method Aggregation Correctness**
    - **Validates: Requirements AC7.2, AC7.4**
    - **Property 12: Account Aggregation Correctness**
    - **Validates: bank-accounts integration**
    - Generate random movements with various methods and accounts
    - Verify sum per method is correct
    - Verify sum per account is correct
    - Verify total across methods equals overall total
    - Verify total across accounts equals overall total
    - Verify aggregation respects filters

  - [ ]* 8.7 Write unit tests for summary components
    - Test method aggregation calculation
    - Test account aggregation calculation
    - Test chart rendering
    - Test empty state (no movements)
    - Test single method/account
    - _Requirements: AC7.1, AC7.2, AC7.3_

  - [ ] 8.8 Add summary components to cash page
    - Update `src/app/(app)/cash/page.tsx`
    - Add PaymentMethodSummary card below CashSummaryCards
    - Add AccountSummary card below PaymentMethodSummary
    - Pass filtered movements as prop to both
    - Ensure responsive layout (grid)
    - _Requirements: AC7.1, AC7.4, bank-accounts integration_

- [ ] 9. Final Integration and Polish
  - [ ] 9.1 Update cash page with all components
    - Ensure all new components are properly integrated
    - Verify data flow from server to client components
    - Test URL param handling for date ranges
    - Verify glassmorphism styling consistency
    - _Requirements: All_

  - [ ] 9.2 Add error boundaries and loading states
    - Add error boundary for client components
    - Add loading skeletons for async operations
    - Add toast notifications for errors
    - Handle edge cases (empty data, network errors)
    - _Requirements: All_

  - [ ] 9.3 Responsive design verification
    - Test on mobile devices (320px - 768px)
    - Test on tablets (768px - 1024px)
    - Test on desktop (1024px+)
    - Ensure filters work on mobile (collapsible)
    - Ensure tables scroll horizontally on small screens
    - _Requirements: All_

  - [ ]* 9.4 Write integration tests
    - Test full filter flow (apply multiple filters, verify display)
    - Test export flow (filter, export, verify content)
    - Test navigation flow (change date, verify refresh)
    - Test grouping with filters
    - _Requirements: All_

- [ ] 10. Final Checkpoint - Complete testing and review
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- **PREREQUISITE**: The Bank Accounts System (bank-accounts spec) MUST be fully implemented before starting these tasks
- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- All new components follow existing patterns (glassmorphism, repository pattern)
- No additional database changes required (bank_account_id already added by bank-accounts spec)
- Export libraries are lazy loaded to minimize initial bundle size
- Filtering and grouping use useMemo for performance optimization
- Account information is integrated throughout: filters, display, grouping, export, and summaries

## Testing Configuration

All property-based tests should use fast-check with minimum 100 iterations:

```typescript
import fc from 'fast-check'

describe('Feature: cash-improvements, Property X', () => {
  it('should satisfy property', () => {
    fc.assert(
      fc.property(
        // arbitraries here
        (input) => {
          // property assertion
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

## Implementation Order

The phases are designed to be implemented sequentially:
1. **Phase 1** establishes improved navigation foundation
2. **Phase 2** adds grouping (depends on navigation for date filtering)
3. **Phase 3** adds details (depends on grouping for context)
4. **Phase 4** adds filters (depends on grouping and details)
5. **Phase 5** adds export (depends on filters for data selection)
6. **Phase 6** adds summary (depends on filters for aggregation)

Each phase can be deployed independently for incremental user feedback.
