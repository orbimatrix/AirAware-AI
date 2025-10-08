export const metadata = {
    title: "Privacy Policy",
  };
  
  export default function PrivacyPage() {
    return (
      <div className="container mx-auto max-w-4xl py-12 sm:py-20 px-4">
        <div className="prose prose-lg dark:prose-invert mx-auto">
        <h1>Privacy Policy</h1>
        <p>
          Your privacy is important to us. It is Saaf Hawa's policy to respect
          your privacy regarding any information we may collect from you across our
          website.
        </p>
  
        <h2>1. Information We Collect</h2>
        <p>
          We only collect information about you if we have a reason to do so—for
          example, to provide our services, to communicate with you, or to make
          our services better.
        </p>
        <p>
          <strong>Health Profile Data:</strong> For personalized recommendations, we
          ask for your age and respiratory conditions. This data is processed in
          real-time and is not stored on our servers.
        </p>
        <p>
          <strong>Usage Data:</strong> We may collect anonymous usage data to
          understand how our services are being used and to improve them.
        </p>
  
        <h2>2. How We Use Information</h2>
        <p>
          We use the information we collect in various ways, including to:
        </p>
        <ul>
          <li>Provide, operate, and maintain our services</li>
          <li>Improve, personalize, and expand our services</li>
          <li>Understand and analyze how you use our services</li>
          <li>Communicate with you for customer service or updates</li>
        </ul>
  
        <h2>3. Data Security</h2>
        <p>
          We are committed to protecting your data. While no online service is
          100% secure, we work very hard to protect information about you against
          unauthorized access, use, alteration, or destruction.
        </p>
  
        <h2>4. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you
          of any changes by posting the new privacy policy on this page.
        </p>
  
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    );
  }
  