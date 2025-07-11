// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "contracts/evm/CrossChainSettlement.sol";

contract CrossChainSettlementMock is CrossChainSettlement {
    bytes public lastRecipient;
    uint256 public lastAmount;
    address public lastTargetToken;
    bool public lastWithdrawFlag;
    address public lastInputToken;

    function dispatchCrossChainCall(
        address inputToken,
        uint256 amount,
        address targetToken,
        bytes memory destinationAddress,
        bool withdrawFlag
    ) external override returns (bytes32) {
        lastInputToken = inputToken;
        lastAmount = amount;
        lastTargetToken = targetToken;
        lastRecipient = destinationAddress;
        lastWithdrawFlag = withdrawFlag;
        return keccak256("mock_swap_id");
    }

    function lastDispatchCall() public view returns (address, uint256, address, bytes memory, bool) {
        return (lastInputToken, lastAmount, lastTargetToken, lastRecipient, lastWithdrawFlag);
    }

    // Mock onCall functions to avoid reverts during testing if they are called
    function onCall(ZetaInterfaces.ZetaMessage calldata context, bytes calldata message) external payable override {
        // Mock implementation
    }

    function onCall(ZetaInterfaces.ZetaMessage calldata context, address zrc20, uint256 amount, bytes calldata message)
        external
        override
    {
        // Mock implementation
    }

    function onRevert(RevertContext calldata context) external override {
        // Mock implementation
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
