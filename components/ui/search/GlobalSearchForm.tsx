"use client";

import { FormEvent } from "react";
import { cn } from "@/lib/utils";
import { SearchIcon } from "@/components/icons/Icons";
import AdvanceSearchButton from "@/components/ui/button/AdvanceSearchButton";

interface SelectOption {
  value: string;
  label: string;
}

interface GlobalSearchFormProps {
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  placeholder: string;
  searchLabel: string;
  selectValue?: string;
  selectOptions?: SelectOption[];
  selectLabel?: string;
  onSelectChange?: (value: string) => void;
  showTips?: boolean;
  onTipsClick?: () => void;
  advancedSearchType?: "deck" | "sets";
  deckId?: string;
  onClearResult?: () => void;
  clearResultLabel?: string;
  isLoading?: boolean;
  loadingLabel?: string;
  className?: string;
}

const GlobalSearchForm = ({
  searchValue,
  onSearchValueChange,
  onSubmit,
  placeholder,
  searchLabel,
  selectValue,
  selectOptions,
  selectLabel = "Filter",
  onSelectChange,
  showTips = false,
  onTipsClick,
  advancedSearchType,
  deckId,
  onClearResult,
  clearResultLabel = "Clear result",
  isLoading = false,
  loadingLabel = "Refreshing results...",
  className,
}: GlobalSearchFormProps) => {
  const hasSelect = Boolean(selectOptions?.length && onSelectChange);

  return (
    <form onSubmit={onSubmit} className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full items-center gap-0 lg:w-[50%]">
          <label className="relative flex-1">
            <span className="sr-only">{searchLabel}</span>
            <input
              value={searchValue}
              onChange={(event) => onSearchValueChange(event.target.value)}
              placeholder={placeholder}
              className="w-full rounded-sm bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400"
            />

            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchValueChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-white"
                aria-label="Clear search"
              >
                x
              </button>
            )}
          </label>

          <button
            type="submit"
            className="cursor-pointer rounded-md bg-violet-500 p-3"
          >
            <SearchIcon size={15} color="white" />
          </button>
        </div>

        {hasSelect && (
          <label className="lg:w-72">
            <span className="sr-only">{selectLabel}</span>
            <select
              value={selectValue}
              onChange={(event) => onSelectChange?.(event.target.value)}
              className="w-full cursor-pointer rounded-sm bg-white/5 px-4 py-3 text-sm text-violet-400 outline-none focus:border-violet-400 md:w-[50%] lg:w-full"
            >
              {selectOptions?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {(showTips || advancedSearchType || onClearResult || isLoading) && (
        <div className="flex flex-wrap gap-3">
          {showTips && onTipsClick && (
            <button
              type="button"
              onClick={onTipsClick}
              className="cursor-pointer text-sm font-medium text-violet-400 hover:text-violet-600"
            >
              Tips
            </button>
          )}

          {advancedSearchType && (
            <AdvanceSearchButton type={advancedSearchType} deckId={deckId} />
          )}

          {onClearResult && (
            <button
              type="button"
              onClick={onClearResult}
              className="cursor-pointer text-sm font-medium text-violet-400 hover:text-violet-600"
            >
              {clearResultLabel}
            </button>
          )}

          {isLoading && (
            <p className="self-center text-sm text-slate-400">
              {loadingLabel}
            </p>
          )}
        </div>
      )}
    </form>
  );
};

export default GlobalSearchForm;
