import { Router, Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

export const analyticsRoutes = Router();

// GET /api/analytics/summary
analyticsRoutes.get("/summary", async (req: Request, res: Response) => {
  try {
    const txPath = path.join(__dirname, "../../data/carbon_transactions.csv");
    const projPath = path.join(__dirname, "../../data/verra_projects.csv");
    const pricePath = path.join(__dirname, "../../data/carbon_prices.csv");

    const transactions = parse(fs.readFileSync(txPath, "utf8"), { columns: true });
    const projects = parse(fs.readFileSync(projPath, "utf8"), { columns: true });
    const prices = parse(fs.readFileSync(pricePath, "utf8"), { columns: true });

    const totalVolume = transactions.reduce(
      (sum: number, tx: any) => sum + parseFloat(tx.total_value_usd), 0
    );
    const totalCredits = transactions.reduce(
      (sum: number, tx: any) => sum + parseInt(tx.amount_credits), 0
    );
    const latestPrice = prices[prices.length - 1];
    const countryCounts: Record<string, number> = {};
    projects.forEach((p: any) => {
      countryCounts[p.country] = (countryCounts[p.country] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        total_projects: projects.length,
        total_transactions: transactions.length,
        total_volume_usd: Math.round(totalVolume),
        total_credits_traded: totalCredits,
        latest_carbon_price: (latestPrice as any)?.price_usd,
        fraud_cases: transactions.filter((tx: any) => tx.is_fraud === "1").length,
        top_countries: Object.entries(countryCounts)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 5)
          .map(([country, count]) => ({ country, count })),
        price_trend: prices.slice(-30).map((p: any) => ({
          date: p.date,
          price: parseFloat(p.price_usd)
        }))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
import * as path from "path";

analyticsRoutes.get("/forecast", async (req: Request, res: Response) => {
  try {
    const forecastPath = path.join(__dirname, "../../data/price_forecast.json");
    const forecast = JSON.parse(fs.readFileSync(forecastPath, "utf8"));
    res.json({ success: true, data: forecast });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});