import axios from 'axios';

interface PRStats {
    login: string;
    totalPRs: number;
    totalMergedPRs: number;
    totalClosedNotMergedPRs: number;
    totalOpenPRs: number;
    averageTimeToMerge: number;
    averageTimeToCloseNotMerged: number;
    averagePROpenDuration: number;
}

interface ContributorStats {
    total: number;
    weeks: Array<{
        w: number;
        a: number;
        d: number;
        c: number;
    }>;
    author: {
        login: string;
        id: number;
        avatar_url: string;
        html_url: string;
    };
}

interface TransformedSummary {
    user: string;
    closedPRs: {
        totalMergedPRs: number;
        totalClosedNotMergedPRs: number;
        averageTimeToMerge: number;
        averageTimeToCloseNotMerged: number;
    };
    openPRs: {
        totalOpenPRs: number;
        averageOpenPRDuration: number;
    };
    commits: {
        weeks: Array<{
            w: number;
            a: number;
            d: number;
            c: number;
        }>;
        months: any[]; // TODO: Implement if needed
        totals: {
            a: number;
            d: number;
            c: number;
        };
    };
}

export const fetchSummary = async () => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    try {
        // Fetch repositories
        const reposResponse = await axios.get(`${baseUrl}/repos`);
        const repos = reposResponse.data;
        console.log("Repos:", repos);

        // Fetch and aggregate contributor stats
        const statsPromises = repos.map((repo: { name: string }) => 
            axios.get(`${baseUrl}/contributors?repository=${repo.name}`)
        );
        const statsResponses = await Promise.all(statsPromises);
        const stats = statsResponses.reduce((acc: ContributorStats[], response) => {
            const repoStats = response.data;
            if (!Array.isArray(repoStats)) {
                console.log("Invalid stats data:", repoStats);
                return acc;
            }
            return mergeContributorStats(acc, repoStats);
        }, []);
        console.log("Stats:", stats);

        // Fetch and aggregate open PRs
        const openPRsPromises = repos.map((repo: { name: string }) => 
            axios.get(`${baseUrl}/prs?state=open&repository=${repo.name}`)
        );
        const openPRsResponses = await Promise.all(openPRsPromises);
        const openPRs = openPRsResponses.reduce((acc: PRStats[], response) => {
            const repoPRs = response.data;
            if (!Array.isArray(repoPRs)) {
                console.log("Invalid open PRs data:", repoPRs);
                return acc;
            }
            return mergePRStats(acc, repoPRs);
        }, []);

        // Fetch and aggregate closed PRs
        const closedPRsPromises = repos.map((repo: { name: string }) => 
            axios.get(`${baseUrl}/prs?state=closed&repository=${repo.name}`)
        );
        const closedPRsResponses = await Promise.all(closedPRsPromises);
        const closedPRs = closedPRsResponses.reduce((acc: PRStats[], response) => {
            const repoPRs = response.data;
            if (!Array.isArray(repoPRs)) {
                console.log("Invalid closed PRs data:", repoPRs);
                return acc;
            }
            return mergePRStats(acc, repoPRs);
        }, []);

        // Transform the data into the required shape
        const users = new Set([
            ...stats.map(s => s.author.login),
            ...openPRs.map(pr => pr.login),
            ...closedPRs.map(pr => pr.login)
        ]);

        const transformedSummary: TransformedSummary[] = Array.from(users).map(user => {
            const userStats = stats.find(s => s.author.login === user);
            const userOpenPRs = openPRs.find(pr => pr.login === user);
            const userClosedPRs = closedPRs.find(pr => pr.login === user);

            // Calculate commit totals
            const totals = userStats?.weeks.reduce(
                (acc, week) => ({
                    a: acc.a + week.a,
                    d: acc.d + week.d,
                    c: acc.c + week.c
                }),
                { a: 0, d: 0, c: 0 }
            ) || { a: 0, d: 0, c: 0 };

            return {
                user,
                closedPRs: {
                    totalMergedPRs: userClosedPRs?.totalMergedPRs || 0,
                    totalClosedNotMergedPRs: userClosedPRs?.totalClosedNotMergedPRs || 0,
                    averageTimeToMerge: userClosedPRs?.averageTimeToMerge || 0,
                    averageTimeToCloseNotMerged: userClosedPRs?.averageTimeToCloseNotMerged || 0
                },
                openPRs: {
                    totalOpenPRs: userOpenPRs?.totalOpenPRs || 0,
                    averageOpenPRDuration: userOpenPRs?.averagePROpenDuration || 0
                },
                commits: {
                    weeks: userStats?.weeks || [],
                    months: [], // TODO: Implement if needed
                    totals
                }
            };
        });

        return transformedSummary;

    } catch (error: any) {
        console.error("Full error:", error);
        throw new Error(`Failed to fetch summary: ${error.message}`);
    }
};

function mergeContributorStats(existing: ContributorStats[], newStats: ContributorStats[]): ContributorStats[] {
    const merged = new Map<string, ContributorStats>();

    // Process existing stats
    existing.forEach(stat => {
        merged.set(stat.author.login, stat);
    });

    // Merge new stats
    newStats.forEach(stat => {
        const existingStat = merged.get(stat.author.login);
        if (existingStat) {
            existingStat.total += stat.total;
            stat.weeks.forEach(week => {
                const existingWeek = existingStat.weeks.find(w => w.w === week.w);
                if (existingWeek) {
                    existingWeek.a += week.a;
                    existingWeek.d += week.d;
                    existingWeek.c += week.c;
                } else {
                    existingStat.weeks.push(week);
                }
            });
        } else {
            merged.set(stat.author.login, stat);
        }
    });

    return Array.from(merged.values());
}

function mergePRStats(existing: PRStats[], newStats: PRStats[]): PRStats[] {
    const merged = new Map<string, PRStats>();

    // Process existing stats
    existing.forEach(stat => {
        merged.set(stat.login, stat);
    });

    // Merge new stats
    newStats.forEach(stat => {
        const existingStat = merged.get(stat.login);
        if (existingStat) {
            existingStat.totalPRs += stat.totalPRs;
            existingStat.totalMergedPRs += stat.totalMergedPRs;
            existingStat.totalClosedNotMergedPRs += stat.totalClosedNotMergedPRs;
            existingStat.totalOpenPRs += stat.totalOpenPRs;
            // Calculate weighted averages for time-based metrics
            existingStat.averageTimeToMerge = weightedAverage(
                [existingStat.averageTimeToMerge, stat.averageTimeToMerge],
                [existingStat.totalMergedPRs, stat.totalMergedPRs]
            );
            existingStat.averageTimeToCloseNotMerged = weightedAverage(
                [existingStat.averageTimeToCloseNotMerged, stat.averageTimeToCloseNotMerged],
                [existingStat.totalClosedNotMergedPRs, stat.totalClosedNotMergedPRs]
            );
            existingStat.averagePROpenDuration = weightedAverage(
                [existingStat.averagePROpenDuration, stat.averagePROpenDuration],
                [existingStat.totalOpenPRs, stat.totalOpenPRs]
            );
        } else {
            merged.set(stat.login, stat);
        }
    });

    return Array.from(merged.values());
}

function weightedAverage(values: number[], weights: number[]): number {
    if (weights.reduce((a, b) => a + b, 0) === 0) return 0;
    return values.reduce((sum, value, i) => sum + value * weights[i], 0) / 
           weights.reduce((a, b) => a + b, 0);
}
