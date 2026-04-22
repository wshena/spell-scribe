import Link from "next/link";
import { footerLinks, navigationLinks, companyInfo } from "@/lib/constants";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-gray-800">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-gray-900">{companyInfo.name}</h3>
            <p className="mt-2 text-sm text-gray-600">{companyInfo.description}</p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Produk</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Resources</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Community</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Legal</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-gray-200" />

        {/* Bottom Section */}
        <div className="mt-8 flex flex-col items-center justify-between sm:flex-row">
          <p className="text-sm text-gray-600">
            © {companyInfo.year} {companyInfo.name}. All rights reserved.
          </p>

          {/* Quick Navigation Links */}
          <nav className="mt-4 flex gap-6 sm:mt-0">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* MTG Notice - Optional MTG Attribution */}
      <div className="border-t border-gray-200 bg-white px-4 py-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs text-gray-500">
          Magic: The Gathering is trademark of Wizards of the Coast. This website is a fan-made deck builder tool.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
