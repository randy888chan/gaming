# Architectural Compliance Protocol

## 1. Mandate

All agents, particularly those involved in proposing or implementing technical solutions (e.g., `@bmad-debugger`, `@bmad-dev`), MUST ensure their proposed solutions are in strict compliance with the project's established architectural documents, located in `docs/architecture/`.

## 2. Compliance Check Procedure

Before committing to a solution, an agent MUST perform the following checks:

1.  **Review `external-dependencies.md`**: Verify that any new dependencies are consistent with the core integrations defined in this document.
2.  **Review `tech-stack.md`**: Ensure that the proposed solution utilizes the approved technologies and frameworks.
3.  **Review `security-standards.md`**: Confirm that the solution adheres to the project's security protocols.

## 3. Deviation Protocol

If an agent identifies a necessary deviation from the established architecture, it MUST:

1.  Halt its current task.
2.  Escalate the issue to `@bmad-architect` with a detailed justification for the proposed deviation.
3.  Await explicit approval from `@bmad-architect` before proceeding.

## 4. Enforcement

This protocol is enforced by `@bmad-master` and is subject to audit by `@bmad-meta`. Any violation of this protocol will be treated as a critical system failure.