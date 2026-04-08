import { Router, Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

export const fraudRoutes = Router();

// Simple fraud scoring in TypeScript
// (Real model runs in Python — this mirrors the logic)
function calculateFraudScore(tx: any): number {
  let score = 0;

  const amount = parseFloat(tx.amount_credits) || 0;
  const price = parseFloat(tx.price_per_credit) || 0;
  const totalValue = parseFloat(tx.total_value_usd) || 0;
  const daysSinceLast = parseFloat(tx.days_since_last_tx) || 30;
  const buyerTxCount = parseFloat(tx.buyer_tx_count) || 1;
  const priceDeviation = Math.abs(parseFloat(tx.price_deviation_pct) || 0);

  if (totalValue > 1000000) score += 35;
  else if (totalValue > 100000) score += 15;

  if (daysSinceLast < 1) score += 30;
  else if (daysSinceLast < 3) score += 15;

  if (buyerTxCount < 3) score += 20;

  if (priceDeviation > 100) score += 30;
  else if (priceDeviation > 50) score += 15;

  if (amount > 100000) score += 25;

  return Math.min(score, 100);
}

// GET /api/fraud/transactions — get flagged transactions
fraudRoutes.get("/transactions", async (req: Request, res: Response) => {
  try {
    const csvPath = path.join(__dirname, "../../data/carbon_transactions.csv");
    const content = fs.readFileSync(csvPath, "utf8");
    const records = parse(content, { columns: true, skip_empty_lines: true });

    const analyzed = records.slice(0, 100).map((tx: any) => ({
      transaction_id: tx.transaction_id,
      project_id: tx.project_id,
      amount_credits: parseInt(tx.amount_credits),
      price_per_credit: parseFloat(tx.price_per_credit),
      total_value_usd: parseFloat(tx.total_value_usd),
      transaction_date: tx.transaction_date,
      fraud_score: calculateFraudScore(tx),
      is_flagged: calculateFraudScore(tx) >= 50,
      actual_fraud: tx.is_fraud === "1"
    }));

    const flagged = analyzed.filter((tx: any) => tx.is_flagged);

    res.json({
      success: true,
      total_analyzed: analyzed.length,
      flagged_count: flagged.length,
      flag_rate: `${((flagged.length / analyzed.length) * 100).toFixed(1)}%`,
      data: analyzed
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/fraud/check — check a single transaction
fraudRoutes.post("/check", async (req: Request, res: Response) => {
  try {
    const tx = req.body;
    const score = calculateFraudScore(tx);

    res.json({
      success: true,
      transaction: tx,
      fraud_score: score,
      risk_level: score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW",
      is_flagged: score >= 50,
      recommendation: score >= 70
        ? "BLOCK — High fraud probability"
        : score >= 40
        ? "REVIEW — Manual verification needed"
        : "APPROVE — Transaction appears legitimate"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});