// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {SystemContract, IZRC20} from "./dependencies/SystemContract.sol";
import {SwapHelperLib} from "./dependencies/SwapHelperLib.sol";
import {BytesHelperLib} from "./dependencies/BytesHelperLib.sol";
import "./dependencies/IUniswapV2Router02.sol";

import {RevertContext, RevertOptions} from "./dependencies/Revert.sol";
import "./dependencies/UniversalContract.sol";
import "./dependencies/IGatewayZEVM.sol";
import "./dependencies/IWZETA.sol";
import {GatewayZEVM} from "./dependencies/GatewayZEVM.sol";

import {Initializable} from "./dependencies/Initializable.sol";
import {OwnableUpgradeable} from "./dependencies/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "./dependencies/UUPSUpgradeable.sol";

struct CrossChainSettlementPayload {
    address targetToken;
    bytes recipient;
    bool withdraw;
    bytes32 swapId;
}

contract CrossChainSettlement is
    UniversalContract,
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    address public uniswapRouter;
    GatewayZEVM public override gateway;
    uint256 constant BITCOIN = 8332;
    uint256 constant BITCOIN_TESTNET = 18334;
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

    modifier onlyGateway() override {
        if (msg.sender != address(gateway)) revert Unauthorized();
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
    ) external initializer {
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
    ) external returns (bytes32) {
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

        _dispatch(abi.encodePacked(msg.sender), inputToken, amount, payload);
        return swapId;
    }

    function onCall(
        MessageContext calldata context,
        bytes calldata message
    ) external payable override onlyGateway {
        // Implementation for onCall with native ZETA transfers
        revert("Not implemented: onCall with native ZETA transfers");
    }

    function onCall(
        MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override onlyGateway {
        CrossChainSettlementPayload memory payload;

        if (context.chainID == BITCOIN_TESTNET || context.chainID == BITCOIN) {
            if (message.length < 41) revert InvalidMessageLength();
            payload.targetToken = BytesHelperLib.bytesToAddress(message, 0);
            bytes memory recipient = new bytes(message.length - 21);
            for (uint256 i = 0; i < message.length - 21; i++) {
                recipient[i] = message[20 + i];
            }
            payload.recipient = recipient;
            payload.withdraw = BytesHelperLib.bytesToBool(
                message,
                message.length - 1
            );
        } else {
            payload = abi.decode(
                message,
                (CrossChainSettlementPayload)
            );
        }

        // Check if the swap exists and is not confirmed or cancelled
        if (
            swaps[payload.swapId].inputToken == address(0) ||
            swaps[payload.swapId].confirmed ||
            swaps[payload.swapId].cancelled
        ) {
            revert InvalidSwapState();
        }

        _dispatch(context.sender, zrc20, amount, payload);
    }

    function _dispatch(
        bytes memory sender,
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
            sender,
            payload.recipient,
            inputToken,
            payload.targetToken,
            amount,
            out
        );

        _withdraw(sender, inputToken, gasFee, gasZRC20, out, payload);
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
        bytes memory sender,
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
                abi.encodePacked(payload.recipient),
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
            bool success = IZRC20(payload.targetToken).transfer(
                address(uint160(bytes20(payload.recipient))),
                out
            );
            if (!success) {
                revert TransferFailed(
                    "Failed to transfer target tokens to the recipient on ZetaChain"
                );
            }
        }
    }

    function onRevert(RevertContext calldata context) external override onlyGateway {
        (bytes32 swapId, address zrc20) = abi.decode(
            context.revertMessage,
            (bytes32, address)
        );
        // Mark the swap as cancelled
        swaps[swapId].cancelled = true;

        (uint256 out, , ) = handleGasAndSwap(
            context.asset,
            context.amount,
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

    function confirmSwap(bytes32 swapId) external {
        Swap storage swap = swaps[swapId];
        if (swap.inputToken == address(0)) revert SwapNotFound();
        if (swap.confirmed || swap.cancelled) revert InvalidSwapState();
        if (swap.sender != abi.encodePacked(msg.sender)) revert UnauthorizedCaller();

        // Re-dispatch the swap to complete it
        _dispatch(swap.sender, swap.inputToken, swap.inputAmount, CrossChainSettlementPayload({
            targetToken: swap.targetToken,
            recipient: swap.recipient,
            withdraw: true, // Assuming confirmSwap implies withdrawal
            swapId: swapId
        }));
    }

    function cancelSwap(bytes32 swapId) external {
        Swap storage swap = swaps[swapId];
        if (swap.inputToken == address(0)) revert SwapNotFound();
        if (swap.confirmed || swap.cancelled) revert InvalidSwapState();
        if (swap.sender != abi.encodePacked(msg.sender)) revert UnauthorizedCaller();

        // Mark the swap as cancelled
        swap.cancelled = true;

        // Refund the tokens to the sender
        bool success = IZRC20(swap.inputToken).transfer(
            address(uint160(BytesHelperLib.bytesToAddress(swap.sender, 0))),
            swap.inputAmount
        );
        if (!success) {
            revert TransferFailed("Failed to refund tokens during cancellation");
        }
    }

    function quoteMinInput(
        address inputToken,
        address targetToken
    ) public view returns (uint256) {
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