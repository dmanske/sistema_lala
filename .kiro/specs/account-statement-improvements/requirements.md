# Account Statement Improvements - Requirements

**Version:** 1.0  
**Date:** 2026-02-12  
**Status:** Approved for Implementation

## Overview
Complete overhaul of the bank account statement view to provide better filtering, visualization, and usability for financial tracking and analysis.

## User Stories

### US-1: Quick Period Filters
**As a** salon owner  
**I want** quick access to common time periods  
**So that** I can view my account movements without manually entering dates

**Acceptance Criteria:**
- Quick filter buttons: Today, Yesterday, 7 Days, 30 Days, This Month, Last Month
- Custom date range option remains available
- Active filter is visually highlighted
- Filters update the statement immediately

### US-2: Date Grouping
**As a** salon owner  
**I want** movements grouped by date with daily subtotals  
**So that** I can easily see my daily cash flow

**Acceptance Criteria:**
- Movements grouped by day (most recent first)
- Each day shows: date, day of week, daily total
- Daily total shows net (entries - exits)
- Expandable/collapsible groups
- Visual distinction between days

### US-3: Text Search
**As a** salon owner  
**I want** to search movements by text  
**So that** I can quickly find specific transactions

**Acceptance Criteria:**
- Search field filters by description, customer name, supplier name
- Real-time filtering as user types
- Case-insensitive search
- Clear button to reset search
- Shows count of filtered results

### US-4: Type Filter
**As a** salon owner  
**I want** to filter by entry/exit type  
**So that** I can analyze income or expenses separately

**Acceptance Criteria:**
- Filter buttons: All, Entries, Exits
- Active filter visually highlighted
- Updates totals to reflect filtered data
- Combines with other filters

### US-5: Payment Method Filter
**As a** salon owner  
**I want** to filter by payment method  
**So that** I can see transactions by PIX, Card, Cash, etc.

**Acceptance Criteria:**
- Dropdown with all payment methods
- "All" option to clear filter
- Shows only movements with selected method
- Combines with other filters

### US-6: Source Filter
**As a** salon owner  
**I want** to filter by transaction source  
**So that** I can separate sales, purchases, refunds, and manual entries

**Acceptance Criteria:**
- Dropdown with sources: All, Sales, Purchases, Refunds, Manual, Credit
- Shows only movements from selected source
- Combines with other filters

### US-7: Visual Icons
**As a** salon owner  
**I want** visual icons for each transaction type  
**So that** I can quickly identify transaction categories

**Acceptance Criteria:**
- Icons for: Sale (🛒), Purchase (📦), Refund (↩️), Manual (✏️), Credit (💳)
- Icons shown next to description
- Consistent icon set across the app
- Color-coded by type (green/red)

### US-8: Balance Evolution Chart
**As a** salon owner  
**I want** a chart showing balance evolution over time  
**So that** I can visualize my account trends

**Acceptance Criteria:**
- Line chart showing balance over filtered period
- X-axis: dates, Y-axis: balance
- Responsive and mobile-friendly
- Updates based on active filters
- Shows min/max balance points

### US-9: Expanded Statistics
**As a** salon owner  
**I want** more detailed statistics about my account  
**So that** I can better understand my financial patterns

**Acceptance Criteria:**
- Cards showing: Highest Entry, Highest Exit, Average Ticket, Transaction Count
- All values formatted as currency (except count)
- Updates based on active filters
- Responsive grid layout

### US-10: Transaction Links
**As a** salon owner  
**I want** to click on a transaction to see its details  
**So that** I can access the original sale/purchase/refund

**Acceptance Criteria:**
- Clickable link/button on each movement
- Opens modal with full transaction details
- Shows: customer/supplier, items, payment methods, notes
- Link to original transaction page (sale/purchase)
- Works for all transaction types

### US-11: Pagination
**As a** salon owner  
**I want** movements paginated  
**So that** the page loads quickly even with many transactions

**Acceptance Criteria:**
- Show 50 movements per page by default
- Page navigation: Previous, Next, page numbers
- Shows total count and current range
- Maintains filters when changing pages
- Smooth scroll to top on page change

### US-12: Export Functionality
**As a** salon owner  
**I want** to export my statement to PDF and Excel  
**So that** I can share with my accountant or keep records

**Acceptance Criteria:**
- Export buttons: PDF and Excel
- PDF includes: account info, period, filters, summary, movements table
- Excel includes all columns with proper formatting
- Respects active filters
- Filename includes account name and date range
- Professional formatting

### US-13: Custom Sorting
**As a** salon owner  
**I want** to sort movements by different columns  
**So that** I can analyze data in different ways

**Acceptance Criteria:**
- Clickable column headers: Date, Description, Amount
- Toggle between ascending/descending
- Visual indicator of sort direction
- Maintains other filters
- Default: Date descending (newest first)

### US-14: Empty State
**As a** salon owner  
**I want** helpful guidance when no movements are found  
**So that** I understand why and what to do next

**Acceptance Criteria:**
- Shows when no movements match filters
- Friendly message explaining situation
- Suggestions: adjust filters, add transaction
- CTA button to add new transaction
- Different message for truly empty account vs filtered results

### US-15: Loading States
**As a** salon owner  
**I want** visual feedback while data loads  
**So that** I know the system is working

**Acceptance Criteria:**
- Skeleton loaders for cards and table
- Smooth transitions when data arrives
- Loading indicator on filter changes
- No layout shift when loading completes

### US-16: Compact/Detailed View Toggle
**As a** salon owner  
**I want** to switch between compact and detailed views  
**So that** I can see more data or more details as needed

**Acceptance Criteria:**
- Toggle button: Compact / Detailed
- Compact: fewer columns, more rows visible
- Detailed: all columns, full information
- Preference saved in localStorage
- Responsive behavior

### US-17: Real-time Updates
**As a** salon owner  
**I want** the statement to update automatically  
**So that** I always see current data

**Acceptance Criteria:**
- Refresh button to manually update
- Auto-refresh every 30 seconds (optional)
- Visual indicator when new data available
- Smooth update without losing scroll position
- Maintains active filters

## Non-Functional Requirements

### Performance
- Initial load < 2 seconds
- Filter application < 500ms
- Smooth scrolling and animations
- Efficient data fetching (pagination)

### Usability
- Mobile-responsive design
- Touch-friendly controls
- Keyboard navigation support
- Clear visual hierarchy

### Accessibility
- ARIA labels on all interactive elements
- Keyboard shortcuts for common actions
- Screen reader friendly
- High contrast mode support

### Browser Support
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Out of Scope
- Editing past transactions
- Deleting transactions
- Bulk operations
- Transaction categories/tags
- Recurring transaction detection
- Budget tracking
- Forecasting

## Success Metrics
- Time to find specific transaction < 10 seconds
- User satisfaction score > 4.5/5
- Export usage > 20% of users
- Filter usage > 60% of sessions
- Mobile usage without issues

## Dependencies
- Existing BankAccount domain model
- Existing cash_movements table
- Chart library (recharts)
- Export libraries (jspdf, papaparse)

## Timeline
- Phase 1 (Essentials): 2-3 days
- Phase 2 (Important): 2 days
- Phase 3 (Desirable): 1-2 days
- Phase 4 (Polish): 1 day
- **Total:** 6-8 days
