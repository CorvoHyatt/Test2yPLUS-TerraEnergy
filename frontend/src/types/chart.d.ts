declare module "react-chartjs-2" {
  import { ChartProps } from "chart.js";
  export const Line: React.FC<ChartProps>;
  export const Bar: React.FC<ChartProps>;
}

declare module "date-fns" {
  export function format(date: Date | number, format: string): string;
}
