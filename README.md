# Saaf Hawa (Clean Air)

Saaf Hawa is a comprehensive Next.js web application designed to provide real-time air quality information, personalized health recommendations, and a suite of tools to promote environmental awareness and action. It's built with a focus on users in Pakistan, with an initial focus on Lahore.

## ✨ Features

- **Real-Time Dashboard**: A comprehensive overview of the current Air Quality Index (AQI) for your location, with a detailed breakdown of major pollutants and an AI-generated weekly insight.
- **AI-Powered Hazard Zones**: Utilizes generative AI to analyze real-time data and identify high-pollution areas in your vicinity, providing alerts and recommendations to avoid them.
- **Personalized Health Advice**: Get AI-driven health recommendations tailored to your personal health profile (age, respiratory conditions, etc.) and the current air quality.
- **Health Journal**: Track your daily symptoms and see how they correlate with air quality, helping you understand the personal health impact of pollution.
- **Carbon Footprint Calculator**: An interactive tool to estimate your weekly carbon footprint based on your lifestyle, track your reduction progress over time, and get AI-powered tips.
- **Eco-Map**: A real-time, crowdsourced map where users can report environmental issues like trash dumping. An AI model automatically classifies the severity of each report.
- **Eco-Challenges & Leaderboard**: Participate in environmental challenges, earn points and badges for positive actions, and see how you rank against others in the community leaderboard.
- **Educational Content**: Access AI-curated articles on key environmental topics like pollution reduction and sustainable living to stay informed and empowered.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (for real-time updates)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit)
- **Deployment**: Firebase App Hosting

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/saaf-hawa.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd saaf-hawa
    ```
3.  Install NPM packages:
    ```bash
    npm install
    ```
4.  Set up your Firebase credentials by creating a `.env` file in the root of the project. This is needed for Genkit AI flows and Firestore to work. You can get these from your Firebase project settings.

### Running the Development Server

You need to run two separate processes for the application and the Genkit AI flows.

1.  **Start the Genkit server**:
    Open a terminal and run:
    ```bash
    npm run genkit:watch
    ```
    This will start the Genkit development server, which runs your AI flows.

2.  **Start the Next.js application**:
    In a separate terminal, run:
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.
