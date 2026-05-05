import CreateNewDeckButton from '@/components/ui/button/CreateNewDeckButton'
import ContentContainer from '@/components/ui/containers/ContentContainer'
import UserDeckList from '@/components/decks/UserDeckList'

const page = () => {
  return (
    <main className="w-full bg-[#0b0f14] pt-28 pb-16">
      <ContentContainer>
        {/* header */}
        <div className="space-y-3 pb-5 border-b border-b-white/10">
          <section className="text-white">
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Your Deck</p>
            <h1 className="mt-3 text-3xl font-semibold">Deck Collections</h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              View and manage all your personal decks in one place. Create new decks, edit existing ones, and organize them into collections. Whether you're building a competitive deck or just want to keep track of your favorite cards, this is your hub for all things deck-related.
            </p>
          </section>

          <div className="flex items-center justify-content">
            <CreateNewDeckButton />
          </div>
        </div>

        {/* deck list */}
        <div className="my-10">
          <UserDeckList />
        </div>
      </ContentContainer>
    </main>
  )
}

export default page