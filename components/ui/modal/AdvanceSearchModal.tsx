"use client";
import { fetchCardManaSymbols } from "@/lib/scryfall/cardSymbols";
import { ScryfallSet } from "@/lib/scryfall/sets";
import { getManaColorSymbolMap } from "@/lib/utils";
import {
  AdvancedSearchParams,
  buildSearchURLParams,
} from "@/lib/scryfall/advanceSearch";
import { useUtilityStore } from "@/lib/zustand/utilityStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const MANA_COLORS = ["W", "U", "B", "R", "G"] as const;
type ManaColor = (typeof MANA_COLORS)[number];

const COLOR_LABELS: Record<ManaColor, string> = {
  W: "White",
  U: "Blue",
  B: "Black",
  R: "Red",
  G: "Green",
};

const COMPARE_OPTIONS = [
  "Equals",
  "Less than",
  "Greater than",
  "Less than or equal",
  "Greater than or equal",
] as const;

const SORT_OPTIONS = [
  "Name",
  "Release Date",
  "Spoiler Date",
  "Set/Number",
  "Rarity",
  "Color",
  "Price: USD",
  "Price: TIX",
  "Price: EUR",
  "Mana Value",
  "Power",
  "Toughness",
  "Artist Name",
  "EDHREC Rank",
  "Set Review",
] as const;

const SORT_DIRECTION_OPTIONS = ["Ascending", "Descending"] as const;

const COLOR_MODE_OPTIONS = [
  "Must have all selected",
  "Must have exactly these",
  "Must have at least one",
  "Must not have any",
] as const;

export type AdvancedSearchContext =
  | { type: "deck"; deckId?: string } // redirects to /deck/[id]/search?q=...
  | { type: "sets" }; // redirects to /cards/search?q=...

interface AdvanceSearchModalProps {
  context: AdvancedSearchContext;
}

