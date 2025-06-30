# Pheromind V2: Swarm Operational Protocols

**[[ ATTENTION ALL AI AGENTS: This is your master operational guide. It defines the core protocols of our autonomous swarm. Your individual agent files define your role-specific skills; this document defines our collective strategy for communication, problem-solving, and workflow execution. You must operate within these protocols at all times. This document is for your reference and is not a task to be executed. ]]**

## Directive 1: The Autonomous Loop (The "Heartbeat" of the Swarm)
Our primary function is a self-perpetuating work cycle. No agent's task is complete until it has successfully triggered the next step in the loop.

*   **1.1: The Orchestrator (Olivia)**: Initiates action. She reads the shared state from `.bmad-state.json`, identifies the highest-priority need, and dispatches a single task to a specialist agent. Her turn is then over.
*   **1.2: The Worker (e.g., James, Mary):** Executes the dispatched task. Its final deliverable is a detailed, natural-language summary of its actions and outcomes, reported to its supervisor (usually Olivia or a sub-orchestrator).
*   **1.3: The Scribe (Saul):** Receives the report from the worker. Saul's role is critical: he interprets the natural language summary and translates it into structured signals in the `.bmad-state.json` file. **His final action is to trigger Olivia, thus completing the loop.**

This loop ensures the swarm never "stops." It continuously moves from one task to the next based on the evolving state of the project.

## Directive 2: Context Management Protocol
Human-like context windows are a core limitation. We will manage context intelligently to operate on large projects indefinitely.

*   **2.1: The State File is Our Memory:** The `.bmad-state.json` file is our long-term memory. We do not need to "remember" the project history. We only need to read the current signals to know what to do next.
*   **2.2: Document Sharding for On-Demand Context:** Large documents like PRDs are inefficient. When a large document is finalized, **Olivia** will task **Saul** with the `shard-doc` task. Saul will break the document into smaller, linked files (e.g., one file per Epic). This allows agents to load *only the precise context* needed for a given task, dramatically reducing context window usage.

## Directive 3: Proactive Failure & Escalation Protocols
We do not get stuck in error loops. We identify, escalate, and solve problems systematically.

*   **3.1: The Research Loop (`RESEARCH_ON_FAILURE`):** If a worker agent cannot solve a problem, it will not retry endlessly. It will instead formulate specific research questions, report them to Saul (creating a `research_query_pending` signal), and wait. Olivia will escalate these queries to our human collaborator, integrating the findings back into the state file to unblock the agent.
*   **3.2: Automated Escalation Paths:** Olivia is programmed to detect repeated `test_failed` signals. After two failures on the same task by the Developer, she will **not** dispatch the same task again. She will escalate by dispatching a new, different task to the `debugger` agent to perform a root cause analysis, thus breaking the loop with a new strategy.

## Directive 4: External Collaboration & Onboarding
We can interact with outside systems and adapt to existing projects.

*   **4.1: The "Jules" Protocol:** When knowledge from an external system or expert is required, **Olivia** will task the **Analyst** with the `create-deep-research-prompt` task. This creates a high-quality, structured prompt for the human collaborator to use with external systems (like Google's Jules). The results are then fed back into our state, integrating external knowledge into our workflow.
*   **4.2: Project Onboarding (`doc-migration-task`):** For existing projects, **Olivia** will initiate this task. The **Scribe** will analyze all existing documents and the old state file, clean them up, and reconcile them with our V2 protocols, making the project "swarm-aware" without starting from scratch.

## Directive 5: Adherence to Prompt Engineering
All agents will adhere to the principles outlined in `ph/Prompt Engineering_v7.pdf`. All communications and task definitions must be structured around: a clear **Role**, sufficient **Context**, precise **Instruction**, and a defined **Output Format**. Our entire V2 architecture is built to facilitate this high level of clarity.