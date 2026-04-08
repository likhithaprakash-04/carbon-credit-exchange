import { expect } from "chai";
import { ethers } from "hardhat";

describe("CarbonCredit", function () {

  async function deployFixture() {
    const [owner, buyer] = await ethers.getSigners();
    const CC = await ethers.getContractFactory("CarbonCredit");
    const contract = await CC.deploy();
    return { contract, owner, buyer };
  }

  it("Should register a project", async function () {
    const { contract } = await deployFixture();
    await contract.registerProject("Amazon Reforestation", "VCS VM0015", "Brazil", 2023);
    const project = await contract.getProject(0);
    expect(project.projectName).to.equal("Amazon Reforestation");
    console.log("✅ Project registered");
  });

  it("Should issue credits to buyer", async function () {
    const { contract, buyer } = await deployFixture();
    await contract.registerProject("Solar Farm", "VCS VM0038", "India", 2023);
    await contract.issueCredits(0, buyer.address, 1000);
    expect(await contract.balanceOf(buyer.address, 0)).to.equal(1000);
    console.log("✅ 1000 credits issued");
  });

  it("Should retire credits", async function () {
    const { contract, buyer } = await deployFixture();
    await contract.registerProject("Wind Kenya", "Gold Standard", "Kenya", 2022);
    await contract.issueCredits(0, buyer.address, 500);
    await contract.connect(buyer).retireCredits(0, 200, "Q1 2024 offset");
    expect(await contract.balanceOf(buyer.address, 0)).to.equal(300);
    console.log("✅ 200 credits retired, 300 remaining");
  });

  it("Should block non-verifiers from issuing", async function () {
    const { contract, buyer } = await deployFixture();
    await contract.registerProject("Test Project", "VCS", "USA", 2023);
    await expect(
      contract.connect(buyer).issueCredits(0, buyer.address, 100)
    ).to.be.reverted;
    console.log("✅ Access control working");
  });

  it("Should emit CreditsRetired event", async function () {
    const { contract, buyer } = await deployFixture();
    await contract.registerProject("Mangrove Brazil", "VCS", "Brazil", 2023);
    await contract.issueCredits(0, buyer.address, 300);
    await expect(
      contract.connect(buyer).retireCredits(0, 100, "Annual offset")
    ).to.emit(contract, "CreditsRetired")
     .withArgs(0, buyer.address, 100, "Annual offset");
    console.log("✅ Event emitted correctly");
  });

});

describe("TradingExchange", function () {

  async function deployAll() {
    const [owner, seller, buyer] = await ethers.getSigners();
    const CC = await ethers.getContractFactory("CarbonCredit");
    const cc = await CC.deploy();
    const TE = await ethers.getContractFactory("TradingExchange");
    const te = await TE.deploy(await cc.getAddress());

    await cc.registerProject("Solar Farm", "VCS", "India", 2023);
    await cc.issueCredits(0, seller.address, 1000);
    await cc.connect(seller).setApprovalForAll(await te.getAddress(), true);

    return { cc, te, owner, seller, buyer };
  }

  it("Should list credits for sale", async function () {
    const { te, seller } = await deployAll();
    await te.connect(seller).listCredits(0, 100, ethers.parseEther("0.01"));
    const listing = await te.listings(0);
    expect(listing.isActive).to.equal(true);
    console.log("✅ 100 credits listed");
  });

  it("Should allow buying credits", async function () {
    const { cc, te, seller, buyer } = await deployAll();
    await te.connect(seller).listCredits(0, 100, ethers.parseEther("0.01"));
    await te.connect(buyer).buyCredits(0, 10, { value: ethers.parseEther("0.1") });
    expect(await cc.balanceOf(buyer.address, 0)).to.equal(10);
    console.log("✅ Buyer received 10 credits");
  });

  it("Should cancel a listing", async function () {
    const { te, seller } = await deployAll();
    await te.connect(seller).listCredits(0, 50, ethers.parseEther("0.02"));
    await te.connect(seller).cancelListing(0);
    const listing = await te.listings(0);
    expect(listing.isActive).to.equal(false);
    console.log("✅ Listing cancelled");
  });

});