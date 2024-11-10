interface Ctx {
  lvFilter: number[]
  sortBy: string
  setSortBy: (s: string) => unknown
  useReverse: boolean
  setUseReverse: (b: boolean) => unknown
  selected: Track
  setSelected: (t: Track) => unknown
}