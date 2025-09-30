// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { ReportSeverityEnum, type EcoReport } from "./types";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-5600821953-d2ec4",
  "appId": "1:952044928761:web:604cfb118a4250a6cbec28",
  "apiKey": "AIzaSyCk7sjCESUm-YilggWMB6UukpPzj5rJ7S0",
  "authDomain": "studio-5600821953-d2ec4.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "952044928761"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

// A helper type for creating new reports, omitting the 'id'
export type NewReport = Omit<EcoReport, 'id' | 'icon'> & {
    severity: z.infer<typeof ReportSeverityEnum>;
    iconName: string;
};
