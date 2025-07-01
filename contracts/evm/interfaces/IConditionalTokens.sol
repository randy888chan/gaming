// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Interface for the Gnosis Conditional Tokens contract
/// @author Polymarket
interface IConditionalTokens {
    /**
     * @notice Splits a position.
     * @dev This function is used to purchase outcome tokens for a given market.
     * @param collateralToken The address of the collateral token (e.g., USDC).
     * @param parentCollectionId The collection ID of the parent market, or bytes32(0) if none.
     * @param conditionId The unique identifier for the market condition.
     * @param partition An array defining the distribution of shares across outcomes.
     * @param amount The amount of collateral to be used for splitting the position.
     */
    function splitPosition(
        address collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint256[] calldata partition,
        uint256 amount
    ) external;

    /**
     * @notice Merges positions.
     * @dev This function is used to redeem outcome tokens for collateral.
     * @param collateralToken The address of the collateral token.
     * @param parentCollectionId The collection ID of the parent market.
     * @param conditionId The unique identifier for the market condition.
     * @param partition An array defining the distribution of shares to be merged.
     * @param amount The amount of outcome tokens to be merged.
     */
    function mergePositions(
        address collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint256[] calldata partition,
        uint256 amount
    ) external;

    /**
     * @notice Redeems positions after a market has resolved.
     * @param collateralToken The address of the collateral token.
     * @param parentCollectionId The collection ID of the parent market.
     * @param conditionId The unique identifier for the market condition.
     * @param indexSets An array of bitmasks indicating the winning outcomes.
     */
    function redeemPositions(
        address collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint256[] calldata indexSets
    ) external;

    /**
     * @notice Gets the number of outcome slots for a condition.
     * @param conditionId The unique identifier for the market condition.
     * @return The number of outcomes.
     */
    function getOutcomeSlotCount(bytes32 conditionId) external view returns (uint256);

    /**
     * @notice Gets the position ID for a given outcome.
     * @param conditionId The unique identifier for the market condition.
     * @param index The index of the outcome.
     * @return The position ID.
     */
    function positionIds(bytes32 conditionId, uint256 index) external view returns (uint256);
}