import { AngleRightIcon, CardsIcon, StackIcon } from "../../icons/Icons";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ExploreDropdownItem({
  href,
  name,
  description,
  onClick,
  active,
}: {
  href: string;
  name: string;
  description?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex min-h-20 w-full items-center justify-between rounded-lg px-4 py-1",
        active ? "bg-violet-500/15 text-white" : "bg-transparent text-white",
        "hover:bg-white/6 hover:text-white transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      )}
    >
      <div className="flex items-center gap-3">
        {name.toLowerCase() === "decks" ? (
          <StackIcon size={25} style="text-violet-300 group-hover:text-white" />
        ) : (
          <CardsIcon size={30} style="text-violet-300 group-hover:text-white" />
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold text-white transition-colors duration-150">
            {name}
          </p>
          {description && (
            <p className="mt-1 text-sm text-slate-400 transition-colors duration-150 group-hover:text-slate-200">
              {description}
            </p>
          )}
        </div>
      </div>
      <AngleRightIcon size={18} style="text-violet-300 group-hover:text-white transition-colors duration-150" />
    </Link>
  );
}
