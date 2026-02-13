# Account Statement Improvements - Implementation Tasks

**Version:** 1.0  
**Date:** 2026-02-12  
**Total Estimated Time:** 6-8 days

---

## PHASE 1: ESSENTIALS (Days 1-3)

### Day 1: Core Infrastructure & Filters

#### Task 1.1: Update Domain Models
- [ ] Add `ExtendedStats` interface to BankAccount.ts
- [ ] Add `MovementWithBalance` interface
- [ ] Add `BalancePoint` interface
- [ ] Add `PaginationInfo` interface
- [ ] Add `StatementFilters` interface
- [ ] Export all new types
**Estimated Time:** 30 minutes

#### Task 1.2: Extend Repository Interface
- [ ] Add `getStatement()` method signature
- [ ] Add `getBalanceEvolution()` method signature
- [ ] Add `getExtendedStats()` method signature
- [ ] Add `getMovementDetails()` method signature
- [ ] Update BankAccountRepository.ts interface
**Estimated Time:** 20 minutes

#### Task 1.3: Implement Repository Methods
- [ ] Implement `getStatement()` in SupabaseBankAccountRepository
- [ ] Write SQL query with all filters
- [ ] Calculate running balance
- [ ] Join with clients/suppliers for names
- [ ] Implement pagination
- [ ] Implement `getExtendedStats()`
- [ ] Write aggregation SQL query
- [ ] Test with various filter combinations
**Estimated Time:** 2 hours

#### Task 1.4: Create QuickPeriodFilters Component
- [ ] Create `src/components/bank-accounts/QuickPeriodFilters.tsx`
- [ ] Implement period buttons (Today, Yesterday, 7D, 30D, This Month, Last Month)
- [ ] Add active state styling
- [ ] Calculate date ranges for each period
- [ ] Emit onChange event
- [ ] Make responsive (stack on mobile)
**Estimated Time:** 1 hour

#### Task 1.5: Create StatementFilters Component
- [ ] Create `src/components/bank-accounts/StatementFilters.tsx`
- [ ] Integrate QuickPeriodFilters
- [ ] Add Type filter (All/Entries/Exits)
- [ ] Add Method dropdown filter
- [ ] Add Source dropdown filter
- [ ] Add Search input with debounce
- [ ] Add Clear All Filters button
- [ ] Make responsive layout
**Estimated Time:** 2 hours

#### Task 1.6: Update AccountStatementView - Part 1
- [ ] Import new components
- [ ] Add filters state management
- [ ] Implement filter change handlers
- [ ] Add client-side filtering logic
- [ ] Add useMemo for filtered movements
- [ ] Update data fetching to use new repository methods
- [ ] Test all filter combinations
**Estimated Time:** 2 hours

---

### Day 2: Grouping, Search & Links

#### Task 2.1: Create DateGroup Component
- [ ] Create `src/components/bank-accounts/DateGroup.tsx`
- [ ] Display date header with day of week
- [ ] Calculate and show daily total
- [ ] Color-code daily total (green/red)
- [ ] Make expandable/collapsible
- [ ] Add smooth animations
**Estimated Time:** 1.5 hours

#### Task 2.2: Create MovementRow Component
- [ ] Create `src/components/bank-accounts/MovementRow.tsx`
- [ ] Add icon based on source type
- [ ] Display time, description, method badge
- [ ] Display amount with color coding
- [ ] Add "View Details" button
- [ ] Make responsive (stack on mobile)
**Estimated Time:** 1 hour

#### Task 2.3: Implement Movement Grouping
- [ ] Add grouping logic in AccountStatementView
- [ ] Group movements by date
- [ ] Sort groups by date (newest first)
- [ ] Integrate DateGroup component
- [ ] Integrate MovementRow component
- [ ] Test with various date ranges
**Estimated Time:** 1.5 hours

