// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "contracts/evm/CrossChainSettlement.sol";
import "@zetachain/toolkit/SystemContract.sol";
import "@zetachain/protocol-contracts/zevm/interfaces/IGatewayZEVM.sol";
import "@uniswap/v2-periphery/interfaces/IUniswapV2Router02.sol";
import "test/mocks/MockGateway.sol";
import "test/mocks/MockUniswapRouter.sol";

contract CrossChainSettlementTest is Test {
    CrossChainSettlement internal settlementContract;
    MockGateway internal mockGateway;
    MockUniswapRouter internal mockUniswapRouter;

    address internal owner = address(0x1);
    address internal user = address(0x2);

    function setUp() public {
        vm.startPrank(owner);
        mockGateway = new MockGateway();
        mockUniswapRouter = new MockUniswapRouter();
        settlementContract = new CrossChainSettlement();
        settlementContract.initialize(
            payable(address(mockGateway)),
            address(mockUniswapRouter),
            500000,
            owner
        );
        vm.stopPrank();
    }

    function test_InitialState() public {
        assertEq(settlementContract.owner(), owner);
        assertEq(address(settlementContract.gateway()), address(mockGateway));
        assertEq(address(settlementContract.uniswapRouter()), address(mockUniswapRouter));
    }
}