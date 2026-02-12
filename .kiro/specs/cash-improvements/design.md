# Cash Page Improvements - Design Document

**Feature:** cash-improvements
**Status:** Design Draft
**Created:** 2026-02-12
**Language:** TypeScript (Next.js 14+ with App Router)

## 1. Overview

This design document specifies the implementation of comprehensive improvements to the Cash page (Livro Caixa). The improvements focus on enhanced temporal navigation, payment grouping, transaction context, advanced filtering, and export capabilities while maintaining the existing glassmorphism design system and repository pattern architecture.

### Key Improvements

1. **Enhanced Date Navigation**: Month/year navigation with visual period display
2. **Payment Grouping**: Group multiple payments from the same sale/purchase
3. **Transaction Details**: Modal with complete transaction information and links
4. **Advanced Filters**: Multi-criteria filtering (type, method, source, text search)
5. **Date Range Picker**: Calendar-based custom date selection
6. **Export Functionality**: PDF and Excel/CSV export with filtered data
7. **Payment Method Summary**: Aggregated view by payment method

### Design Principles

- **No Database Changes**: All functionality implemented in frontend
- **Server Components First**: Leverage Next.js App Router server components
- **Client Components When Needed**: Use client components only for interactivity
- **Existing Patterns**: Follow established repository and use case patterns
- **Glassmorphism Consistency**: Maintain visual design language
- **Progressive Enhancement**: Build incrementally, test continuously

## 2. Architecture

### 2.1. Component Hierarchy

```
app/(app)/cash/page.tsx (Server Component)
├── CashHeader
│   ├── NewTransactionDialog (existing)
│   └── ExportButton (new)
├── DateNavigator (new - replaces DateFilter)
│   ├── MonthYearDisplay
│   ├── NavigationButtons
│   ├── QuickFilters
│   └── DateRangePicker
├── CashFilters (new)
│   ├── TypeFilter
│   ├── MethodFilter
│   ├── SourceFilter
│   └── TextSearch
├── CashSummaryCards (existing - enhanced)
│   └── PaymentMethodSummary (new)
└── CashList (enhanced)
    ├── CashMovementGroup (new)
    │   ├── GroupHeader
    │   └── GroupedRows
    ├── CashMovementRow (refactored)
    └── CashMovementDetailsDialog (new)
```

### 2.2. Data Flow

```
User Action → URL Search Params → Server Component → Use Cases → Repository → Supabase
                                        ↓
                                  Client Components (hydration)
                                        ↓
                                  Local Filtering/Grouping
```

### 2.3. State Management

- **Server State**: Date range via URL search params (`start`, `end`)
- **Client State**: 
  - Active filters (type, method, source, search text)
  - Expanded groups (Set<string>)
  - Selected movement for details modal
  - Export dialog state

## 3. Components and Interfaces

### 3.1. DateNavigator Component

**Purpose**: Replace DateFilter with enhanced temporal navigation

**Props**:
```typescript
interface DateNavigatorProps {
  currentStart: Date
  currentEnd: Date
}
```

**Features**:
- Month/year display with clear formatting
- Previous/Next month navigation buttons
- Quick filter buttons (Hoje, Ontem, 7 Dias, 30 Dias, Mês Atual, Ano Atual)
- Custom date range picker
- Visual feedback for active filter

**Implementation Notes**:
- Client component (needs interactivity)
- Uses `useRouter` and `useSearchParams` for URL manipulation
- Integrates `react-day-picker` for calendar (via shadcn/ui)

### 3.2. CashFilters Component

**Purpose**: Multi-criteria filtering interface

**Props**:
```typescript
interface CashFiltersProps {
  movements: CashMovement[]
  onFilteredChange: (filtered: CashMovement[]) => void
}
```

**State**:
```typescript
interface FilterState {
  type: 'ALL' | 'IN' | 'OUT'
  method: 'ALL' | 'CASH' | 'PIX' | 'CARD' | 'TRANSFER' | 'WALLET'
  source: 'ALL' | 'SALE' | 'REFUND' | 'PURCHASE' | 'MANUAL'
  searchText: string
}
```

