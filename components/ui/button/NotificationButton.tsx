import { BellIcon } from "../../icons/Icons";

export default function NotificationButton({ onClick }: { onClick?: () => void }) {
  return (
    <button className="cursor-pointer rounded-full border border-white/10 bg-white/5 p-2" onClick={onClick}>
      <BellIcon size={16} style="text-white" />
    </button>
  );
}
