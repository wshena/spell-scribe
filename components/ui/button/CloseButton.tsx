import { CancelIcon } from "../../icons/Icons";

export default function CloseButton({ onClick }: { onClick?: () => void }) {
  return (
    <button className="rounded-full border border-white/10 p-2" onClick={onClick}>
      <CancelIcon size={20} style="text-white" />
    </button>
  );
}