**Features**:
- Dropdown/button group for each filter dimension
- Text input for search with debounce
- Result counter showing filtered count
- Clear all filters button
- Filters combine with AND logic

**Implementation Notes**:
- Client component
- Uses `useMemo` for efficient filtering
- Debounced search (300ms) using `useDebounce` hook

### 3.3. CashMovementGroup Component

**Purpose**: Display grouped payments from same sale/purchase

**Props**:
```typescript
interface CashMovementGroupProps {
  sourceId: string
  movements: CashMovement[]
  customerName?: string
  isExpanded: boolean
  onToggle: () => void
}
```

**Display Logic**:
- **Header Row**: Customer/Supplier name, total amount, expand icon
- **Child Rows**: Individual payment methods with amounts
- **Change Display**: Show change amount when applicable
- **Visual Distinction**: Border, background color, indentation

**Implementation Notes**:
- Client component (expandable state)
- Calculates total from child movements
- Fetches customer/supplier name from sourceId

### 3.4. CashMovementDetailsDialog Component

**Purpose**: Show complete transaction details in modal

**Props**:
```typescript
interface CashMovementDetailsDialogProps {
  movement: CashMovement
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

**Content**:
- Customer/Supplier name
- Full date and time
- Payment method(s)
- Items sold/purchased (if applicable)
- Notes/observations
- Link to original sale/purchase

**Implementation Notes**:
- Client component (dialog state)
- Uses shadcn/ui Dialog component
- Fetches related data (customer, items) on open
- Link uses Next.js `<Link>` component

### 3.5. PaymentMethodSummary Component

**Purpose**: Aggregate and display totals by payment method

**Props**:
```typescript
interface PaymentMethodSummaryProps {
  movements: CashMovement[]
}
```

**Display**:
- Card with list of methods and totals
- Simple bar chart or pie chart visualization
- Respects active filters

**Implementation Notes**:
- Client component (receives filtered movements)
- Uses `recharts` for visualization
- Calculates aggregates with `reduce`

### 3.6. ExportButton Component

**Purpose**: Export filtered data to PDF or Excel/CSV

**Props**:
```typescript
interface ExportButtonProps {
  movements: CashMovement[]
  summary: CashSummary
  period: { start: Date; end: Date }
}
```

**Features**:
- Dropdown menu with PDF and Excel options
- PDF includes logo, period, summary, movement list
- Excel/CSV includes all columns for analysis

**Implementation Notes**:
- Client component
- Uses `jspdf` and `jspdf-autotable` for PDF generation
- Uses `papaparse` for CSV generation
- Triggers browser download

## 4. Data Models

### 4.1. Existing Models (No Changes)

```typescript
interface CashMovement {
  id: string
  tenantId: string
  type: 'IN' | 'OUT'
  amount: number
  method: 'CASH' | 'PIX' | 'CARD' | 'TRANSFER' | 'WALLET'
  sourceType: 'SALE' | 'REFUND' | 'PURCHASE' | 'MANUAL'
  sourceId?: string | null
  description?: string
  occurredAt: Date
  createdBy?: string
  createdAt: Date
}

interface CashSummary {
  totalIn: number
  totalOut: number
  balance: number
}
```

### 4.2. New Helper Types

```typescript
// Grouped movements for display
interface MovementGroup {
  sourceId: string
  sourceType: 'SALE' | 'PURCHASE'
  movements: CashMovement[]
  customerName?: string
  supplierName?: string
  total: number
  isExpanded: boolean
}

// Filter state
interface FilterState {
  type: 'ALL' | 'IN' | 'OUT'
  method: 'ALL' | 'CASH' | 'PIX' | 'CARD' | 'TRANSFER' | 'WALLET'
  source: 'ALL' | 'SALE' | 'REFUND' | 'PURCHASE' | 'MANUAL'
  searchText: string
}

