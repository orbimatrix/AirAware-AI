
"use client"

import { useState, useEffect, useCallback } from 'react';

export type AcceptedChallenge = {
    id: string;
    date: string; // ISO string
    note: string;
}

const STORAGE_KEY = 'userAcceptedChallenges';

export function useUserChallenges(initialChallenges: AcceptedChallenge[] = []) {
  const [acceptedChallenges, setAcceptedChallenges] = useState<AcceptedChallenge[]>(initialChallenges);
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

  const saveChallenges = useCallback((newChallenges: AcceptedChallenge[]) => {
    try {
      const jsonValue = JSON.stringify(newChallenges);
      window.localStorage.setItem(STORAGE_KEY, jsonValue);
      setAcceptedChallenges(newChallenges);
    } catch (error) {
      console.warn(`Error setting localStorage key “${STORAGE_KEY}”:`, error);
    }
  }, []);

  const acceptChallenge = useCallback((challengeId: string, note: string) => {
    if (!isLoaded || acceptedChallenges.some(c => c.id === challengeId)) return;
    
    const newChallenge: AcceptedChallenge = {
        id: challengeId,
        date: new Date().toISOString(),
        note: note,
    }

    const updatedChallenges = [...acceptedChallenges, newChallenge];
    saveChallenges(updatedChallenges);
  }, [acceptedChallenges, saveChallenges, isLoaded]);

  const isChallengeAccepted = (challengeId: string) => {
    return acceptedChallenges.some(c => c.id === challengeId);
  }

  return { acceptedChallenges, acceptChallenge, isChallengeAccepted, isLoaded };
}
