"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { navigationLinks } from "@/lib/constants";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/lib/zustand/authStore";
import { useUtilityStore } from "@/lib/zustand/utilityStore";
import { cn } from "@/lib/utils";
import ContentContainer from "./ui/containers/ContentContainer";
import { BellIcon, BoxIcon, CancelIcon, CardsIcon, MenuIcon, PlusIcon, ProfileIcon, SearchIcon, StackIcon } from "./icons/Icons";
import ExploreDropdown from "./ui/ExploreDropdown";

const authedLinks = [
  { name: "Your Deck", href: "/your-decks", label: "View your saved decks" },
  { name: "Collection", href: "/collection", label: "View your card collection" },
  { name: "Wishlist", href: "/wishlist", label: "View your wishlist" },
];

const RightSide = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const pathname = usePathname();
  const navItems = isLoggedIn ? [...navigationLinks, ...authedLinks] : navigationLinks;

  return (
    <div className="flex items-center gap-5 xl:gap-8">
      <Link href="/" className="text-xl font-bold text-primary hover:text-primary-dark transition-colors">
        SpellScribe
      </Link>
            
      <ul className="hidden items-center gap-5 lg:flex xl:gap-6">
        {navItems.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === link.href ? "text-primary" : "text-text-secondary hover:text-primary"
              )}
              title={link.label}
            >
              {link.name}
            </Link>
          </li>
        ))}

        <li className="hidden xl:block">
          <ExploreDropdown />
        </li>
      </ul>
    </div>
  )
}

const LeftSide = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  return (
    <div className="hidden items-center gap-3 lg:flex">
      <button className="cursor-pointer rounded-full border border-white/10 bg-white/5 p-2"> 
        <SearchIcon size={16} style="text-white" /> 
      </button>

      {!isLoggedIn ? (
        <>
          <Link
            href="/account/auth/register"
            className="rounded-md border border-white/10 px-4 py-2 text-sm font-medium text-text-primary hover:border-primary hover:text-primary"
          >
            Register
          </Link>
          <Link
            href="/account/auth/login"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Login
          </Link>
        </>
      ) : (
        <>
          <button className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark"> 
            <PlusIcon size={14} color={'white'} /> 
            <span>Create</span>
          </button>
          <button className="cursor-pointer rounded-md border border-white/10 bg-white/5 p-2.5">
            <BellIcon size={16} style="text-white" />
          </button>
          <Link href="/account/settings" className="cursor-pointer rounded-md border border-white/10 bg-white/5 p-2.5">
            <ProfileIcon size={16} style="text-white" />
          </Link>
        </>
      )}
    </div>
  )
}

const MobileSidebar = ({
  isLoggedIn,
  onLogout,
}: {
  isLoggedIn: boolean
  onLogout: () => Promise<void>
}) => {
  const pathname = usePathname()
  const isMenuOpen = useUtilityStore((state) => state.isMenuOpen)
  const closeMenu = useUtilityStore((state) => state.closeMenu)
  const navItems = isLoggedIn ? [...navigationLinks, ...authedLinks] : navigationLinks

  if (!isMenuOpen) {
    return null
  }

  return (
    <div className="lg:hidden">
      <button
        aria-label="Close mobile navigation overlay"
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
        onClick={closeMenu}
      />

      <aside className="fixed right-0 top-0 z-[80] flex h-screen w-[88vw] max-w-sm flex-col border-l border-white/10 bg-[#121820] p-5 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link href="/" className="text-lg font-semibold text-primary" onClick={closeMenu}>
            SpellScribe
          </Link>
          <button className="rounded-md border border-white/10 p-2" onClick={closeMenu}>
            <CancelIcon size={20} style="text-white" />
          </button>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
          <SearchIcon size={15} style="text-slate-300" />
          <span className="text-sm text-slate-300">Search cards, decks, commanders</span>
        </div>

        <nav className="mt-6 flex-1 space-y-1">
          {navItems.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className={cn(
                "flex items-center justify-between rounded-md px-4 py-3 text-sm font-medium",
                pathname === link.href ? "bg-violet-500/15 text-violet-200" : "text-slate-200 hover:bg-white/5"
              )}
            >
              <span>{link.name}</span>
              {link.name === "Your Deck" && <CardsIcon size={16} style="text-violet-200" />}
              {link.name === "Collection" && <BoxIcon size={16} style="text-violet-200" />}
              {link.name === "Wishlist" && <StackIcon size={16} style="text-violet-200" />}
            </Link>
          ))}
        </nav>

        {!isLoggedIn ? (
          <div className="space-y-3 border-t border-white/10 pt-5">
            <Link
              href="/account/auth/login"
              onClick={closeMenu}
              className="flex h-11 items-center justify-center rounded-md bg-primary text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Login
            </Link>
            <Link
              href="/account/auth/register"
              onClick={closeMenu}
              className="flex h-11 items-center justify-center rounded-md border border-white/10 text-sm font-medium text-slate-100"
            >
              Register
            </Link>
          </div>
        ) : (
          <div className="space-y-3 border-t border-white/10 pt-5">
            <div className="grid grid-cols-3 gap-3">
              <button className="flex h-11 items-center justify-center rounded-md border border-white/10 bg-white/5">
                <PlusIcon size={14} style="text-white" />
              </button>
              <button className="flex h-11 items-center justify-center rounded-md border border-white/10 bg-white/5">
                <BellIcon size={14} style="text-white" />
              </button>
              <Link
                href="/account/settings"
                onClick={closeMenu}
                className="flex h-11 items-center justify-center rounded-md border border-white/10 bg-white/5"
              >
                <ProfileIcon size={15} style="text-white" />
              </Link>
            </div>

            <button
              onClick={async () => {
                await onLogout()
                closeMenu()
              }}
              className="flex h-11 w-full items-center justify-center rounded-md border border-red-400/25 bg-red-500/10 text-sm font-semibold text-red-200"
            >
              Log out
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

const Navbar = () => {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const user = useAuthStore((state) => state.user)
  const isReady = useAuthStore((state) => state.isReady)
  const logoutUser = useAuthStore((state) => state.logoutUser)
  const toggleMenu = useUtilityStore((state) => state.toggleMenu)
  const closeMenu = useUtilityStore((state) => state.closeMenu)
  const isLoggedIn = !!user

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logoutUser()
    closeMenu()
    router.refresh()
  }

  return (
    <>
    <header className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-[#121820]/95 py-0 text-text-primary backdrop-blur">
      <ContentContainer>
        <nav>
          <div className="flex items-center justify-between gap-4">
            {/* Logo and navigations */}
            <RightSide isLoggedIn={isLoggedIn} />

            {/* profile, search, notifications, create */}
            {isReady ? <LeftSide isLoggedIn={isLoggedIn} /> : <div className="hidden h-10 w-40 lg:block" />}

            <div className="flex items-center gap-2 lg:hidden">
              <button className="rounded-md border border-white/10 bg-white/5 p-2.5">
                <SearchIcon size={16} style="text-white" />
              </button>
              <button className="rounded-md border border-white/10 bg-white/5 p-2.5" onClick={toggleMenu}>
                <MenuIcon size={18} style="text-white" />
              </button>
            </div>
          </div>
        </nav>
      </ContentContainer>
    </header>
    <MobileSidebar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
    </>
  )
}

export default Navbar
