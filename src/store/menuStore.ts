import { create } from "zustand";
import type { MenuItem } from "@prisma/client";

export type MenuFilter = {
  category: string | null;
  tags: string[];
  allergens: string[]; // items with these allergens are EXCLUDED
  vegOnly: boolean;
  searchQuery: string;
};

interface MenuState {
  items: MenuItem[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  filter: MenuFilter;
  filteredItems: MenuItem[];

  // Actions
  setItems: (items: MenuItem[], categories: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCategory: (category: string | null) => void;
  toggleTag: (tag: string) => void;
  toggleAllergenExclusion: (allergen: string) => void;
  setVegOnly: (vegOnly: boolean) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
  applyFilters: () => void;
}

const defaultFilter: MenuFilter = {
  category: null,
  tags: [],
  allergens: [],
  vegOnly: false,
  searchQuery: "",
};

function filterItems(items: MenuItem[], filter: MenuFilter): MenuItem[] {
  let result = items;

  // Category filter
  if (filter.category) {
    result = result.filter((item) => item.category === filter.category);
  }

  // Veg-only filter
  if (filter.vegOnly) {
    result = result.filter((item) => item.isVeg);
  }

  // Tag filter (item must have ALL selected tags)
  if (filter.tags.length > 0) {
    result = result.filter((item) =>
      filter.tags.every((tag) => item.tags.includes(tag))
    );
  }

  // Allergen exclusion (item must NOT have any excluded allergens)
  if (filter.allergens.length > 0) {
    result = result.filter(
      (item) => !item.allergens.some((a) => filter.allergens.includes(a))
    );
  }

  // Search query (case-insensitive name/description match)
  if (filter.searchQuery.trim()) {
    const q = filter.searchQuery.toLowerCase().trim();
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return result;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  categories: [],
  isLoading: false,
  error: null,
  filter: defaultFilter,
  filteredItems: [],

  setItems: (items, categories) => {
    set({ items, categories, filteredItems: items });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  setCategory: (category) => {
    const filter = { ...get().filter, category };
    set({ filter, filteredItems: filterItems(get().items, filter) });
  },

  toggleTag: (tag) => {
    const currentTags = get().filter.tags;
    const tags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    const filter = { ...get().filter, tags };
    set({ filter, filteredItems: filterItems(get().items, filter) });
  },

  toggleAllergenExclusion: (allergen) => {
    const currentAllergens = get().filter.allergens;
    const allergens = currentAllergens.includes(allergen)
      ? currentAllergens.filter((a) => a !== allergen)
      : [...currentAllergens, allergen];
    const filter = { ...get().filter, allergens };
    set({ filter, filteredItems: filterItems(get().items, filter) });
  },

  setVegOnly: (vegOnly) => {
    const filter = { ...get().filter, vegOnly };
    set({ filter, filteredItems: filterItems(get().items, filter) });
  },

  setSearchQuery: (searchQuery) => {
    const filter = { ...get().filter, searchQuery };
    set({ filter, filteredItems: filterItems(get().items, filter) });
  },

  resetFilters: () => {
    set({ filter: defaultFilter, filteredItems: get().items });
  },

  applyFilters: () => {
    set({ filteredItems: filterItems(get().items, get().filter) });
  },
}));
