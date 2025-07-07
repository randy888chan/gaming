// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts/ccip/libraries/Client.sol";

contract MockRouter is IRouterClient {
    function ccipSend(uint64 destinationChainSelector, Client.EVM2AnyMessage memory message)
        external
        payable
        returns (bytes32)
    {
        return bytes32(keccak256(abi.encodePacked(destinationChainSelector, message.receiver, message.data)));
    }

    function getFee(uint64, Client.EVM2AnyMessage memory) external view returns (uint256 fee) {
        return 1 ether;
    }

    function getSupportedTokens(uint64) external view returns (address[] memory) {
        address[] memory tokens = new address[](1);
        tokens[0] = address(0);
        return tokens;
    }

    function isChainSupported(uint64) external view returns (bool) {
        return true;
    }
}