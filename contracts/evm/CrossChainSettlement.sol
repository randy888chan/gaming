// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {SystemContract, IZRC20} from "./dependencies/SystemContract.sol";
import {SwapHelperLib} from "./dependencies/SwapHelperLib.sol";
import {BytesHelperLib} from "./dependencies/BytesHelperLib.sol";
import "./dependencies/IUniswapV2Router02.sol";
import {ZetaInterfaces} from "./dependencies/ZetaInterfaces.sol";

import {RevertContext, RevertOptions} from "./dependencies/Revert.sol";
import "./dependencies/UniversalContract.sol";
import "./dependencies/IGatewayZEVM.sol";
import "./dependencies/IWZETA.sol";
import {GatewayZEVM} from "./dependencies/GatewayZEVM.sol";

import {Initializable} from "./dependencies/Initializable.sol";
import {OwnableUpgradeable} from "./dependencies/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "./dependencies/UUPSUpgradeable.sol";

interface ICrossChainSettlement {
    struct CrossChainSettlementPayload {
        address targetToken;
        bytes recipient;
        bool withdraw;
        bytes32 swapId;
    }

    struct Swap {
        bytes sender;
        address inputToken;
        uint256 inputAmount;
        address targetToken;
        bytes recipient;
        uint256 timestamp;
        bool confirmed;
        bool cancelled;
    }

    event TokenSwap(
        bytes sender,
        bytes indexed recipient,
        address indexed inputToken,
        address indexed targetToken,
        uint256 inputAmount,
        uint256 outputAmount
    );

    function initialize(
        address payable gatewayAddress,
        address uniswapRouterAddress,
        uint256 gasLimitAmount,
        address owner
    ) external;

    function initiateSwap(
        address inputToken,
        uint256 amount,
        address targetToken,
        bytes memory recipient,
        bool withdrawFlag
    ) external returns (bytes32);

