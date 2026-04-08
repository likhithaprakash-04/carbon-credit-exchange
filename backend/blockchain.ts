import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

// Load deployed addresses
const addressesPath = path.join(__dirname, "../deployed-addresses.json");
const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

// Load ABIs from artifacts
const carbonCreditABI = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../artifacts/contracts/CarbonCredit.sol/CarbonCredit.json"),
    "utf8"
  )
).abi;

const tradingExchangeABI = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../artifacts/contracts/TradingExchange.sol/TradingExchange.json"),
    "utf8"
  )
).abi;

const daoGovernanceABI = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../artifacts/contracts/DAOGovernance.sol/DAOGovernance.json"),
    "utf8"
  )
).abi;

// Connect to local blockchain
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Contract instances (read-only)
export const carbonCreditContract = new ethers.Contract(
  addresses.carbonCredit,
  carbonCreditABI,
  provider
);

export const tradingExchangeContract = new ethers.Contract(
  addresses.tradingExchange,
  tradingExchangeABI,
  provider
);

export const daoGovernanceContract = new ethers.Contract(
  addresses.daoGovernance,
  daoGovernanceABI,
  provider
);

export { provider, addresses };