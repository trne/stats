import React, { useEffect, useState } from 'react';
import Card from '../../../../components/baseUi/card/card.component';
import { DeveloperActivityProps } from './types';
import { getColorByIndex, formatDuration, formatNumber } from '../../../../lib/utils';
import { GitPullRequest, GitCommit, FileCode, Clock, CheckCircle, XCircle, AlertCircle, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
import BarChart from '../../../../components/baseUi/charts/barChart/barChart.component';

const DeveloperActivity: React.FC<DeveloperActivityProps> = ({ developer, colorIndex, allMonths }) => {
  const color = getColorByIndex(colorIndex);
  
  // Calculate PR metrics
  const totalPRs = developer.closedPRs.totalMergedPRs + developer.closedPRs.totalClosedNotMergedPRs + developer.openPRs.totalOpenPRs;
  
  // Calculate code-to-commit ratio metrics
  const totalCodeChanges = developer.commits.totals.a + developer.commits.totals.d;
  const codeCommitRatio = developer.commits.totals.c > 0 
    ? totalCodeChanges / developer.commits.totals.c 
    : 0;
  
  // Determine ratio status (danger, warning, success)
  let ratioStatus: 'danger' | 'warning' | 'success' = 'success';
  let ratioMessage = '';
  
  if (codeCommitRatio < 20) {
    ratioStatus = 'danger';
    ratioMessage = 'Very low code changes per commit';
  } else if (codeCommitRatio < 50) {
    ratioStatus = 'warning';
    ratioMessage = 'Low code changes per commit';
  } else {
    ratioStatus = 'success';
    ratioMessage = 'Good code changes per commit';
  }
  
  // Format for commit trend chart (by month)
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  // Process developer's data for all available months
  const [commitData, setCommitData] = useState<any[]>([]);
  const [showScrollIndicators, setShowScrollIndicators] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  useEffect(() => {
    if (!allMonths || !allMonths.length) return;
    
    // Create a map of the developer's activity data by month
    const devActivityByMonth = new Map();
    
    developer.commits.weeks.forEach(week => {
      const date = new Date(week.w * 1000);
      const month = date.getMonth();
      const year = date.getFullYear();
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      
      if (!devActivityByMonth.has(monthKey)) {
        devActivityByMonth.set(monthKey, {
          commits: 0,
          additions: 0,
          deletions: 0
        });
      }
      
      const monthData = devActivityByMonth.get(monthKey);
      monthData.commits += week.c;
      monthData.additions += week.a;
      monthData.deletions += week.d;
    });
    
    // Ensure all months have data (even if it's zero)
    const processedData = allMonths.map(monthInfo => {
      const { monthKey, monthLabel } = monthInfo;
      const devData = devActivityByMonth.get(monthKey) || { commits: 0, additions: 0, deletions: 0 };
      
      return {
        week: monthLabel,
        monthKey: monthKey,
        commits: devData.commits,
        additions: devData.additions,
        deletions: devData.deletions
      };
    });
    
    setCommitData(processedData);
  }, [developer, allMonths]);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
  };
  
  const handleScrollLeft = () => {
    const container = document.getElementById(`chart-container-${developer.user}`);
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const handleScrollRight = () => {
    const container = document.getElementById(`chart-container-${developer.user}`);
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  
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
      
      {/* Code-to-Commit Ratio Alert */}
      <div className={`mb-4 p-3 rounded-lg flex items-start ${
        ratioStatus === 'danger' 
          ? 'bg-red-50 text-red-700' 
          : ratioStatus === 'warning' 
            ? 'bg-amber-50 text-amber-700' 
            : 'bg-green-50 text-green-700'
      }`}>
        {ratioStatus === 'danger' ? (
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
        ) : ratioStatus === 'warning' ? (
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
        ) : (
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
        )}
        <div>
          <p className="font-medium text-sm">
            {ratioStatus === 'danger' 
              ? 'Low Code Impact' 
              : ratioStatus === 'warning' 
                ? 'Moderate Code Impact' 
                : 'Good Code Impact'}
          </p>
          <p className="text-xs mt-1">
            {ratioMessage}. Ratio: {Math.round(codeCommitRatio)} changes per commit.
          </p>
        </div>
      </div>
      
      {/* PR Status Breakdown */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Pull Request Status</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-indigo-50 p-3 rounded-lg flex flex-col items-center justify-center">
            <div className="flex items-center mb-1">
              <AlertCircle className="h-4 w-4 mr-1 text-indigo-600" />
              <h3 className="text-xs text-gray-600">Open</h3>
            </div>
            <p className="text-lg font-bold text-indigo-700">{developer.openPRs.totalOpenPRs}</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg flex flex-col items-center justify-center">
            <div className="flex items-center mb-1">
              <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
              <h3 className="text-xs text-gray-600">Merged</h3>
            </div>
            <p className="text-lg font-bold text-green-700">{developer.closedPRs.totalMergedPRs}</p>
          </div>
          
          <div className="bg-amber-50 p-3 rounded-lg flex flex-col items-center justify-center">
            <div className="flex items-center mb-1">
              <XCircle className="h-4 w-4 mr-1 text-amber-600" />
              <h3 className="text-xs text-gray-600">Closed</h3>
            </div>
            <p className="text-lg font-bold text-amber-700">{developer.closedPRs.totalClosedNotMergedPRs}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Monthly Activity</h3>
          {commitData.length > 3 && (
            <div className="flex space-x-1">
              <button 
                onClick={handleScrollLeft}
                disabled={!canScrollLeft}
                className={`p-1 rounded ${canScrollLeft ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300'}`}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={handleScrollRight}
                disabled={!canScrollRight}
                className={`p-1 rounded ${canScrollRight ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300'}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
        <div 
          id={`chart-container-${developer.user}`}
          className="overflow-x-auto pb-2 relative" 
          onScroll={handleScroll}
          onMouseEnter={() => setShowScrollIndicators(true)}
          onMouseLeave={() => setShowScrollIndicators(false)}
        >
          <div style={{ 
            width: `${Math.max(100, commitData.length * 40)}px`, 
            minWidth: '100%', 
            height: '150px' 
          }}>
            <BarChart 
              data={commitData}
              xDataKey="week"
              barItems={[
                { dataKey: 'commits', color: color },
              ]}
              height={130}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <div>
          <span className="font-medium">Success Rate:</span> {totalPRs > 0 ? Math.round((developer.closedPRs.totalMergedPRs / totalPRs) * 100) : 0}%
        </div>
        <div>
          <span className="font-medium">Code Ratio:</span> {developer.commits.totals.d > 0 ? (developer.commits.totals.a / developer.commits.totals.d).toFixed(1) : 'N/A'}
        </div>
      </div>
    </Card>
  );
};

export default DeveloperActivity;