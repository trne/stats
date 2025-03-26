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
  // Group by month and developer (not by week)
  const monthMap = new Map<string, { week: string, [key: string]: any }>();
  const monthOrder: string[] = [];
  
  // Array of month names for formatting
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  // Collect and aggregate all data by month for all developers
  data.forEach(dev => {
    dev.commits.weeks.forEach(week => {
      const weekDate = new Date(week.w * 1000);
      const month = weekDate.getMonth();
      const year = weekDate.getFullYear();
      const yearShort = year.toString().slice(2);
      
      // Create a month key for grouping (YYYY-MM format for sorting)
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      const monthLabel = `${monthNames[month]}-${yearShort}`;
      
      // Initialize month data if not exists
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { 
          week: monthLabel,
          month: month,
          year: year,
          monthKey: monthKey
        });
        monthOrder.push(monthKey);
      }
      
      const monthData = monthMap.get(monthKey)!;
      
      // Accumulate data for this developer in this month
      const commitsKey = `${dev.user}_commits`;
      const additionsKey = `${dev.user}_additions`;
      const deletionsKey = `${dev.user}_deletions`;
      
      monthData[commitsKey] = (monthData[commitsKey] || 0) + week.c;
      monthData[additionsKey] = (monthData[additionsKey] || 0) + week.a;
      monthData[deletionsKey] = (monthData[deletionsKey] || 0) + week.d;
    });
  });
  
  // Initialize all developers' data for all months to ensure no gaps
  const allDevelopers = data.map(dev => dev.user);
  const allMonthData = Array.from(monthMap.values());
  
  allMonthData.forEach(monthData => {
    allDevelopers.forEach(developer => {
      if (!(`${developer}_commits` in monthData)) {
        monthData[`${developer}_commits`] = 0;
      }
      if (!(`${developer}_additions` in monthData)) {
        monthData[`${developer}_additions`] = 0;
      }
      if (!(`${developer}_deletions` in monthData)) {
        monthData[`${developer}_deletions`] = 0;
      }
    });
  });
  
  // Sort chronologically by year and month
  return Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, value]) => value);
};

export const getLeaderboardData = (data: ProcessedDeveloperStats[]) => {
  return data
    .map(dev => {
      // Calculate total code changes (additions + deletions)
      const totalCodeChanges = dev.commits.totals.a + dev.commits.totals.d;
      
      return {
        name: dev.user,
        commits: dev.commits.totals.c,
        mergedPRs: dev.closedPRs.totalMergedPRs,
        totalPRs: dev.totalPRs,
        additions: dev.commits.totals.a,
        deletions: dev.commits.totals.d,
        // Updated scoring formula with higher weights for code changes and PRs
        // This should ensure chanduka ranks higher than laila, and laila higher than naomi
        score: 
          // Code changes are weighted highest
          (dev.commits.totals.a * 1.2) + 
          (dev.commits.totals.d * 0.8) +
          // PRs are weighted second highest
          (dev.closedPRs.totalMergedPRs * 15) + 
          (dev.openPRs.totalOpenPRs * 5) + 
          // Commits get a moderate weight
          (dev.commits.totals.c * 3)
      };
    })
    .sort((a, b) => b.score - a.score);
};