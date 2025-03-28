import React, { useEffect, useState } from 'react';
import { useFileUpload } from '../../lib/hooks/useFileUpload.hooks';
import FileUpload from '../../components/baseUi/fileUpload/fileUpload.component';
import Card from '../../components/baseUi/card/card.component';
import { BarChart } from 'lucide-react';
import DeveloperLeaderboard from './components/developerLeaderboard/developerLeaderboard.component';
import CommitTrends from './components/commitTrends/commitTrends.component';
import PullRequestStats from './components/pullRequestStats/pullRequestStats.component';
import DeveloperActivity from './components/developerActivity/developerActivity.component';
import { getLeaderboardData } from '../../services/fileProcessing/fileProcessing.service';
import { MonthInfo } from './components/developerActivity/types';

const DashboardScreen: React.FC = () => {
  const { processedData, error, isLoading, handleFileUpload } = useFileUpload();
  const [allMonths, setAllMonths] = useState<MonthInfo[]>([]);

  // Get sorted developers by same criteria as leaderboard when data is available
  const sortedDevelopers = processedData ? getLeaderboardData(processedData).map(leaderData => {
    return processedData.find(dev => dev.user === leaderData.name)!;
  }) : [];
  
  // Extract all unique months from all developers' data
  useEffect(() => {
    if (!processedData || !processedData.length) return;
    
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthsMap = new Map<string, MonthInfo>();
    
    // Collect all months from all developers
    processedData.forEach(dev => {
      dev.commits.weeks.forEach(week => {
        const date = new Date(week.w * 1000);
        const month = date.getMonth();
        const year = date.getFullYear();
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
        const monthLabel = `${monthNames[month]}-${year.toString().slice(2)}`;
        
        if (!monthsMap.has(monthKey)) {
          monthsMap.set(monthKey, {
            monthKey,
            monthLabel
          });
        }
      });
    });
    
    // Convert to array and sort chronologically
    const months = Array.from(monthsMap.values())
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    
    setAllMonths(months);
  }, [processedData]);

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <header className="bg-indigo-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Developer Stats Dashboard</h1>
            </div>
            <p className="text-indigo-100">Team Performance Insights</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!processedData ? (
          <div className="max-w-2xl mx-auto">
            <Card className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Developer Stats</h2>
              <p className="mb-4 text-gray-600">
                Upload a JSON file containing developer statistics to visualize team performance. 
                The data will be displayed in charts and graphs to help identify trends and top performers.
              </p>
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              <FileUpload onFileUpload={handleFileUpload} />
              {isLoading && (
                <div className="flex justify-center items-center mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </Card>
            
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <h3 className="text-amber-800 font-medium">Sample Data Format</h3>
              <pre className="mt-2 text-xs overflow-auto p-2 bg-amber-100 rounded">
                {`[
  {
    "user": "developer1",
    "closedPRs": {
      "totalMergedPRs": 5,
      "totalClosedNotMergedPRs": 1,
      // ...
    },
    // ...
  }
]`}
              </pre>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <DeveloperLeaderboard data={processedData} />
              </div>
              <div>
                <PullRequestStats data={processedData} />
              </div>
            </div>
            
            <CommitTrends data={processedData} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {sortedDevelopers.map((developer, index) => (
                <DeveloperActivity 
                  key={developer.user} 
                  developer={developer} 
                  colorIndex={index}
                  allMonths={allMonths}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardScreen;