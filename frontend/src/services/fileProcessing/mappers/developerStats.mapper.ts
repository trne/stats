import { DeveloperStats, ProcessedDeveloperStats } from '../../../models/developerStats';

// Convert milliseconds to hours
const msToHours = (ms: number): number => {
  if (!ms) return 0;
  return Number((ms / (1000 * 60 * 60)).toFixed(1));
};

export const mapDeveloperStats = (stats: DeveloperStats): ProcessedDeveloperStats => {
  // Ensure all required properties exist with defaults if missing
  const closedPRs = stats.closedPRs || { totalMergedPRs: 0, totalClosedNotMergedPRs: 0, averageTimeToMerge: 0, averageTimeToCloseNotMerged: 0 };
  const openPRs = stats.openPRs || { totalOpenPRs: 0, averageOpenPRDuration: 0 };
  const commits = stats.commits || { weeks: [], months: [], totals: { a: 0, d: 0, c: 0 } };
  
  const totalMergedPRs = closedPRs.totalMergedPRs || 0;
  const totalClosedNotMergedPRs = closedPRs.totalClosedNotMergedPRs || 0;
  const totalOpenPRs = openPRs.totalOpenPRs || 0;
  
  const totalClosedPRs = totalMergedPRs + totalClosedNotMergedPRs;
  
  return {
    user: stats.user,
    closedPRs,
    openPRs,
    commits,
    totalPRs: totalClosedPRs + totalOpenPRs,
    avgMergeTimeHours: msToHours(closedPRs.averageTimeToMerge || 0),
    avgCloseTimeHours: msToHours(closedPRs.averageTimeToCloseNotMerged || 0),
    avgOpenTimeHours: msToHours(openPRs.averageOpenPRDuration || 0),
    totalCommits: commits.totals?.c || 0,
    mergeRatio: totalClosedPRs > 0 
      ? Number((totalMergedPRs / totalClosedPRs).toFixed(2)) 
      : 0
  };
};