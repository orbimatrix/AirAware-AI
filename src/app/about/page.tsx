export const metadata = {
  title: "About Us",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 sm:py-20 px-4">
      <div className="prose prose-lg dark:prose-invert mx-auto">
      <h1>About Saaf Hawa</h1>
      <p>
        Welcome to Saaf Hawa, your personal guide to understanding and improving
        the air quality around you. Our mission is to empower individuals and
        communities in Pakistan with the data and tools they need to make
        informed decisions for a healthier life.
      </p>
      <h2>Our Story</h2>
      <p>
        Saaf Hawa (which means "Clean Air" in Urdu) was born from a desire to
        address the growing concern of air pollution in our cities. We believe
        that access to clear, real-time environmental information is a right,
        not a privilege. We are a team of developers, designers, and environmental
        enthusiasts dedicated to making a positive impact.
      </p>
      <h2>What We Do</h2>
      <p>
        We provide a suite of tools to help you navigate your environment:
      </p>
      <ul>
        <li>
          <strong>Real-Time AQI Data:</strong> We aggregate data to give you
          up-to-the-minute information on air quality.
        </li>
        <li>
          <strong>AI-Powered Insights:</strong> Our smart systems analyze data to
          provide personalized health recommendations and identify high-pollution zones.
        </li>
        <li>
          <strong>Community Engagement:</strong> Through eco-challenges and a
          shared platform, we aim to build a community committed to a cleaner
          future.
        </li>
      </ul>
      <h2>Our Vision</h2>
      <p>
        We envision a future where every citizen is aware of their environmental
        impact and is equipped to take action. By making complex data simple and
        actionable, we hope to contribute to a cleaner, healthier Pakistan for
        generations to come.
      </p>
      </div>
    </div>
  );
}
