// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface IZetaConnector {
    function sendToEvm(
        uint256 chainId,
        address evmAddress,
        uint256 amount
    ) external;
}
