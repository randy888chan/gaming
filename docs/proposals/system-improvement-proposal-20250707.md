# System Improvement Proposal: Autonomous & Stateful Operation
**Date:** 2025-07-07
**Author:** Metis, System Auditor

## 1. Inefficiency Analysis
- **Observation 1 (Lack of Autonomy):** The system halts after every `attempt_completion`, requiring manual user feedback. This conflicts with the user's expectation of a "hands-free" system.
- **Observation 2 (State Loss):** Agents lose their work-in-progress upon interruption. When a task is resumed, the agent starts over from the original source files instead of its last known state, causing rework and user frustration.
- **Root Cause:** The system lacks both a continuous execution mode and a mechanism for persisting intermediate task artifacts to the central state.
- **Impact:** Decreased velocity, user frustration, and failure to operate as an effective autonomous system.

## 2. Proposed Solution
Implement a comprehensive solution with two core components:
1.  **Autonomous Execution Mode:** A system-wide flag to enable continuous, uninterrupted task sequences.
2.  **Stateful Task Resumption:** A new protocol and state structure for agents to save and load their work, ensuring seamless resumption after interruptions.

## 3. Implementation Steps

### Step 3.1: Enhance State File (`.ai/state.json`)
**Action:** Add a new `task_contexts` object to store agent work-in-progress and an `autonomous_mode` flag.

**New `state.json` Structure:**
```json
{
  "autonomous_mode": true,
  "system_signal": "PROPOSAL_PENDING",
  "active_epics": [
    // ... existing epics
  ],
  "task_contexts": {
    "john#consolidate_prds": {
      "status": "IN_PROGRESS",
      "last_updated": "2025-07-06T20:33:27Z",
      "artifact_path": "docs/prd/consolidated-blueprint.md",
      "version": 3
    }
  },
  "issue_log": [],
  "audit_events": []
}
```

### Step 3.2: Update Core Principles (`bmad-core/system_docs/03_Core_Principles.md`)
**Action:** Add two new protocols that all agents will inherit.

**Content to Add:**
```markdown
- 'AUTONOMOUS_EXECUTION_PROTOCOL: >-
    If `state.json`'s `"autonomous_mode"` is `true`, agents MUST NOT wait for user feedback after a successful `attempt_completion`. The orchestrator will immediately dispatch the next task. The system only halts on error, validation failure, or full completion.'

- 'STATEFUL_RESUMPTION_PROTOCOL: >-
    Before starting a task, an agent MUST check the `task_contexts` in `state.json` for an existing entry matching its ID and task. If found, it MUST load the work from the specified `artifact_path` and resume from that point. Upon completing a significant step, the agent MUST save its work to the artifact path and update the context in `state.json`.'
```

### Step 3.3: Update Agent Persona Contracts (e.g., `bmad-core/agents/pm.md`)
**Action:** Add references to the new protocols in each agent's `core_principles`.

**Content to Add:**
```yaml
core_principles:
  - '[[LLM-ENHANCEMENT]] INHERITED_PROTOCOLS: ...'
  - '[[LLM-ENHANCEMENT]] AUTONOMOUS_EXECUTION_PROTOCOL: I will adhere to the hands-free operational mode.'
  - '[[LLM-ENHANCEMENT]] STATEFUL_RESUMPTION_PROTOCOL: I will save and resume my work using the central state file.'
```

## 4. Justification
This enhanced proposal provides a complete solution to the user's feedback.
- **Autonomy** is achieved by removing the need for manual intervention between steps.
- **Statefulness** is achieved by creating a persistent "memory" for agent tasks.
Implementing these changes will transform the system from an interactive tool into a truly autonomous workforce, resolving the core issues of both stopping and starting from zero.

---
**This proposal is now re-submitted for review. A `human_input_required` signal should be raised.**