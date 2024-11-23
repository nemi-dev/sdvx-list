export async function load(): Promise<[[SD[], string[]], null] | [null, Error]> {
  try {
    const response = await fetch("/sdvx/list.tsv");
    const text = await response.text();
    const rows_text = text.split("\n").filter(t => !!t.trim()).map(row => row.split("\t"));
    const header = rows_text.shift();
    const tracks = rows_text.map(
      ([ino, no, title, artist, bpm, slow, nov, adv, exh, mxm, unov, uadv, uexh, umxm, from, at, etc]) => {
        const islow = parseInt(slow)
        return {
          ino,
          no : parseInt(no),
          title,
          artist,
          bpm: parseInt(bpm),
          slow: !isNaN(islow)? islow : null,
          nov: parseInt(nov),
          adv: parseInt(adv),
          exh: parseInt(exh),
          mxm: parseInt(mxm),
          unov: unov.trim() || null,
          uadv: uadv.trim() || null,
          uexh: uexh.trim() || null,
          umxm: umxm.trim() || null,
          from: from.trim() || null,
          at: at.trim() || null,
          etc: etc.trim() || null
        }
      }
    )
    return [[tracks as SD[], header], null];
  } catch (e) {
    return [null, e];
  }
}

export async function loadCaptions(): Promise<[C[], null] | [null, Error]> {
  try {
    const response = await fetch("/sdvx/captions.tsv");
    const text = await response.text();
    const rows_text = text.split("\n").map(row => row.split("\t"));
    const header = rows_text.shift();
    rows_text.forEach((a) => {
      header.forEach((key, i) => a[key] = a[i]);
    });
    return [rows_text as C[], null];
  } catch (e) {
    return [null, e];
  }
}

function same<T>(v: T[]) {
  const b = v.filter(a => a != null)
  if (b.length === 0) return undefined;
  const h = b[0]
  if (b.every(i => i === h)) return h
  return '*mixed*'
}

export function getUnlockKey({ unov , uadv , uexh , umxm } : SD) {
  if (!!umxm && unov === uadv && uadv === uexh && uexh === umxm) return umxm
  return same([unov, uadv, uexh, umxm])
}

export function isLevelOf(levels: number[], { nov, adv, exh, mxm }: SD) {
  return levels.some(level => [nov, adv, exh, mxm].includes(level))
}

export const unlockMap = {
  pcb: 'PCB',
  blas: 'BLASTER GATE',
  hexa: 'HEXA DIVER',
  tama: 'TAMA네코 어드벤처',
  kona: '코나스테 연동'
}

export function compareUpdate(a: SD, b: SD) {
  return a.no - b.no
}

export function compareLevel(a: SD, b: SD) {
  let d = 0
  if (d = a.mxm - b.mxm) return -d
  if (d = a.exh - b.exh) return -d
  if (d = a.adv - b.adv) return -d
  return - a.nov + b.nov
}

export function compareTitle(a: SD, b: SD) {
  const titleA = a.title.toLocaleLowerCase()
  const titleB = b.title.toLocaleLowerCase()
  return titleA > titleB? 1 : titleA < titleB? -1 : 0
}

export function negate<T>(comparer: (a:T, b:T) => number) {
  return (a: T, b: T) => -comparer(a, b)
}
