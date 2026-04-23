import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'

interface AuthState {
  user: User | null
  session: Session | null
  isReady: boolean

  // Actions
  getUser: (user: User | null) => void
  getSession: (session: Session | null) => void
  setAuth: (payload: { user: User | null; session: Session | null }) => void
  setReady: (isReady: boolean) => void
  logoutUser: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  session: null,
  isReady: false,

  // Actions
  getUser:    (user)    => set({ user }),
  getSession: (session) => set({ session }),
  setAuth:    ({ user, session }) => set({ user, session, isReady: true }),
  setReady:   (isReady) => set({ isReady }),
  logoutUser: ()        => set({ user: null, session: null, isReady: true }),
}))
