import { MenuIcon } from "../../icons/Icons";

export default function MenuButton({ onClick }: { onClick?: () => void }) {
  return (
    <button className="rounded-full border border-white/10 bg-white/5 p-2" onClick={onClick}>
      <MenuIcon size={18} style="text-white" />
    </button>
  );
}
