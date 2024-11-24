export async function load(): Promise<[[SD[], string[]], null] | [null, Error]> {
  try {
    const response = await fetch("/sdvx/slist.tsv");
    const text = await response.text();
    const rows_text = text.split("\n").filter(t => !!t.trim()).map(row => row.split("\t"));
    const header = rows_text.shift();
    const tracks = rows_text.map(
      ([no, title, artist, bpm, slow, nov, adv, exh, mxm, unlock, ino, iuse, from, at, etc]) => {
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
          iuse: iuse,
          unlock: unlock.trim() || undefined,
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
