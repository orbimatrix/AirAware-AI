"use client"

import { useState, useEffect, useCallback } from 'react';

export type HealthLogEntry = {
    date: string; // YYYY-MM-DD
    aqi: number;
    symptoms: string[];
    notes: string;
};

const STORAGE_KEY = 'healthLog';

export function useHealthLog(initialLog: HealthLogEntry[] = []) {
  const [log, setLog] = useState<HealthLogEntry[]>(initialLog);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsedLog = JSON.parse(item);
        parsedLog.sort((a: HealthLogEntry, b: HealthLogEntry) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setLog(parsedLog);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${STORAGE_KEY}”:`, error);
    }
    setIsLoaded(true);
  }, []);

  const saveLog = useCallback((newLog: HealthLogEntry[]) => {
    try {
      newLog.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const jsonValue = JSON.stringify(newLog);
      window.localStorage.setItem(STORAGE_KEY, jsonValue);
      setLog(newLog);
    } catch (error) {
      console.warn(`Error setting localStorage key “${STORAGE_KEY}”:`, error);
    }
  }, []);

  const addEntry = useCallback((newEntry: HealthLogEntry) => {
    if(!isLoaded) return;
    
    const entryExists = log.some(entry => entry.date === newEntry.date);
    
    let updatedLog;
    if (entryExists) {
        updatedLog = log.map(entry => entry.date === newEntry.date ? newEntry : entry);
    } else {
        updatedLog = [...log, newEntry];
    }
    saveLog(updatedLog);
  }, [log, saveLog, isLoaded]);

  return { log, addEntry, isLoaded };
}
