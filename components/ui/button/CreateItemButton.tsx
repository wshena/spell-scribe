import { PlusIcon } from "../../icons/Icons";

export default function CreateItemButton({ onClick, children }: { onClick?: () => void, children?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left hover:bg-white/6"
    >
      <span className="mt-0.5 rounded-full border border-violet-400/25 bg-violet-500/10 p-2 text-violet-200">
        <PlusIcon size={12} />
      </span>
      <span className="space-y-1">{children}</span>
    </button>
  );
}
