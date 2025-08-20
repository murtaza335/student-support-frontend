// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// interface UserStatus {
//   exist: boolean;
//   approved: boolean;
//   hydrated: boolean;
//   setExist: (exist: boolean) => void;
//   setApproved: (approved: boolean) => void;
//   setHydrated: () => void;
//   resetStatus: () => void;
//   clearOnLogout: () => void;
// }

// export const useUserStatus = create<UserStatus>()(
//   persist(
//     (set) => ({
//       exist: false,
//       approved: false,
//       hydrated: false,
//       setExist: (value) => set({ exist: value }),
//       setApproved: (value) => set({ approved: value }),
//       setHydrated: () => set({ hydrated: true }),
//       resetStatus: () => set({ exist: false, approved: false }), // Don't reset hydrated
//       clearOnLogout: () => set({ exist: false, approved: false }), // Clear user data on logout
//     }),
//     {
//       name: 'user-status',
//       // ✅ Only trigger the `setHydrated` method here
//       onRehydrateStorage: () => (state) => {
//         state?.setHydrated?.();
//       },
//     }
//   )
// );
