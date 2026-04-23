"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import useDropdownClose from "@/hooks/useDropdownClose";
import SearchButton from "../ui/button/SearchButton";
import NotificationButton from "../ui/button/NotificationButton";
import NotificationDropdown from "../ui/dropdown/NotificationDropdown";
import CreateButton from "../ui/button/CreateButton";
import ProfileButton from "../ui/button/ProfileButton";
import NavCreateButtonDropdown from "../ui/dropdown/NavCreateButtonDropdown";
import NavProfileButtonDropdown from "../ui/dropdown/NavProfileButtonDropdown";

export default function NavbarLeftSide({
  isLoggedIn,
  onLogout,
}: {
  isLoggedIn: boolean;
  onLogout: () => Promise<void>;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const createRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  useDropdownClose([createRef, profileRef, notifRef], () => {
    setIsCreateOpen(false);
    setIsProfileOpen(false);
    setIsNotifOpen(false);
  });

  return (
    <div className="hidden items-center gap-3 xl:flex">
      <SearchButton />

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
          <div className="relative" ref={createRef}>
            <CreateButton
              onClick={() => {
                setIsCreateOpen((prev) => !prev);
                setIsProfileOpen(false);
              }}
            />

            {isCreateOpen && <NavCreateButtonDropdown onClose={() => setIsCreateOpen(false)} />}
          </div>

          <div className="relative" ref={notifRef}>
            <NotificationButton onClick={() => {
              setIsNotifOpen((prev) => !prev);
              setIsCreateOpen(false);
              setIsProfileOpen(false);
            }} />
            {isNotifOpen && <NotificationDropdown onClose={() => setIsNotifOpen(false)} />}
          </div>

          <div className="relative" ref={profileRef}>
            <ProfileButton
              onClick={() => {
                setIsProfileOpen((prev) => !prev);
                setIsCreateOpen(false);
              }}
            />

            {isProfileOpen && (
              <NavProfileButtonDropdown
                onClose={() => setIsProfileOpen(false)}
                onLogout={onLogout}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