// Export data structure
interface ExportData {
  period: { start: Date; end: Date }
  summary: CashSummary
  movements: CashMovement[]
  methodSummary: Record<string, number>
}
```

### 4.3. Grouping Logic

**Algorithm**:
```typescript
function groupMovements(movements: CashMovement[]): (CashMovement | MovementGroup)[] {
  // 1. Separate movements with and without sourceId
  const withSource = movements.filter(m => m.sourceId && (m.sourceType === 'SALE' || m.sourceType === 'PURCHASE'))
  const withoutSource = movements.filter(m => !m.sourceId || (m.sourceType !== 'SALE' && m.sourceType !== 'PURCHASE'))
  
  // 2. Group by sourceId
  const grouped = withSource.reduce((acc, movement) => {
    const key = movement.sourceId!
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(movement)
    return acc
  }, {} as Record<string, CashMovement[]>)
  
  // 3. Create MovementGroup objects for groups with multiple movements
  const groups: MovementGroup[] = Object.entries(grouped)
    .filter(([_, movements]) => movements.length > 1)
    .map(([sourceId, movements]) => ({
      sourceId,
      sourceType: movements[0].sourceType as 'SALE' | 'PURCHASE',
      movements,
      total: movements.reduce((sum, m) => sum + (m.type === 'IN' ? m.amount : -m.amount), 0),
      isExpanded: false
    }))
  
  // 4. Get single movements (not grouped)
  const singles = Object.entries(grouped)
    .filter(([_, movements]) => movements.length === 1)
    .flatMap(([_, movements]) => movements)
  
  // 5. Combine and sort by date
  const combined = [...groups, ...singles, ...withoutSource]
  return combined.sort((a, b) => {
    const dateA = 'movements' in a ? a.movements[0].occurredAt : a.occurredAt
    const dateB = 'movements' in b ? b.movements[0].occurredAt : b.occurredAt
    return dateB.getTime() - dateA.getTime()
  })
}
```

## 5. Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Movement Grouping Consistency

*For any* set of cash movements with the same non-null `sourceId` and `sourceType` of 'SALE' or 'PURCHASE', if there are multiple movements, they should be grouped together into a single `MovementGroup` object.

**Validates: Requirements AC2.1, AC2.6**

### Property 2: Change Display Condition

*For any* payment movement, if the movement has associated change data (change > 0), then the change amount should be displayed in the UI.

**Validates: Requirements AC2.4**

### Property 3: Description Enrichment

*For any* cash movement linked to a sale or purchase (has non-null `sourceId`), the displayed description should include the customer or supplier name.

**Validates: Requirements AC3.3**

### Property 4: Type Filter Correctness

*For any* filter state with type set to 'IN' or 'OUT', all displayed movements should have a matching `type` field.

**Validates: Requirements AC4.1**

### Property 5: Method Filter Correctness

*For any* filter state with method set to a specific value (not 'ALL'), all displayed movements should have a matching `method` field.

**Validates: Requirements AC4.2**

### Property 6: Source Filter Correctness

*For any* filter state with source set to a specific value (not 'ALL'), all displayed movements should have a matching `sourceType` field.

**Validates: Requirements AC4.3**

### Property 7: Text Search Correctness

*For any* non-empty search text, all displayed movements should have a `description` field that contains the search text (case-insensitive).

**Validates: Requirements AC4.4**

### Property 8: Combined Filter Correctness

*For any* combination of active filters (type, method, source, search text), all displayed movements should satisfy ALL active filter conditions simultaneously.

**Validates: Requirements AC4.5**

### Property 9: Filter Count Accuracy

*For any* filter state, the displayed count should equal the number of movements that pass all active filters.

**Validates: Requirements AC4.6**

### Property 10: Export Data Consistency

*For any* export operation, the exported data should exactly match the currently filtered and displayed movements.

**Validates: Requirements AC6.3**

### Property 11: Payment Method Aggregation Correctness

*For any* set of movements, the sum of amounts per payment method should equal the sum of all movements with that method, and the total across all methods should equal the total of all movements.

**Validates: Requirements AC7.2, AC7.4**

## 6. Error Handling

### 6.1. Date Navigation Errors

**Scenario**: Invalid date parameters in URL
**Handling**: 
- Validate dates on server component
- Fall back to current month if invalid
- Log warning for debugging

**Scenario**: Future date selection
**Handling**:
- Allow future dates (for planning)
- Show warning if no data exists

### 6.2. Grouping Errors

**Scenario**: Missing customer/supplier data for grouped movements
**Handling**:
- Display "Cliente não encontrado" / "Fornecedor não encontrado"
- Still show grouped movements with available data
- Log missing reference for investigation

**Scenario**: Inconsistent sourceType in group
**Handling**:
- Should not occur (data integrity issue)
- If occurs, log error and display ungrouped
- Add data validation in use case layer

### 6.3. Export Errors

**Scenario**: Export fails (PDF/CSV generation error)
**Handling**:
- Show toast notification with error message
- Log full error for debugging
- Offer retry option

**Scenario**: Large dataset export (>10,000 movements)
**Handling**:
- Show warning before export
- Suggest narrowing date range
- Implement streaming for CSV if needed

### 6.4. Filter Errors

**Scenario**: No movements match filters
**Handling**:
- Display "Nenhuma movimentação encontrada com os filtros aplicados"
- Show "Limpar Filtros" button
- Keep filter state visible for adjustment

## 7. Testing Strategy

### 7.1. Property-Based Testing

We will use **fast-check** (TypeScript property-based testing library) to validate universal properties across generated inputs. Each property test will run a minimum of 100 iterations.

**Test Configuration**:
```typescript
import fc from 'fast-check'

