import axios from "axios";

const GITHUB_PAT = process.env.GITHUB_PAT;
const ORG_NAME = process.env.ORGANIZATION;

// New function to fetch contributor stats
export const fetchContributorStats = async (repository: string = "tawny-mobile", retries: number = 5, delay: number = 2000) => {
    if (!GITHUB_PAT || !ORG_NAME) {
        throw new Error("Missing required environment variables.");
    }

    const url = `https://api.github.com/repos/${ORG_NAME}/${repository}/stats/contributors`;

    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${GITHUB_PAT}`,
                    Accept: "application/vnd.github+json",
                },
            });

            // If the response is successful, return the data
            return response.data;
        } catch (error: any) {
            // If we get a 202 status, wait and retry
            if (error.response?.status === 202) {
                console.log(`Data not ready, retrying in ${delay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error(error.response?.data || error.message);
            }
        }
    }

    throw new Error("Contributor stats are still not available after multiple attempts.");
};
