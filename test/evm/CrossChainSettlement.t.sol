// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import {CrossChainSettlement} from "../../contracts/evm/CrossChainSettlement.sol";
import {IZRC20} from "../../contracts/evm/dependencies/SystemContract.sol";
import {GatewayZEVM} from "../../contracts/evm/dependencies/GatewayZEVM.sol";
import {ZetaInterfaces} from "../../contracts/evm/dependencies/ZetaInterfaces.sol";

contract CrossChainSettlementTest is Test {
    CrossChainSettlement public settlement;
    GatewayZEVM public mockGateway;
    IZRC20 public mockZRC20;
    IUniswapV2Router02 public mockUniswapRouter;

    address public constant GAMBA_TOKEN = address(0xGaMbA); // Mock Gamba Token Address
    address public constant COLLATERAL_TOKEN = address(0xC011a73); // Mock Collateral Token Address

    function setUp() public {
        mockGateway = new GatewayZEVM();
        mockZRC20 = IZRC20(makeAddr("mockZRC20"));
        mockUniswapRouter = IUniswapV2Router02(makeAddr("mockUniswapRouter"));

        settlement = new CrossChainSettlement();
        settlement.initialize(
            payable(address(mockGateway)),
            address(mockUniswapRouter),
            1000000, // gasLimit
            address(this) // owner
        );
    }

    function testInitiateSwap_SolanaRecipient() public {
        // Mock Solana address (32 bytes)
        bytes memory solanaRecipient = hex"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

        // Mock ZRC20 transferFrom
        vm.mockCall(
            address(COLLATERAL_TOKEN),
            abi.encodeWithSelector(IZRC20.transferFrom.selector, address(this), address(settlement), 100),
            abi.encode(true)
        );

        // Mock Gateway withdraw
        vm.mockCall(
            address(mockGateway),
            abi.encodeWithSelector(mockGateway.withdraw.selector, solanaRecipient, 0, COLLATERAL_TOKEN, ZetaInterfaces.RevertOptions(address(0), false, address(0), "", 0)),
            abi.encode(true)
        );

        bytes32 swapId = settlement.initiateSwap(
            COLLATERAL_TOKEN,
            100,
            COLLATERAL_TOKEN,
            solanaRecipient,
            true // withdrawFlag
        );

        assertEq(settlement.swaps(swapId).recipient, solanaRecipient);
        assertTrue(settlement.swaps(swapId).confirmed); // Should be confirmed after dispatch
    }

    function testInitiateSwap_TONRecipient() public {
        // Mock TON address (32 bytes)
        bytes memory tonRecipient = hex"fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210";

        // Mock ZRC20 transferFrom
        vm.mockCall(
            address(COLLATERAL_TOKEN),
            abi.encodeWithSelector(IZRC20.transferFrom.selector, address(this), address(settlement), 100),
            abi.encode(true)
        );

        // Mock Gateway withdraw
        vm.mockCall(
            address(mockGateway),
            abi.encodeWithSelector(mockGateway.withdraw.selector, tonRecipient, 0, COLLATERAL_TOKEN, ZetaInterfaces.RevertOptions(address(0), false, address(0), "", 0)),
            abi.encode(true)
        );

        bytes32 swapId = settlement.initiateSwap(
            COLLATERAL_TOKEN,
            100,
            COLLATERAL_TOKEN,
            tonRecipient,
            true // withdrawFlag
        );

        assertEq(settlement.swaps(swapId).recipient, tonRecipient);
        assertTrue(settlement.swaps(swapId).confirmed); // Should be confirmed after dispatch
    }

    function testOnCall_SolanaRecipient() public {
        // Mock Solana address (32 bytes)
        bytes memory solanaRecipient = hex"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
        bytes32 swapId = keccak256(abi.encodePacked(address(this), COLLATERAL_TOKEN, 100, COLLATERAL_TOKEN, solanaRecipient, block.timestamp));

        // Manually set up a swap in the mapping
        settlement.swaps(swapId).inputToken = COLLATERAL_TOKEN;
        settlement.swaps(swapId).inputAmount = 100;
        settlement.swaps(swapId).targetToken = COLLATERAL_TOKEN;
        settlement.swaps(swapId).recipient = solanaRecipient;
        settlement.swaps(swapId).timestamp = block.timestamp;
        settlement.swaps(swapId).confirmed = false;
        settlement.swaps(swapId).cancelled = false;

        CrossChainSettlement.CrossChainSettlementPayload memory payload = CrossChainSettlement.CrossChainSettlementPayload({
            targetToken: COLLATERAL_TOKEN,
            recipient: solanaRecipient,
            withdraw: true,
            swapId: swapId
        });

        ZetaInterfaces.ZetaMessage memory context = ZetaInterfaces.ZetaMessage({
            zetaTxSenderAddress: abi.encodePacked(address(this)),
            sourceChainId: 1, // Mock source chain ID
            destinationAddress: address(settlement),
            zetaValue: 0,
            message: ""
        });

        // Mock ZRC20 withdrawGasFee
        vm.mockCall(
            address(COLLATERAL_TOKEN),
            abi.encodeWithSelector(IZRC20.withdrawGasFee.selector),
            abi.encode(COLLATERAL_TOKEN, 0)
        );

        // Mock UniswapRouter swapExactTokensForTokens
        vm.mockCall(
            address(mockUniswapRouter),
            abi.encodeWithSelector(IUniswapV2Router02.swapExactTokensForTokens.selector, 0, 0, address(0), address(0), 0),
            abi.encode(100)
        );

        // Mock Gateway withdraw
        vm.mockCall(
            address(mockGateway),
            abi.encodeWithSelector(mockGateway.withdraw.selector, solanaRecipient, 100, COLLATERAL_TOKEN, ZetaInterfaces.RevertOptions(address(0), false, address(0), "", 0)),
            abi.encode(true)
        );

        // Call onZetaMessage
        settlement.onCall(context, COLLATERAL_TOKEN, 100, abi.encode(payload));

        assertTrue(settlement.swaps(swapId).confirmed);
    }

    function testOnCall_TONRecipient() public {
        // Mock TON address (32 bytes)
        bytes memory tonRecipient = hex"fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210";
        bytes32 swapId = keccak256(abi.encodePacked(address(this), COLLATERAL_TOKEN, 100, COLLATERAL_TOKEN, tonRecipient, block.timestamp));

        // Manually set up a swap in the mapping
        settlement.swaps(swapId).inputToken = COLLATERAL_TOKEN;
        settlement.swaps(swapId).inputAmount = 100;
        settlement.swaps(swapId).targetToken = COLLATERAL_TOKEN;
        settlement.swaps(swapId).recipient = tonRecipient;
        settlement.swaps(swapId).timestamp = block.timestamp;
        settlement.swaps(swapId).confirmed = false;
        settlement.swaps(swapId).cancelled = false;

        CrossChainSettlement.CrossChainSettlementPayload memory payload = CrossChainSettlement.CrossChainSettlementPayload({
            targetToken: COLLATERAL_TOKEN,
            recipient: tonRecipient,
            withdraw: true,
            swapId: swapId
        });

        ZetaInterfaces.ZetaMessage memory context = ZetaInterfaces.ZetaMessage({
            zetaTxSenderAddress: abi.encodePacked(address(this)),
            sourceChainId: 1, // Mock source chain ID
            destinationAddress: address(settlement),
            zetaValue: 0,
            message: ""
        });

        // Mock ZRC20 withdrawGasFee
        vm.mockCall(
            address(COLLATERAL_TOKEN),
            abi.encodeWithSelector(IZRC20.withdrawGasFee.selector),
            abi.encode(COLLATERAL_TOKEN, 0)
        );

        // Mock UniswapRouter swapExactTokensForTokens
        vm.mockCall(
            address(mockUniswapRouter),
            abi.encodeWithSelector(IUniswapV2Router02.swapExactTokensForTokens.selector, 0, 0, address(0), address(0), 0),
            abi.encode(100)
        );

        // Mock Gateway withdraw
        vm.mockCall(
            address(mockGateway),
            abi.encodeWithSelector(mockGateway.withdraw.selector, tonRecipient, 100, COLLATERAL_TOKEN, ZetaInterfaces.RevertOptions(address(0), false, address(0), "", 0)),
            abi.encode(true)
        );

        // Call onZetaMessage
        settlement.onCall(context, COLLATERAL_TOKEN, 100, abi.encode(payload));

        assertTrue(settlement.swaps(swapId).confirmed);
    }
}