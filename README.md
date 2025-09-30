# Saaf Hawa (Clean Air)

Saaf Hawa is a Next.js web application designed to provide real-time air quality information, personalized health recommendations, and tools to promote environmental awareness and action. It's built with a focus on users in Pakistan, with an initial focus on Lahore.

## ✨ Features

- **Dashboard**: A comprehensive overview of the current Air Quality Index (AQI) for your location, along with a detailed breakdown of major pollutants like PM2.5, PM10, O₃, and more.
- **AI-Powered Hazard Zones**: Utilizes generative AI to analyze real-time data and identify high-pollution areas in your vicinity, providing alerts and recommendations to avoid them.
- **Personalized Health Advice**: Get AI-driven health recommendations tailored to your personal health profile (age, respiratory conditions, etc.) and the current air quality.
- **Carbon Footprint Calculator**: An interactive tool to estimate your daily carbon footprint based on your lifestyle choices in transportation, energy use, diet, and consumption.
- **Eco-Challenges & Leaderboard**: Participate in environmental challenges, earn points for positive actions, and see how you rank against others in the community leaderboard.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
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
