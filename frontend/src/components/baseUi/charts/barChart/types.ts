export interface BarItem {
  dataKey: string;
  name?: string;
  color: string;
  stackId?: string;
}

export interface BarChartProps {
  data: any[];
  xDataKey: string;
  barItems: BarItem[];
  height?: number;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}