#### Task 2.4: Create MovementDetailsDialog
- [ ] Create `src/components/bank-accounts/MovementDetailsDialog.tsx`
- [ ] Fetch full movement details on open
- [ ] Display customer/supplier info
- [ ] Display items list (for sales/purchases)
- [ ] Display payment methods
- [ ] Add link to original transaction
- [ ] Handle all source types (SALE, PURCHASE, REFUND, MANUAL, CREDIT)
**Estimated Time:** 2 hours

#### Task 2.5: Implement Search Functionality
- [ ] Add search state
- [ ] Implement debounced search (300ms)
- [ ] Filter by description, customer name, supplier name
- [ ] Show result count
- [ ] Add clear search button
- [ ] Test with various search terms
**Estimated Time:** 1 hour

#### Task 2.6: Add Transaction Icons
- [ ] Define icon mapping (🛒 Sale, 📦 Purchase, ↩️ Refund, ✏️ Manual, 💳 Credit)
- [ ] Add icon to MovementRow
- [ ] Ensure consistent sizing
- [ ] Add tooltips for icon meaning
**Estimated Time:** 30 minutes

---

### Day 3: Export & Extended Stats

#### Task 3.1: Create ExtendedStatsCards Component
- [ ] Create `src/components/bank-accounts/ExtendedStatsCards.tsx`
- [ ] Display 4 cards: Highest Entry, Highest Exit, Average Ticket, Transaction Count
- [ ] Format currency values
- [ ] Make responsive grid
- [ ] Update based on filters
- [ ] Add loading skeletons
**Estimated Time:** 1.5 hours

#### Task 3.2: Implement PDF Export
- [ ] Install jspdf and jspdf-autotable
- [ ] Create `src/lib/bank-accounts/exportStatementToPDF.ts`
- [ ] Add account header
- [ ] Add summary section
- [ ] Add movements table
- [ ] Format currency and dates
- [ ] Generate filename with account name and dates
- [ ] Test with various data sizes
**Estimated Time:** 2 hours

#### Task 3.3: Implement Excel Export
- [ ] Install papaparse
- [ ] Create `src/lib/bank-accounts/exportStatementToExcel.ts`
- [ ] Convert movements to CSV format
- [ ] Include all columns
- [ ] Format currency and dates
- [ ] Generate filename
- [ ] Trigger download
- [ ] Test with various data sizes
**Estimated Time:** 1 hour

#### Task 3.4: Create ExportButtons Component
- [ ] Create `src/components/bank-accounts/ExportButtons.tsx`
- [ ] Add PDF export button
- [ ] Add Excel export button
- [ ] Show loading state during export
- [ ] Handle export errors
- [ ] Add success toast
**Estimated Time:** 45 minutes

#### Task 3.5: Integrate Extended Stats & Export
- [ ] Add ExtendedStatsCards to AccountStatementView
- [ ] Add ExportButtons to header
- [ ] Fetch extended stats from repository
- [ ] Update stats when filters change
- [ ] Test export with filtered data
**Estimated Time:** 1 hour

---

## PHASE 2: IMPORTANT (Days 4-5)

### Day 4: Charts & Visual Enhancements

#### Task 4.1: Install Chart Library
- [ ] Install recharts
- [ ] Install @types/recharts
- [ ] Test basic chart rendering
**Estimated Time:** 15 minutes

#### Task 4.2: Implement Balance Evolution Query
- [ ] Add SQL query for daily balance points
- [ ] Implement `getBalanceEvolution()` in repository
- [ ] Calculate running balance per day
- [ ] Test with various date ranges
**Estimated Time:** 1 hour

#### Task 4.3: Create BalanceEvolutionChart Component
- [ ] Create `src/components/bank-accounts/BalanceEvolutionChart.tsx`
- [ ] Implement LineChart with recharts
- [ ] Format X-axis (dates)
- [ ] Format Y-axis (currency)
- [ ] Add tooltip with date and balance
- [ ] Make responsive
- [ ] Add loading skeleton
- [ ] Handle empty data
**Estimated Time:** 2 hours

#### Task 4.4: Integrate Chart in AccountStatementView
- [ ] Add chart between summary and filters
- [ ] Fetch balance evolution data
- [ ] Update chart when filters change
- [ ] Add toggle to show/hide chart
- [ ] Test with various periods
**Estimated Time:** 1 hour

