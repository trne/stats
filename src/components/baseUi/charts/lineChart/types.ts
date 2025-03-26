export interface LineItem {
  dataKey: string;
  name?: string;
  color: string;
}

export interface LineChartProps {
  data: any[];
  xDataKey: string;
  lineItems: LineItem[];
  height?: number;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}