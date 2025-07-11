// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../../contracts/evm/interfaces/IConditionalTokens.sol";

contract ConditionalTokensMock is IConditionalTokens {
    event PositionSplit(
        address indexed collateralToken, bytes32 indexed conditionId, uint256[] partition, uint256 amount
    );

    function splitPosition(
        address collateralToken,
        bytes32, // parentCollectionId
        bytes32 conditionId,
        uint256[] calldata partition,
        uint256 amount
    ) external override {
        emit PositionSplit(collateralToken, conditionId, partition, amount);
    }

    function mergePositions(
        address, // collateralToken
        bytes32, // parentCollectionId
        bytes32, // conditionId
        uint256[] calldata, // partition
        uint256 // amount
    ) external override {}

    function redeemPositions(
        address, // collateralToken
        bytes32, // parentCollectionId
        bytes32, // conditionId
        uint256[] calldata // indexSets
    ) external override {}

    function getOutcomeSlotCount(bytes32) external view override returns (uint256) {
        return 2;
    }

    function positionIds(bytes32, uint256) external view override returns (uint256) {
        return 0;
    }
}
