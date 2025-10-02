import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";
import type { NewReport } from "./types";
import { firebaseConfig } from "@/firebase/config";

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const reportsCollection = collection(db, 'reports');

export { db, reportsCollection };

// A helper type for creating new reports, omitting the 'id'
export type { NewReport };
