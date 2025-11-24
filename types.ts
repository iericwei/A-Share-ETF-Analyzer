export interface DailyPrice {
  date: string;
  close: number;
}

export interface ETFProfile {
  description?: string;
  manager?: string;
  fundSize?: string;
  launchDate?: string;
  company?: string;
  trackingIndex?: string;
}

export interface ETFData {
  id: string; // Unique ID (usually the code)
  code: string;
  name: string;
  history: DailyPrice[];
  color: string;
  sources?: { title: string; uri: string }[];
  profile?: ETFProfile;
}

export interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

export interface APIResponse {
  name: string;
  code: string;
  history: {
    date: string;
    close: number;
  }[];
  sources?: { title: string; uri: string }[];
}