const { expect } = require("chai");
const { ethers } = require("hardhat");

// Mock ConditionalTokens contract for testing purposes
const ConditionalTokensMockABI = [
  "function splitPosition(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint256[] memory partition, uint256 amount) external",
  "function mergePositions(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint256[] memory partition, uint256 amount) external",
  "function redeemPositions(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint256[] memory indexSets) external",
  "event PositionSplit(address indexed collateralToken, bytes32 indexed conditionId, uint256[] partition, uint256 amount)",
  "event PositionsMerged(address indexed collateralToken, bytes32 indexed conditionId, uint256[] partition, uint256 amount)",
  "event PositionsRedeemed(address indexed collateralToken, bytes32 indexed conditionId, uint256[] indexSets)",
];

// Mock CrossChainSettlement contract for testing purposes
const CrossChainSettlementMockABI = [
  "function dispatchCrossChainCall(address inputToken, uint256 amount, address targetToken, bytes memory destinationAddress, bool withdrawFlag) external returns (bytes32)",
  "function lastDispatchCall() public view returns (address, uint256, address, bytes memory, bool)",
];

// Mock ERC20 contract for testing purposes
const ERC20MockABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function mint(address to, uint256 amount) external",
  "function transfer(address to, uint256 amount) external returns (bool)",
];

