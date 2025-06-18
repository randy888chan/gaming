

### front-end-spec.md

```
# Quantum Nexus UI/UX Specification

This document defines the user experience goals, information architecture, user flows, and visual design specifications for Quantum Nexus's user interface. It serves as the foundation for visual design and frontend development, ensuring a cohesive, empowering, and user-centered experience that stands out from generic crypto applications.## Introduction### Overall UX Goals & PrinciplesThe overall UX vision is to create an immersive, intuitive, and empowering experience that positions "Quantum Nexus" as a high-tech control center for decentralized finance and gaming. It should feel futuristic, intelligent, and provide users with a sense of strategic advantage, moving beyond typical crypto dApp aesthetics.### Target User Personas*   **Power User:** Technical professionals who need advanced features and efficiency*   **Casual User:** Occasional users who prioritize ease of use and clear guidance*   **Administrator:** System managers who need control and oversight capabilities### Usability Goals*   **Ease of learning:** New users can complete core tasks (e.g., connect wallet, play a game, sign up for newsletter) within 5 minutes.*   **Efficiency of use:** Savvy Web3 Explorers can navigate insights and games with minimal friction.*   **Error prevention:** Clear validation and confirmation for critical actions, especially for cross-chain interactions.*   **Memorability:** Infrequent users can return without relearning complex flows.*   **Value Perception:** The UI/UX itself should convey intelligence, cutting-edge technology, and a premium, unique experience.### Design Principles1.  **Clarity over cleverness:** Prioritize clear communication over aesthetic innovation.2.  **Progressive disclosure:** Show only what's needed, when it's needed, to manage complexity.3.  **Consistent patterns:** Use familiar UI patterns throughout the application, customized with our unique visual style.4.  **Immediate feedback:** Every user action should have a clear, immediate, and often animated response.5.  **Accessible by default:** Design for all users from the start.6.  **Futuristic & Empowering:** The aesthetic should evoke a sense of high-tech control, personal advantage, and immersion.7.  **Fluid & Responsive:** Interactions should feel seamless, with dynamic visual responses.8.  **Digital Esoterica:** Embrace unique visual metaphors and custom SVG animations to create a distinct and memorable brand identity.### Change Log| Date       | Version | Description      | Author || :--------- | :------ | :--------------- | :----- || 2025-06-15 | 1.0     | Final "Flash & Viral" Edition | Sally  |## Information Architecture (IA)### Site Map / Screen Inventory```mermaidgraph TD    A[Homepage: Nexus Orb, Insight Shards, CTA] --> B[Game Play Pages: /play/[gameId]]    A --> C[Profile Page: /profile]    A --> D[pSEO Landing Pages: /games/seo/[slug]]    B --> B1[Smart Bet Panel (Integrated)]    C --> C1[Wallet Details]    C --> C2[Referral Link Management]    D --> D1[Interception Portal (Lead Capture Form)]
```

content_copydownload

Use code [with caution](https://support.google.com/legal/answer/13505487).Markdown

### Navigation Structure

**Primary Navigation:** The **"Nexus Orb"**. This is a central, interactive 3D element in the header. On click, it unfurls a holographic radial menu with glowing icons leading to core sections:

- Games (Homepage)

- Predict (Future - disabled/greyed out in MVP)

- Profile

- Insights (Future - disabled/greyed out in MVP, as insights are integrated directly into game pages for now)

**Secondary Navigation:** Contextual elements on game pages (e.g., sound toggle, fairness info) integrated into a sleek "Control Console" at the bottom of the screen.

**Breadcrumb Strategy:** Not a primary feature for the MVP's flat structure. Navigation will be handled by the Nexus Orb and clear back/home buttons.

## User Flows

### New User Onboarding & First "Smart Bet"

**User Goal:** A new user lands on the homepage, connects their wallet, and experiences the "wow" factor of receiving an AI-driven bet suggestion.

**Entry Points:** Homepage, direct link from social media.

**Success Criteria:** User's wallet is connected, they receive an AI insight, and feel empowered to play.

#### Flow Diagram

```
graph TD
    A[Landing Page / Homepage with animated "Nexus Orb" & "Insight Shards"] --> B{Click "Insight Shard" (Game Card)}
    B -- "Hyperspace Jump" Transition --> C[Game Play Page]
    C --> D{Wallet not connected? Prompt to Connect via Particle Network Social Login}
    D -- Clicks "Sign in with Google" --> E[Particle Network UI]
    E -- Social Login Success --> F[UI updates to show "Get Smart Bet" button is active]
    F -- User clicks "Get Smart Bet" --> G[Button animates with "energy pulse"]
    G --> H{API call to /api/smart-bet}
    H --> I[Smart Bet Panel displays AI suggestion with animation]
    I --> J{User can apply suggestion to wager input}
```

content_copydownload

Use code [with caution](https://support.google.com/legal/answer/13505487).Mermaid

**Edge Cases & Error Handling:**

- Wallet connection failure: A non-intrusive toast notification with a retry option.

- "Smart Bet" API error: The button shows a subtle error state (e.g., a red glow) with a tooltip "Insights currently unavailable."

### Lead Capture from pSEO Landing Page

**User Goal:** A visitor from an organic search query is captivated by the page's unique design and value proposition, and willingly provides their email.

**Entry Points:** Google search result leading to a pSEO page.

**Success Criteria:** User submits their email through the "Interception Portal."

#### Flow Diagram

```
graph TD
    A[Organic Search Traffic] --> B[pSEO Landing Page (with fluid animations)]
    B --> C{User scrolls and reads compelling AI-generated copy}
    C --> D{"Interception Portal" (Lead Form) animates into view}
    D --> E[User enters email]
    E -- On Submit --> F[Form animates with "data transfer" effect]
    F --> G[A "Thank You" message appears with holographic shimmer]
