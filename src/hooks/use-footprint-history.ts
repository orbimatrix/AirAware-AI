"use client"

import { useState, useEffect, useCallback } from 'react';

export type FootprintHistoryEntry = {
    date: string; // ISO string
    footprint: number;
};

const STORAGE_KEY = 'footprintHistory';

export function useFootprintHistory(initialHistory: FootprintHistoryEntry[] = []) {
  const [history, setHistory] = useState<FootprintHistoryEntry[]>(initialHistory);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsedHistory = JSON.parse(item);
        // Sort by date just in case
        parsedHistory.sort((a: FootprintHistoryEntry, b: FootprintHistoryEntry) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${STORAGE_KEY}”:`, error);
    }
    setIsLoaded(true);
  }, []);

  const saveHistory = useCallback((newHistory: FootprintHistoryEntry[]) => {
    try {
      // Keep only the last 10 entries
      const limitedHistory = newHistory.slice(-10);
      limitedHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const jsonValue = JSON.stringify(limitedHistory);
      window.localStorage.setItem(STORAGE_KEY, jsonValue);
      setHistory(limitedHistory);
    } catch (error) {
      console.warn(`Error setting localStorage key “${STORAGE_KEY}”:`, error);
    }
  }, []);

  const addEntry = useCallback((newEntry: FootprintHistoryEntry) => {
    if(!isLoaded) return;
    
    // Check if an entry for the same day already exists
    const entryExists = history.some(entry => entry.date === newEntry.date);
    
    let updatedHistory;
    if (entryExists) {
        // Replace the existing entry for today
        updatedHistory = history.map(entry => entry.date === newEntry.date ? newEntry : entry);
    } else {
        // Add the new entry
        updatedHistory = [...history, newEntry];
    }
    saveHistory(updatedHistory);
  }, [history, saveHistory, isLoaded]);

  return { history, addEntry, isLoaded };
}
