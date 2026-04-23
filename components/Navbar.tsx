
import Link from "next/link";
import { navigationLinks } from "@/lib/constants";
import ContentContainer from "./ui/containers/ContentContainer";
import { BellIcon, CardsIcon, PlusIcon, ProfileIcon, SearchIcon, StackIcon } from "./icons/Icons";
import ExploreDropdown from "./ui/ExploreDropdown";

const RightSide = () => {
  return (
    <div className="flex items-center gap-5">
      <Link href="/" className="text-xl font-bold text-primary hover:text-primary-dark transition-colors">
        SpellScribe
      </Link>
            
      <ul className="flex items-center gap-6">
        {navigationLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
              title={link.label}
            >
              {link.name}
            </Link>
          </li>
        ))}

        {/* Explore Dropdown */}
        <ExploreDropdown />
      </ul>
    </div>
  )
}

const LeftSide = () => {
  return (
    <div className="flex items-center gap-5">
      <button className="cursor-pointer bg-purple-600 flex items-center gap-2 px-3 py-1 rounded-md hover:bg-purple-700 transition-colors"> 
        <PlusIcon size={20} color={'white'} /> 
        <span className="text-md font-medium capitalize">Create</span>
      </button>
      <button className="cursor-pointer"> <BellIcon size={20} style="hover:text-purple-700 text-white" /> </button>
      <button className="cursor-pointer"> <ProfileIcon size={20} style="hover:text-purple-700 text-white" /> </button>
      <button className="cursor-pointer"> <SearchIcon size={20} style="hover:text-purple-700 text-white" /> </button>
    </div>
  )
}

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 z-50 w-full text-text-primary py-0 dark:bg-bg-secondary dark:border-border-primary">
      <ContentContainer>
        <nav className="">
          <div className="flex items-center justify-between">
            {/* Logo and navigations */}
            <RightSide />

            {/* profile, search, notifications, create */}
            <LeftSide />
          </div>
        </nav>
      </ContentContainer>
    </header>
  )
}

export default Navbar