describe("PolymarketAdapter", function () {
  let PolymarketAdapter,
    polymarketAdapter,
    conditionalTokens,
    collateral,
    crossChainSettlementMock,
    owner,
    addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    // Deploy a mock collateral token
    const CollateralToken = await ethers.getContractFactory("ERC20Mock");
    collateral = await CollateralToken.deploy("Mock USDC", "USDC");
    await collateral.deployed();

    // Deploy a mock ConditionalTokens contract
    const ConditionalTokensMock = await ethers.getContractFactory(
      "ConditionalTokensMock"
    );
    conditionalTokens = await ConditionalTokensMock.deploy();
    await conditionalTokens.deployed();

    // Deploy a mock CrossChainSettlement contract
    const CrossChainSettlementMockFactory = await ethers.getContractFactory(
      "CrossChainSettlementMock"
    );
    crossChainSettlementMock = await CrossChainSettlementMockFactory.deploy();
    await crossChainSettlementMock.deployed();

    // Deploy the PolymarketAdapter contract
    PolymarketAdapter = await ethers.getContractFactory("PolymarketAdapter");
    polymarketAdapter = await PolymarketAdapter.deploy(
      conditionalTokens.address,
      collateral.address,
      ethers.constants.AddressZero, // ZetaConnector address
      crossChainSettlementMock.address // Pass the mock CrossChainSettlement address
    );
    await polymarketAdapter.deployed();

    // Mint some collateral for the user
    await collateral.mint(addr1.address, ethers.utils.parseEther("1000"));
  });

  it("Should place a bet successfully and call dispatchCrossChainCall", async function () {
    const conditionId = ethers.utils.formatBytes32String("test-condition");
    const outcomeIndex = 0;
    const amount = ethers.utils.parseEther("100");
    const targetChainId = 1; // Example chain ID
    const targetToken = ethers.constants.AddressZero; // Example target token
    const recipient = ethers.utils.arrayify(
      "0x1234567890123456789012345678901234567890"
    ); // Example recipient bytes

    // Approve the adapter to spend collateral
    await collateral.connect(addr1).approve(polymarketAdapter.address, amount);

    // Expect dispatchCrossChainCall to be called on the mock
    await expect(
      polymarketAdapter
        .connect(addr1)
        .placeBet(
          conditionId,
          outcomeIndex,
          amount,
          targetChainId,
          targetToken,
          recipient
        )
    ).to.not.be.reverted;

    // Verify that dispatchCrossChainCall was called on the mock
    const [
      _inputToken,
      _amount,
      _targetToken,
      _destinationAddress,
      _withdrawFlag,
    ] = await crossChainSettlementMock.lastDispatchCall();

    expect(_inputToken).to.equal(collateral.address);
    expect(_amount).to.equal(amount);
    expect(_targetToken).to.equal(targetToken);
    expect(_destinationAddress).to.equal(ethers.utils.hexlify(recipient));
    expect(_withdrawFlag).to.be.false;
  });

  it("Should handle onZetaMessage for splitPosition (actionType 0)", async function () {
    const conditionId = ethers.utils.formatBytes32String(
      "test-condition-split"
    );
    const partition = [1, 0]; // Example partition
    const amount = ethers.utils.parseEther("50");

    // Encode the message payload for actionType 0
    const messagePayload = ethers.utils.defaultAbiCoder.encode(
      ["uint8", "bytes32", "uint256[]"],
      [0, conditionId, partition]
    );

    // Mock ZetaMessage context (simplified for testing)
    const zetaMessageContext = {
      zetaTxSenderAddress: ethers.utils.arrayify(
        "0x000000000000000000000000000000000000000000"
      ),
      sourceChainId: 1,
      destinationAddress: ethers.constants.AddressZero,
      destinationChainId: 0,
      gasLimit: 0,
      message: "0x",
      zetaValue: 0,
      msgSender: owner.address,
      sender: ethers.utils.arrayify(owner.address),
    };

    // Mint some ZRC20 tokens to the adapter for the test
    await collateral.mint(polymarketAdapter.address, amount);

    // Simulate onZetaMessage call
    await expect(
      polymarketAdapter.onZetaMessage(
        zetaMessageContext,
        collateral.address, // zrc20
        amount,
        messagePayload
      )
    )
      .to.emit(conditionalTokens, "PositionSplit")
      .withArgs(collateral.address, conditionId, partition, amount);
  });

  it("Should handle onZetaMessage for mergePositions (actionType 1)", async function () {
    const conditionId = ethers.utils.formatBytes32String(
      "test-condition-merge"
    );
    const partition = [1, 0]; // Example partition
    const amount = ethers.utils.parseEther("75");

    // Encode the message payload for actionType 1
    const messagePayload = ethers.utils.defaultAbiCoder.encode(
      ["uint8", "bytes32", "uint256[]"],
      [1, conditionId, partition]
    );

    // Mock ZetaMessage context
    const zetaMessageContext = {
      zetaTxSenderAddress: ethers.utils.arrayify(
        "0x000000000000000000000000000000000000000000"
      ),
      sourceChainId: 1,
      destinationAddress: ethers.constants.AddressZero,
      destinationChainId: 0,
      gasLimit: 0,
      message: "0x",
      zetaValue: 0,
      msgSender: owner.address,
      sender: ethers.utils.arrayify(owner.address),
    };

    // Mint some ZRC20 tokens to the adapter for the test
    await collateral.mint(polymarketAdapter.address, amount);

    // Simulate onZetaMessage call
    await expect(
      polymarketAdapter.onZetaMessage(
        zetaMessageContext,
        collateral.address, // zrc20
        amount,
        messagePayload
      )
    )
      .to.emit(conditionalTokens, "PositionsMerged")
      .withArgs(collateral.address, conditionId, partition, amount);
  });

  it("Should handle onZetaMessage for redeemPositions (actionType 2)", async function () {
    const conditionId = ethers.utils.formatBytes32String(
      "test-condition-redeem"
    );
    const indexSets = [1, 2]; // Example indexSets
    const amount = ethers.utils.parseEther("25"); // Amount is not used for redeemPositions in Polymarket, but passed by ZetaChain

    // Encode the message payload for actionType 2
    const messagePayload = ethers.utils.defaultAbiCoder.encode(
      ["uint8", "bytes32", "uint256[]"],
      [2, conditionId, indexSets]
    );

    // Mock ZetaMessage context
    const zetaMessageContext = {
      zetaTxSenderAddress: ethers.utils.arrayify(
        "0x000000000000000000000000000000000000000000"
      ),
      sourceChainId: 1,
      destinationAddress: ethers.constants.AddressZero,
      destinationChainId: 0,
      gasLimit: 0,
      message: "0x",
      zetaValue: 0,
      msgSender: owner.address,
      sender: ethers.utils.arrayify(owner.address),
    };

    // Simulate onZetaMessage call
    await expect(
      polymarketAdapter.onZetaMessage(
        zetaMessageContext,
        collateral.address, // zrc20
        amount,
        messagePayload
      )
    )
      .to.emit(conditionalTokens, "PositionsRedeemed")
      .withArgs(collateral.address, conditionId, indexSets);
  });

  it("Should revert for invalid action type in onZetaMessage", async function () {
    const conditionId = ethers.utils.formatBytes32String(
      "test-condition-invalid"
    );
    const dataArray = [1, 2];
    const amount = ethers.utils.parseEther("10");

    // Encode a message payload with an invalid actionType (e.g., 99)
    const messagePayload = ethers.utils.defaultAbiCoder.encode(
      ["uint8", "bytes32", "uint256[]"],
      [99, conditionId, dataArray]
    );

    // Mock ZetaMessage context
    const zetaMessageContext = {
      zetaTxSenderAddress: ethers.utils.arrayify(
        "0x000000000000000000000000000000000000000000"
      ),
      sourceChainId: 1,
      destinationAddress: ethers.constants.AddressZero,
      destinationChainId: 0,
      gasLimit: 0,
      message: "0x",
      zetaValue: 0,
      msgSender: owner.address,
      sender: ethers.utils.arrayify(owner.address),
    };

    await expect(
      polymarketAdapter.onZetaMessage(
        zetaMessageContext,
        collateral.address,
        amount,
        messagePayload
      )
    ).to.be.revertedWith("PolymarketAdapter: Invalid action type");
  });
});
