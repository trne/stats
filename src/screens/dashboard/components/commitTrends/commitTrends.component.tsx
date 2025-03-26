import React, { useState } from 'react';
import Card from '../../../../components/baseUi/card/card.component';
import LineChart from '../../../../components/baseUi/charts/lineChart/lineChart.component';
import { CommitTrendsProps } from './types';
import { getWeeklyCommitData } from '../../../../services/fileProcessing/fileProcessing.service';
import { getColorByIndex } from '../../../../lib/utils';
import { GitCommit, FileCode } from 'lucide-react';

const CommitTrends: React.FC<CommitTrendsProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'commits' | 'changes'>('commits');
  const weeklyData = getWeeklyCommitData(data);
  
  // Create line items for each developer
  const getLineItems = () => {
    if (chartType === 'commits') {
      return data.map((dev, index) => ({
        dataKey: `${dev.user}_commits`,
        name: dev.user,
        color: getColorByIndex(index)
      }));
    } else {
      // For code changes, we'll show additions without the "(additions)" text
      return data.map((dev, index) => ({
        dataKey: `${dev.user}_additions`,
        name: dev.user,
        color: getColorByIndex(index)
      }));
    }
  };
  
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Team Activity Trends
        </h2>
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              chartType === 'commits'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300 focus:z-10 focus:ring-2 focus:ring-indigo-500 focus:text-indigo-600`}
            onClick={() => setChartType('commits')}
          >
            <div className="flex items-center">
              <GitCommit className="h-4 w-4 mr-2" />
              Commits
            </div>
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              chartType === 'changes'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300 focus:z-10 focus:ring-2 focus:ring-indigo-500 focus:text-indigo-600`}
            onClick={() => setChartType('changes')}
          >
            <div className="flex items-center">
              <FileCode className="h-4 w-4 mr-2" />
              Code Changes
            </div>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto pb-4">
        <div style={{ width: `${Math.max(100, weeklyData.length * 40)}px`, minWidth: '100%', height: '400px' }}>
          <LineChart 
            data={weeklyData} 
            xDataKey="week" 
            lineItems={getLineItems()}
            height={400}
          />
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Showing {chartType === 'commits' ? 'commit count' : 'code additions'} over time for each developer. Scroll horizontally to see all months.</p>
      </div>
    </Card>
  );
};

export default CommitTrends;