```

content_copydownload

Use code [with caution](https://support.google.com/legal/answer/13505487).Mermaid

**Edge Cases & Error Handling:**

- Invalid email: Input field border glows red with a subtle shake animation.

- API submission error: The "Submit" button shows a temporary error state.

## Wireframes & Mockups

**Primary Design Files:** Figma (to be created externally by a visual designer, based on this spec).

### Key Screen Layouts

#### Homepage (The Cosmic Nexus Hub)

- **Layout:** Immersive and dynamic. The central "Nexus Orb" or prominent animated header element. Large, visually rich "Insight Shards" (Game Cards) for featured games. A section for "Recent Plays" with subtle particle animations. Dedicated space for a compelling lead capture CTA (e.g., "Unlock Your Edge").

- **Key Elements:**
  
  - Animated "Quantum Fabric" background.
  
  - Dynamic Game Cards, subtly shifting on hover.
  
  - Live feed of "Recent Plays" with winning/losing animations.
  
  - Primary navigation (Games, Predict, Profile, Insights) accessible.

#### Game Play Pages (The "Probability Tunnel")

- **Layout:** Highly immersive. The background is a "Probability Tunnel" of data points and glowing lines that accelerates and intensifies as the game's multiplier increases (for Crash/Limbo).

- **Key Elements:**
  
  - Game Renderer: The core game (e.g., Dice, Crash) takes center stage.
  
  - "Smart Bet Panel": Sleek, integrated panel with a single, glowing "Get Smart Bet" button.
  
  - "Control Console": A footer element containing the wager input and play button, designed to look like a futuristic control interface.

#### pSEO Landing Pages

- **Layout:** Clean, minimalist, but with the signature "Quantum Nexus" flash.

- **Key Elements:**
  
  - Hero Section: A powerful, SEO-optimized headline with a subtle text animation (e.g., a "glitch" or "flicker" effect).
  
  - "Interception Portal" (Lead Form): A visually striking form that animates into view. Input fields are "data conduits" with animated effects on focus and submission.

## Component Library / Design System

**Design System Approach:** We will leverage **Shadcn UI** as a robust, accessible base for standard components (buttons, inputs, dialogs, dropdowns). However, these will be heavily customized with our unique "Cosmic Bloom" color palette and enhanced with bespoke animations using styled-components and react-three/fiber to achieve the "pop" factor and avoid a generic appearance.

### Core Components

- **Button:** On hover: emanates a "Quantum Violet" glow. On click: a ripple/energy pulse animation.

- **Modal:** The "Interception Portal" (Lead capture) and "Provably Fair" modal. Slides in with a subtle holographic shimmer. Close button with custom Icon.Close2.

- **Card:** The "Insight Shard" (GameCard). Multi-layered, slightly translucent, appearing to float. On hover: layers subtly separate, revealing a "Quantum Violet" inner glow.

- **Navigation:** The "Nexus Orb" with its holographic radial menu is the primary navigation component.

## Branding & Style Guide

### Visual Identity

Futuristic, high-tech, data-driven, and empowering. The core visual metaphors are "Quantum Nexus," "Hyperspace Jump," and "Digital Esoterica."

### Color Palette

| Color Type     | Hex/RGBA                 | Usage                                            |
| -------------- | ------------------------ | ------------------------------------------------ |
| **Background** | #0A0B12 (Deep Space)     | Main background for depth and immersion.         |
| **Primary**    | #8851FF (Quantum Violet) | Primary interactive elements, glows, highlights. |
| **Secondary**  | #00FFFF (Electric Cyan)  | Secondary actions, sub-highlights, data streams. |
| **Tertiary**   | #FFEC63 (Neon Charge)    | Win states, critical alerts, high-impact CTAs.   |
| **Text**       | rgba(255, 255, 255, 0.9) | Main readable text.                              |
| **Muted Text** | rgba(255, 255, 255, 0.5) | Subheadings, descriptions, secondary info.       |
| **Borders**    | rgba(255, 255, 255, 0.2) | Subtle outlines for components and sections.     |

### Typography

A modern, clean sans-serif for UI text, with a geometric or condensed font for headlines to enhance the futuristic feel.

### Iconography

Lucide React for base icons, but with custom animated SVG icons for key features.

## Animation & Micro-interactions

### Motion Principles

Fluidity, empowerment, and intelligent feedback. Animations should be purposeful and enhance the user experience.

### Key Animations

- **"Hyperspace Jump" Page Transitions**

- **"Nexus Orb" Navigation**

- **"Insight Shard" Hover Effect**

- **"Probability Tunnel" Background**

- **"Interception Portal" Form Animation**

## Performance Considerations

### Performance Goals

- **Page Load:** Core pages < 2 seconds on a 3G network.

- **Interaction Response:** Instantaneous (<100ms).

- **Animation FPS:** A smooth 60 FPS on modern devices.

### Design Strategies

- Optimize 3D assets and animations.

- Lazy load non-critical components and assets.

- Use CSS animations for simple effects, and react-three/fiber for more complex ones, ensuring they are performant.
