import { SearchIcon } from "../../icons/Icons";

export default function SearchButton({ onClick }: { onClick?: () => void }) {
  return (
    <button className="cursor-pointer rounded-full border border-white/10 bg-white/5 p-2" onClick={onClick}>
      <SearchIcon size={16} style="text-white" />
    </button>
  );
}
