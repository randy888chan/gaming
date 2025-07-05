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

## ESCALATION PROTOCOL
1. Workers may signal `escalation_required`
2. Chief Orchestrator must dispatch @debugger within 3 state cycles
3. Debugger has authority to override any in-progress operations