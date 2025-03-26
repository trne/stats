import React from 'react';
import Card from '../../../../components/baseUi/card/card.component';
import { DeveloperActivityProps } from './types';
import { getColorByIndex, formatDuration, formatNumber } from '../../../../lib/utils';
import { GitPullRequest, GitCommit, FileCode, Clock } from 'lucide-react';
import BarChart from '../../../../components/baseUi/charts/barChart/barChart.component';

const DeveloperActivity: React.FC<DeveloperActivityProps> = ({ developer, colorIndex }) => {
  const color = getColorByIndex(colorIndex);
  
  // Calculate PR metrics
  const totalPRs = developer.closedPRs.totalMergedPRs + developer.closedPRs.totalClosedNotMergedPRs + developer.openPRs.totalOpenPRs;
  
  // Format for commit trend chart (by week)
  const commitData = developer.commits.weeks.map(week => {
    const date = new Date(week.w * 1000);
    return {
      week: `W${date.getDate()}/${date.getMonth() + 1}`,
      commits: week.c,
      additions: week.a,
      deletions: week.d
    };
  });
  
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800" style={{ color }}>
          {developer.user}
        </h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center mb-1">
            <GitCommit className="h-4 w-4 mr-1 text-blue-600" />
            <h3 className="text-xs text-gray-600">Commits</h3>
          </div>
          <p className="text-2xl font-bold text-gray-800">{developer.commits.totals.c}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center mb-1">
            <GitPullRequest className="h-4 w-4 mr-1 text-indigo-600" />
            <h3 className="text-xs text-gray-600">PRs</h3>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {totalPRs}
          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center mb-1">
            <FileCode className="h-4 w-4 mr-1 text-emerald-600" />
            <h3 className="text-xs text-gray-600">Changes</h3>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            <span className="text-green-600">+{formatNumber(developer.commits.totals.a)}</span>
            {" / "}
            <span className="text-red-600">-{formatNumber(developer.commits.totals.d)}</span>
          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center mb-1">
            <Clock className="h-4 w-4 mr-1 text-amber-600" />
            <h3 className="text-xs text-gray-600">Avg. Merge Time</h3>
          </div>
          <p className="text-lg font-bold text-gray-800">
            {formatDuration(developer.closedPRs.averageTimeToMerge)}
          </p>
        </div>
      </div>
      
      <div className="h-48 mb-2">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Weekly Activity</h3>
        <BarChart 
          data={commitData.slice(-5)} // Show last 5 weeks
          xDataKey="week"
          barItems={[
            { dataKey: 'commits', color: color },
          ]}
          height={130}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <div>
          <span className="font-medium">Merged PRs:</span> {developer.closedPRs.totalMergedPRs}
        </div>
        <div>
          <span className="font-medium">Open PRs:</span> {developer.openPRs.totalOpenPRs}
        </div>
      </div>
    </Card>
  );
};

export default DeveloperActivity;