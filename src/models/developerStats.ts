// Types for the developer statistics

export interface CommitWeekData {
  w: number; // Unix timestamp for the week
  a: number; // Additions
  d: number; // Deletions
  c: number; // Commits
}

export interface CommitMonthData {
  month: string; // Format: YYYY-M
  a: number; // Additions
  d: number; // Deletions
  c: number; // Commits
}

export interface CommitTotals {
  a: number; // Total additions
  d: number; // Total deletions
  c: number; // Total commits
}

export interface CommitData {
  weeks: CommitWeekData[];
  months: CommitMonthData[];
  totals: CommitTotals;
}

export interface ClosedPRs {
  totalMergedPRs: number;
  totalClosedNotMergedPRs: number;
  averageTimeToMerge: number; // In milliseconds
  averageTimeToCloseNotMerged: number; // In milliseconds
}

export interface OpenPRs {
  totalOpenPRs: number;
  averageOpenPRDuration: number; // In milliseconds
}

export interface DeveloperStats {
  user: string;
  closedPRs: ClosedPRs;
  openPRs: OpenPRs;
  commits: CommitData;
}

export interface ProcessedDeveloperStats extends DeveloperStats {
  // Additional processed fields
  totalPRs: number;
  avgMergeTimeHours: number;
  avgCloseTimeHours: number;
  avgOpenTimeHours: number;
  totalCommits: number;
  mergeRatio: number; // Ratio of merged PRs to total closed PRs
}