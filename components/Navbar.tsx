"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/lib/zustand/authStore";
import { useUtilityStore } from "@/lib/zustand/utilityStore";
import ContentContainer from "./ui/containers/ContentContainer";
import SearchButton from "./ui/button/SearchButton";
import MenuButton from "./ui/button/MenuButton";
import MobileSidebar from "./MobileSidebar";
import NavbarRightSide from "./navbar/NavbarRightSide";
import NavbarLeftSide from "./navbar/NavbarLeftSide";

const Navbar = () => {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const user = useAuthStore((state) => state.user);
  const isReady = useAuthStore((state) => state.isReady);
  const logoutUser = useAuthStore((state) => state.logoutUser);
  const toggleMenu = useUtilityStore((state) => state.toggleMenu);
  const closeMenu = useUtilityStore((state) => state.closeMenu);
  const isLoggedIn = !!user;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logoutUser();
    closeMenu();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-[#121820]/95 py-0 text-text-primary backdrop-blur">
        <ContentContainer>
          <nav>
            <div className="flex items-center justify-between gap-4">
              <NavbarRightSide isLoggedIn={isLoggedIn} />

              {isReady ? (
                <NavbarLeftSide
                  isLoggedIn={isLoggedIn}
                  onLogout={handleLogout}
                />
              ) : (
                <div className="hidden h-10 w-40 lg:block" />
              )}

              <div className="flex items-center gap-2 xl:hidden">
                <SearchButton />
                <MenuButton onClick={toggleMenu} />
              </div>
            </div>
          </nav>
        </ContentContainer>
      </header>
      <MobileSidebar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
    </>
  );
};

export default Navbar;
