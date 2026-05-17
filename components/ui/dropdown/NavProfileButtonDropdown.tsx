"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BoxIcon,
  CancelIcon,
  CardsIcon,
  ProfileIcon,
  StackIcon,
} from "../../icons/Icons";
import { profileLinks } from "@/lib/constants";
import { useAuthStore } from "@/lib/zustand/authStore";
import { cn } from "@/lib/utils";

export default function NavProfileButtonDropdown({
  onClose,
  onLogout,
}: {
  onClose: () => void;
  onLogout: () => Promise<void>;
}) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="absolute right-0 top-[calc(100%+0.75rem)] w-72 rounded-xl border border-white/10 bg-[#161b24] p-2 shadow-2xl shadow-black/40">
      <div className="border-b border-white/8 px-3 py-3">
        <p className="text-sm font-semibold text-white">
          {user?.user_metadata?.display_name ||
            user?.email?.split("@")[0] ||
            "Planeswalker"}
        </p>
        <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
      </div>

      <div className="py-2">
        <div className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
          Profile & Settings
        </div>
        <Link
          href={
            user?.user_metadata?.username
              ? `/account/${user.user_metadata.username}`
              : "/account/profile"
          }
          onClick={onClose}
          className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium",
            pathname === `/account/${user?.user_metadata?.username}`
              ? "bg-violet-500/12 text-violet-200"
              : "text-slate-200 hover:bg-white/6",
          )}
        >
          <span>Profile</span>
          <ProfileIcon size={15} style="text-violet-200" />
        </Link>
        <Link
          href="/account/settings"
          onClick={onClose}
          className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium",
            pathname === "/account/settings"
              ? "bg-violet-500/12 text-violet-200"
              : "text-slate-200 hover:bg-white/6",
          )}
        >
          <span>Account Settings</span>
          <ProfileIcon size={15} style="text-violet-200" />
        </Link>
        <div className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
          Deck & Collection
        </div>
        {profileLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium",
              pathname === link.href
                ? "bg-violet-500/12 text-violet-200"
                : "text-slate-200 hover:bg-white/6",
            )}
          >
            <span>{link.name}</span>
            {link.name === "Your Deck" && (
              <CardsIcon size={15} style="text-violet-200" />
            )}
            {link.name === "Collection" && (
              <BoxIcon size={15} style="text-violet-200" />
            )}
            {link.name === "Wishlist" && (
              <StackIcon size={15} style="text-violet-200" />
            )}
            {link.name === "Account" && (
              <ProfileIcon size={15} style="text-violet-200" />
            )}
          </Link>
        ))}
      </div>

      <div className="border-t border-white/8 pt-2">
        <button
          onClick={async () => {
            onClose();
            await onLogout();
          }}
          className="cursor-pointer flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-500/10"
        >
          <span>Log out</span>
          <CancelIcon size={15} style="text-red-200" />
        </button>
      </div>
    </div>
  );
}