// Arbitrary generators
const cashMovementArbitrary = fc.record({
  id: fc.uuid(),
  tenantId: fc.uuid(),
  type: fc.constantFrom('IN', 'OUT'),
  amount: fc.float({ min: 0.01, max: 10000, noNaN: true }),
  method: fc.constantFrom('CASH', 'PIX', 'CARD', 'TRANSFER', 'WALLET'),
  sourceType: fc.constantFrom('SALE', 'REFUND', 'PURCHASE', 'MANUAL'),
  sourceId: fc.option(fc.uuid(), { nil: null }),
  description: fc.option(fc.string(), { nil: undefined }),
  occurredAt: fc.date(),
  createdAt: fc.date()
})
```

**Property Test Examples**:

1. **Grouping Property**: For any list of movements, grouped movements should maintain all original movements
2. **Filter Property**: For any filter state, filtered movements should be a subset of original movements
3. **Aggregation Property**: For any list of movements, sum of method totals should equal overall total

### 7.2. Unit Testing

Unit tests will focus on specific examples, edge cases, and integration points:

**Component Tests**:
- DateNavigator: Quick filter buttons update URL correctly
- CashFilters: Each filter dimension works independently
- CashMovementGroup: Expand/collapse toggles correctly
- ExportButton: PDF/CSV generation produces valid output

**Edge Cases**:
- Empty movement list
- Single movement (no grouping)
- All movements from same sale (single group)
- Movements with null/undefined descriptions
- Very large amounts (formatting)
- Date boundaries (start/end of month)

**Integration Tests**:
- Full filter flow: Apply multiple filters, verify count and display
- Export flow: Filter movements, export, verify content
- Navigation flow: Change date range, verify data refresh

### 7.3. Test Organization

```
__tests__/
├── unit/
│   ├── components/
│   │   ├── DateNavigator.test.tsx
│   │   ├── CashFilters.test.tsx
│   │   ├── CashMovementGroup.test.tsx
│   │   └── ExportButton.test.tsx
│   └── utils/
│       ├── groupMovements.test.ts
│       ├── filterMovements.test.ts
│       └── aggregateByMethod.test.ts
└── properties/
    ├── grouping.property.test.ts
    ├── filtering.property.test.ts
    └── aggregation.property.test.ts
