import Link from "next/link";
import { Leaf, Twitter, Facebook, Instagram } from "lucide-react";

const socialLinks = [
  { icon: Twitter, href: "#" },
  { icon: Facebook, href: "#" },
  { icon: Instagram, href: "#" },
];

const footerLinks = [
    {
        title: "App",
        links: [
            { label: "Dashboard", href: "/dashboard" },
            { label: "Hazard Zones", href: "/hazard-zones" },
            { label: "Health Advice", href: "/recommendations" },
        ],
    },
    {
        title: "Community",
        links: [
            { label: "Eco-Challenges", href: "/challenges" },
            { label: "Leaderboard", href: "/challenges" },
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
];

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Leaf className="h-6 w-6" />
              </div>
              <span className="text-xl font-headline font-bold">Saaf Hawa</span>
            </Link>
            <p className="text-muted-foreground text-sm">Breathe Cleaner, Live Healthier in Pakistan.</p>
          </div>
          
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold mb-4">{section.title}</h3>
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
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Saaf Hawa. All rights reserved.
          </p>
          <div className="flex gap-4">
            {socialLinks.map((social, index) => (
              <Link key={index} href={social.href} className="text-muted-foreground hover:text-primary transition-colors">
                <social.icon className="h-5 w-5" />
                <span className="sr-only">Social Media</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
