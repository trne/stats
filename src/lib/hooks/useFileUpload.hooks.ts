import { useState } from 'react';
import { DeveloperStats, ProcessedDeveloperStats } from '../../models/developerStats';
import { readJsonFile, processData } from '../../services/fileProcessing/fileProcessing.service';

export const useFileUpload = () => {
  const [rawData, setRawData] = useState<DeveloperStats[] | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedDeveloperStats[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await readJsonFile(file);
      
      // Validate that the data has the expected structure
      if (!Array.isArray(data)) {
        throw new Error('Uploaded file must contain an array of developer statistics');
      }
      
      // Pre-process the data to fill in missing properties
      const processedRawData = data.map((dev, index) => {
        if (!dev || typeof dev !== 'object') {
          console.warn(`Invalid developer data at index ${index}, using default values`);
          return {
            user: `Developer ${index}`,
            closedPRs: { totalMergedPRs: 0, totalClosedNotMergedPRs: 0, averageTimeToMerge: 0, averageTimeToCloseNotMerged: 0 },
            openPRs: { totalOpenPRs: 0, averageOpenPRDuration: 0 },
            commits: { weeks: [], months: [], totals: { a: 0, d: 0, c: 0 } }
          };
        }
        
        // Ensure user property exists
        if (!dev.user || typeof dev.user !== 'string') {
          console.warn(`Missing or invalid 'user' property for developer at index ${index}, using default name`);
          dev.user = `Developer ${index}`;
        }
        
        // Ensure closedPRs property exists
        if (!dev.closedPRs || typeof dev.closedPRs !== 'object') {
          console.warn(`Missing or invalid 'closedPRs' property for developer ${dev.user}, using defaults`);
          dev.closedPRs = { totalMergedPRs: 0, totalClosedNotMergedPRs: 0, averageTimeToMerge: 0, averageTimeToCloseNotMerged: 0 };
        }
        
        // Ensure openPRs property exists
        if (!dev.openPRs || typeof dev.openPRs !== 'object') {
          console.warn(`Missing or invalid 'openPRs' property for developer ${dev.user}, using defaults`);
          dev.openPRs = { totalOpenPRs: 0, averageOpenPRDuration: 0 };
        }
        
        // Ensure commits property exists
        if (!dev.commits || typeof dev.commits !== 'object') {
          console.warn(`Missing or invalid 'commits' property for developer ${dev.user}, using defaults`);
          dev.commits = { weeks: [], months: [], totals: { a: 0, d: 0, c: 0 } };
        }
        
        return dev as DeveloperStats;
      });
      
      setRawData(processedRawData);
      
      const processed = processData(processedRawData);
      setProcessedData(processed);
    } catch (err) {
      console.error('Error processing file:', err);
      setError(`Failed to process the file: ${err instanceof Error ? err.message : 'Invalid format'}. Please ensure it is a valid JSON file with the correct structure.`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rawData,
    processedData,
    error,
    isLoading,
    handleFileUpload
  };
};