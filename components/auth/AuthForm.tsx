'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useAuthStore } from '@/lib/zustand/authStore'
import { useUtilityStore } from '@/lib/zustand/utilityStore'

type AuthMode = 'login' | 'register'

const authCopy = {
  login: {
    eyebrow: 'Welcome back',
    title: 'Sign in to your SpellScribe account',
    subtitle: 'Pick up your decks, brews, and collection tools where you left off.',
    submitLabel: 'Sign in',
    switchLabel: "Don't have an account yet?",
    switchHref: '/account/auth/register',
    switchText: 'Create one',
  },
  register: {
    eyebrow: 'Start brewing',
    title: 'Create your SpellScribe account',
    subtitle: 'Save lists, track your collection, and keep every brew in one place.',
    submitLabel: 'Create account',
    switchLabel: 'Already have an account?',
    switchHref: '/account/auth/login',
    switchText: 'Sign in',
  },
} as const

const AuthForm = ({ mode }: { mode: AuthMode }) => {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const setAuth = useAuthStore((state) => state.setAuth)
  const user = useAuthStore((state) => state.user)
  const isReady = useAuthStore((state) => state.isReady)
  const setAlert = useUtilityStore((state) => state.setAlert)

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isReady) {
      return
    }

    if (user) {
      router.replace('/')
    }
  }, [isReady, router, user])

  const copy = authCopy[mode]

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    if (mode === 'register') {
      if (!displayName.trim()) {
        setAlert({ label: 'Username wajib diisi.', type: 'warning' })
        return
      }

      if (password !== confirmPassword) {
        setAlert({ label: 'Konfirmasi password belum cocok.', type: 'warning' })
        return
      }
    }

    if (password.length < 6) {
      setAlert({ label: 'Password minimal 6 karakter.', type: 'warning' })
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
        }

        setAuth({
          user: data.user,
          session: data.session,
        })
        setAlert({ label: 'Berhasil login.', type: 'success' })
        router.replace('/')
        router.refresh()
        return
      }

      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/account/settings`
          : undefined

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName.trim(),
            username: displayName.trim(),
          },
          emailRedirectTo: redirectTo,
        },
      })

      if (error) {
        throw error
      }

      if (data.session) {
        setAuth({
          user: data.user,
          session: data.session,
        })
        setAlert({ label: 'Akun berhasil dibuat. Selamat datang.', type: 'success' })
        router.replace('/')
        router.refresh()
        return
      }

      setAlert({
        label: 'Akun dibuat. Cek email kamu untuk verifikasi sebelum login.',
        type: 'info',
      })
      router.replace('/account/auth/login')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses autentikasi.'

      setAlert({
        label: message,
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full lg:w-[46%] xl:w-[40%] min-h-screen px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto flex min-h-full w-full max-w-lg items-center">
        <div className="w-full rounded-lg border border-white/10 bg-[#161b24] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-8 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">
              {copy.eyebrow}
            </p>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                {copy.title}
              </h1>
              <p className="text-sm leading-6 text-slate-300">
                {copy.subtitle}
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-200">Username</span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="LilianaBrewer"
                  className="h-12 w-full rounded-md border border-white/10 bg-[#0f131a] px-4 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-violet-400"
                />
              </label>
            )}

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 w-full rounded-md border border-white/10 bg-[#0f131a] px-4 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-violet-400"
              />
            </label>

            <label className="block space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-200">Password</span>
                {mode === 'login' && (
                  <span className="text-xs text-slate-400">Minimum 6 karakter</span>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="h-12 w-full rounded-md border border-white/10 bg-[#0f131a] px-4 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-violet-400"
              />
            </label>

            {mode === 'register' && (
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-200">Confirm password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat your password"
                  className="h-12 w-full rounded-md border border-white/10 bg-[#0f131a] px-4 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-violet-400"
                />
              </label>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-violet-900/70"
            >
              {isSubmitting ? 'Please wait...' : copy.submitLabel}
            </button>
          </form>

          <div className="mt-6 border-t border-white/8 pt-5 text-sm text-slate-300">
            <span>{copy.switchLabel} </span>
            <Link href={copy.switchHref} className="font-semibold text-violet-300 hover:text-violet-200">
              {copy.switchText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthForm
