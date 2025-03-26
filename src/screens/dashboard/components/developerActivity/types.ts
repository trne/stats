import { ProcessedDeveloperStats } from '../../../../models/developerStats';

export interface MonthInfo {
  monthKey: string;
  monthLabel: string;
}

export interface DeveloperActivityProps {
  developer: ProcessedDeveloperStats;
  colorIndex: number;
  allMonths?: MonthInfo[];
}