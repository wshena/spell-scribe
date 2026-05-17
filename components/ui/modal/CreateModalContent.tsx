"use client";

import { useUtilityStore } from "@/lib/zustand/utilityStore";
import { CancelIcon } from "../../icons/Icons";

const CreateModalContent = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const closeModal = useUtilityStore((state) => state.closeModal);

  return (
    <div className="w-[min(92vw,34rem)] rounded-xl border border-white/10 bg-[#161b24] p-6 text-white shadow-2xl shadow-black/40">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
            Create
          </p>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-sm leading-6 text-slate-300">{description}</p>
        </div>
        <button
          onClick={closeModal}
          className="cursor-pointer rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white"
        >
          <CancelIcon size={18} />
        </button>
      </div>

      <h1>hello</h1>

      <div className="mt-6 flex justify-end">
        <button
          onClick={closeModal}
          className="cursor-pointer rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CreateModalContent;
