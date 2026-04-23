"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authedLinks, navigationLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";
import ExploreDropdown from "../ui/dropdown/ExploreDropdown";

export default function NavbarRightSide({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  const navItems = isLoggedIn ? [...navigationLinks, ...authedLinks] : navigationLinks;

  return (
    <div className="flex items-center gap-5 xl:gap-8">
      <Link href="/" className="text-xl font-bold text-primary hover:text-primary-dark transition-colors">
        SpellScribe
      </Link>

      <ul className="hidden items-center gap-3 xl:flex xl:gap-4">
        {navItems.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-violet-500/12 text-violet-200"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
              title={link.label}
            >
              {link.name}
            </Link>
          </li>
        ))}

        <li>
          <ExploreDropdown />
        </li>
      </ul>
    </div>
  );
}
