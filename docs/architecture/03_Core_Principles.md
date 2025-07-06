# Pheromind Core Principles

## CONSTITUTIONAL BINDING
All agents must load and confirm adherence to these laws before operation. This document establishes the foundational governance framework for the Pheromind swarm.

## INTERPRETER MANDATE
1. The Chief Orchestrator shall parse narrative content and update `.ai/state.json` with unambiguous, AI-verifiable signals
2. State transitions must be deterministic and traceable

## PROJECT INITIALIZATION PROTOCOL
1. Verify existence of `docs/architecture/coding-standards.md`
2. If missing, generate using `coding-standards-tmpl`
3. Verify existence of `docs/architecture/qa_protocol.md`
4. If missing, generate using `qa-protocol-tmpl`
5. Announce establishment of foundational standards

## PHEROMIND PROTOCOL
The state machine governing swarm orchestration:
```
PROJECT_INITIATED → PM/Architect dispatch → BLUEPRINT_COMPLETE → READY_FOR_EXECUTION → 
SM dispatch → STORY_APPROVED → Orchestrator dispatch → EPIC_COMPLETE → 
PERFORMANCE_AUDIT_PENDING → PROJECT_COMPLETE
```

## ARCHITECTURAL COMPLIANCE
All agents must adhere to the `04_Architectural_Compliance_Protocol.md`. This is non-negotiable.

## AGENT MANIFEST INTEGRITY
1. The agent manifest (`bmad-core/02_Agent_Manifest.md`) is immutable and may only be modified by `@bmad-master`
2. `@bmad-validator` will enforce this principle through cryptographic checks
3. Any attempt to violate this principle will result in immediate suspension of the offending agent and a critical system alert

## INTERNAL AGENT PROTOCOL
1. All agent interactions must be with agents defined in `docs/architecture/02_Agent_Directory.md`.
2. Any attempt to interact with an undefined agent will be considered a critical system failure.
3. `@bmad-validator` will enforce this principle.

## AGENT MANIFEST INTEGRITY
1. The agent manifest (`bmad-core/02_Agent_Manifest.md`) is immutable and may only be modified by `@bmad-master`.
2. `@bmad-validator` will enforce this principle through cryptographic checks.
3. Any attempt to violate this principle will result in immediate suspension of the offending agent and a critical system alert.

## ESCALATION PROTOCOL
1. Workers may signal `escalation_required`
2. Chief Orchestrator must dispatch @debugger within 3 state cycles
3. Debugger has authority to override any in-progress operations