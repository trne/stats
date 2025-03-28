import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const GITHUB_PAT = process.env.GITHUB_PAT;
const ORG_NAME = process.env.ORGANIZATION;
const TEAM_SLUG = process.env.TEAM_SLUG;

export const fetchTeamRepositories = async () => {
    if (!GITHUB_PAT || !ORG_NAME || !TEAM_SLUG) {
        console.error("Missing required environment variables.");
        return;
    }

    const url = `https://api.github.com/orgs/${ORG_NAME}/teams/${TEAM_SLUG}/repos`;

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${GITHUB_PAT}`,
                Accept: "application/vnd.github+json",
            },
        });

        const repos = response.data.map((repo: any) => ({
            name: repo.name,
            url: repo.html_url,
        }));

        console.log("Repositories:", repos);
        return repos;
    } catch (error: any) {
        console.error("Error fetching team repositories:", error.response?.data || error.message);
    }
};
