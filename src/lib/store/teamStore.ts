import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TeamState {
  team: { id: string; name: string } | null;
  setTeam: (team: { id: string; name: string }) => void;
  fetchTeam: (userEmail: string) => Promise<void>;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set) => ({
      team: null,

      // Manually set team
      setTeam: (team) => {
        console.log("Setting team in Zustand:", team);
        set({ team });
      },

      // Fetch team using user email
      fetchTeam: async (userEmail) => {
        if (!userEmail) {
          console.warn("No user email provided to fetch team.");
          return;
        }

        try {
          console.log(`🔍 Fetching team for user: ${userEmail}`);
          const res = await fetch(`/api/team?email=${userEmail}`);
          const data = await res.json();

          if (res.ok) {
            console.log("Team fetched successfully:", data);
            set({ team: { id: data._id, name: data.name } });
          } else {
            console.error("Failed to fetch team:", data.message);
          }
        } catch (error) {
          console.error("Error fetching team:", error);
        }
      },
    }),
    {
      name: "team-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
