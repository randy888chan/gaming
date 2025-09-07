// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ZetaInterfaces} from "../dependencies/ZetaInterfaces.sol";

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

    function onCall(
        ZetaInterfaces.ZetaMessage calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external;

    function onRevert(
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