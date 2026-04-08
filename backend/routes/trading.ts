import { Router, Request, Response } from "express";
import { tradingExchangeContract } from "../blockchain";

export const tradingRoutes = Router();

// GET /api/trading/listings — get all active listings
tradingRoutes.get("/listings", async (req: Request, res: Response) => {
  try {
    const listingCount = await tradingExchangeContract.listingCount();
    const listings = [];

    for (let i = 0; i < Number(listingCount); i++) {
      const listing = await tradingExchangeContract.listings(i);
      if (listing.isActive) {
        listings.push({
          listingId: i,
          seller: listing.seller,
          tokenId: Number(listing.tokenId),
          amount: Number(listing.amount),
          pricePerCredit: listing.pricePerCredit.toString(),
          priceInEth: parseFloat(listing.pricePerCredit.toString()) / 1e18,
          isActive: listing.isActive,
          createdAt: new Date(Number(listing.createdAt) * 1000).toISOString()
        });
      }
    }

    res.json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/trading/listings/:id — get single listing
tradingRoutes.get("/listings/:id", async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.id as string);
    const listing = await tradingExchangeContract.listings(listingId);

    res.json({
      success: true,
      data: {
        listingId,
        seller: listing.seller,
        tokenId: Number(listing.tokenId),
        amount: Number(listing.amount),
        pricePerCredit: listing.pricePerCredit.toString(),
        isActive: listing.isActive
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/trading/price-history/:tokenId
tradingRoutes.get("/price-history/:tokenId", async (req: Request, res: Response) => {
  try {
    const tokenId = parseInt(req.params.tokenId as string);
    const history = await tradingExchangeContract.getPriceHistory(tokenId);

    const formatted = history.map((price: bigint, index: number) => ({
      index,
      priceWei: price.toString(),
      priceEth: parseFloat(price.toString()) / 1e18
    }));

    res.json({
      success: true,
      tokenId,
      count: formatted.length,
      data: formatted
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});