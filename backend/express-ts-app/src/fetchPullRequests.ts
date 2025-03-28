import axios from "axios";

const GITHUB_PAT = process.env.GITHUB_PAT;
const ORG_NAME = process.env.ORGANIZATION;


export const fetchPullRequests = async (state: "open" | "closed" | "all" = "all", perPage: number = 100, repository: string = "tawny-mobile") => {
    if (!GITHUB_PAT || !ORG_NAME) {
        throw new Error("Missing required environment variables.");
    }

    const url = `https://api.github.com/repos/${ORG_NAME}/${repository}/pulls?state=${state}&per_page=${perPage}`;

    console.log(url)

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${GITHUB_PAT}`,
                Accept: "application/vnd.github+json",
            },
        });

        return processPRs(response.data);
    } catch (error: any) {
        throw new Error(error.response?.data || error.message);
    }
};

interface UserStats {
  login: string;
  totalPRs: number;
  totalMergedPRs: number;
  totalClosedNotMergedPRs: number;
  totalOpenPRs: number;
  totalMergedDuration: number;
  totalClosedNotMergedDuration: number;
  totalOpenDuration: number;
}

function processPRs(prs: any, status = "all") {
    const users: { [key: string]: UserStats } = {};
  
    for (const item of prs) {
      const { login } = item.user;
      const createdAt = new Date(item.created_at);
      const closedAt = item.closed_at ? new Date(item.closed_at) : null;
      const mergedAt = item.merged_at ? new Date(item.merged_at) : null;
      const isMerged = !!mergedAt;
      const isClosed = !!closedAt;
      const isOpen = !isClosed;

      
  
      if (!users[login]) {
        users[login] = {
          login,
          totalPRs: 0,
          totalMergedPRs: 0,
          totalClosedNotMergedPRs: 0,
          totalOpenPRs: 0,
          totalMergedDuration: 0, // Time to merge PRs
          totalClosedNotMergedDuration: 0, // Time to close but not merge
          totalOpenDuration: 0, // Time PR has been open
        };
      }
  
      // Determine which PRs to count based on `status`
      if (status === "all" || (status === "merged" && isMerged) || (status === "closed" && isClosed && !isMerged) || (status === "open" && isOpen)) {
        users[login].totalPRs++;
  
        if (isMerged) {
          users[login].totalMergedPRs++;
          users[login].totalMergedDuration += mergedAt.getTime() - createdAt.getTime();
        } else if (isClosed) {
          users[login].totalClosedNotMergedPRs++;
          users[login].totalClosedNotMergedDuration += closedAt.getTime() - createdAt.getTime();
        } else if (isOpen) {
          users[login].totalOpenPRs++;
          users[login].totalOpenDuration += new Date().getTime() - createdAt.getTime();
        }
      }
    }
  
    return Object.values(users).map(user => ({
      login: user.login,
      totalPRs: user.totalPRs,
      totalMergedPRs: user.totalMergedPRs,
      totalClosedNotMergedPRs: user.totalClosedNotMergedPRs,
      totalOpenPRs: user.totalOpenPRs,
      averageTimeToMerge: user.totalMergedPRs ? user.totalMergedDuration / user.totalMergedPRs : 0,
      averageTimeToCloseNotMerged: user.totalClosedNotMergedPRs ? user.totalClosedNotMergedDuration / user.totalClosedNotMergedPRs : 0,
      averagePROpenDuration: user.totalOpenPRs ? user.totalOpenDuration / user.totalOpenPRs : 0,
    }));
  }