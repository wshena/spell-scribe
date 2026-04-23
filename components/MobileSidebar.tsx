import { authedLinks, navigationLinks } from "@/lib/constants"
import { useAuthStore } from "@/lib/zustand/authStore"
import { useUtilityStore } from "@/lib/zustand/utilityStore"
import Link from "next/link";
import { usePathname } from "next/navigation"
import { BellIcon, BoxIcon, CancelIcon, CardsIcon, PlusIcon, ProfileIcon, SearchIcon, StackIcon } from "./icons/Icons";
import CreateModalContent from "./ui/modal/CreateModalContent";
import { cn } from "@/lib/utils";

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
  const openModal = useUtilityStore((state) => state.openModal)
  const navItems = isLoggedIn ? [...navigationLinks, ...authedLinks] : navigationLinks
  const user = useAuthStore((state) => state.user)

  if (!isMenuOpen) {
    return null
  }

  return (
    <div className="xl:hidden">
      <button
        aria-label="Close mobile navigation overlay"
        className="fixed inset-0 z-70 bg-black/60 backdrop-blur-sm"
        onClick={closeMenu}
      />

      <aside className="fixed right-0 top-0 z-80 flex h-screen w-[88vw] max-w-sm flex-col border-l border-white/10 bg-[#121820] p-5 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link href="/" className="text-lg font-semibold text-primary" onClick={closeMenu}>
            SpellScribe
          </Link>
          <button className="rounded-full border border-white/10 p-2" onClick={closeMenu}>
            <CancelIcon size={20} style="text-white" />
          </button>
        </div>

        <div className="my-3 md:my-6 flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3">
          <SearchIcon size={15} style="text-slate-300" />
          <span className="text-sm text-slate-300">Search cards, decks, commanders</span>
        </div>

        <div className="h-[70%] overflow-y-auto">
          <div className="mt-3 md:mt-6 rounded-xl border border-white/10 bg-white/5 p-2">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
              Explore
            </p>
            <div className="space-y-1">
              <Link
                href="/decks"
                onClick={closeMenu}
                className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-slate-200 hover:bg-white/6"
              >
                <span>Decks</span>
                <StackIcon size={16} style="text-violet-200" />
              </Link>
              <Link
                href="/cards"
                onClick={closeMenu}
                className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-slate-200 hover:bg-white/6"
              >
                <span>Cards</span>
                <CardsIcon size={16} style="text-violet-200" />
              </Link>
            </div>
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
        </div>

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
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">
                {user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Planeswalker"}
              </p>
              <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  openModal(
                    <CreateModalContent
                      title="New Deck"
                      description="Start a fresh brew from a commander, archetype, or blank slate."
                    />,
                    { contentClassName: "w-full" }
                  )
                  closeMenu()
                }}
                className="flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5"
              >
                <PlusIcon size={14} style="text-white" />
              </button>
              <button className="flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <BellIcon size={14} style="text-white" />
              </button>
              <Link
                href="/account/settings"
                onClick={closeMenu}
                className="flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5"
              >
                <ProfileIcon size={15} style="text-white" />
              </Link>
            </div>

            <button
              onClick={async () => {
                await onLogout()
                closeMenu()
              }}
              className="flex h-11 w-full items-center justify-center rounded-full border border-red-400/25 bg-red-500/10 text-sm font-semibold text-red-200"
            >
              Log out
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

export default MobileSidebar