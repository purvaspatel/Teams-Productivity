import { create } from 'zustand';

interface AvatarStore {
  avatars: { [email: string]: string };
  fetchAvatar: (email: string) => Promise<string>;
}

export const useAvatarStore = create<AvatarStore>((set, get) => ({
  avatars: {},

  fetchAvatar: async (email: string) => {
    const cachedAvatars = get().avatars;
    
    if (cachedAvatars[email]) {
      return cachedAvatars[email]; // Return from cache if exists
    }

    try {
      const res = await fetch(`/api/user/avatar?email=${email}`);
      const data = await res.json();
      const avatarUrl = res.ok ? data.avatar : "/default-avatar.png";

      set((state) => ({
        avatars: { ...state.avatars, [email]: avatarUrl }
      }));

      return avatarUrl;
    } catch (error) {
      console.error(`Error fetching avatar for ${email}:`, error);
      return "/default-avatar.png";
    }
  }
}));
