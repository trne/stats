import React from 'react';
import Card from '../../../../components/baseUi/card/card.component';
import { Trophy, GitPullRequest, GitCommit, FileCode } from 'lucide-react';
import { DeveloperLeaderboardProps } from './types';
import { getLeaderboardData } from '../../../../services/fileProcessing/fileProcessing.service';
import { formatNumber } from '../../../../lib/utils';

const DeveloperLeaderboard: React.FC<DeveloperLeaderboardProps> = ({ data }) => {
  const leaderboardData = getLeaderboardData(data);
  
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
          Developer Leaderboard
        </h2>
        <div className="text-xs text-gray-500">
          Based on code changes and PR volume
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Developer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <GitCommit className="h-4 w-4 mr-1" />
                  Commits
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <GitPullRequest className="h-4 w-4 mr-1" />
                  Merged PRs
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FileCode className="h-4 w-4 mr-1" />
                  Code Changes
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboardData.map((dev, index) => (
              <tr key={dev.name} className={index === 0 ? "bg-yellow-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {index === 0 && <Trophy className="h-5 w-5 text-yellow-500 mr-1" />}
                    {index === 1 && <Trophy className="h-5 w-5 text-gray-400 mr-1" />}
                    {index === 2 && <Trophy className="h-5 w-5 text-amber-700 mr-1" />}
                    <span className={`${index < 3 ? "font-semibold" : ""}`}>{index + 1}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{dev.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatNumber(dev.commits)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatNumber(dev.mergedPRs)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <span className="text-green-600">+{formatNumber(dev.additions)}</span>
                    {" / "}
                    <span className="text-red-600">-{formatNumber(dev.deletions)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatNumber(Math.round(dev.score))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default DeveloperLeaderboard;