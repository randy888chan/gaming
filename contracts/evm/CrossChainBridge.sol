// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@zetachain/protocol-contracts/contracts/ZetaInterfaces.sol";
import "@zetachain/protocol-contracts/contracts/ZetaCommon.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title CrossChainBridge
/// @author Quantum Nexus
/// @notice This contract facilitates cross-chain bridging between EVM, Solana, and TON.
contract CrossChainBridge is ZetaCommon, ZetaReceiver {
    /// @notice The address of the token to be bridged.
    IERC20 public immutable bridgeToken;

    /// @param _zetaConnector The address of the ZetaChain connector.
    /// @param _bridgeToken The address of the token to be bridged.
    constructor(
        address _zetaConnector,
        address _bridgeToken
    ) ZetaCommon(_zetaConnector) {
        bridgeToken = IERC20(_bridgeToken);
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
        // Decode the message to determine the destination chain and address
        (string memory destinationChain, string memory destinationAddress) =
            abi.decode(message, (string, string));

        // In a real implementation, you would have logic to handle transfers
        // to different chains (e.g., Solana, TON).
        // This is a simplified example.
        if (keccak256(abi.encodePacked(destinationChain)) == keccak256(abi.encodePacked("Solana"))) {
            // Handle transfer to Solana
        } else if (keccak256(abi.encodePacked(destinationChain)) == keccak256(abi.encodePacked("TON"))) {
            // Handle transfer to TON
        } else {
            revert("CrossChainBridge: Unsupported destination chain");
        }
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
}