export const metadata = {
    title: "Terms of Service",
  };
  
  export default function TermsPage() {
    return (
      <div className="container mx-auto max-w-4xl py-12 sm:py-20 px-4">
        <div className="prose prose-lg dark:prose-invert mx-auto">
        <h1>Terms of Service</h1>
        <p>
          By accessing and using Saaf Hawa, you agree to comply with and be bound
          by the following terms and conditions of use.
        </p>
  
        <h2>1. Use of the Service</h2>
        <p>
          Saaf Hawa provides data and recommendations for informational purposes
          only. It is not a substitute for professional medical advice. Always
          consult a healthcare professional for any health concerns.
        </p>
  
        <h2>2. Accuracy of Information</h2>
        <p>
          While we strive to provide accurate and up-to-date information, we make
          no warranties or representations as to the accuracy, reliability, or
          completeness of the content.
        </p>
  
        <h2>3. User Conduct</h2>
        <p>
          You agree not to use the service for any unlawful purpose or in any way
          that could damage, disable, or impair the service.
        </p>
  
        <h2>4. Limitation of Liability</h2>
        <p>
          In no event shall Saaf Hawa or its developers be liable for any
          damages whatsoever arising out of the use of or inability to use the
          service.
        </p>
  
        <h2>5. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Your continued
          use of the service after any such changes constitutes your acceptance of
          the new terms.
        </p>
  
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    );
  }
  