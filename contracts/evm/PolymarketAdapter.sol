// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./interfaces/IConditionalTokens.sol";
import "./dependencies/ZetaInterfaces.sol";
import "./dependencies/ZetaCommon.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title PolymarketAdapter
/// @author Quantum Nexus
/// @notice This contract is a ZetaChain omnichain contract that allows users to bet on Polymarket.
contract PolymarketAdapter is ZetaCommon, ZetaReceiver, Ownable {
    /// @notice The address of the Polymarket Conditional Tokens contract.
    IConditionalTokens public immutable conditionalTokens;

    /// @notice The address of the collateral token (USDC).
    IERC20 public immutable collateral;

    /// @param _conditionalTokens The address of the Polymarket Conditional Tokens contract.
    /// @param _collateral The address of the collateral token (USDC).
    /// @param _zetaConnector The address of the ZetaChain connector.
    constructor(
        address _conditionalTokens,
        address _collateral,
        address _zetaConnector
    ) ZetaCommon(_zetaConnector) {
        conditionalTokens = IConditionalTokens(_conditionalTokens);
        collateral = IERC20(_collateral);
    }

    /// @notice This function is called by the ZetaChain connector when a cross-chain message is received.
    /// @param context The context of the cross-chain message.
    /// @param zrc20 The address of the ZRC20 token.
    /// @param amount The amount of ZRC20 tokens received.
    /// @param message The message sent from the source chain.
    function onZetaMessage(
        ZetaInterfaces.ZetaMessage calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override isValidMessage(context) {
        // Decode the message to get the action type and parameters
        uint8 actionType = abi.decode(message, (uint8));

        if (actionType == 0) {
            // Split Position (Bet)
            (
                uint8 decodedActionType,
                bytes32 conditionId,
                uint256[] memory partition
            ) = abi.decode(message, (uint8, bytes32, uint256[]));

            collateral.approve(address(conditionalTokens), amount);

            conditionalTokens.splitPosition(
                address(collateral),
                bytes32(0),
                conditionId,
                partition,
                amount
            );
        } else if (actionType == 1) {
            // Merge Positions (Claim Winnings)
            (
                uint8 decodedActionType,
                bytes32 conditionId,
                uint256[] memory partition
            ) = abi.decode(message, (uint8, bytes32, uint256[]));

            conditionalTokens.mergePositions(
                address(collateral),
                bytes32(0),
                conditionId,
                partition,
                amount
            );
        } else if (actionType == 2) {
            // Redeem Positions (Withdraw Collateral)
            (
                uint8 decodedActionType,
                bytes32 conditionId,
                uint256[] memory indexSets
            ) = abi.decode(message, (uint8, bytes32, uint256[]));

            conditionalTokens.redeemPositions(
                address(collateral),
                bytes32(0),
                conditionId,
                indexSets
            );
        } else {
            revert("PolymarketAdapter: Invalid action type");
        }
    }
    /// @notice This function is called by a user to place a bet on a Polymarket market.
    /// @param conditionId The unique identifier for the market condition.
    /// @param outcomeIndex The index of the outcome to bet on.
    /// @param amount The amount of collateral to bet.
    function placeBet(
        bytes32 conditionId,
        uint256 outcomeIndex,
        uint256 amount
    ) external {
        // This is a simplified example. In a real-world scenario, you would
        // need to handle token approvals and transfers.

        // Define the partition for the bet. In a binary market, this would be
        // [1, 0] for "Yes" and [0, 1] for "No".
        uint256[] memory partition = new uint256[](2);
        partition[outcomeIndex] = 1;

        // Encode the message for the splitPosition action
        bytes memory message = abi.encode(
            uint8(0), // actionType 0 for splitPosition
            conditionId,
            partition
        );

        // Simulate receiving a Zeta message to trigger the bet
        // In a real implementation, this would be called by the ZetaChain connector
        // after a cross-chain transaction.
        // For simplicity, we are directly calling the internal logic here.
        // Note: This is not a standard way to use onZetaMessage and is for demonstration purposes.
        // A proper implementation would involve sending a transaction on a connected chain
        // that would then be relayed to this contract via the ZetaChain protocol.
        ZetaInterfaces.ZetaMessage memory context; // Dummy context
        
        // The following line is a placeholder for where you would handle the ZRC20 token logic.
        // In a real scenario, the `amount` would be managed by the ZetaChain protocol
        // and delivered to this contract as a ZRC20 token.
        // For this example, we assume the contract already holds the necessary collateral.
        collateral.approve(address(conditionalTokens), amount);

        conditionalTokens.splitPosition(
            address(collateral),
            bytes32(0),
            conditionId,
            partition,
            amount
        );
    }

    /// @notice This function is called when ZRC20 tokens are reverted.
    /// @param context The context of the cross-chain message.
    /// @param zrc20 The address of the ZRC20 token.
    /// @param amount The amount of ZRC20 tokens reverted.
    /// @param message The message sent from the source chain.
    function onZetaRevert(
        ZetaInterfaces.ZetaMessage calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override isValidRevert(context) {
        // Handle the revert logic here, e.g., refund the user
    }

    /// @notice Allows the owner to withdraw any excess gas fees.
    /// @param to The address to send the withdrawn funds to.
    function withdrawGas(address to) external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No gas to withdraw");
        payable(to).transfer(balance);
    }
}