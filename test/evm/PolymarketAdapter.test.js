const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PolymarketAdapter", function () {
  let PolymarketAdapter,
    polymarketAdapter,
    ConditionalTokens,
    conditionalTokens,
    Collateral,
    collateral,
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

    // Deploy the PolymarketAdapter contract
    PolymarketAdapter = await ethers.getContractFactory("PolymarketAdapter");
    polymarketAdapter = await PolymarketAdapter.deploy(
      conditionalTokens.address,
      collateral.address,
      ethers.constants.AddressZero
    );
    await polymarketAdapter.deployed();

    // Mint some collateral for the user
    await collateral.mint(addr1.address, ethers.utils.parseEther("1000"));
  });

  it("Should place a bet successfully", async function () {
    const conditionId = ethers.utils.formatBytes32String("test-condition");
    const outcomeIndex = 0;
    const amount = ethers.utils.parseEther("100");

    // Approve the adapter to spend collateral
    await collateral
      .connect(addr1)
      .approve(polymarketAdapter.address, amount);

    // Place the bet
    await expect(
      polymarketAdapter
        .connect(addr1)
        .placeBet(conditionId, outcomeIndex, amount)
    )
      .to.emit(conditionalTokens, "PositionSplit")
      .withArgs(
        collateral.address,
        conditionId,
        [1, 0], // Partition for the bet
        amount
      );
  });
});