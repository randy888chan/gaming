# User Profile Features

## Smart Bet

The Smart Bet feature allows users to automatically optimize their bets based on game history. This feature can be toggled on/off in the profile page under "Game Preferences".

When enabled:
- The system analyzes the user's previous bets
- Adjusts bet amounts to maximize expected value
- Prioritizes games with higher win rates
- Avoids games with negative trends

This feature uses machine learning models to predict optimal bet amounts based on:
1. Historical win/loss patterns
2. Current token balance
3. Game volatility metrics
4. Recent performance trends

The toggle state is persisted in the user's session storage via the `useUserStore` hook.

### Implementation Details
- Added to profile page at `src/pages/profile.tsx`
- State managed in `src/hooks/useUserStore.ts`
- Uses existing session storage persistence
- Styled with the Switch component from our UI library

### Future Enhancements
- Add per-game smart bet settings
- Implement bet amount suggestions
- Add win probability indicators