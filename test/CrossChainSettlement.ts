import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { CrossChainSettlement } from "../typechain-types";

describe("CrossChainSettlement", function () {
  let crossChainSettlement: CrossChainSettlement;
  let owner: any, addr1: any, addr2: any;
  let gatewayMock: any;
  let uniswapRouterMock: any;
  let zrc20Mock: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Mock contracts
    const GatewayMock = await ethers.getContractFactory("GatewayZEVM");
    gatewayMock = await GatewayMock.deploy();
    
    const UniswapRouterMock = await ethers.getContractFactory("UniswapV2Router02");
    uniswapRouterMock = await UniswapRouterMock.deploy(ethers.constants.AddressZero, ethers.constants.AddressZero);

    const ZRC20Mock = await ethers.getContractFactory("ZRC20");
    zrc20Mock = await ZRC20Mock.deploy("Mock ZRC20", "MOCK", 18);

    const CrossChainSettlementFactory = await ethers.getContractFactory("CrossChainSettlement");
    crossChainSettlement = (await upgrades.deployProxy(CrossChainSettlementFactory, [
      gatewayMock.address,
      uniswapRouterMock.address,
      200000,
      owner.address
    ])) as CrossChainSettlement;
    await crossChainSettlement.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await crossChainSettlement.owner()).to.equal(owner.address);
    });

    it("Should set the correct gateway and uniswap router addresses", async function () {
      expect(await crossChainSettlement.gateway()).to.equal(gatewayMock.address);
      expect(await crossChainSettlement.uniswapRouter()).to.equal(uniswapRouterMock.address);
    });
  });
  
  // More tests to be added here
});