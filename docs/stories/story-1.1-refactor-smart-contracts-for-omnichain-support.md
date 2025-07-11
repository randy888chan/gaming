# Story 1.1: Refactor Smart Contracts for Omnichain Support

## Status: Draft

## Story

- As a developer
- I want the smart contracts to be refactored for omnichain support
- so that the platform can seamlessly interact with various blockchain networks (EVM, Solana, TON) and ensure compliance with the System Directive.

## Acceptance Criteria (ACs)

1.  `CrossChainSettlement.sol` handles bytes for destination addresses.
2.  `PolymarketAdapter.sol` uses production-ready implementation.
3.  Optimized `onZetaMessage` decoding in `PolymarketAdapter.sol`.
4.  New omnichain unit tests added for both contracts.

---

## Tasks / Subtasks

<!--
  This section is for Olivia, the Execution Coordinator, to manage.
  She will decompose these high-level tasks into smaller, verifiable steps
  and manage the dev loop for each one sequentially.
-->

- [ ] Update `CrossChainSettlement.sol` to use `bytes` for `destinationAddress` in `dispatchCrossChainCall`. (AC: #1)
- [ ] Refactor `PolymarketAdapter.sol` to be production-ready, including robust error handling and proper event emission. (AC: #2)
- [ ] Optimize `onZetaMessage` decoding in `PolymarketAdapter.sol` for efficiency and clarity. (AC: #3)
- [ ] Implement new unit tests for `CrossChainSettlement.sol` covering omnichain dispatch and settlement. (AC: #4)
- [ ] Implement new unit tests for `PolymarketAdapter.sol` covering `onZetaMessage` decoding and Polymarket interactions. (AC: #4)

---

## Dev Notes

<!--
  This section is populated by the @sm (Bob, the Task Decomposer).
  It contains only the critical, specific technical context from the
  architecture documents needed for this story.
-->

**Relevant Architectural Snippets:**

- **`CrossChainSettlement.sol` (The Universal Contract on zEVM)**

  - **Purpose:** To be the single, chain-agnostic entry point for all cross-chain operations. It is a generic dispatcher and contains no application-specific logic (e.g., no knowledge of Polymarket or Gamba).
  - **Key Function:** `function dispatchCrossChainCall(uint256 destinationChainId, bytes memory destinationAddress, bytes memory message) external payable;`
  - **Workflow:** The backend service (`zetaChainService`) calls this function. The contract's sole responsibility is to validate the call and use the ZetaChain protocol to forward the `message` to the `destinationAddress` on the `destinationChainId`.

- **`PolymarketAdapter.sol` (The Target Contract on EVM)**
  - **Purpose:** A specific "endpoint" contract deployed on the same chain as Polymarket (e.g., Polygon). It is the target of ZetaChain cross-chain calls destined for Polymarket.
  - **Key Function:** `function onZetaMessage(ZetaInterfaces.ZetaMessage calldata zetaMessage) external override;`
  - **Workflow:** When a cross-chain message arrives from ZetaChain, this function is executed. It decodes the `zetaMessage.message` payload to understand the user's intent (e.g., "place bet," "create limit order") and then makes the appropriate calls to the Polymarket protocol contracts on its own chain.

**Implementation Guidance:**

- Adhere strictly to the project's `coding-standards.md` and `qa-protocol.md`.
- Ensure `CrossChainSettlement.sol`'s `dispatchCrossChainCall` function correctly handles `bytes` for `destinationAddress` to support non-EVM chains like Solana and TON.
- Review `PolymarketAdapter.sol`'s `onZetaMessage` function for current decoding logic. The current implementation uses `abi.decode(message, (uint8))` to get `actionType` and then decodes the rest of the message based on `actionType`. This needs to be optimized and made production-ready.
- Consider the `ZetaInterfaces.ZetaMessage` structure and how `message` is passed and decoded.
- New unit tests should cover successful cross-chain calls, various `actionType` scenarios in `PolymarketAdapter.sol`, and error handling.

---

## Dev Agent Record

<!-- This section is for the @dev agent (James) to update upon completion. -->

**Agent Model Used:** {{Agent Model Name/Version}}

**Referenced Research:**

<!-- Links to documentation/Stack Overflow that were used to solve problems. -->

**Completion Notes:**

<!-- Notes for the next agent (e.g., Olivia, or the SM for the next story). -->

**Changelog:**

<!-- Auto-populated by a git hook in a future version. For now, manual. -->

| Date       | Version | Description                         | Author |
| :--------- | :------ | :---------------------------------- | :----- |
| YYYY-MM-DD | 1.0     | Initial implementation of sub-tasks | @dev   |
