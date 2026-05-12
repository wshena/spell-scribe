"use client";
import { useUtilityStore } from "@/lib/zustand/utilityStore";
import React from "react";
import AdvanceSearchModal from "../modal/AdvanceSearchModal";

type props = {
  type: "deck" | "sets";
  deckId?: string;
};

const AdvanceSearchButton = ({ type, deckId }: props) => {
  const openModal = useUtilityStore((state) => state.openModal);
  const handleClick = () => {
    openModal(<AdvanceSearchModal context={{ type: type, deckId: deckId }} />);
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      className="cursor-pointer text-sm font-medium text-violet-400 hover:text-violet-600"
    >
      Advanced search
    </button>
  );
};

export default AdvanceSearchButton;
