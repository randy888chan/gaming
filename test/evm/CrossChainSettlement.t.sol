// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "contracts/evm/CrossChainSettlement.sol";
import "@zetachain/toolkit/SystemContract.sol";
import "contracts/evm/dependencies/IGatewayZEVM.sol"; // Corrected import path
import "@uniswap/v2-periphery/interfaces/IUniswapV2Router02.sol";
import "test/mocks/MockGateway.sol";
import "test/mocks/MockUniswapRouter.sol";
import "contracts/evm/dependencies/ZetaInterfaces.sol"; // Import ZetaInterfaces

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
        uint256[] memory evmChains = new uint256[](2);
        evmChains[0] = 1; // Ethereum Mainnet
        evmChains[1] = 56; // BSC
        settlementContract.initialize(
            payable(address(mockGateway)), address(mockUniswapRouter), 500000, owner, evmChains
        );
        vm.stopPrank();
    }

    function test_IsEVMChain() public {
        // Test EVM chains
        assertTrue(settlementContract.isEVMChain(1));
        assertTrue(settlementContract.isEVMChain(56));

        // Test non-EVM chains
        assertFalse(settlementContract.isEVMChain(8332)); // Bitcoin
        assertFalse(settlementContract.isEVMChain(18334)); // Bitcoin Testnet
        assertFalse(settlementContract.isEVMChain(139)); // Solana
        assertFalse(settlementContract.isEVMChain(200)); // TON
    }

    function test_NonWithdrawTransferEVM() public {
        address recipient = address(0x123);
        bytes memory recipientBytes = abi.encodePacked(recipient);
        uint256 chainId = 1; // EVM chain

        // Setup message context and payload
        ZetaInterfaces.ZetaMessage memory context = ZetaInterfaces.ZetaMessage({
            zetaTxSenderAddress: bytes22(0),
            sourceChainId: chainId,
            destinationAddress: address(0),
            destinationChainId: 0,
            gasLimit: 0,
            message: "",
            zetaValue: 0,
            msgSender: address(0),
            sender: abi.encodePacked(user)
        });

        CrossChainSettlement.CrossChainSettlementPayload memory payload = CrossChainSettlement
            .CrossChainSettlementPayload({
            targetToken: address(0x456),
            recipient: recipientBytes,
            withdraw: false,
            swapId: keccak256("test")
        });

        // Execute the call
        vm.prank(address(mockGateway));
        settlementContract.onCall{value: 0}(
            context,
            address(0x789), // zrc20
            1e18, // amount
            abi.encode(payload)
        );

        // Verify EVM-style address conversion was used
        (bool success, bytes memory returnData) =
            address(mockGateway).call(abi.encodeWithSignature("lastTransferRecipient()"));
        address transferredTo = abi.decode(returnData, (address));
        assertEq(transferredTo, recipient);
    }

    function test_NonWithdrawTransferNonEVM_Bitcoin() public {
        bytes memory recipientBytes = hex"11223344556677889900aabbccddeeff00112233";
        uint256 chainId = 8332; // Bitcoin chain ID

        // Setup message context and payload
        ZetaInterfaces.ZetaMessage memory context = ZetaInterfaces.ZetaMessage({
            zetaTxSenderAddress: bytes22(0),
            sourceChainId: chainId,
            destinationAddress: address(0),
            destinationChainId: 0,
            gasLimit: 0,
            message: "",
            zetaValue: 0,
            msgSender: address(0),
            sender: abi.encodePacked(user)
        });

        CrossChainSettlement.CrossChainSettlementPayload memory payload = CrossChainSettlement
            .CrossChainSettlementPayload({
            targetToken: address(0x456),
            recipient: recipientBytes,
            withdraw: false,
            swapId: keccak256("test")
        });

        // Execute the call
        vm.prank(address(mockGateway));
        settlementContract.onCall{value: 0}(
            context,
            address(0x789), // zrc20
            1e18, // amount
            abi.encode(payload)
        );

        // Verify raw bytes address was used
        (bool success, bytes memory returnData) =
            address(mockGateway).call(abi.encodeWithSignature("lastTransferRecipientBytes()"));
        bytes memory transferredTo = abi.decode(returnData, (bytes));
        assertEq(transferredTo, recipientBytes);
    }

    function test_NonWithdrawTransferNonEVM_Solana() public {
        bytes memory recipientBytes = hex"1111111111111111111111111111111111111111111111111111111111111111"; // Example Solana address (32 bytes)
        uint256 chainId = 139; // Solana chain ID

        // Setup message context and payload
        ZetaInterfaces.ZetaMessage memory context = ZetaInterfaces.ZetaMessage({
            zetaTxSenderAddress: bytes22(0),
            sourceChainId: chainId,
            destinationAddress: address(0),
            destinationChainId: 0,
            gasLimit: 0,
            message: "",
            zetaValue: 0,
            msgSender: address(0),
            sender: abi.encodePacked(user)
        });

        CrossChainSettlement.CrossChainSettlementPayload memory payload = CrossChainSettlement
            .CrossChainSettlementPayload({
            targetToken: address(0x456),
            recipient: recipientBytes,
            withdraw: false,
            swapId: keccak256("testSolana")
        });

        // Execute the call
        vm.prank(address(mockGateway));
        settlementContract.onCall{value: 0}(
            context,
            address(0x789), // zrc20
            1e18, // amount
            abi.encode(payload)
        );

        // Verify raw bytes address was used
        (bool success, bytes memory returnData) =
            address(mockGateway).call(abi.encodeWithSignature("lastTransferRecipientBytes()"));
        bytes memory transferredTo = abi.decode(returnData, (bytes));
        assertEq(transferredTo, recipientBytes);
    }

    function test_NonWithdrawTransferNonEVM_TON() public {
        bytes memory recipientBytes = hex"2222222222222222222222222222222222222222222222222222222222222222"; // Example TON address (32 bytes)
        uint256 chainId = 200; // TON chain ID

        // Setup message context and payload
        ZetaInterfaces.ZetaMessage memory context = ZetaInterfaces.ZetaMessage({
            zetaTxSenderAddress: bytes22(0),
            sourceChainId: chainId,
            destinationAddress: address(0),
            destinationChainId: 0,
            gasLimit: 0,
            message: "",
            zetaValue: 0,
            msgSender: address(0),
            sender: abi.encodePacked(user)
        });

        CrossChainSettlement.CrossChainSettlementPayload memory payload = CrossChainSettlement
            .CrossChainSettlementPayload({
            targetToken: address(0x456),
            recipient: recipientBytes,
            withdraw: false,
            swapId: keccak256("testTON")
        });

        // Execute the call
        vm.prank(address(mockGateway));
        settlementContract.onCall{value: 0}(
            context,
            address(0x789), // zrc20
            1e18, // amount
            abi.encode(payload)
        );

        // Verify raw bytes address was used
        (bool success, bytes memory returnData) =
            address(mockGateway).call(abi.encodeWithSignature("lastTransferRecipientBytes()"));
        bytes memory transferredTo = abi.decode(returnData, (bytes));
        assertEq(transferredTo, recipientBytes);
    }

    function test_InitialState() public {
        assertEq(settlementContract.owner(), owner);
        assertEq(address(settlementContract.gateway()), address(mockGateway));
        assertEq(address(settlementContract.uniswapRouter()), address(mockUniswapRouter));
    }
}
