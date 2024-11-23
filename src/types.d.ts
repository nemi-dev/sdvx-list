interface Ctx {
  lvFilter: number[]
  sortBy: string
  setSortBy: (s: string) => unknown
  useReverse: boolean
  setUseReverse: (b: boolean) => unknown
  selected: SD
  setSelected: (t: SD) => unknown
}