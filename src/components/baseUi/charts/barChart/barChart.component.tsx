import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChartProps } from './types';

const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  xDataKey, 
  barItems,
  height = 300,
  margin = { top: 20, right: 30, left: 20, bottom: 5 }
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={margin}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xDataKey} 
          tick={{ fontSize: 10 }}
          interval={0}
          padding={{ left: 10, right: 10 }}
          angle={-30}
          textAnchor="end"
          height={40}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        {barItems.map((item, index) => (
          <Bar
            key={index}
            dataKey={item.dataKey}
            name={item.name || item.dataKey}
            fill={item.color}
            stackId={item.stackId}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;