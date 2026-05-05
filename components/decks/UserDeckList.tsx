import { getUserDeckHistory, getUserDecks } from '@/lib/supabase/decks'
import type { DeckWithCards } from '@/lib/supabase/decks'
import UserDeckHistory from './UserDeckHistory'
import UserDeckListTable from './UserDeckListTable'

export default async function UserDeckList() {
  const [decks, history] = await Promise.all([
    getUserDecks() as Promise<DeckWithCards[]>,
    getUserDeckHistory(),
  ])

  return (
    <div className="space-y-10">
      <UserDeckHistory history={history} />
      <UserDeckListTable decks={decks} />
    </div>
  )
}
