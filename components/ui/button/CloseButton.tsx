import { CancelIcon } from "../../icons/Icons";

export default function CloseButton({ onClick }: { onClick?: () => void }) {
  return (
    <button className="cursor-pointer" onClick={onClick}>
      <CancelIcon size={20} style="text-white" />
    </button>
  );
}
