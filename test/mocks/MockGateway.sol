// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@zetachain/protocol-contracts/zevm/GatewayZEVM.sol";
import "@zetachain/protocol-contracts/Revert.sol";

contract MockGateway is GatewayZEVM {
    function withdraw(
        bytes memory to,
        uint256 amount,
        address asset,
        RevertOptions memory options
    ) external payable {}

    function onRevert(
        address,
        uint256,
        bytes calldata,
        uint256,
        address,
        uint256,
        bytes calldata
    ) external pure {}
}