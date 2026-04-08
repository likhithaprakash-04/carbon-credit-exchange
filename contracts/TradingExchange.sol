// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CarbonCredit.sol";

/**
 * @title TradingExchange
 * @dev Decentralized marketplace for buying and selling carbon credits
 * Features: listings, purchases, cancellations, 2.5% platform fee
 */
contract TradingExchange is Ownable, ReentrancyGuard {

    CarbonCredit public carbonCreditContract;

    uint256 public platformFeePercent = 250; // 2.5% (basis points)
    uint256 public listingCount;

    struct Listing {
        uint256 listingId;
        address seller;
        uint256 tokenId;
        uint256 amount;
        uint256 pricePerCredit; // in wei
        bool isActive;
        uint256 createdAt;
    }

    mapping(uint256 => Listing) public listings;

    // Track all listing IDs per seller
    mapping(address => uint256[]) public sellerListings;

    // Price history: tokenId => array of prices
    mapping(uint256 => uint256[]) public priceHistory;

    event CreditListed(uint256 indexed listingId, address indexed seller, uint256 tokenId, uint256 amount, uint256 pricePerCredit);
    event CreditPurchased(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 totalPaid);
    event ListingCancelled(uint256 indexed listingId, address indexed seller);
    event PlatformFeeUpdated(uint256 newFee);

    constructor(address _carbonCreditAddress) Ownable(msg.sender) {
        carbonCreditContract = CarbonCredit(_carbonCreditAddress);
    }

    /**
     * @dev Seller lists carbon credits for sale
     * Seller must first call setApprovalForAll on CarbonCredit contract
     */
    function listCredits(
        uint256 tokenId,
        uint256 amount,
        uint256 pricePerCredit
    ) external nonReentrant returns (uint256) {
        require(amount > 0, "Amount must be greater than zero");
        require(pricePerCredit > 0, "Price must be greater than zero");
        require(
            carbonCreditContract.balanceOf(msg.sender, tokenId) >= amount,
            "Insufficient credit balance"
        );
        require(
            carbonCreditContract.isApprovedForAll(msg.sender, address(this)),
            "Exchange not approved to transfer credits"
        );

        uint256 listingId = listingCount++;

        listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            tokenId: tokenId,
            amount: amount,
            pricePerCredit: pricePerCredit,
            isActive: true,
            createdAt: block.timestamp
        });

        sellerListings[msg.sender].push(listingId);
        priceHistory[tokenId].push(pricePerCredit);

        emit CreditListed(listingId, msg.sender, tokenId, amount, pricePerCredit);
        return listingId;
    }

    /**
     * @dev Buyer purchases credits from a listing
     * Send exact ETH: amount * pricePerCredit
     */
    function buyCredits(
        uint256 listingId,
        uint256 amountToBuy
    ) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing is not active");
        require(amountToBuy > 0 && amountToBuy <= listing.amount, "Invalid amount");

        uint256 totalPrice = listing.pricePerCredit * amountToBuy;
        require(msg.value >= totalPrice, "Insufficient ETH sent");

        // Calculate platform fee
        uint256 fee = (totalPrice * platformFeePercent) / 10000;
        uint256 sellerAmount = totalPrice - fee;

        // Update listing
        listing.amount -= amountToBuy;
        if (listing.amount == 0) {
            listing.isActive = false;
        }

        // Transfer credits from seller to buyer
        carbonCreditContract.safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId,
            amountToBuy,
            ""
        );

        // Pay seller
        payable(listing.seller).transfer(sellerAmount);

        // Refund excess ETH
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        emit CreditPurchased(listingId, msg.sender, amountToBuy, totalPrice);
    }

    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing already inactive");

        listing.isActive = false;
        emit ListingCancelled(listingId, msg.sender);
    }

    function getPriceHistory(uint256 tokenId) external view returns (uint256[] memory) {
        return priceHistory[tokenId];
    }

    function getSellerListings(address seller) external view returns (uint256[] memory) {
        return sellerListings[seller];
    }

    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        platformFeePercent = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    // Withdraw accumulated platform fees
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}