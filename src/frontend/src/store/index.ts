import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  activeShootPlanId: bigint | null;
  activePoseId: bigint | null;
  chatLoading: boolean;
  setSidebarOpen: (open: boolean) => void;
  setActiveShootPlanId: (id: bigint | null) => void;
  setActivePoseId: (id: bigint | null) => void;
  setChatLoading: (loading: boolean) => void;
}

export const useAppStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeShootPlanId: null,
  activePoseId: null,
  chatLoading: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveShootPlanId: (id) => set({ activeShootPlanId: id }),
  setActivePoseId: (id) => set({ activePoseId: id }),
  setChatLoading: (loading) => set({ chatLoading: loading }),
}));
