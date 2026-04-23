'use client'

import { useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuthStore } from '@/lib/zustand/authStore'

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = useMemo(() => createClient(), [])
  const setAuth = useAuthStore((state) => state.setAuth)
  const logoutUser = useAuthStore((state) => state.logoutUser)
  const setReady = useAuthStore((state) => state.setReady)

  useEffect(() => {
    let isMounted = true

    const syncSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      if (error || !data.session) {
        logoutUser()
        return
      }

      setAuth({
        user: data.session.user,
        session: data.session,
      })
    }

    syncSession().finally(() => {
      if (isMounted) {
        setReady(true)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        logoutUser()
        return
      }

      setAuth({
        user: session.user,
        session,
      })
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [logoutUser, setAuth, setReady, supabase])

  return children
}

export default AuthProvider
