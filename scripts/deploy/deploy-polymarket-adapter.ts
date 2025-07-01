import { ethers, run } from "hardhat";

async function main() {
  const PolymarketAdapter = await ethers.getContractFactory("PolymarketAdapter");

  // TODO: Replace with actual addresses for ZetaChain testnet and mainnet
  const conditionalTokensAddress = "0x0000000000000000000000000000000000000000";
  const collateralAddress = "0x0000000000000000000000000000000000000000";
  const zetaConnectorAddress = "0x0000000000000000000000000000000000000000";

  const polymarketAdapter = await PolymarketAdapter.deploy(
    conditionalTokensAddress,
    collateralAddress,
    zetaConnectorAddress
  );

  await polymarketAdapter.deployed();

  console.log("PolymarketAdapter deployed to:", polymarketAdapter.address);

  await run("verify:verify", {
    address: polymarketAdapter.address,
    constructorArguments: [
      conditionalTokensAddress,
      collateralAddress,
      zetaConnectorAddress,
    ],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});