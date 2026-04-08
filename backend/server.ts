import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { projectRoutes } from "./routes/projects";
import { tradingRoutes } from "./routes/trading";
import { fraudRoutes } from "./routes/fraud";
import { analyticsRoutes } from "./routes/analytics";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/projects", projectRoutes);
app.use("/api/trading", tradingRoutes);
app.use("/api/fraud", fraudRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      blockchain: "connected",
      ml_model: "loaded",
      api: "running"
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Carbon Credit API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Projects API: http://localhost:${PORT}/api/projects`);
  console.log(`💱 Trading API:  http://localhost:${PORT}/api/trading`);
  console.log(`🤖 Fraud API:    http://localhost:${PORT}/api/fraud`);
  console.log(`📈 Analytics:    http://localhost:${PORT}/api/analytics\n`);
});

export default app;