const AdvanceSearchModal = ({ context }: AdvanceSearchModalProps) => {
  const closeModal = useUtilityStore((state) => state.closeModal);
  const router = useRouter();

  const [formData, setFormData] = useState<AdvancedSearchParams>({
    name: "",
    set: "",
    oracle_text: "",
    card_type: "",
    mana_cost: "",
    mana_value: "",
    mana_value_compare: "Equals",
    power: "",
    power_compare: "Equals",
    toughness: "",
    toughness_compare: "Equals",
    loyalty: "",
    loyalty_compare: "Equals",
    order: "Name",
    order_dir: "Ascending",
    colors: [],
    color_mode: "Must have all selected",
    color_identity: [],
    color_identity_mode: "Must have all selected",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [allSets, setAllSets] = useState<string[]>([]);
  const [colorSymbolMap, setColorSymbolMap] = useState<Map<string, string>>(
    new Map(),
  );

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleColor = (
    field: "colors" | "color_identity",
    color: ManaColor,
  ) => {
    setFormData((prev: any) => {
      const current = (prev[field] ?? []) as ManaColor[];
      return {
        ...prev,
        [field]: current.includes(color)
          ? current.filter((c) => c !== color)
          : [...current, color],
      };
    });
  };

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const res = await fetch("/api/sets/all");
        const result: ScryfallSet[] = await res.json();
        setAllSets(result.map((set: ScryfallSet) => set.name));
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSymbols = async () => {
      try {
        const res = await fetchCardManaSymbols();
        const data = getManaColorSymbolMap(res.data);
        setColorSymbolMap(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchSets();
    fetchSymbols();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const urlParams = buildSearchURLParams(formData);

      const redirectURL =
        context.type === "deck"
          ? `/decks/${context.deckId}/search?${urlParams.toString()}`
          : `/cards/search?${urlParams.toString()}`;

      closeModal();
      router.push(redirectURL);
    } catch (error: unknown) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm";
  const selectClass =
    "px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm";
  const labelClass = "block text-sm font-medium text-slate-300 mb-2";

  const ColorPicker = ({
    field,
    modeField,
  }: {
    field: "colors" | "color_identity";
    modeField: "color_mode" | "color_identity_mode";
  }) => {
    const selected = (formData[field] ?? []) as ManaColor[];
    const mode = formData[modeField] as string;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1 flex-wrap">
          {MANA_COLORS.map((color) => {
            const isSelected = selected.includes(color);
            const svgUrl = colorSymbolMap.get(color);
            return (
              <button
                key={color}
                type="button"
                title={COLOR_LABELS[color]}
                onClick={() => toggleColor(field, color)}
                className={`h-8 w-8 rounded flex items-center justify-center transition border-2 ${
                  isSelected
                    ? "border-violet-400 opacity-100"
                    : "border-transparent opacity-40 hover:opacity-70"
                }`}
              >
                {svgUrl ? (
                  <Image
                    src={svgUrl}
                    alt={COLOR_LABELS[color]}
                    width={24}
                    height={24}
                    className="h-6 w-6"
                  />
                ) : (
                  <span className="text-xs text-white">{color}</span>
                )}
              </button>
            );
          })}
        </div>
        <select
          value={mode}
          onChange={(e) => handleInputChange(modeField, e.target.value)}
          className={`w-full ${selectClass}`}
        >
          {COLOR_MODE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const CompareRow = ({
    label,
    compareField,
    valueField,
  }: {
    label: string;
    compareField: string;
    valueField: string;
  }) => (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex gap-2">
        <select
          value={formData[compareField as keyof typeof formData] as string}
          onChange={(e) => handleInputChange(compareField, e.target.value)}
          className={`flex-1 ${selectClass}`}
        >
          {COMPARE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={formData[valueField as keyof typeof formData] as string}
          onChange={(e) => handleInputChange(valueField, e.target.value)}
          className={`w-28 ${inputClass}`}
          min={0}
        />
      </div>
    </div>
  );

  return (
    <div className="w-[min(100vw,32rem)] max-h-[95vh] rounded-lg border border-white/10 bg-[#10161f] p-6 text-white shadow-2xl shadow-black/50 overflow-hidden flex flex-col">
      <div className="pb-5 border-b border-b-gray-800/50 mb-5 flex items-center justify-between">
        <h1 className="text-base font-semibold">Advanced Search</h1>
        <button
          onClick={closeModal}
          className="cursor-pointer rounded-md bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Close
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto px-2
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-slate-800
        [&::-webkit-scrollbar-thumb]:bg-slate-600
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:hover:bg-slate-500"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Card Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter card name..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Sets / Expansions</label>
            <select
              value={formData.set}
              onChange={(e) => handleInputChange("set", e.target.value)}
              className={`w-full ${selectClass}`}
            >
              <option value="">Any set</option>
              {allSets.map((set) => (
                <option key={set} value={set.toLowerCase()}>
                  {set}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Oracle Text</label>
            <input
              type="text"
              value={formData.oracle_text}
              onChange={(e) => handleInputChange("oracle_text", e.target.value)}
              placeholder='Any text, e.g. "draw a card"'
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Card Type</label>
            <input
              type="text"
              value={formData.card_type}
              onChange={(e) => handleInputChange("card_type", e.target.value)}
              placeholder="e.g. Creature, Instant, Legendary..."
              className={inputClass}
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <label className={`${labelClass} shrink-0 mt-2`}>Colors</label>
            <div className="flex-1">
              <ColorPicker field="colors" modeField="color_mode" />
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <label className={`${labelClass} shrink-0 mt-2`}>
              Color Identity
            </label>
            <div className="flex-1">
              <ColorPicker
                field="color_identity"
                modeField="color_identity_mode"
              />
            </div>
          </div>

          <CompareRow
            label="Mana Value"
            compareField="mana_value_compare"
            valueField="mana_value"
          />

          <div>
            <label className={labelClass}>Mana Cost</label>
            <input
              type="text"
              value={formData.mana_cost}
              onChange={(e) => handleInputChange("mana_cost", e.target.value)}
              placeholder="e.g., {2}{G}"
              className={inputClass}
            />
          </div>

          <CompareRow
            label="Power"
            compareField="power_compare"
            valueField="power"
          />
          <CompareRow
            label="Toughness"
            compareField="toughness_compare"
            valueField="toughness"
          />
          <CompareRow
            label="Loyalty"
            compareField="loyalty_compare"
            valueField="loyalty"
          />

          <div className="flex items-center justify-between gap-4">
            <label className={`${labelClass} shrink-0 mb-0`}>Sort Order</label>
            <select
              value={formData.order}
              onChange={(e) => handleInputChange("order", e.target.value)}
              className={`flex-1 ${selectClass}`}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className={`${labelClass} shrink-0 mb-0`}>
              Sort Direction
            </label>
            <select
              value={formData.order_dir}
              onChange={(e) => handleInputChange("order_dir", e.target.value)}
              className={`flex-1 ${selectClass}`}
            >
              {SORT_DIRECTION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            {errors.submit && (
              <p className="mr-auto self-center text-sm text-red-400">
                {errors.submit}
              </p>
            )}
            <button
              type="button"
              onClick={closeModal}
              className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Redirecting...
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvanceSearchModal;
