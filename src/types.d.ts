interface Ctx {
  lvFilter: number[]
  sortBy: string
  setSortBy: (s: string) => unknown
  useReverse: boolean
  setUseReverse: (b: boolean) => unknown
  selected: SD
  setSelected: (t: SD) => unknown
}


interface SD {
  no?: number
  title: string
  artist: string
  bpm: number
  slow?: number
  nov: number
  adv: number
  exh: number
  mxm: number
  ino?: string
  iuse?: string
  unlock?: string
  from?: string
  at?: string
  etc?: string
}

interface C extends Array<string> {
  key?: string
  content?: string
  from?: string
}

