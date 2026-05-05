/**
 * Format a date into relative time format
 * @example
 * formatRelativeTime('2024-01-15T10:30:00') => '5 hours ago'
 * formatRelativeTime('2024-01-15T23:45:00') => '2 minutes ago'
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (secondsAgo < 60) {
    return `${secondsAgo} ${secondsAgo === 1 ? 'second' : 'seconds'} ago`
  }

  const minutesAgo = Math.floor(secondsAgo / 60)
  if (minutesAgo < 60) {
    return `${minutesAgo} ${minutesAgo === 1 ? 'minute' : 'minutes'} ago`
  }

  const hoursAgo = Math.floor(minutesAgo / 60)
  if (hoursAgo < 24) {
    return `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`
  }

  const daysAgo = Math.floor(hoursAgo / 24)
  if (daysAgo < 7) {
    return `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`
  }

  const weeksAgo = Math.floor(daysAgo / 7)
  if (weeksAgo < 4) {
    return `${weeksAgo} ${weeksAgo === 1 ? 'week' : 'weeks'} ago`
  }

  const monthsAgo = Math.floor(daysAgo / 30)
  if (monthsAgo < 12) {
    return `${monthsAgo} ${monthsAgo === 1 ? 'month' : 'months'} ago`
  }

  const yearsAgo = Math.floor(monthsAgo / 12)
  return `${yearsAgo} ${yearsAgo === 1 ? 'year' : 'years'} ago`
}

/**
 * Extract unique mana colors from cards in a deck
 * @param cards - Array of deck cards
 * @returns Array of unique mana colors (W, U, B, R, G, C)
 */
export function extractManaColors(
  cards: Array<{
    colors?: string[] | null
    color_identity?: string[] | null
    section?: string
  }>
): string[] {
  const colorOrder = ['W', 'U', 'B', 'R', 'G', 'C']
  const colorSet = new Set<string>()

  cards.forEach((card) => {
    const cardColors = card.colors?.length ? card.colors : card.color_identity
    cardColors?.forEach((color) => {
      if (colorOrder.includes(color)) {
        colorSet.add(color)
      }
    })
  })

  return colorOrder.filter((color) => colorSet.has(color))
}

/**
 * Get color information for display
 */
export function getColorInfo(color: string): { bg: string; label: string } {
  const colorMap: Record<string, { bg: string; label: string }> = {
    W: { bg: 'bg-yellow-500', label: 'White' },
    U: { bg: 'bg-blue-500', label: 'Blue' },
    B: { bg: 'bg-gray-800', label: 'Black' },
    R: { bg: 'bg-red-500', label: 'Red' },
    G: { bg: 'bg-green-500', label: 'Green' },
    C: { bg: 'bg-gray-400', label: 'Colorless' },
  }

  return colorMap[color] || { bg: 'bg-gray-500', label: 'Unknown' }
}
