# TournamentBracket Component UX Specification

## Overview
Visualizes tournament progress with bracket format, showing matchups and results.

## User Stories
- As a user, I want to see the tournament bracket structure
- As a user, I want to view match details (participants, odds, start time)
- As a user, I want to place bets on individual matches
- As a user, I want to see real-time updates as matches progress
- As a user, I want to navigate between different tournament stages

## Design Requirements
1. **Layout**: 
   - Responsive bracket visualization
   - Horizontal on desktop, vertical on mobile
   - Collapsible sections for large tournaments
2. **Match Components**:
   - Participant avatars and names
   - Odds display
   - Current score (if in progress)
   - Start time/status indicator
   - Bet placement button
3. **Navigation**:
   - Tournament stage selector (Quarterfinals, Semifinals, Finals)
   - Scrollable bracket area with position indicators
4. **Interactive Elements**:
   - Hover over match: Highlight connected matches
   - Click match: Expand to show details and betting interface
   - Click participant: View participant profile
5. **Empty State**: "No active tournaments" message with link to create tournament
6. **Loading State**: Skeleton bracket structure with placeholder matches
7. **Accessibility**:
   - ARIA roles for bracket navigation
   - Screen reader support for match information
   - Color-blind friendly status indicators

## Interaction Design
- Animated transitions between tournament stages
- Smooth scrolling through bracket
- Real-time updates via websockets
- Bet placement modal appears when clicking "Place Bet"

## Visual Design
- Clean lines connecting matches
- Color-coded match status (upcoming, live, completed)
- Consistent with MarketList card styling
- Victory path highlighting for winners

## Mockup
![TournamentBracket component mockup](public/games/tournament-bracket-preview.png)