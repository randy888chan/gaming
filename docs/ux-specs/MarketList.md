# MarketList Component UX Specification

## Overview
Displays a list of Polymarket prediction markets with filtering and sorting capabilities.

## User Stories
- As a user, I want to browse available markets
- As a user, I want to filter markets by category
- As a user, I want to sort markets by volume, end date, or creation date
- As a user, I want to see market details at a glance

## Design Requirements
1. **Layout**: Card-based grid layout (3 columns on desktop, 2 on tablet, 1 on mobile)
2. **Card Components**:
   - Market title
   - Current volume (USDC)
   - End date/time
   - Outcome probabilities
   - Progress bar for time remaining
3. **Filters**:
   - Category dropdown (Politics, Sports, Crypto, etc.)
   - Status filter (Active, Resolved, Upcoming)
4. **Sorting**:
   - Volume (high to low)
   - Ending soonest
   - Newest
5. **Empty State**: "No markets found" illustration with prompt to check back later
6. **Loading State**: Skeleton loader with 6 card placeholders
7. **Accessibility**:
   - ARIA labels for filter/sort controls
   - Sufficient color contrast
   - Keyboard navigation support

## Interaction Design
- Hover state: Card elevation and subtle shadow
- Click: Navigates to market detail view
- Filter/Sort: Instant results update without page reload

## Visual Design
- Follows existing design system from `src/components/ui`
- Uses Gamba color palette (purple/blue accents)
- Typography: Inter font family
- Icons from Material Design Icons set

## Mockup
![MarketList component mockup](public/games/market-list-preview.png)