#### Task 4.5: Enhance Visual Design
- [ ] Update color scheme for consistency
- [ ] Add hover effects on rows
- [ ] Improve badge styling
- [ ] Add subtle animations
- [ ] Ensure glassmorphism consistency
- [ ] Test dark mode (if applicable)
**Estimated Time:** 1.5 hours

#### Task 4.6: Add Method & Source Badges
- [ ] Create badge component for payment methods
- [ ] Add color coding (PIX=green, Card=blue, Cash=amber, etc)
- [ ] Create badge for source types
- [ ] Integrate in MovementRow
- [ ] Make responsive
**Estimated Time:** 1 hour

---

### Day 5: Pagination & Sorting

#### Task 5.1: Implement Pagination Logic
- [ ] Add pagination state (page, itemsPerPage)
- [ ] Calculate total pages
- [ ] Slice movements for current page
- [ ] Update repository to support pagination
- [ ] Test with large datasets
**Estimated Time:** 1.5 hours

#### Task 5.2: Create Pagination Component
- [ ] Create `src/components/bank-accounts/StatementPagination.tsx`
- [ ] Add Previous/Next buttons
- [ ] Add page number buttons (with ellipsis for many pages)
- [ ] Show current range (e.g., "1-50 of 234")
- [ ] Disable buttons appropriately
- [ ] Make responsive
**Estimated Time:** 1.5 hours

#### Task 5.3: Integrate Pagination
- [ ] Add pagination component to AccountStatementView
- [ ] Handle page changes
- [ ] Scroll to top on page change
- [ ] Maintain filters when changing pages
- [ ] Update URL with page parameter (optional)
- [ ] Test navigation
**Estimated Time:** 1 hour

#### Task 5.4: Implement Column Sorting
- [ ] Add sort state (sortBy, sortOrder)
- [ ] Make column headers clickable
- [ ] Add sort direction indicator (↑↓)
- [ ] Implement sort logic for date, amount, description
- [ ] Update table header styling
- [ ] Test all sort combinations
**Estimated Time:** 1.5 hours

#### Task 5.5: Add Sorting UI
- [ ] Update table headers with sort buttons
- [ ] Add visual feedback on hover
- [ ] Show active sort column
- [ ] Add keyboard support (Enter to sort)
- [ ] Test accessibility
**Estimated Time:** 1 hour

---

## PHASE 3: DESIRABLE (Days 6-7)

### Day 6: Polish & UX Improvements

#### Task 6.1: Create Empty State Component
- [ ] Create `src/components/bank-accounts/EmptyStatementState.tsx`
- [ ] Add friendly illustration/icon
- [ ] Different messages for: no movements vs filtered results
- [ ] Add suggestions (adjust filters, add transaction)
- [ ] Add CTA button
- [ ] Make responsive
**Estimated Time:** 1 hour

#### Task 6.2: Add Loading Skeletons
- [ ] Create skeleton for summary cards
- [ ] Create skeleton for stats cards
- [ ] Create skeleton for chart
- [ ] Create skeleton for movement rows
- [ ] Integrate in AccountStatementView
- [ ] Test loading states
**Estimated Time:** 1.5 hours

#### Task 6.3: Implement View Mode Toggle
- [ ] Add viewMode state (compact/detailed)
- [ ] Create toggle button component
- [ ] Implement compact view (fewer columns)
- [ ] Implement detailed view (all columns)
- [ ] Save preference to localStorage
- [ ] Make responsive
**Estimated Time:** 1.5 hours

#### Task 6.4: Add Refresh Functionality
- [ ] Add refresh button to header
- [ ] Implement manual refresh
- [ ] Add loading indicator
- [ ] Show last updated timestamp
- [ ] Add keyboard shortcut (Ctrl+R)
- [ ] Test refresh behavior
**Estimated Time:** 1 hour

