import React, { useEffect, useState } from 'react';
import { BarChart } from 'lucide-react';
import DeveloperLeaderboard from './components/developerLeaderboard/developerLeaderboard.component';
import CommitTrends from './components/commitTrends/commitTrends.component';
import PullRequestStats from './components/pullRequestStats/pullRequestStats.component';
import DeveloperActivity from './components/developerActivity/developerActivity.component';
import { getLeaderboardData } from '../../services/fileProcessing/fileProcessing.service';
import { MonthInfo } from './components/developerActivity/types';
import { processData } from '../../services/fileProcessing/fileProcessing.service';

const DashboardScreen: React.FC = () => {
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [allMonths, setAllMonths] = useState<MonthInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/summary');
        const data = await response.json();
        setProcessedData(processData(data));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get sorted developers by same criteria as leaderboard
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
      dev.commits.weeks.forEach((week: { w: number }) => {
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

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-xl text-gray-600">Loading...</div>
    </div>;
  }

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
      </main>
    </div>
  );
};

export default DashboardScreen;