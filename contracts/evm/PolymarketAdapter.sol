// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./interfaces/IConditionalTokens.sol";
import "./dependencies/ZetaInterfaces.sol";
import "./dependencies/ZetaCommon.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CrossChainSettlement.sol";
import "./interfaces/ICrossChainSettlement.sol";
import "./interfaces/IGambaToken.sol"; // Add Gamba token interface
 
 struct PolymarketMessagePayload {
     uint8 actionType;
     bytes32 conditionId;
     uint256[] dataArray; // Can be partition or indexSets
 }
 
 /// @title PolymarketAdapter
 /// @author Quantum Nexus
 /// @notice This contract is a ZetaChain omnichain contract that allows users to bet on Polymarket.
 contract PolymarketAdapter is ZetaCommon, ZetaReceiver, Ownable {
     /// @notice The address of the Polymarket Conditional Tokens contract.
     IConditionalTokens public immutable conditionalTokens;
 
     /// @notice The address of the collateral token (USDC).
     IERC20 public immutable collateral;
 
     /// @notice The address of the CrossChainSettlement contract.
     ICrossChainSettlement public immutable crossChainSettlement;
 
     /// @notice The address of the Gamba token.
     address public immutable gambaToken;
 
     event GambaActionExecuted(uint8 actionType, bytes32 conditionId, uint256 amount);
     event GambaRefund(address indexed recipient, uint256 amount);
 
     /// @param _conditionalTokens The address of the Polymarket Conditional Tokens contract.
     /// @param _collateral The address of the collateral token (USDC).
     /// @param _zetaConnector The address of the ZetaChain connector.
     /// @param _crossChainSettlement The address of the CrossChainSettlement contract.
     /// @param _gambaToken The address of the Gamba token.
     constructor(
         address _conditionalTokens,
         address _collateral,
         address _zetaConnector,
         address _crossChainSettlement,
         address _gambaToken
     ) ZetaCommon(_zetaConnector) {
         conditionalTokens = IConditionalTokens(_conditionalTokens);
         collateral = IERC20(_collateral);
         crossChainSettlement = ICrossChainSettlement(_crossChainSettlement);
         gambaToken = _gambaToken;
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
        // Single decode operation for efficiency
        PolymarketMessagePayload memory payload = abi.decode(message, (PolymarketMessagePayload));

        // Handle Gamba token integration: Ensure the ZRC20 token sent is the Gamba token
        require(zrc20 == gambaToken, "PolymarketAdapter: Invalid ZRC20 token. Only Gamba token is accepted.");

        if (payload.actionType == 0) {
            // Split Position (Bet)
            collateral.approve(address(conditionalTokens), amount);
            conditionalTokens.splitPosition(
                address(collateral),
                bytes32(0),
                payload.conditionId,
                payload.dataArray,
                amount
            );
        } else if (payload.actionType == 1) {
            // Merge Positions (Claim Winnings)
            collateral.approve(address(conditionalTokens), amount);
            conditionalTokens.mergePositions(
                address(collateral),
                bytes32(0),
                payload.conditionId,
                payload.dataArray,
                amount
            );
        } else if (payload.actionType == 2) {
            // Redeem Positions (Withdraw Collateral)
            conditionalTokens.redeemPositions(
                address(collateral),
                bytes32(0),
                payload.conditionId,
                payload.dataArray
            );
        } else {
            revert("Invalid action type");
        }

        // Emit event for Gamba integration
        emit GambaActionExecuted(payload.actionType, payload.conditionId, amount);
    }

    /// @notice This function is called by a user to place a bet on a Polymarket market.
    /// @param conditionId The unique identifier for the market condition.
    /// @param outcomeIndex The index of the outcome to bet on.
    /// @param amount The amount of collateral to bet.
    /// @param targetToken The address of the ZRC20 token on the target chain to be used for the bet.
    /// @param recipient The recipient address on the target chain.
    function placeBet(
        bytes32 conditionId,
        uint256 outcomeIndex,
        uint256 amount,
        address targetToken,
        bytes memory recipient
    ) external {
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

        // Initiate the cross-chain call via CrossChainSettlement
        // The PolymarketAdapter should not directly interact with Polymarket.
        // It only prepares the payload and dispatches it via CrossChainSettlement.
        crossChainSettlement.dispatchCrossChainCall(
            collateral, // inputToken: The collateral token on the source chain
            amount, // amount: The amount of collateral to bet
            targetToken, // targetToken: The ZRC20 token on the target chain
            recipient, // destinationAddress: The recipient address on the target chain
            false // withdrawFlag: false, as we are placing a bet, not withdrawing
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
        // Refund user with Gamba tokens
        require(zrc20 == gambaToken, "PolymarketAdapter: Invalid ZRC20 token for refund.");
        require(IGambaToken(gambaToken).transfer(context.zetaTxSenderAddress, amount),
            "Refund failed");
        emit GambaRefund(context.zetaTxSenderAddress, amount);
    }
 
     /// @notice Allows the owner to withdraw any excess gas fees.
     /// @param to The address to send the withdrawn funds to.
     function withdrawGas(address to) external onlyOwner {
         uint256 balance = address(this).balance;
         require(balance > 0, "No gas to withdraw");
         payable(to).transfer(balance);
     }
 }