# Saaf Hawa (Clean Air)

Saaf Hawa is a comprehensive Next.js web application designed to provide real-time air quality information, personalized health recommendations, and a suite of tools to promote environmental awareness and action. It's built with a focus on users in Pakistan, with an initial focus on Lahore.

## ✨ Features

- **Real-Time Dashboard**: A comprehensive overview of the current Air Quality Index (AQI) for your location, with a detailed breakdown of major pollutants (PM2.5, PM10, O3, etc.) and an AI-generated weekly insight comparing current vs. past data.
- **Hazard Map**: A live, interactive map displaying toggleable layers for various real-time environmental hazards, including:
    - Wildfire data from NASA FIRMS.
    - Air quality monitoring stations from OpenAQ.
    - Weather overlays (temperature, precipitation, wind, clouds) from OpenWeatherMap.
- **AI Hazard Agent**: An intelligent, conversational AI agent that can be queried about environmental hazards in any location. The agent uses a combination of web search and live data APIs to provide detailed summaries and sources.
- **Personalized Health Advice**: Get AI-driven health recommendations tailored to your personal health profile (age, respiratory conditions, etc.) and the current air quality in your area.
- **Health Journal**: Track your daily symptoms (like coughing or headaches) and see how they correlate with local air quality, helping you understand the personal health impact of pollution.
- **Carbon Footprint Calculator**: An interactive tool to estimate your annual carbon footprint based on your lifestyle (transport, energy use, diet, waste). It tracks your reduction progress over time and provides AI-powered tips.
- **Eco-Challenges & Leaderboard**: Participate in environmental challenges (e.g., "Green Commuter," "Waste Warrior"), earn points and badges for positive actions, and see how you rank against others in the community leaderboard.
- **Educational Content**: Access AI-curated articles on key environmental topics like pollution reduction, climate change, and sustainable living to stay informed and empowered.
- **User Profile Management**: A dedicated section for users to manage their profile information.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Database & Auth**: [Firebase Firestore](https://firebase.google.com/docs/firestore) & [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Mapping**: [Leaflet.js](https://leafletjs.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Generative AI**: [OpenAI-compatible API](https://www.aimlapi.com/) for the Hazard Agent.
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
4.  Set up your Firebase and other API credentials by creating a `.env` file in the root of the project. You can get these from your Firebase project settings and the respective API provider dashboards.

    ```env
    # Firebase Client SDK Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=
    NEXT_PUBLIC_FIREBASE_APP_ID=
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=

    # API Keys for Hazard Map & Agent
    NEXT_PUBLIC_NASA_API_KEY=
    NEXT_PUBLIC_OPENWEATHER_API_KEY=
    NEXT_PUBLIC_OPENAQ_API_KEY=
    AIML_API_KEY=
    TAVILY_API_KEY=
    ```

### Running the Development Server

Start the Next.js application:
```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.
