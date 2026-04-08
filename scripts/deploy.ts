import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  console.log("🚀 Starting deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy CarbonCredit contract
  console.log("\n📄 Deploying CarbonCredit...");
  const CarbonCredit = await ethers.getContractFactory("CarbonCredit");
  const carbonCredit = await CarbonCredit.deploy();
  await carbonCredit.waitForDeployment();
  const carbonCreditAddress = await carbonCredit.getAddress();
  console.log("✅ CarbonCredit deployed to:", carbonCreditAddress);

  // Deploy TradingExchange contract
  console.log("\n📄 Deploying TradingExchange...");
  const TradingExchange = await ethers.getContractFactory("TradingExchange");
  const tradingExchange = await TradingExchange.deploy(carbonCreditAddress);
  await tradingExchange.waitForDeployment();
  const tradingExchangeAddress = await tradingExchange.getAddress();
  console.log("✅ TradingExchange deployed to:", tradingExchangeAddress);

  // Deploy DAOGovernance contract
  console.log("\n📄 Deploying DAOGovernance...");
  const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
  const daoGovernance = await DAOGovernance.deploy();
  await daoGovernance.waitForDeployment();
  const daoGovernanceAddress = await daoGovernance.getAddress();
  console.log("✅ DAOGovernance deployed to:", daoGovernanceAddress);

  // Seed some sample data
  console.log("\n🌱 Seeding sample carbon projects...");
  
  await carbonCredit.registerProject("Amazon Reforestation", "VCS VM0015", "Brazil", 2023);
  console.log("  ✅ Project 0: Amazon Reforestation registered");

  await carbonCredit.registerProject("Solar Farm Gujarat", "VCS VM0038", "India", 2023);
  console.log("  ✅ Project 1: Solar Farm Gujarat registered");

  await carbonCredit.registerProject("Wind Energy Kenya", "Gold Standard", "Kenya", 2022);
  console.log("  ✅ Project 2: Wind Energy Kenya registered");

  await carbonCredit.registerProject("Mangrove Restoration", "VCS VM0033", "Indonesia", 2023);
  console.log("  ✅ Project 3: Mangrove Restoration registered");

  // Issue credits to deployer for testing
  await carbonCredit.issueCredits(0, deployer.address, 10000);
  await carbonCredit.issueCredits(1, deployer.address, 5000);
  await carbonCredit.issueCredits(2, deployer.address, 8000);
  await carbonCredit.issueCredits(3, deployer.address, 3000);
  console.log("  ✅ Credits issued to deployer for testing");

  // Save contract addresses to file (frontend will use this)
  const addresses = {
    carbonCredit: carbonCreditAddress,
    tradingExchange: tradingExchangeAddress,
    daoGovernance: daoGovernanceAddress,
    network: "localhost",
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    "deployed-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("\n📁 Contract addresses saved to deployed-addresses.json");

  console.log("\n🎉 Deployment complete!");
  console.log("================================");
  console.log("CarbonCredit:    ", carbonCreditAddress);
  console.log("TradingExchange: ", tradingExchangeAddress);
  console.log("DAOGovernance:   ", daoGovernanceAddress);
  console.log("================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});