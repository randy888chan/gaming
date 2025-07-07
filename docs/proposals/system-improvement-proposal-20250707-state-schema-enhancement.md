# System Improvement Proposal: Enhanced State Schema for Project Management

**Date:** 2025-07-07
**Auditor:** Metis (📈 bmad-meta)
**Target File:** `.ai/state.json` schema definition in `bmad-core/system_docs/04_System_State_Schema.md`

## 1. Analysis of Current State and Identified Inefficiencies

The current `.ai/state.json` schema, as defined in `bmad-core/system_docs/04_System_State_Schema.md`, provides foundational elements for project status, system signals, and issue logging. However, it presents the following inefficiencies and limitations:

*   **Lack of Comprehensive Project Plan Tracking:** The `current_epic` field is present, but there is no explicit, structured representation of all planned epics and their constituent stories (e.g., Epic 1-4, stories 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 4.2). This makes it difficult for agents to programmatically understand the full scope of the project and for the system to enforce adherence to the PRD.
*   **Risk of Task Deletion:** The user explicitly stated that tasks should not be deleted. The current schema does not provide a mechanism to track the lifecycle of individual tasks beyond the `history` of system signals, which is a high-level audit trail. This could lead to loss of context or an inability to verify task completion.
*   **Limited Granularity for Audit:** While `history` and `agent_reports` provide valuable insights, a dedicated task history would offer more granular detail on task execution, status, and outcomes, which is crucial for comprehensive system auditing and performance analysis.

## 2. Proposed Solutions

To address the identified inefficiencies and meet the user's requirements, I propose the following modifications to the `.ai/state.json` schema:

### 2.1. Add `project_plan` Object

This new top-level object will serve as the definitive, structured representation of the project's epics and stories, directly reflecting the PRD.

**Proposed `project_plan` Structure:**

```json
"project_plan": {
  "epics": [
    {
      "id": "string",
      "title": "string",
      "status": "PLANNED | IN_PROGRESS | COMPLETED",
      "stories": [
        {
          "id": "string",
          "title": "string",
          "path": "string",
          "status": "PLANNED | IN_PROGRESS | COMPLETED | REJECTED"
        }
      ]
    }
  ]
}
```

**Justification:**
*   **AI-Verifiable Outcomes:** Provides a clear, machine-readable project roadmap, enabling agents to verify progress against the defined plan.
*   **Prevents Deletion:** Establishes the project plan as a persistent part of the state, making it explicit that stories are completed or rejected, not removed.
*   **Enhanced Orchestration:** Allows the `@bmad-master` and `@bmad-orchestrator` agents to more effectively manage the project lifecycle by having a direct reference to all planned work.

### 2.2. Add `task_history` Array

This new top-level array will log every significant task dispatched within the system, providing a detailed, immutable record of execution.

**Proposed `task_history` Structure:**

```json
"task_history": [
  {
    "task_id": "string",
    "agent_id": "string",
    "task_description": "string",
    "timestamp_dispatched": "ISO 8601 string",
    "timestamp_completed": "ISO 8601 string | null",
    "status": "DISPATCHED | IN_PROGRESS | COMPLETED | FAILED | REJECTED",
    "related_story_id": "string | null",
    "output_summary": "string | null",
    "error_details": "string | null"
  }
]
```

**Justification:**
*   **Immutable Task Record:** Ensures that no task is ever "deleted" from the system's memory, addressing the user's concern directly.
*   **Improved Auditability:** Provides a granular log for Metis's `META_ANALYSIS_PROTOCOL`, allowing for more precise identification of inefficiencies, recurring failures, and agent performance.
*   **Enhanced Debugging:** Offers a clear history of task execution, aiding `@debugger` in root cause analysis.

## 3. Proposed Changes to `bmad-core/system_docs/04_System_State_Schema.md`

The `Updated File Content` section within `bmad-core/system_docs/04_System_State_Schema.md` should be modified to include these new fields.

**Diff Proposal:**

```
<<<<<<< SEARCH
:start_line:15
-------
```json
{
  "project_name": "string",
  "project_status": "string (See Project Status Enum)",
  "system_signal": "string (See System Signal Enum)",
  "current_epic": "string | null",
  "history": [
    {
      "timestamp": "ISO 8601 string",
      "agent_id": "string",
      "signal": "string",
      "summary": "string"
    }
  ],
  "agent_reports": "object",
  "issue_log": [
    {
      "issue_id": "string",
      "status": "OPEN | RESOLVED | CLOSED",
      "reporter_agent": "string",
      "description": "string",
      "history": "array"
    }
  ]
}
```
=======
```json
{
  "project_name": "string",
  "project_status": "string (See Project Status Enum)",
  "system_signal": "string (See System Signal Enum)",
  "current_epic": "string | null",
  "project_plan": {
    "epics": [
      {
        "id": "string",
        "title": "string",
        "status": "PLANNED | IN_PROGRESS | COMPLETED",
        "stories": [
          {
            "id": "string",
            "title": "string",
            "path": "string",
            "status": "PLANNED | IN_PROGRESS | COMPLETED | REJECTED"
          }
        ]
      }
    ]
  },
  "history": [
    {
      "timestamp": "ISO 8601 string",
      "agent_id": "string",
      "signal": "string",
      "summary": "string"
    }
  ],
  "agent_reports": "object",
  "issue_log": [
    {
      "issue_id": "string",
      "status": "OPEN | RESOLVED | CLOSED",
      "reporter_agent": "string",
      "description": "string",
      "history": "array"
    }
  ],
  "task_history": [
    {
      "task_id": "string",
      "agent_id": "string",
      "task_description": "string",
      "timestamp_dispatched": "ISO 8601 string",
      "timestamp_completed": "ISO 8601 string | null",
      "status": "DISPATCHED | IN_PROGRESS | COMPLETED | FAILED | REJECTED",
      "related_story_id": "string | null",
      "output_summary": "string | null",
      "error_details": "string | null"
    }
  ]
}
```
>>>>>>> REPLACE
```

## 4. Impact on Agents and Protocols

These changes will require updates to agents that read from or write to `.ai/state.json`, particularly:

*   **`@bmad-master` (Saul):** Will need to update its `INTERPRETER_MANDATE` and `PHEROMIND_PROTOCOL` to manage the `project_plan` and `task_history` fields, ensuring new stories are added to `project_plan` and tasks are logged in `task_history`.
*   **`@bmad-orchestrator` (Olivia):** Will need to adapt its `DISPATCH_PROTOCOL` to leverage the `project_plan` for determining the next logical task and to log task status in `task_history`.
*   **`@bmad-sm` (Bob):** When creating new stories, it will need to update the `project_plan` with the new story's details.
*   **`@bmad-debugger` (Dexter):** Will benefit from the `task_history` for more detailed context during issue resolution.
*   **`@bmad-meta` (Metis - Self):** My own `META_ANALYSIS_PROTOCOL` will be significantly enhanced by the richer data available in `project_plan` and `task_history` for identifying inefficiencies.

## 5. Conclusion

These proposed enhancements to the `.ai/state.json` schema will significantly improve the system's ability to track project progress, ensure task immutability, and provide comprehensive data for performance auditing. This aligns directly with the core principles of **AI-Verifiable Outcomes** and **Adaptive Swarm Intelligence**.

This proposal requires human review and approval before the next epic can begin.