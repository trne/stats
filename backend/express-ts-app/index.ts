import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import cors from "cors";

dotenv.config();

import { fetchPullRequests } from "./src/fetchPullRequests"; // Import the function
import { fetchTeamRepositories } from "./src/fetchRepos"; // Add this import
import { fetchContributorStats } from "./src/fetchContributorStats";
import { fetchSummary } from "./src/summary"; // Add this import

const app = express();
const PORT = process.env.PORT || 3000;

// Add CORS middleware
app.use(cors());

app.get("/hello", (req: Request, res: Response) => {
    res.json({ message: "hello world" });
});

// New endpoint to fetch pull requests
app.get("/prs", async (req: Request, res: Response) => {
    const { state = "all", per_page = "100", repository } = req.query;
    try {
        const prs = await fetchPullRequests(
            state as "all" | "open" | "closed", 
            parseInt(per_page as string, 10),
            repository as string
        );
        res.json(prs);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

// Add new endpoint for team repositories
app.get("/repos", async (req: Request, res: Response): Promise<void> => {
    try {
        const repos = await fetchTeamRepositories();
        if (!repos) {
            res.status(500).json({ error: "Failed to fetch repositories" });
            return;
        }
        res.json(repos);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

app.get("/contributors", async (req: Request, res: Response) => {
    const { repository } = req.query;
    try {
        const contributors = await fetchContributorStats(repository as string);
        res.json(contributors);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

// Add new endpoint for summary
app.get("/summary", async (req: Request, res: Response) => {
    try {
        const summary = await fetchSummary();
        res.json(summary);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

