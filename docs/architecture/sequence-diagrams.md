# Critical Workflow Sequence Diagrams

## 1. User Onboarding & Credit Claiming
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthService
    participant D1DB
    participant ZetaChain

    User->>Frontend: Initiate social login
    Frontend->>AuthService: Request token (Particle Network)
    AuthService-->>Frontend: Return JWT
    Frontend->>D1DB: Create user record
    User->>Frontend: Claim first-play credits
    Frontend->>ZetaChain: Verify eligibility
    ZetaChain-->>Frontend: Approval
    Frontend->>D1DB: Update credits
    D1DB-->>Frontend: Success
    Frontend-->>User: Credits available
```

## 2. Cross-Chain Game Play
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant ZetaChain
    participant TargetChain

    User->>Frontend: Place game bet
    Frontend->>API: Submit play request
    API->>ZetaChain: Initiate cross-chain tx
    ZetaChain->>TargetChain: Forward transaction
    TargetChain-->>ZetaChain: Tx receipt
    ZetaChain-->>API: Confirmation
    API->>D1DB: Record play result
    API-->>Frontend: Game outcome
    Frontend-->>User: Display result
```

## 3. AI-Generated Content Publishing
```mermaid
sequenceDiagram
    participant CRON
    participant pSEOWorker
    participant AIAdapter
    participant D1DB
    participant Queue
    participant SocialWorker
    participant SocialMedia

    CRON->>pSEOWorker: Trigger hourly
    pSEOWorker->>AIAdapter: Request content
    AIAdapter-->>pSEOWorker: Generated content
    pSEOWorker->>D1DB: Store metadata
    pSEOWorker->>Queue: Enqueue social post
    Queue->>SocialWorker: Dequeue message
    SocialWorker->>SocialMedia: Post content
    SocialMedia-->>SocialWorker: Success
    SocialWorker->>D1DB: Update post status
```

> **Note:** These diagrams use the Mermaid syntax without double quotes in square brackets to avoid parsing errors.