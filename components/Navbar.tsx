
import Link from "next/link";
import { navigationLinks } from "@/lib/constants";

const Navbar = () => {
  return (
    <header>
      <nav className="fixed top-0 left-0 z-50 w-full border-b border-gray-100 bg-white px-5 py-3 text-black">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-purple-600 hover:text-purple-700 transition-colors">
            MTG Deckbuilder
          </Link>
          
          <div className="flex gap-6">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                title={link.label}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar