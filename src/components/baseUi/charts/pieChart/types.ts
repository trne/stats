export interface PieChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  colors: string[];
  height?: number;
  outerRadius?: number;
  innerRadius?: number;
}