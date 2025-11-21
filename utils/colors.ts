export const CHART_COLORS = [
  '#2563eb', // blue-600
  '#dc2626', // red-600
  '#16a34a', // green-600
  '#d97706', // amber-600
  '#9333ea', // purple-600
  '#0891b2', // cyan-600
  '#be185d', // pink-700
  '#4d7c0f', // lime-700
  '#4b5563', // gray-600
  '#0f172a', // slate-900
];

export const getNextColor = (usedColors: string[]): string => {
  const available = CHART_COLORS.find(c => !usedColors.includes(c));
  return available || `#${Math.floor(Math.random()*16777215).toString(16)}`;
};