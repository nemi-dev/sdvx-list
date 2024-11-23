/// <reference types="vite/client" />


interface SD {
  ino?: string
  no?: number
  title: string
  artist: string
  bpm: number
  slow?: number
  nov: number
  adv: number
  exh: number
  mxm: number
  unov?: string
  uadv?: string
  uexh?: string
  umxm?: string
  from?: string
  at?: string
  etc?: string
}

interface C extends Array<string> {
  key?: string
  content?: string
  from?: string
}

