import Link from "next/link";
import { footerLinks, navigationLinks, companyInfo } from "@/lib/constants";

const Footer = () => {
  return (
    <footer className="bg-bg-secondary text-text-primary">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold">{companyInfo.name}</h3>
            <p className="mt-2 text-sm text-text-tertiary">{companyInfo.description}</p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="capitalize text-sm font-semibold">{category}</h4>
              <ul className="mt-4 space-y-2">
                {links.map((link:{name:string, href:string}) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-tertiary hover:text-text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-gray-200" />

        {/* Bottom Section */}
        <div className="mt-8 flex flex-col items-center justify-between sm:flex-row">
          <p className="text-sm text-text-tertiary">
            © {companyInfo.year} {companyInfo.name}. All rights reserved.
          </p>

          {/* Quick Navigation Links */}
          <nav className="mt-4 flex gap-6 sm:mt-0">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* MTG Notice - Optional MTG Attribution */}
      <div className="border-t border-border-secondary px-4 py-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs text-text-primary">
          Magic: The Gathering is trademark of Wizards of the Coast. This website is a fan-made deck builder tool.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
