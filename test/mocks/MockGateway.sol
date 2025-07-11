// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "contracts/evm/dependencies/GatewayZEVM.sol"; // Corrected import path
import "contracts/evm/dependencies/Revert.sol"; // Corrected import path

contract MockGateway is GatewayZEVM {
    function withdraw(bytes memory to, uint256 amount, address asset, RevertOptions memory options) external payable {}

    function onRevert(address, uint256, bytes calldata, uint256, address, uint256, bytes calldata) external pure {}
}
