import { PlusIcon } from "../../icons/Icons";

export default function CreateButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex cursor-pointer items-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
    >
      <PlusIcon size={14} color={'white'} />
      <span>Create</span>
    </button>
  );
}
