// src/hooks/useUserStore.ts

import { StoreApi, create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface UserStore {
  agreedToTerms: boolean;
  newcomer: boolean;
  gamesPlayed: string[];
  isPriorityFeeEnabled: boolean;
  priorityFee: number;
  user: any; // Particle Network user info
  hasClaimedFirstPlay: boolean; // New field
  smartBet: boolean; // Smart Bet feature
  set: StoreApi<UserStore>["setState"];
}

/**
 * Store client settings here
 */
export const useUserStore = create(
  persist<UserStore>(
    (set) => ({
      agreedToTerms: false,
      newcomer: true,
      gamesPlayed: [],
      priorityFee: 400_201,
      isPriorityFeeEnabled: true,
      user: null,
      hasClaimedFirstPlay: false, // Initialize new field
      smartBet: true, // Smart Bet feature default
      set,
    }),
    {
      name: "user",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
