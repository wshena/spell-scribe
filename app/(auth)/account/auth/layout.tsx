import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const AuthLayout = ({children}:{children: React.ReactNode}) => {
  return (
    <main className="flex min-h-screen w-full bg-[#0b0f14] text-white">
      <div className="relative hidden min-h-screen overflow-hidden border-r border-white/10 lg:block lg:w-[54%]">
        <Image
          src={'/image/signin-bg.jpg'}
          alt="Magic: The Gathering fantasy artwork"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,11,17,0.2),rgba(8,11,17,0.9))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.3),transparent_45%)]" />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-200">
            SpellScribe
          </Link>

          <div className="max-w-xl space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-violet-300/80">
                Magic Deckbuilding Workspace
              </p>
              <h2 className="text-4xl font-semibold leading-tight text-white xl:text-5xl">
                Build sharper lists, track every card, and keep your brews within reach.
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-7 text-slate-300 xl:text-base">
              A focused workspace for Commander brewers, grinders, and collectors who want a clean place
              to shape decks and revisit ideas fast.
            </p>
          </div>
        </div>
      </div>
      {children}
    </main>
  )
}

export default AuthLayout
