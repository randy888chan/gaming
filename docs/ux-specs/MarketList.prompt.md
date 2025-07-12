# MarketList Component Implementation Prompt

## Component Location
`src/components/polymarket/MarketList.tsx`

## Design Reference
- Follow UX spec: [`docs/ux-specs/MarketList.md`](docs/ux-specs/MarketList.md:1)
- Use existing Card component: [`src/components/ui/card.tsx`](src/components/ui/card.tsx:1)
- Use existing Dropdown component: [`src/components/Dropdown.tsx`](src/components/Dropdown.tsx:1)

## Props Interface
```typescript
interface MarketListProps {
  markets: Array<{
    id: string;
    title: string;
    category: string;
    volume: number;
    endDate: Date;
    outcomes: Array<{name: string; probability: number}>;
  }>;
  onMarketSelect: (marketId: string) => void;
}
```

## Implementation Requirements
1. **Responsive Grid Layout**:
   - Desktop: 3 columns
   - Tablet: 2 columns (max-width: 1024px)
   - Mobile: 1 column (max-width: 640px)
   - Use CSS grid with responsive breakpoints

2. **Market Card**:
   - Use `<Card>` component from ui library
   - Display:
     - Title (truncated after 2 lines)
     - Category badge using `<Badge>` component
     - Volume formatted as USDC (e.g., "1.2K USDC")
     - Time remaining with progress bar
     - Outcome probabilities as horizontal bars

3. **Filtering & Sorting**:
   - Implement filter dropdown for categories
   - Implement sort dropdown with options: "Volume", "Ending Soon", "Newest"
   - Use state management for filter/sort values
   - Debounce filter changes

4. **Empty State**:
   - Display when no markets match filters
   - Include illustration and message

5. **Loading State**:
   - Show skeleton loader with 6 card placeholders
   - Use `<Skeleton>` component from ui library

6. **Accessibility**:
   - Ensure ARIA attributes for filter/sort controls
   - Keyboard navigation support
   - Color contrast meets WCAG AA standards

## Sample Implementation Snippet
```tsx
// Filter and sort state
const [categoryFilter, setCategoryFilter] = useState<string>('All');
const [sortBy, setSortBy] = useState<string>('volume');

// Filtered and sorted markets
const filteredMarkets = useMemo(() => {
  let result = [...markets];
  if (categoryFilter !== 'All') {
    result = result.filter(market => market.category === categoryFilter);
  }
  // Sorting logic
  return result.sort((a, b) => {
    if (sortBy === 'volume') return b.volume - a.volume;
    if (sortBy === 'ending') return a.endDate.getTime() - b.endDate.getTime();
    return b.endDate.getTime() - a.endDate.getTime();
  });
}, [markets, categoryFilter, sortBy]);

// Render
return (
  <div className="market-list">
    <div className="filters">
      <Dropdown 
        options={CATEGORIES} 
        selected={categoryFilter}
        onChange={setCategoryFilter}
      />
      <Dropdown 
        options={SORT_OPTIONS} 
        selected={sortBy}
        onChange={setSortBy}
      />
    </div>
    {loading ? (
      <SkeletonLoader />
    ) : filteredMarkets.length === 0 ? (
      <EmptyState />
    ) : (
      <div className="grid">
        {filteredMarkets.map(market => (
          <MarketCard 
            key={market.id}
            market={market}
            onClick={() => onMarketSelect(market.id)}
          />
        ))}
      </div>
    )}
  </div>
);