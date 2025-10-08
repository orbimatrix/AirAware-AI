import Link from "next/link";
import { Leaf, Twitter, Facebook, Instagram } from "lucide-react";

const socialLinks = [
  { icon: Twitter, href: "#", name: "Twitter" },
  { icon: Facebook, href: "#", name: "Facebook" },
  { icon: Instagram, href: "#", name: "Instagram" },
];

const footerLinks = [
    {
        title: "Product",
        links: [
            { label: "Dashboard", href: "/dashboard" },
            { label: "Features", href: "/#features" },
            { label: "Eco-Challenges", href: "/challenges" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About Us", href: "/about" },
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
        ],
    },
    {
        title: "Contact",
        links: [
            { label: "support@saafhawa.com", href: "mailto:support@saafhawa.com" },
        ]
    }
];

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Leaf className="h-6 w-6" />
              </div>
              <span className="text-xl font-headline font-bold">Saaf Hawa</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Providing real-time air quality data and insights for a healthier Pakistan.
            </p>
          </div>
          
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4 text-foreground">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Saaf Hawa. All rights reserved.
          </p>
          <div className="flex gap-4">
            {socialLinks.map((social) => (
              <Link key={social.name} href={social.href} className="text-muted-foreground hover:text-primary transition-colors">
                <social.icon className="h-5 w-5" />
                <span className="sr-only">{social.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
