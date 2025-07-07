// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./dependencies/ZetaInterfaces.sol";
import "./dependencies/ZetaCommon.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./dependencies/BytesLib.sol";

/// @title CrossChainBridge
/// @author Quantum Nexus
/// @notice This contract facilitates cross-chain bridging between EVM, Solana, and TON.
contract CrossChainBridge is ZetaCommon, ZetaReceiver {
    using BytesLib for bytes;
    /// @notice The address of the token to be bridged.
    IERC20 public immutable bridgeToken;

    event EVMTransfer(address indexed zrc20, uint256 amount, string destinationChain, address recipient);
    event SolanaTransfer(address indexed zrc20, uint256 amount, string recipient);
    event TONTransfer(address indexed zrc20, uint256 amount, bytes32 recipient);

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
    struct Settlement {
        string destinationChain;
        string destinationAddress;
        uint256 amount;
    }

    function onZetaMessage(
        ZetaInterfaces.ZetaMessage calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override isValidMessage(context) {
        Settlement[] memory settlements = abi.decode(message, (Settlement[]));
        
        uint256 totalSettlementAmount;
        for (uint256 i = 0; i < settlements.length; i++) {
            totalSettlementAmount += settlements[i].amount;
        }
        require(totalSettlementAmount == amount, "CrossChainBridge: Amount mismatch");

        for (uint256 i = 0; i < settlements.length; i++) {
            Settlement memory settlement = settlements[i];
            
            if (keccak256(abi.encodePacked(settlement.destinationChain)) == keccak256(abi.encodePacked("Ethereum"))) {
                _sendToEVM(context, zrc20, settlement.amount, settlement.destinationAddress, 1, settlement.destinationChain);
            } else if (keccak256(abi.encodePacked(settlement.destinationChain)) == keccak256(abi.encodePacked("Polygon"))) {
                _sendToEVM(context, zrc20, settlement.amount, settlement.destinationAddress, 137, settlement.destinationChain);
            } else if (keccak256(abi.encodePacked(settlement.destinationChain)) == keccak256(abi.encodePacked("BSC"))) {
                _sendToEVM(context, zrc20, settlement.amount, settlement.destinationAddress, 56, settlement.destinationChain);
            } else if (keccak256(abi.encodePacked(settlement.destinationChain)) == keccak256(abi.encodePacked("Solana"))) {
                _sendToSolana(context, zrc20, settlement.amount, settlement.destinationAddress);
            } else if (keccak256(abi.encodePacked(settlement.destinationChain)) == keccak256(abi.encodePacked("TON"))) {
                _sendToTON(context, zrc20, settlement.amount, settlement.destinationAddress);
            } else {
                revert("CrossChainBridge: Unsupported destination chain");
            }
        }
    }


    function _sendToEVM(
        ZetaInterfaces.ZetaMessage calldata context,
        address zrc20,
        uint256 amount,
        string memory destinationAddress,
        uint256 chainId,
        string memory destinationChain
    ) private {
        // Validate destination address format
        require(bytes(destinationAddress).length == 42 && keccak256(bytes(destinationAddress).slice(0, 2)) == keccak256("0x"), "CrossChainBridge: Invalid EVM address");
        
        // Convert string address to bytes20
        address evmAddress = address(uint160(uint256(keccak256(bytes(destinationAddress)))));
        
        // Send to EVM chain using ZetaChain connector
        IZetaConnector(zetaConnector).sendToEvm(chainId, evmAddress, amount);
        
        // Emit transfer event
        emit EVMTransfer(zrc20, amount, destinationChain, evmAddress);
    }
    
    function _sendToSolana(
        ZetaInterfaces.ZetaMessage calldata context,
        address zrc20,
        uint256 amount,
        string memory destinationAddress
    ) private {
        // Validate Solana address format (44 characters base58)
        require(bytes(destinationAddress).length == 44, "CrossChainBridge: Invalid Solana address length");
        
        // Implementation to send to Solana using ZetaChain connector
        // Example: zetaConnector.sendToSolana(destinationAddress, amount);
        emit SolanaTransfer(zrc20, amount, destinationAddress);
    }

    function _sendToTON(
        ZetaInterfaces.ZetaMessage calldata context,
        address zrc20,
        uint256 amount,
        string memory destinationAddress
    ) private {
        // Validate TON address format (64 hex chars without 0x)
        require(bytes(destinationAddress).length == 64, "CrossChainBridge: Invalid TON address length");
        
        // Convert to bytes32
        bytes32 tonAddress = bytes32(abi.encodePacked(destinationAddress));
        
        // Implementation to send to TON using ZetaChain connector
        // Example: zetaConnector.sendToTON(tonAddress, amount);
        emit TONTransfer(zrc20, amount, tonAddress);
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
        // Extract the original sender from the message
        (address sender) = abi.decode(message, (address));
        address payable originalSender = payable(sender);
        
        // Refund the user by sending back the tokens
        require(bridgeToken.transfer(originalSender, amount), "CrossChainBridge: Token transfer failed");
    }
}