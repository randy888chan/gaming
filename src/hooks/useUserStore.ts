import { create } from 'zustand';

interface UserState {
  isPriorityFeeEnabled: boolean;
  priorityFee: number;
  newcomer: boolean;
  gamesPlayed: string[];
  referralCode: string | null;
  agreedToTerms: boolean;
  set: (partial: Partial<UserState>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  isPriorityFeeEnabled: false,
  priorityFee: 1000,
  newcomer: true,
  gamesPlayed: [],
  referralCode: null,
  agreedToTerms: false,
  set: (partial) => set(partial),
}));