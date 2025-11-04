export async function fetchRateToINR(currency?: string): Promise<number> {
  if (!currency || currency === 'INR') return 1
  
  try {
    // Frankfurter API
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${encodeURIComponent(currency)}&to=INR`,
      { cache: 'no-store' }
    )
    if (!res.ok) throw new Error('rate fetch failed')
    const data = await res.json()
    const rate = data?.rates?.INR
    if (typeof rate === 'number' && isFinite(rate)) return rate
    throw new Error('bad rate')
  } catch {
    // Fallback API
    try {
      const res = await fetch(
        `https://api.exchangerate.host/latest?base=${encodeURIComponent(currency)}&symbols=INR`,
        { cache: 'no-store' }
      )
      const data = await res.json()
      const rate = data?.rates?.INR
      return typeof rate === 'number' && isFinite(rate)
        ? rate
        : Number(process.env.NEXT_PUBLIC_FX_FALLBACK || 85)
    } catch {
      return Number(process.env.NEXT_PUBLIC_FX_FALLBACK || 85)
    }
  }
}

export async function getRatesMap(currencies: string[]): Promise<Map<string, number>> {
  const uniqueCurrencies = Array.from(new Set(currencies))
  const rateEntries = await Promise.all(
    uniqueCurrencies.map(async (cur) => [cur, await fetchRateToINR(cur)] as const)
  )
  return new Map<string, number>(rateEntries)
}

export function toINR(amount: number, currency: string | undefined, rates: Map<string, number>): number {
  return amount * (rates.get(currency || 'INR') ?? 1)
}