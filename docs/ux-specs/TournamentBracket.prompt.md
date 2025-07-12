# TournamentBracket Component Implementation Prompt

## Component Location
`src/components/tournament/TournamentBracket.tsx`

## Design Reference
- Follow UX spec: [`docs/ux-specs/TournamentBracket.md`](docs/ux-specs/TournamentBracket.md:1)
- Use existing Card component: [`src/components/ui/card.tsx`](src/components/ui/card.tsx:1)
- Use existing Button component: [`src/components/ui/button.tsx`](src/components/ui/button.tsx:1)

## Props Interface
```typescript
interface TournamentBracketProps {
  tournament: {
    id: string;
    name: string;
    stages: Array<{
      name: string;
      matches: Array<{
        id: string;
        participant1: { id: string; name: string; avatar: string };
        participant2: { id: string; name: string; avatar: string };
        startTime: Date;
        status: 'upcoming' | 'live' | 'completed';
        score?: [number, number];
        odds?: [number, number];
      }>;
    }>;
  };
  onMatchSelect: (matchId: string) => void;
  onParticipantSelect: (participantId: string) => void;
}
```

## Implementation Requirements
1. **Responsive Bracket Layout**:
   - Desktop: Horizontal layout with multiple columns
   - Mobile: Vertical layout with collapsible sections
   - Use CSS flexbox with media queries

2. **Match Component**:
   - Use `<Card>` component with custom styling
   - Display:
     - Participant avatars and names
     - Status indicator (color-coded)
     - Current score if available
     - Start time/date
     - "Place Bet" button for upcoming matches
   - Highlight connected matches on hover

3. **Navigation**:
   - Stage selector tabs at top
   - Scroll controls for large brackets
   - Current position indicators

4. **Interactions**:
   - Click match: Expand to show details and betting interface
   - Click participant: Trigger onParticipantSelect callback
   - Hover match: Highlight connected matches with CSS transitions

5. **Empty State**:
   - "No active tournaments" message
   - Illustration and call-to-action button

6. **Loading State**:
   - Skeleton bracket structure
   - Animated placeholders for matches

7. **Accessibility**:
   - ARIA roles for bracket navigation
   - Keyboard support for match selection
   - Screen reader announcements for status changes

## Sample Implementation Snippet
```tsx
// State management
const [activeStage, setActiveStage] = useState(0);
const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

// Render match component
const renderMatch = (match: Match) => (
  <div 
    className={`match ${match.status} ${expandedMatch === match.id ? 'expanded' : ''}`}
    onClick={() => setExpandedMatch(match.id)}
    onKeyDown={(e) => e.key === 'Enter' && setExpandedMatch(match.id)}
    tabIndex={0}
    role="button"
    aria-label={`Match between ${match.participant1.name} and ${match.participant2.name}`}
  >
    <div className="participant">
      <Avatar src={match.participant1.avatar} />
      <span>{match.participant1.name}</span>
      {match.status === 'completed' && <span className="score">{match.score?.[0]}</span>}
    </div>
    <div className="participant">
      <Avatar src={match.participant2.avatar} />
      <span>{match.participant2.name}</span>
      {match.status === 'completed' && <span className="score">{match.score?.[1]}</span>}
    </div>
    {expandedMatch === match.id && (
      <div className="match-details">
        <Button onClick={() => onMatchSelect(match.id)}>Place Bet</Button>
        <div>Start: {formatDate(match.startTime)}</div>
        {match.odds && (
          <div>Odds: {match.odds[0]} - {match.odds[1]}</div>
        )}
      </div>
    )}
  </div>
);

// Render bracket
return (
  <div className="tournament-bracket">
    <div className="stage-selector">
      {tournament.stages.map((stage, index) => (
        <Button 
          key={index}
          active={index === activeStage}
          onClick={() => setActiveStage(index)}
        >
          {stage.name}
        </Button>
      ))}
    </div>
    
    <div className="bracket-view">
      {tournament.stages[activeStage].matches.map(renderMatch)}
    </div>
  </div>
);
```

## Animation Requirements
- Use framer-motion for smooth transitions
- Animate match expansion/collapse
- Animate bracket navigation
- Add subtle hover animations