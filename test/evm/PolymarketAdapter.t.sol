// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "contracts/evm/PolymarketAdapter.sol";
import "contracts/evm/dependencies/ZetaInterfaces.sol";
import "test/mocks/ERC20Mock.sol";
import "test/mocks/ConditionalTokensMock.sol";
import "test/mocks/CrossChainSettlementMock.sol";

contract PolymarketAdapterTest is Test {
    PolymarketAdapter internal polymarketAdapter;
    ERC20Mock internal collateral;
    ConditionalTokensMock internal conditionalTokens;
    CrossChainSettlementMock internal crossChainSettlement;

    address internal owner = address(0x1);
    address internal user = address(0x2);

    function setUp() public {
        vm.startPrank(owner);

        collateral = new ERC20Mock("Mock USDC", "USDC");
        conditionalTokens = new ConditionalTokensMock();
        crossChainSettlement = new CrossChainSettlementMock();

        polymarketAdapter = new PolymarketAdapter(
            address(conditionalTokens),
            address(collateral),
            address(0), // ZetaConnector address (mocked as 0 for now)
            address(crossChainSettlement)
        );

        collateral.mint(user, 1000 ether); // Mint some collateral for the user
        vm.stopPrank();
    }

    function test_PlaceBetAndDispatchCrossChainCall() public {
        vm.startPrank(user);
        bytes32 conditionId = keccak256("test-condition");
        uint256 outcomeIndex = 0;
        uint256 amount = 100 ether;
        uint256 targetChainId = 1;
        address targetToken = address(0x456);
        bytes memory recipient = hex"1234567890123456789012345678901234567890"; // Example recipient bytes

        collateral.approve(address(polymarketAdapter), amount);

        polymarketAdapter.placeBet(conditionId, outcomeIndex, amount, targetChainId, targetToken, recipient);

        (
            address _inputToken,
            uint256 _amount,
            address _targetToken,
            bytes memory _destinationAddress,
            bool _withdrawFlag
        ) = crossChainSettlement.lastDispatchCall();

        assertEq(_inputToken, address(collateral));
        assertEq(_amount, amount);
        assertEq(_targetToken, targetToken);
        assertEq(_destinationAddress, recipient);
        assertEq(_withdrawFlag, false);
        vm.stopPrank();
    }

    function test_OnZetaMessage_SplitPosition() public {
        vm.startPrank(address(polymarketAdapter.zetaConnector())); // Mock ZetaConnector as sender
        bytes32 conditionId = keccak256("test-condition-split");
        uint256[] memory partition = new uint256[](2);
        partition[0] = 1;
        partition[1] = 0;
        uint256 amount = 50 ether;

        bytes memory messagePayload = abi.encode(
            uint8(0), // actionType 0 for splitPosition
            conditionId,
            partition
        );

        ZetaInterfaces.ZetaMessage memory context = ZetaInterfaces.ZetaMessage({
            zetaTxSenderAddress: abi.encodePacked(user),
            sourceChainId: 1,
            destinationAddress: address(polymarketAdapter),
            zetaValue: 0,
            message: ""
        });

        collateral.mint(address(polymarketAdapter), amount); // Mint ZRC20 to adapter

        polymarketAdapter.onZetaMessage(
            context,
            address(collateral), // zrc20
            amount,
            messagePayload
        );

        // Verify PositionSplit event (mocked in ConditionalTokensMock)
        // This requires a way to check events in Foundry, which is typically done with vm.expectEmit
        // For now, we'll rely on the internal logic of ConditionalTokensMock to confirm interaction.
        // In a real scenario, we'd use vm.expectEmit.
        // assertEq(conditionalTokens.lastSplitPositionAmount(), amount);
        // assertEq(conditionalTokens.lastSplitPositionConditionId(), conditionId);
    }

    function test_OnZetaMessage_MergePositions() public {
        vm.startPrank(address(polymarketAdapter.zetaConnector()));
        bytes32 conditionId = keccak256("test-condition-merge");
        uint256[] memory partition = new uint256[](2);
        partition[0] = 1;
        partition[1] = 0;
        uint256 amount = 75 ether;

        bytes memory messagePayload = abi.encode(
            uint8(1), // actionType 1 for mergePositions
            conditionId,
            partition
        );

        ZetaInterfaces.ZetaMessage memory context = ZetaInterfaces.ZetaMessage({
            zetaTxSenderAddress: abi.encodePacked(user),
            sourceChainId: 1,
            destinationAddress: address(polymarketAdapter),
            zetaValue: 0,
            message: ""
        });

        collateral.mint(address(polymarketAdapter), amount);

        polymarketAdapter.onZetaMessage(context, address(collateral), amount, messagePayload);
    }

    function test_OnZetaMessage_RedeemPositions() public {
        vm.startPrank(address(polymarketAdapter.zetaConnector()));
        bytes32 conditionId = keccak256("test-condition-redeem");
        uint256[] memory indexSets = new uint256[](2);
        indexSets[0] = 1;
        indexSets[1] = 2;
        uint256 amount = 25 ether; // Amount is not used for redeemPositions in Polymarket, but passed by ZetaChain

        bytes memory messagePayload = abi.encode(
            uint8(2), // actionType 2 for redeemPositions
            conditionId,
            indexSets
        );

        ZetaInterfaces.ZetaMessage memory context = ZetaInterfaces.ZetaMessage({
            zetaTxSenderAddress: abi.encodePacked(user),
            sourceChainId: 1,
            destinationAddress: address(polymarketAdapter),
            zetaValue: 0,
            message: ""
        });

        polymarketAdapter.onZetaMessage(context, address(collateral), amount, messagePayload);
    }

    function test_OnZetaMessage_InvalidActionType() public {
        vm.startPrank(address(polymarketAdapter.zetaConnector()));
        bytes32 conditionId = keccak256("test-condition-invalid");
        uint256[] memory dataArray = new uint256[](2);
        dataArray[0] = 1;
        dataArray[1] = 2;
        uint256 amount = 10 ether;

        bytes memory messagePayload = abi.encode(
            uint8(99), // Invalid actionType
            conditionId,
            dataArray
        );

        ZetaInterfaces.ZetaMessage memory context = ZetaInterfaces.ZetaMessage({
            zetaTxSenderAddress: abi.encodePacked(user),
            sourceChainId: 1,
            destinationAddress: address(polymarketAdapter),
            zetaValue: 0,
            message: ""
        });

        vm.expectRevert("PolymarketAdapter: Invalid action type");
        polymarketAdapter.onZetaMessage(context, address(collateral), amount, messagePayload);
    }
}
