"use client"

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'userAcceptedChallenges';

export function useUserChallenges(initialChallenges: string[] = []) {
  const [acceptedChallenges, setAcceptedChallenges] = useState<string[]>(initialChallenges);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        setAcceptedChallenges(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${STORAGE_KEY}”:`, error);
    }
    setIsLoaded(true);
  }, []);

  const saveChallenges = useCallback((newChallenges: string[]) => {
    try {
      const jsonValue = JSON.stringify(newChallenges);
      window.localStorage.setItem(STORAGE_KEY, jsonValue);
      setAcceptedChallenges(newChallenges);
    } catch (error) {
      console.warn(`Error setting localStorage key “${STORAGE_KEY}”:`, error);
    }
  }, []);

  const acceptChallenge = useCallback((challengeId: string) => {
    if (!isLoaded || acceptedChallenges.includes(challengeId)) return;
    
    const updatedChallenges = [...acceptedChallenges, challengeId];
    saveChallenges(updatedChallenges);
  }, [acceptedChallenges, saveChallenges, isLoaded]);

  const isChallengeAccepted = (challengeId: string) => {
    return acceptedChallenges.includes(challengeId);
  }

  return { acceptedChallenges, acceptChallenge, isChallengeAccepted, isLoaded };
}
