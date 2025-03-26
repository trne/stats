// Format large numbers with k/m suffixes
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}m`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

// Format timestamp to date
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

// Format time duration from ms to readable format
export const formatDuration = (ms: number): string => {
  if (!ms) return '0h';
  
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
};

// Generate color based on index
export const getColorByIndex = (index: number): string => {
  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', 
    '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'
  ];
  return colors[index % colors.length];
};

// Calculate percentage and format
export const calculatePercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

// Rank items in an array based on a numeric property
export const rankByProperty = <T>(items: T[], property: keyof T): (T & { rank: number })[] => {
  // Sort items by the property in descending order
  const sortedItems = [...items].sort((a, b) => {
    const aValue = a[property] as unknown as number;
    const bValue = b[property] as unknown as number;
    return bValue - aValue;
  });
  
  // Assign ranks (equal values get the same rank)
  const ranks: (T & { rank: number })[] = [];
  let currentRank = 1;
  let previousValue: number | null = null;
  
  sortedItems.forEach((item, index) => {
    const value = item[property] as unknown as number;
    
    // If not the first item and value is different from previous, increase rank
    if (index > 0 && value !== previousValue) {
      currentRank = index + 1;
    }
    
    ranks.push({ ...item, rank: currentRank });
    previousValue = value;
  });
  
  return ranks;
};