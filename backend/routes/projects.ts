import { Router, Request, Response } from "express";
import { carbonCreditContract } from "../blockchain";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

export const projectRoutes = Router();

// GET /api/projects — get all projects from blockchain
projectRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const projectCount = await carbonCreditContract.projectCount();
    const projects = [];

    for (let i = 0; i < Number(projectCount); i++) {
      const project = await carbonCreditContract.getProject(i);
      projects.push({
        tokenId: i,
        projectName: project.projectName,
        methodology: project.methodology,
        country: project.country,
        vintageYear: Number(project.vintageYear),
        totalSupply: Number(project.totalSupply),
        retired: Number(project.retired),
        isVerified: project.isVerified,
        verifier: project.verifier,
        registeredAt: new Date(Number(project.registeredAt) * 1000).toISOString()
      });
    }

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/projects/:id — get single project
projectRoutes.get("/:id", async (req: Request, res: Response) => {
  try {
    const tokenId = parseInt(req.params.id as string);
    const project = await carbonCreditContract.getProject(tokenId);

    res.json({
      success: true,
      data: {
        tokenId,
        projectName: project.projectName,
        methodology: project.methodology,
        country: project.country,
        vintageYear: Number(project.vintageYear),
        totalSupply: Number(project.totalSupply),
        retired: Number(project.retired),
        isVerified: project.isVerified,
        verifier: project.verifier
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/projects/dataset/all — get CSV dataset projects
projectRoutes.get("/dataset/all", async (req: Request, res: Response) => {
  try {
    const csvPath = path.join(__dirname, "../../data/verra_projects.csv");
    const content = fs.readFileSync(csvPath, "utf8");
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true
    });

    res.json({
      success: true,
      count: records.length,
      data: records.slice(0, 50) // return first 50
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});