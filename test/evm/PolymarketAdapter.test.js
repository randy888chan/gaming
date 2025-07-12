const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PolymarketAdapter", function () {
    let ConditionalTokens;
    let Collateral;
    let ZetaConnector;
    let CrossChainSettlement;
    let PolymarketAdapter;
    let owner;
    let addr1;
    let addr2;
    let gambaToken;

    const CONDITION_ID = ethers.utils.formatBytes32String("test_condition");
    const OUTCOME_INDEX = 0; // For "Yes" outcome in a binary market
    const BET_AMOUNT = ethers.utils.parseUnits("100", 6); // 100 USDC

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Mock contracts
        const MockConditionalTokens = await ethers.getContractFactory("MockConditionalTokens");
        ConditionalTokens = await MockConditionalTokens.deploy();
        await ConditionalTokens.deployed();

        const MockERC20 = await ethers.getContractFactory("MockERC20");
        Collateral = await MockERC20.deploy("Mock USDC", "USDC", 6);
        await Collateral.deployed();

        const MockZetaConnector = await ethers.getContractFactory("MockZetaConnector");
        ZetaConnector = await MockZetaConnector.deploy();
        await ZetaConnector.deployed();

        const MockCrossChainSettlement = await ethers.getContractFactory("MockCrossChainSettlement");
        CrossChainSettlement = await MockCrossChainSettlement.deploy();
        await CrossChainSettlement.deployed();

        gambaToken = await MockERC20.deploy("Gamba Token", "GAMBA", 18); // Deploy a mock Gamba token
        await gambaToken.deployed();

        const PolymarketAdapterFactory = await ethers.getContractFactory("PolymarketAdapter");
        PolymarketAdapter = await PolymarketAdapterFactory.deploy(
            ConditionalTokens.address,
            Collateral.address,
            ZetaConnector.address,
            CrossChainSettlement.address,
            gambaToken.address
        );
        await PolymarketAdapter.deployed();

        // Mint some collateral to owner and addr1
        await Collateral.mint(owner.address, ethers.utils.parseUnits("1000", 6));
        await Collateral.mint(addr1.address, ethers.utils.parseUnits("1000", 6));
        await gambaToken.mint(owner.address, ethers.utils.parseEther("1000"));
        await gambaToken.mint(addr1.address, ethers.utils.parseEther("1000"));
    });

    describe("Deployment", function () {
        it("Should set the correct conditionalTokens address", async function () {
            expect(await PolymarketAdapter.conditionalTokens()).to.equal(ConditionalTokens.address);
        });

        it("Should set the correct collateral address", async function () {
            expect(await PolymarketAdapter.collateral()).to.equal(Collateral.address);
        });

        it("Should set the correct crossChainSettlement address", async function () {
            expect(await PolymarketAdapter.crossChainSettlement()).to.equal(CrossChainSettlement.address);
        });

        it("Should set the correct gambaToken address", async function () {
            expect(await PolymarketAdapter.gambaToken()).to.equal(gambaToken.address);
        });
    });

    describe("placeBet", function () {
        it("Should call dispatchCrossChainCall on CrossChainSettlement with correct payload", async function () {
            const targetChainId = 101; // Example target chain ID
            const targetToken = ethers.constants.AddressZero; // Example target token
            const recipient = ethers.utils.arrayify(addr1.address); // Example recipient as bytes

            // Prepare the expected message payload for splitPosition
            const expectedPartition = [0, 0];
            expectedPartition[OUTCOME_INDEX] = 1;
            const expectedMessage = ethers.utils.defaultAbiCoder.encode(
                ["uint8", "bytes32", "uint256[]"],
                [0, CONDITION_ID, expectedPartition]
            );

            // Mock the dispatchCrossChainCall on CrossChainSettlement
            await expect(PolymarketAdapter.connect(addr1).placeBet(
                CONDITION_ID,
                OUTCOME_INDEX,
                BET_AMOUNT,
                targetChainId,
                targetToken,
                recipient
            )).to.emit(CrossChainSettlement, "DispatchCalled")
                .withArgs(Collateral.address, BET_AMOUNT, targetToken, recipient, false);
        });
    });

    describe("onZetaMessage", function () {
        let zetaMessageContext;
        let encodedPayload;

        beforeEach(async function () {
            zetaMessageContext = {
                zetaTxSenderAddress: ethers.utils.arrayify(addr1.address),
                sourceChainId: 1,
                destinationAddress: PolymarketAdapter.address,
                zetaValue: 0,
                message: "0x" // Placeholder, will be replaced by encodedPayload
            };

            // Mock collateral approval and conditionalTokens calls
            await Collateral.connect(addr1).approve(PolymarketAdapter.address, BET_AMOUNT);
            await Collateral.connect(owner).approve(ConditionalTokens.address, BET_AMOUNT);
            await gambaToken.connect(addr1).approve(PolymarketAdapter.address, BET_AMOUNT);
            await gambaToken.connect(owner).approve(PolymarketAdapter.address, BET_AMOUNT);
        });

        it("Should handle splitPosition (bet) action correctly", async function () {
            const partition = [0, 0];
            partition[OUTCOME_INDEX] = 1;
            const payload = {
                actionType: 0, // splitPosition
                conditionId: CONDITION_ID,
                dataArray: partition
            };
            encodedPayload = ethers.utils.defaultAbiCoder.encode(
                ["uint8", "bytes32", "uint256[]"],
                [payload.actionType, payload.conditionId, payload.dataArray]
            );
            zetaMessageContext.message = encodedPayload;

            // Mock transferFrom for gambaToken
            await gambaToken.connect(addr1).transfer(PolymarketAdapter.address, BET_AMOUNT);

            await expect(PolymarketAdapter.onZetaMessage(
                zetaMessageContext,
                gambaToken.address, // zrc20 is gambaToken
                BET_AMOUNT,
                encodedPayload
            )).to.emit(PolymarketAdapter, "GambaActionExecuted")
                .withArgs(0, CONDITION_ID, BET_AMOUNT);

            // Verify that collateral was approved and splitPosition was called
            expect(await Collateral.allowance(PolymarketAdapter.address, ConditionalTokens.address)).to.equal(BET_AMOUNT);
        });

        it("Should handle mergePositions (claim winnings) action correctly", async function () {
            const indexSets = [1, 2]; // Example index sets
            const payload = {
                actionType: 1, // mergePositions
                conditionId: CONDITION_ID,
                dataArray: indexSets
            };
            encodedPayload = ethers.utils.defaultAbiCoder.encode(
                ["uint8", "bytes32", "uint256[]"],
                [payload.actionType, payload.conditionId, payload.dataArray]
            );
            zetaMessageContext.message = encodedPayload;

            // Mock transferFrom for gambaToken
            await gambaToken.connect(addr1).transfer(PolymarketAdapter.address, BET_AMOUNT);

            await expect(PolymarketAdapter.onZetaMessage(
                zetaMessageContext,
                gambaToken.address, // zrc20 is gambaToken
                BET_AMOUNT,
                encodedPayload
            )).to.emit(PolymarketAdapter, "GambaActionExecuted")
                .withArgs(1, CONDITION_ID, BET_AMOUNT);

            // Verify that collateral was approved and mergePositions was called
            expect(await Collateral.allowance(PolymarketAdapter.address, ConditionalTokens.address)).to.equal(BET_AMOUNT);
        });

        it("Should handle redeemPositions (withdraw collateral) action correctly", async function () {
            const indexSets = [1, 2]; // Example index sets
            const payload = {
                actionType: 2, // redeemPositions
                conditionId: CONDITION_ID,
                dataArray: indexSets
            };
            encodedPayload = ethers.utils.defaultAbiCoder.encode(
                ["uint8", "bytes32", "uint256[]"],
                [payload.actionType, payload.conditionId, payload.dataArray]
            );
            zetaMessageContext.message = encodedPayload;

            // Mock transferFrom for gambaToken
            await gambaToken.connect(addr1).transfer(PolymarketAdapter.address, BET_AMOUNT);

            await expect(PolymarketAdapter.onZetaMessage(
                zetaMessageContext,
                gambaToken.address, // zrc20 is gambaToken
                BET_AMOUNT,
                encodedPayload
            )).to.emit(PolymarketAdapter, "GambaActionExecuted")
                .withArgs(2, CONDITION_ID, BET_AMOUNT);
        });

        it("Should revert if invalid action type", async function () {
            const payload = {
                actionType: 99, // Invalid action type
                conditionId: CONDITION_ID,
                dataArray: []
            };
            encodedPayload = ethers.utils.defaultAbiCoder.encode(
                ["uint8", "bytes32", "uint256[]"],
                [payload.actionType, payload.conditionId, payload.dataArray]
            );
            zetaMessageContext.message = encodedPayload;

            await expect(PolymarketAdapter.onZetaMessage(
                zetaMessageContext,
                gambaToken.address,
                BET_AMOUNT,
                encodedPayload
            )).to.be.revertedWith("Invalid action type");
        });

        it("Should revert if zrc20 is not Gamba token", async function () {
            const payload = {
                actionType: 0,
                conditionId: CONDITION_ID,
                dataArray: [1, 0]
            };
            encodedPayload = ethers.utils.defaultAbiCoder.encode(
                ["uint8", "bytes32", "uint256[]"],
                [payload.actionType, payload.conditionId, payload.dataArray]
            );
            zetaMessageContext.message = encodedPayload;

            await expect(PolymarketAdapter.onZetaMessage(
                zetaMessageContext,
                Collateral.address, // Using collateral token instead of gambaToken
                BET_AMOUNT,
                encodedPayload
            )).to.be.revertedWith("PolymarketAdapter: Invalid ZRC20 token. Only Gamba token is accepted.");
        });
    });

    describe("onZetaRevert", function () {
        it("Should refund Gamba tokens to the sender", async function () {
            const senderAddress = addr1.address;
            const refundAmount = ethers.utils.parseEther("50");

            const zetaMessageContext = {
                zetaTxSenderAddress: ethers.utils.arrayify(senderAddress),
                sourceChainId: 1,
                destinationAddress: PolymarketAdapter.address,
                zetaValue: 0,
                message: "0x"
            };

            // Ensure PolymarketAdapter has enough Gamba tokens to refund
            await gambaToken.mint(PolymarketAdapter.address, refundAmount);

            await expect(PolymarketAdapter.onZetaRevert(
                zetaMessageContext,
                gambaToken.address,
                refundAmount,
                "0x"
            )).to.emit(PolymarketAdapter, "GambaRefund")
                .withArgs(senderAddress, refundAmount);

            expect(await gambaToken.balanceOf(senderAddress)).to.equal(ethers.utils.parseEther("1000").add(refundAmount));
        });

        it("Should revert if zrc20 is not Gamba token for refund", async function () {
            const senderAddress = addr1.address;
            const refundAmount = ethers.utils.parseEther("50");

            const zetaMessageContext = {
                zetaTxSenderAddress: ethers.utils.arrayify(senderAddress),
                sourceChainId: 1,
                destinationAddress: PolymarketAdapter.address,
                zetaValue: 0,
                message: "0x"
            };

            await expect(PolymarketAdapter.onZetaRevert(
                zetaMessageContext,
                Collateral.address, // Using collateral token instead of gambaToken
                refundAmount,
                "0x"
            )).to.be.revertedWith("PolymarketAdapter: Invalid ZRC20 token for refund.");
        });

        it("Should revert if refund fails", async function () {
            const senderAddress = addr1.address;
            const refundAmount = ethers.utils.parseEther("50");

            const zetaMessageContext = {
                zetaTxSenderAddress: ethers.utils.arrayify(senderAddress),
                sourceChainId: 1,
                destinationAddress: PolymarketAdapter.address,
                zetaValue: 0,
                message: "0x"
            };

            // Do not mint enough gambaToken to PolymarketAdapter to simulate refund failure
            await expect(PolymarketAdapter.onZetaRevert(
                zetaMessageContext,
                gambaToken.address,
                refundAmount,
                "0x"
            )).to.be.revertedWith("Refund failed");
        });
    });
});