    function onZetaMessage(
        ZetaInterfaces.ZetaMessage calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external;

    function onZetaRevert(
        ZetaInterfaces.ZetaMessage calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external;

    function confirmSwap(bytes32 swapId) external;

    function cancelSwap(bytes32 swapId) external;

    function dispatchCrossChainCall(
        address inputToken,
        uint256 amount,
        address targetToken,
        bytes memory destinationAddress,
        bool withdrawFlag
    ) external returns (bytes32);

    function quoteMinInput(
        address inputToken,
        address targetToken
    ) external view returns (uint256);
}

abstract contract CrossChainSettlementBase is
    UniversalContract,
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ICrossChainSettlement
{
    address public uniswapRouter;
    uint256 public gasLimit;

    error InvalidAddress();
    
    error ApprovalFailed();
    error TransferFailed(string);
    error InsufficientAmount(string);
    error InvalidMessageLength();
    error SwapNotFound();
    error InvalidSwapState();
    error UnauthorizedCaller();

    mapping(bytes32 => Swap) public swaps;

    modifier onlyGateway() override {
        if (msg.sender != address(gateway)) revert UnauthorizedCaller();
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address payable gatewayAddress,
        address uniswapRouterAddress,
        uint256 gasLimitAmount,
        address owner
    ) public virtual initializer {
        if (gatewayAddress == address(0) || uniswapRouterAddress == address(0))
            revert InvalidAddress();
        __UUPSUpgradeable_init();
        __Ownable_init(owner);
        uniswapRouter = uniswapRouterAddress;
        gateway = GatewayZEVM(gatewayAddress);
        gasLimit = gasLimitAmount;
    }

    function initiateSwap(
        address inputToken,
        uint256 amount,
        address targetToken,
        bytes memory recipient,
        bool withdrawFlag
    ) public virtual returns (bytes32) {
        // No change needed here, recipient is already bytes.
        // This block is for context and to ensure the diff applies correctly.
        bool success = IZRC20(inputToken).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        if (!success) {
            revert TransferFailed(
                "Failed to transfer ZRC-20 tokens from the sender to the contract"
            );
        }

        bytes32 swapId = keccak256(
            abi.encodePacked(
                msg.sender,
                inputToken,
                amount,
                targetToken,
                recipient,
                block.timestamp
            )
        );

        swaps[swapId] = Swap({
            sender: abi.encodePacked(msg.sender),
            inputToken: inputToken,
            inputAmount: amount,
            targetToken: targetToken,
            recipient: recipient,
            timestamp: block.timestamp,
            confirmed: false,
            cancelled: false
        });

        CrossChainSettlementPayload memory payload = CrossChainSettlementPayload({
            targetToken: targetToken,
            recipient: recipient,
            withdraw: withdrawFlag,
            swapId: swapId
        });

        ZetaInterfaces.ZetaMessage memory contextMem = ZetaInterfaces.ZetaMessage({
            zetaTxSenderAddress: abi.encodePacked(msg.sender), // Use msg.sender as the ZetaTxSenderAddress
            sourceChainId: block.chainid,
            destinationAddress: address(this),
            zetaValue: 0,
            message: ""
        });
        
        // Convert memory to calldata by calling the function directly
        _dispatchWithMemory(contextMem, inputToken, amount, payload);
        return swapId;
    }

    function onZetaMessage(
        ZetaInterfaces.ZetaMessage calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) public virtual override onlyGateway {
        CrossChainSettlementPayload memory payload;

        // Decode the payload directly for all chains.
        // The contract should be generic and not handle chain-specific address formats here.
        payload = abi.decode(message, (CrossChainSettlementPayload));

        // Check if the swap exists and is not confirmed or cancelled
        if (
            swaps[payload.swapId].inputToken == address(0) ||
            swaps[payload.swapId].confirmed ||
            swaps[payload.swapId].cancelled
        ) {
            revert InvalidSwapState();
        }

        _dispatch(context, zrc20, amount, payload);
    }

    // Implement the UniversalContract onCall functions
    function onCall(
        ZetaInterfaces.ZetaMessage calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) public virtual override(UniversalContract) onlyGateway {
        // Delegate to our own onZetaMessage function
        onZetaMessage(context, zrc20, amount, message);
    }

    function onCall(ZetaInterfaces.ZetaMessage calldata context, bytes calldata message) external payable override(UniversalContract) onlyGateway {
        // This function is not used in our implementation
        revert("Not implemented");
    }

    function _dispatch(
        ZetaInterfaces.ZetaMessage calldata context,
        address inputToken,
        uint256 amount,
        CrossChainSettlementPayload memory payload
    ) internal {
        // Update the swap status to confirmed
        swaps[payload.swapId].confirmed = true;

        (uint256 out, address gasZRC20, uint256 gasFee) = handleGasAndSwap(
            inputToken,
            amount,
            payload.targetToken,
            payload.withdraw
        );

        emit TokenSwap(
            context.zetaTxSenderAddress,
            payload.recipient,
            inputToken,
            payload.targetToken,
            amount,
            out
        );

        _withdraw(context, inputToken, gasFee, gasZRC20, out, payload);
    }
    
    function _dispatchWithMemory(
        ZetaInterfaces.ZetaMessage memory context,
        address inputToken,
        uint256 amount,
        CrossChainSettlementPayload memory payload
    ) internal {
        // Create a calldata version by calling the original function
        this._dispatchInternal(context, inputToken, amount, payload);
    }
    
    function _dispatchInternal(
        ZetaInterfaces.ZetaMessage memory context,
        address inputToken,
        uint256 amount,
        CrossChainSettlementPayload memory payload
    ) external {
        require(msg.sender == address(this), "Only self call allowed");
        // Update the swap status to confirmed
        swaps[payload.swapId].confirmed = true;

        (uint256 out, address gasZRC20, uint256 gasFee) = handleGasAndSwap(
            inputToken,
            amount,
            payload.targetToken,
            payload.withdraw
        );

        emit TokenSwap(
            context.zetaTxSenderAddress,
            payload.recipient,
            inputToken,
            payload.targetToken,
            amount,
            out
        );

        _withdrawWithMemory(context, inputToken, gasFee, gasZRC20, out, payload);
    }

    function handleGasAndSwap(
        address inputToken,
        uint256 amount,
        address targetToken,
        bool withdrawFlag
    ) internal returns (uint256, address, uint256) {
        uint256 inputForGas;
        address gasZRC20;
        uint256 gasFee = 0;
        uint256 swapAmount = amount;

        if (withdrawFlag) {
            (gasZRC20, gasFee) = IZRC20(targetToken).withdrawGasFee();
            uint256 minInput = quoteMinInput(inputToken, targetToken);
            if (amount < minInput) {
                revert InsufficientAmount(
                    "The input amount is less than the min amount required to cover the withdraw gas fee"
                );
            }
            if (gasZRC20 == inputToken) {
                swapAmount = amount - gasFee;
            } else {
                inputForGas = SwapHelperLib.swapTokensForExactTokens(
                    uniswapRouter,
                    inputToken,
                    gasFee,
                    gasZRC20,
                    amount
                );
                swapAmount = amount - inputForGas;
            }
        }

        uint256 out = SwapHelperLib.swapExactTokensForTokens(
            uniswapRouter,
            inputToken,
            swapAmount,
            targetToken,
            0
        );
        return (out, gasZRC20, gasFee);
    }

    function _withdraw(
        ZetaInterfaces.ZetaMessage calldata context,
        address inputToken,
        uint256 gasFee,
        address gasZRC20,
        uint256 out,
        CrossChainSettlementPayload memory payload
    ) internal {
        if (payload.withdraw) {
            if (gasZRC20 == payload.targetToken) {
                if (!IZRC20(gasZRC20).approve(address(gateway), out + gasFee)) {
                    revert ApprovalFailed();
                }
            } else {
                if (!IZRC20(gasZRC20).approve(address(gateway), gasFee)) {
                    revert ApprovalFailed();
                }
                if (!IZRC20(payload.targetToken).approve(address(gateway), out)) {
                    revert ApprovalFailed();
                }
            }
            gateway.withdraw(
                payload.recipient, // Pass the raw bytes recipient to the gateway
                out,
                payload.targetToken,
                RevertOptions({
                    revertAddress: address(this),
                    callOnRevert: true,
                    abortAddress: address(0),
                    revertMessage: abi.encode(payload.swapId, inputToken),
                    onRevertGasLimit: gasLimit
                })
            );
        } else {
            // If not withdrawing, it's an internal transfer on ZetaChain.
            // This assumes the ZRC20 contract supports transfers to `bytes` recipients.
            // If not, this logic needs to be adjusted based on ZRC20 interface.
            // For now, we are ensuring the types are correct for cross-chain sends.
            bool success = IZRC20(payload.targetToken).transfer(
                address(uint160(BytesHelperLib.bytesMemoryToAddress(payload.recipient, 0))),
                out
            );
            if (!success) {
                revert TransferFailed("Failed to transfer target tokens to the recipient on ZetaChain");
            }
        }
    }
    
    function _withdrawWithMemory(
        ZetaInterfaces.ZetaMessage memory context,
        address inputToken,
        uint256 gasFee,
        address gasZRC20,
        uint256 out,
        CrossChainSettlementPayload memory payload
    ) internal {
        if (payload.withdraw) {
            if (gasZRC20 == payload.targetToken) {
                if (!IZRC20(gasZRC20).approve(address(gateway), out + gasFee)) {
                    revert ApprovalFailed();
                }
            } else {
                if (!IZRC20(gasZRC20).approve(address(gateway), gasFee)) {
                    revert ApprovalFailed();
                }
                if (!IZRC20(payload.targetToken).approve(address(gateway), out)) {
                    revert ApprovalFailed();
                }
            }
            gateway.withdraw(
                payload.recipient, // Pass the raw bytes recipient to the gateway
                out,
                payload.targetToken,
                RevertOptions({
                    revertAddress: address(this),
                    callOnRevert: true,
                    abortAddress: address(0),
                    revertMessage: abi.encode(payload.swapId, inputToken),
                    onRevertGasLimit: gasLimit
                })
            );
        } else {
            // If not withdrawing, it's an internal transfer on ZetaChain.
            // This assumes the ZRC20 contract supports transfers to `bytes` recipients.
            // If not, this logic needs to be adjusted based on ZRC20 interface.
            // For now, we are ensuring the types are correct for cross-chain sends.
            bool success = IZRC20(payload.targetToken).transfer(
                address(uint160(BytesHelperLib.bytesMemoryToAddress(payload.recipient, 0))),
                out
            );
            if (!success) {
                revert TransferFailed("Failed to transfer target tokens to the recipient on ZetaChain");
            }
        }
    }

    function onZetaRevert(
        ZetaInterfaces.ZetaMessage calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) public virtual override onlyGateway {
        // Extract swapId and inputToken from the message instead of revertMessage
        (bytes32 swapId, address inputToken) = abi.decode(
            message,
            (bytes32, address)
        );
        // Mark the swap as cancelled
        swaps[swapId].cancelled = true;

        (uint256 out, , ) = handleGasAndSwap(
            zrc20, // Use zrc20 directly instead of context.asset
            amount, // Use amount directly instead of context.amount
            zrc20,
            true
        );

        gateway.withdraw(
            abi.encodePacked(swapId),
            out,
            zrc20,
            RevertOptions({
                revertAddress: address(this), // Revert to this contract
                callOnRevert: false,
                abortAddress: address(0),
                revertMessage: "",
                onRevertGasLimit: gasLimit
            })
        );
    }

    function confirmSwap(bytes32 swapId) public virtual {
        Swap storage swap = swaps[swapId];
        if (swap.inputToken == address(0)) revert SwapNotFound();
        if (swap.confirmed || swap.cancelled) revert InvalidSwapState();
        // Compare using keccak256 for bytes comparison
        if (keccak256(swap.sender) != keccak256(abi.encodePacked(msg.sender))) revert UnauthorizedCaller();

        // Re-dispatch the swap to complete it
        ZetaInterfaces.ZetaMessage memory context = ZetaInterfaces.ZetaMessage({
            zetaTxSenderAddress: swap.sender, // Use the stored sender from the swap
            sourceChainId: block.chainid,
            destinationAddress: address(this),
            zetaValue: 0,
            message: ""
        });
        _dispatchWithMemory(context, swap.inputToken, swap.inputAmount, CrossChainSettlementPayload({
            targetToken: swap.targetToken,
            recipient: swap.recipient,
            withdraw: true, // Assuming confirmSwap implies withdrawal
            swapId: swapId
        }));
    }

    function cancelSwap(bytes32 swapId) public virtual {
        Swap storage swap = swaps[swapId];
        if (swap.inputToken == address(0)) revert SwapNotFound();
        if (swap.confirmed || swap.cancelled) revert InvalidSwapState();
        // Compare using keccak256 for bytes comparison
        if (keccak256(swap.sender) != keccak256(abi.encodePacked(msg.sender))) revert UnauthorizedCaller();

        // Mark the swap as cancelled
        swap.cancelled = true;

        // Refund the tokens to the sender. Assuming sender is always an EVM address for now.
        // Future: Potentially handle non-EVM sender refunds if cross-chain refunds to non-EVM chains are supported.
        bool success = IZRC20(swap.inputToken).transfer(
            address(uint160(BytesHelperLib.bytesStorageToAddress(swap.sender, 0))), // Assuming sender is an EVM address
            swap.inputAmount
        );
        if (!success) {
            revert TransferFailed("Failed to refund tokens during cancellation");
        }
    }

    function dispatchCrossChainCall(
        address inputToken,
        uint256 amount,
        address targetToken,
        bytes memory destinationAddress,
        bool withdrawFlag
    ) public virtual returns (bytes32) {
        CrossChainSettlementPayload memory payload = CrossChainSettlementPayload({
            targetToken: targetToken,
            recipient: destinationAddress,
            withdraw: withdrawFlag,
            swapId: keccak256(
                abi.encodePacked(
                    msg.sender,
                    inputToken,
                    amount,
                    targetToken,
                    destinationAddress,
                    block.timestamp
                )
            )
        });

        ZetaInterfaces.ZetaMessage memory context = ZetaInterfaces.ZetaMessage({
            zetaTxSenderAddress: abi.encodePacked(msg.sender), // Use msg.sender as the ZetaTxSenderAddress
            sourceChainId: block.chainid,
            destinationAddress: address(this),
            zetaValue: 0,
            message: ""
        });

        _dispatchWithMemory(context, inputToken, amount, payload);
        return payload.swapId;
    }

    function quoteMinInput(
        address inputToken,
        address targetToken
    ) public view virtual returns (uint256) {
        (address gasZRC20, uint256 gasFee) = IZRC20(targetToken)
            .withdrawGasFee();

        if (inputToken == gasZRC20) {
            return gasFee;
        }

        address zeta = IUniswapV2Router01(uniswapRouter).WETH();

        address[] memory path;
        if (inputToken == zeta || gasZRC20 == zeta) {
            path = new address[](2);
            path[0] = inputToken;
            path[1] = gasZRC20;
        } else {
            path = new address[](3);
            path[0] = inputToken;
            path[1] = zeta;
            path[2] = gasZRC20;
        }

        uint256[] memory amountsIn = IUniswapV2Router02(uniswapRouter)
            .getAmountsIn(gasFee, path);

        return amountsIn[0];
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}

contract CrossChainSettlement is CrossChainSettlementBase {
    // Contract is now complete
}