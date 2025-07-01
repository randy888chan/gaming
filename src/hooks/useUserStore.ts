import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
  user: any | null;
  hasClaimedFirstPlay: boolean;
  smartBet: boolean;
  referralCode: string | null;
  referredBy: string | null;
  isPriorityFeeEnabled: boolean;
  priorityFee: number;
  set: (fn: (state: UserState) => UserState) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      hasClaimedFirstPlay: false,
      smartBet: true,
      referralCode: null,
      referredBy: null,
      isPriorityFeeEnabled: false,
      priorityFee: 10000,
      set,
    }),
    {
      name: 'user-storage', // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
