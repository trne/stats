import { DeveloperStats, ProcessedDeveloperStats } from '../../models/developerStats';
import { mapDeveloperStats } from './mappers/developerStats.mapper';

export const readJsonFile = (file: File): Promise<DeveloperStats[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const data = JSON.parse(result) as DeveloperStats[];
          resolve(data);
        } else {
          reject(new Error('Failed to read file contents'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

export const processData = (data: DeveloperStats[]): ProcessedDeveloperStats[] => {
  return data.map(mapDeveloperStats);
};

// Get the transformation data for charts
export const getUsersCommitComparisonData = (data: ProcessedDeveloperStats[]) => {
  return data.map(dev => ({
    name: dev.user,
    commits: dev.commits.totals.c,
    additions: dev.commits.totals.a,
    deletions: dev.commits.totals.d
  }));
};

export const getPRComparisonData = (data: ProcessedDeveloperStats[]) => {
  return data.map(dev => ({
    name: dev.user,
    merged: dev.closedPRs.totalMergedPRs,
    closed: dev.closedPRs.totalClosedNotMergedPRs,
    open: dev.openPRs.totalOpenPRs
  }));
};

export const getWeeklyCommitData = (data: ProcessedDeveloperStats[]) => {
  // Group by week and developer
  const weekMap = new Map<number, { week: string, [key: string]: any }>();
  
  data.forEach(dev => {
    dev.commits.weeks.forEach(week => {
      const weekTimestamp = week.w;
      const weekDate = new Date(weekTimestamp * 1000);
      const weekLabel = `${weekDate.getFullYear()}-${weekDate.getMonth() + 1}-${weekDate.getDate()}`;
      
      if (!weekMap.has(weekTimestamp)) {
        weekMap.set(weekTimestamp, { week: weekLabel });
      }
      
      const weekData = weekMap.get(weekTimestamp)!;
      weekData[`${dev.user}_commits`] = week.c;
      weekData[`${dev.user}_additions`] = week.a;
      weekData[`${dev.user}_deletions`] = week.d;
    });
  });
  
  return Array.from(weekMap.values()).sort((a, b) => a.week.localeCompare(b.week));
};

export const getLeaderboardData = (data: ProcessedDeveloperStats[]) => {
  return data
    .map(dev => ({
      name: dev.user,
      commits: dev.commits.totals.c,
      mergedPRs: dev.closedPRs.totalMergedPRs,
      totalPRs: dev.totalPRs,
      additions: dev.commits.totals.a,
      deletions: dev.commits.totals.d,
      // Calculate a score based on activity
      score: dev.commits.totals.c * 5 + dev.closedPRs.totalMergedPRs * 20
    }))
    .sort((a, b) => b.score - a.score);
};