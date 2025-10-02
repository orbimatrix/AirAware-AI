
"use client"

import { useState, useEffect, useCallback } from 'react';
import { mockLeaderboard } from '@/lib/data';

const STORAGE_KEY = 'userScore';

// Find the initial score for the user named 'You' from the mock data
const initialUser = mockLeaderboard.find(u => u.name === 'You');
const defaultScore = initialUser ? initialUser.score : 0;

export function useUserScore() {
  const [score, setScore] = useState<number>(defaultScore);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      // If there's a stored score, use it; otherwise, stick with the default from mock data
      if (item) {
        setScore(parseInt(item, 10));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${STORAGE_KEY}”:`, error);
    }
    setIsLoaded(true);
  }, []);

  const saveScore = useCallback((newScore: number) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, newScore.toString());
      setScore(newScore);
    } catch (error) {
      console.warn(`Error setting localStorage key “${STORAGE_KEY}”:`, error);
    }
  }, []);

  const addScore = useCallback((points: number) => {
    if(!isLoaded) return;
    saveScore(score + points);
  }, [score, saveScore, isLoaded]);

  return { score, addScore, isLoaded };
}
