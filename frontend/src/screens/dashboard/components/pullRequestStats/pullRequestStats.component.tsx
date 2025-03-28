import React from 'react';
import Card from '../../../../components/baseUi/card/card.component';
import PieChart from '../../../../components/baseUi/charts/pieChart/pieChart.component';
import { getPRComparisonData } from '../../../../services/fileProcessing/fileProcessing.service';
import { PullRequestStatsProps } from './types';
import { GitPullRequest, GitMerge, GitCompare } from 'lucide-react';
import { formatDuration } from '../../../../lib/utils';

const PullRequestStats: React.FC<PullRequestStatsProps> = ({ data }) => {
  const prData = getPRComparisonData(data);
  
  // Calculate totals
  const totalMerged = data.reduce((sum, dev) => sum + dev.closedPRs.totalMergedPRs, 0);
  const totalClosed = data.reduce((sum, dev) => sum + dev.closedPRs.totalClosedNotMergedPRs, 0);
  const totalOpen = data.reduce((sum, dev) => sum + dev.openPRs.totalOpenPRs, 0);
  
  // Calculate average time to merge across all developers
  const totalTimeToMerge = data.reduce(
    (sum, dev) => sum + (dev.closedPRs.averageTimeToMerge * dev.closedPRs.totalMergedPRs), 
    0
  );
  const averageTimeToMerge = totalMerged > 0 
    ? totalTimeToMerge / totalMerged 
    : 0;
  
  // Format for pie chart
  const prStatusData = [
    { name: 'Merged', value: totalMerged },
    { name: 'Closed (Not Merged)', value: totalClosed },
    { name: 'Open', value: totalOpen }
  ];
  
  return (
    <Card className="h-full">
      <div className="flex items-center mb-4">
        <GitPullRequest className="h-5 w-5 mr-2 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-800">Pull Request Stats</h2>
      </div>
      
      <div className="h-64 mb-4">
        <PieChart 
          data={prStatusData}
          dataKey="value"
          nameKey="name"
          colors={['#10B981', '#F59E0B', '#6366F1']}
        />
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center mb-2">
            <GitMerge className="h-4 w-4 mr-2 text-emerald-600" />
            <h3 className="font-semibold text-gray-800">Merge Efficiency</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Total Merged</p>
              <p className="text-xl font-bold text-emerald-600">{totalMerged}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg. Time to Merge</p>
              <p className="text-lg font-semibold text-gray-800">{formatDuration(averageTimeToMerge)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-indigo-50 p-3 rounded-lg">
          <div className="flex items-center mb-2">
            <GitCompare className="h-4 w-4 mr-2 text-indigo-600" />
            <h3 className="font-semibold text-gray-800">Open PRs</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Total Open</p>
              <p className="text-xl font-bold text-indigo-600">{totalOpen}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Need Review</p>
              <p className="text-lg font-semibold text-gray-800">{totalOpen}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PullRequestStats;