```

## 8. Implementation Phases

### Phase 1: Date Navigation Enhancement (Day 1)
- Replace DateFilter with DateNavigator
- Add month/year display and navigation
- Implement quick filters with visual feedback
- Add date range picker integration

### Phase 2: Payment Grouping (Day 2)
- Implement grouping algorithm
- Create CashMovementGroup component
- Add expand/collapse functionality
- Fetch and display customer/supplier names

### Phase 3: Transaction Details (Day 3)
- Create CashMovementDetailsDialog component
- Fetch related data (items, customer info)
- Add navigation links to sales/purchases
- Enhance descriptions with context

### Phase 4: Advanced Filters (Day 4)
- Create CashFilters component
- Implement multi-criteria filtering logic
- Add text search with debounce
- Display filter count

### Phase 5: Export Functionality (Day 5)
- Create ExportButton component
- Implement PDF generation with jspdf
- Implement CSV generation with papaparse
- Add export dialog with options

### Phase 6: Payment Method Summary (Day 6)
- Create PaymentMethodSummary component
- Implement aggregation logic
- Add chart visualization with recharts
- Integrate with filter system

## 9. Dependencies

### 9.1. New Dependencies

```json
{
  "dependencies": {
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.2",
    "papaparse": "^5.4.1",
    "recharts": "^2.10.3"
  },
  "devDependencies": {
    "@types/papaparse": "^5.3.14",
    "fast-check": "^3.15.0"
  }
}
```

### 9.2. Existing Dependencies (Already Available)

- `react-day-picker`: Date picker (via shadcn/ui)
- `date-fns`: Date manipulation
- `lucide-react`: Icons
- `shadcn/ui`: UI components

## 10. Performance Considerations

### 10.1. Optimization Strategies

**Client-Side Filtering**:
- Use `useMemo` to cache filtered results
- Debounce text search (300ms)
- Avoid re-filtering on unrelated state changes

**Grouping Performance**:
- Group once, cache result
- Only re-group when movements change
- Use Map for O(1) lookups

**Large Datasets**:
- Consider pagination if >1000 movements
- Implement virtual scrolling for very large lists
- Limit export to reasonable date ranges

### 10.2. Bundle Size

**Code Splitting**:
- Lazy load export functionality (PDF/CSV libraries)
- Lazy load chart library (recharts)
- Keep core filtering in main bundle

**Expected Impact**:
- jspdf + jspdf-autotable: ~150KB
- papaparse: ~50KB
- recharts: ~400KB
- Total additional: ~600KB (lazy loaded)

## 11. Accessibility

### 11.1. Keyboard Navigation

- All filters accessible via keyboard
- Tab order follows visual flow
- Enter/Space to activate buttons
- Escape to close dialogs

### 11.2. Screen Readers

- Proper ARIA labels for all interactive elements
- Announce filter changes
- Describe grouped movements clearly
- Provide text alternatives for charts

### 11.3. Visual Accessibility

- Maintain sufficient color contrast
- Don't rely solely on color for information
- Provide text labels alongside icons
- Support browser zoom up to 200%

## 12. Security Considerations

### 12.1. Data Access

- All data filtered by tenantId (existing pattern)
- No new security concerns (read-only operations)
- Export respects tenant isolation

### 12.2. Input Validation

- Validate date parameters on server
- Sanitize search text input
- Limit export date ranges to prevent abuse

## 13. Migration and Rollout

### 13.1. Backward Compatibility

- No database changes required
- Existing URLs with date params continue to work
- Graceful degradation if JavaScript disabled (server-rendered table)

### 13.2. Feature Flags

Not required - all changes are additive and non-breaking

### 13.3. Rollout Plan

1. Deploy Phase 1-2 (navigation + grouping) - core improvements
2. Gather user feedback
3. Deploy Phase 3-4 (details + filters) - enhanced functionality
4. Deploy Phase 5-6 (export + summary) - advanced features

## 14. Future Enhancements

### 14.1. Potential Improvements

- Real-time updates via Supabase subscriptions
- Saved filter presets
- Scheduled exports via email
- Advanced analytics dashboard
- Comparison between periods
- Cash flow forecasting

### 14.2. Technical Debt

- Consider moving filtering to server-side for very large datasets
- Implement proper pagination instead of loading all movements
- Add caching layer for frequently accessed data

---

**Design Status**: Ready for Review
**Next Step**: Create tasks.md with implementation plan
