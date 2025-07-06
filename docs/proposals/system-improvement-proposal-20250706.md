# Pheromind: The Autonomous AI Development Swarm

Pheromind is a revolutionary framework for orchestrating a swarm of specialized AI agents to autonomously build software. It moves beyond simple scripting to a model of **true autonomous orchestration**, where a central intelligence plans, executes, and learns with minimal human intervention.

At its core, the system utilizes:

- **Stigmergic Coordination:** Agents interact indirectly by leaving "digital pheromones" (signals) in a shared state file (`.ai/state.json`), enabling complex, coordinated behavior without direct communication.
- **State-Driven Autonomous Cycle:** A single, intelligent orchestrator manages the entire project lifecycle—from planning and architecture to coding, verification, and self-improvement—within your IDE.
- **AI-Verifiable Outcomes:** Progress is measured by concrete, programmatically-confirmable outputs and system states, bringing mathematical rigor and transparency to project tracking.
- **Constitutional AI:** All agents operate under a shared set of core principles (`bmad-core/system_docs/03_Core_Principles.md`), ensuring consistent, predictable, and safe behavior.

## 🚀 Installation & Upgrade

### One-Time Authentication Setup
Because Pheromind is distributed via the GitHub Package Registry, you must first authenticate your local machine. You only need to do this once.

1.  Create a [GitHub Personal Access Token (Classic)](https://github.com/settings/tokens/new) with the `read:packages` scope.
2.  Log in to the GitHub NPM registry by running the following command and pasting your token when prompted for a password:
    ```bash
    npm login --scope=@randy888chan --registry=https://npm.pkg.github.com
    ```
    (Use your GitHub username for the username prompt).

### For New Projects
Install the Pheromind framework into your project directory.
```bash
# Run this command in the root of your new project folder
npx @randy888chan/pheromind install
```

### For Existing V3 Projects
An interactive upgrader is available to transition your project to the new architecture.
```bash
# From your existing project's root directory
npx @randy888chan/pheromind upgrade
```

---
## The Pheromind Cycle: The Path to Autonomy

Pheromind simplifies development into a single, unified workflow driven by the Chief Orchestrator.

1.  **Initiation:** In your IDE, activate the Chief Orchestrator, **`@bmad-master` (Saul)**.
2.  **Directive:** Give Saul a high-level project goal. You can provide a path to a project brief or give him the goal directly.
    > "We need to build a new application. A project brief is located at `docs/brief.md`. Please begin the project."

    *Alternatively, if you've done initial planning (e.g., in a Web UI) and have a `prd.md` and `architecture.md` in your `docs/` folder:*
    > "@bmad-master, I have already created the project blueprint. Please run the `*ingest_docs` command to prepare the system for execution."

3.  **Autonomous Orchestration:** Saul will now initiate the Pheromind Cycle. He will read the system's state, interpret needs, and dispatch the correct agents to autonomously plan, execute, verify, and adapt until the project is complete.

---

## Agent Archetypes

The swarm is composed of specialized agents, each with a clear role in the hierarchy.

| Agent ID                 | Name (Archetype)               | Core Responsibilities                                                                |
| ------------------------ | ------------------------------ | ------------------------------------------------------------------------------------ |
| **`@bmad-master`**         | **Saul (Chief Orchestrator)**  | The master brain. Interprets state, dispatches all tasks, and manages the lifecycle. |
| `@pm`, `@architect`      | (Planners)                     | Create the project blueprint (`docs/`) under Saul's direction.                       |
| `@sm`                    | Bob (Task Decomposer)          | Breaks down epics from the blueprint into actionable, technically-rich stories.      |
| **`@bmad-orchestrator`**   | **Olivia (Execution Coord.)**  | A sub-orchestrator, dispatched by Saul to manage the `dev->qa->po` loop for one story. |
| `@dev`, `@victor`        | (Executors)                    | Write code and implement stories according to strict standards.                      |
| `@qa`                    | Quinn (Quality Verifier)       | Programmatically verifies code quality against a defined, project-specific protocol. |
| `@po`                    | Sarah (Product Verifier)       | Validates that implemented features meet the acceptance criteria of the blueprint.   |
| `@debugger`, `@refactorer` | (Adaptive Responders)        | Specialists dispatched by Saul to diagnose and resolve complex failures.             |
| `@meta`                  | Metis (System Auditor)         | Analyzes swarm performance to make the system itself better.                         |

---

## Project Structure

```plaintext
.
├── .bmad-core/        # The "brain" of the AI agents. Installed locally.
│   ├── agents/        # Individual agent prompt definitions.
│   └── system_docs/   # The core "constitution" of the system.
├── .ai/               # The dynamic "memory" of the swarm (gitignore this).
│   └── state.json     # The shared state file driving agent coordination.
├── docs/              # The project-specific "blueprint" (PRD, Architecture).
│   ├── architecture/  # Detailed, verifiable architecture documents.
│   └── stories/       # AI-generated, self-contained story files.
└── src/               # The source code of the application being built.
```
