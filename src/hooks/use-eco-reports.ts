"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EcoReport } from '@/lib/types';

export function useEcoReports() {
    const [reports, setReports] = useState<EcoReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const reportsCollection = collection(db, 'reports');
        const q = query(reportsCollection, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const reportsData: EcoReport[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                reportsData.push({
                    id: doc.id,
                    type: data.type,
                    description: data.description,
                    position: data.position,
                    iconName: data.iconName,
                    severity: data.severity,
                    // Firestore timestamps need to be converted
                    createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
                } as EcoReport);
            });
            setReports(reportsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching reports: ", error);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return { reports, loading };
}
