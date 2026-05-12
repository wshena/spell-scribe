"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useUtilityStore } from "@/lib/zustand/utilityStore";
import { buildCardSearchPath, CardSearchContext } from "@/lib/utils/searchUtils";
import CardsSearchTipsModal from "@/components/ui/modal/CardsSearchTipsModal";
import GlobalSearchForm from "@/components/ui/search/GlobalSearchForm";

interface CardSearchFormProps {
  context: CardSearchContext;
  initialQuery?: string;
  placeholder?: string;
  showTips?: boolean;
  showAdvancedSearch?: boolean;
}

const CardSearchForm = ({
  context,
  initialQuery = "",
  placeholder = "Search card name",
  showTips = true,
  showAdvancedSearch = true,
}: CardSearchFormProps) => {
  const router = useRouter();
  const openModal = useUtilityStore((state) => state.openModal);
  const [isRouting, startRouting] = useTransition();
  const [searchInput, setSearchInput] = useState(initialQuery);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startRouting(() => {
      router.push(buildCardSearchPath(context, searchInput));
    });
  };

  return (
    <GlobalSearchForm
      searchValue={searchInput}
      onSearchValueChange={setSearchInput}
      onSubmit={handleSubmit}
      placeholder={placeholder}
      searchLabel="Search cards"
      showTips={showTips}
      onTipsClick={() =>
        openModal(<CardsSearchTipsModal />, {
          contentClassName: "w-full max-w-2xl",
        })
      }
      advancedSearchType={showAdvancedSearch ? context.type : undefined}
      deckId={context.type === "deck" ? context.deckId : undefined}
      isLoading={isRouting}
      loadingLabel="Searching cards..."
    />
  );
};

export default CardSearchForm;