#### Task 6.5: Improve Mobile Experience
- [ ] Test all features on mobile
- [ ] Adjust touch targets (min 44px)
- [ ] Optimize filter layout for mobile
- [ ] Make table horizontally scrollable
- [ ] Test gestures (swipe, tap)
- [ ] Fix any layout issues
**Estimated Time:** 2 hours

---

### Day 7: Testing & Documentation

#### Task 7.1: Write Unit Tests
- [ ] Test filter logic
- [ ] Test grouping logic
- [ ] Test sorting logic
- [ ] Test pagination calculations
- [ ] Test export functions
- [ ] Achieve >80% coverage
**Estimated Time:** 2 hours

#### Task 7.2: Write Integration Tests
- [ ] Test repository methods
- [ ] Test data fetching
- [ ] Test filter combinations
- [ ] Test error handling
**Estimated Time:** 1.5 hours

#### Task 7.3: E2E Testing
- [ ] Test full user flow
- [ ] Test all filter combinations
- [ ] Test export functionality
- [ ] Test pagination
- [ ] Test mobile experience
**Estimated Time:** 1.5 hours

#### Task 7.4: Accessibility Audit
- [ ] Run automated accessibility tests
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Fix any issues found
- [ ] Document accessibility features
**Estimated Time:** 1 hour

#### Task 7.5: Performance Testing
- [ ] Test with large datasets (1000+ movements)
- [ ] Measure load times
- [ ] Optimize slow queries
- [ ] Add performance monitoring
- [ ] Document performance metrics
**Estimated Time:** 1 hour

#### Task 7.6: Update Documentation
- [ ] Update PRD with new features
- [ ] Update Inventário
- [ ] Create user guide
- [ ] Document API changes
- [ ] Add inline code comments
**Estimated Time:** 1.5 hours

---

## PHASE 4: FINAL POLISH (Day 8)

### Day 8: Bug Fixes & Deployment

#### Task 8.1: Bug Fixing
- [ ] Review all reported issues
- [ ] Fix critical bugs
- [ ] Fix UI inconsistencies
- [ ] Test fixes
**Estimated Time:** 2 hours

#### Task 8.2: Code Review & Refactoring
- [ ] Self code review
- [ ] Refactor complex logic
- [ ] Improve code comments
- [ ] Remove console.logs
- [ ] Check for code duplication
**Estimated Time:** 1.5 hours

#### Task 8.3: Final Testing
- [ ] Full regression test
- [ ] Test on all browsers
- [ ] Test on all devices
- [ ] Verify all acceptance criteria
**Estimated Time:** 1.5 hours

#### Task 8.4: Build & Deploy
- [ ] Run production build
- [ ] Fix any build errors
- [ ] Test production build locally
- [ ] Deploy to staging
- [ ] Smoke test on staging
- [ ] Deploy to production
**Estimated Time:** 1 hour

#### Task 8.5: Post-Deployment
- [ ] Monitor for errors
- [ ] Check performance metrics
- [ ] Gather initial user feedback
- [ ] Create follow-up tasks if needed
**Estimated Time:** 1 hour

---

## Summary

**Total Tasks:** 68  
**Estimated Time:** 6-8 days  
**Priority:** High  
**Dependencies:** Existing bank accounts system, recharts, jspdf, papaparse

## Success Criteria
- [ ] All 17 user stories implemented
- [ ] All tests passing
- [ ] Build successful
- [ ] Performance targets met
- [ ] Accessibility compliant
- [ ] Documentation complete
- [ ] User feedback positive

## Risks & Mitigation
- **Risk:** Large datasets causing performance issues  
  **Mitigation:** Implement pagination and virtual scrolling
  
- **Risk:** Complex filter combinations causing bugs  
  **Mitigation:** Comprehensive testing of all combinations
  
- **Risk:** Export functionality failing with large data  
  **Mitigation:** Add data size limits and streaming for large exports
  
- **Risk:** Mobile experience not optimal  
  **Mitigation:** Test early and often on real devices

## Notes
- Prioritize Phase 1 tasks - they provide the most value
- Phase 2-4 can be adjusted based on user feedback
- Consider feature flags for gradual rollout
- Monitor performance metrics closely
