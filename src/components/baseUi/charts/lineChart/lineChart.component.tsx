import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { LineChartProps } from './types';

const LineChart: React.FC<LineChartProps> = ({
  data,
  xDataKey,
  lineItems,
  height = 300,
  margin = { top: 20, right: 30, left: 20, bottom: 5 }
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={margin}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xDataKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {lineItems.map((item, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={item.dataKey}
            name={item.name || item.dataKey}
            stroke={item.color}
            activeDot={{ r: 8 }}
            strokeWidth={2}
            dot={{ strokeWidth: 2 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;