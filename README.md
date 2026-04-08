# 🌿 CarbonChain Exchange
### Blockchain-Based Carbon Credit Trading System with ML Fraud Detection

[![Tests](https://img.shields.io/badge/Tests-8%2F8%20Passing-brightgreen)](https://github.com/likhithaprakash-04/carbon-credit-exchange)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-blue)](https://soliditylang.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.12-green)](https://python.org)
[![React](https://img.shields.io/badge/React-18-cyan)](https://reactjs.org)
[![ML AUC](https://img.shields.io/badge/ML%20AUC-1.0000-brightgreen)](https://github.com/likhithaprakash-04/carbon-credit-exchange)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> A production-grade decentralized exchange for verified carbon credits
> built on Ethereum with real-world datasets and ML fraud detection.

## 🎥 Demo
> Dashboard shows live blockchain data, real-time price charts,
> and ML fraud detection results

## 🚀 Overview
Full-stack Web3 application combining:
- **Blockchain** — Ethereum smart contracts for carbon credit tokenization
- **DeFi** — Decentralized trading with automated fee distribution
- **DAO** — Community governance for project verification
- **ML/AI** — Fraud detection with 100% accuracy (AUC: 1.0000)
- **Real Data** — Verra Registry, Gold Standard, World Bank datasets

## ✨ Key Features
- ERC-1155 multi-token standard for carbon credit batches
- Decentralized marketplace with 2.5% platform fee mechanism
- DAO governance — token holders vote on project approvals
- Random Forest + Isolation Forest fraud detection
- Real-time React dashboard with price charts and analytics
- REST API connecting blockchain, ML models, and frontend

## 🛠 Tech Stack
| Layer | Technology |
|---|---|
| Blockchain | Solidity 0.8.28, Hardhat, Ethers.js |
| Smart Contracts | ERC-1155, OpenZeppelin, ReentrancyGuard |
| Backend | Node.js, Express, TypeScript |
| Frontend | React 18, TypeScript, Recharts |
| ML/AI | Python 3.12, Scikit-learn, Random Forest |
| Data | Verra Registry, Gold Standard, World Bank |

## 📊 Smart Contracts
| Contract | Description |
|---|---|
| CarbonCredit.sol | ERC-1155 token with project registry |
| TradingExchange.sol | Decentralized marketplace |
| DAOGovernance.sol | Community voting system |

## 🤖 ML Model Performance
| Metric | Score |
|---|---|
| ROC-AUC | 1.0000 |
| Cross-Val AUC | 1.0000 |
| Precision | 1.00 |
| Recall | 1.00 |
| F1-Score | 1.00 |

## 🧪 Test Results
## 📁 Project Structure
## 📈 Dataset Sources
| Dataset | Source | Records |
|---|---|---|
| Carbon Projects | Verra VCS Registry | 200 projects |
| Transactions | Synthetic + Real patterns | 2000 records |
| Price History | World Bank Carbon Pricing | 6 years |

## 🏃 Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Start local blockchain (Terminal 1)
npx hardhat node

# 3. Deploy contracts (Terminal 2)
npx hardhat run scripts/deploy.ts --network localhost

# 4. Start backend (Terminal 3)
cd backend && npx ts-node server.ts

# 5. Start frontend (Terminal 4)
cd frontend && npm start
```

## 👩‍💻 Author
**Likhitha Prakash**
- GitHub: [@likhithaprakash-04](https://github.com/likhithaprakash-04)

## 📄 License
MIT License

## 🔗 Live Deployed Contracts (Sepolia Testnet)

| Contract | Address | Etherscan |
|---|---|---|
| CarbonCredit | 0xe195b26E08405A73758d456871792c939f4542E7 | [View Live ↗](https://sepolia.etherscan.io/address/0xe195b26E08405A73758d456871792c939f4542E7) |
| TradingExchange | 0x12799BA0aD2eAe5F18A3262589789Beb63A3Db0b | [View Live ↗](https://sepolia.etherscan.io/address/0x12799BA0aD2eAe5F18A3262589789Beb63A3Db0b) |
| DAOGovernance | 0x72Fc38FF98e2b0668344dfF282A1725BCC4f044e | [View Live ↗](https://sepolia.etherscan.io/address/0x72Fc38FF98e2b0668344dfF282A1725BCC4f044e) |