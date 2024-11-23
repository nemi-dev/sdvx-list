import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { AppContext } from './context'
import { compareLevel, compareTitle, isLevelOf, load, loadCaptions, negate, unlockMap, getUnlockKey, compareUpdate } from './data'
import { YouTubeSearchLink } from './YouTubeLink'

function focus(el: Element) {
  el.scrollIntoView({
    behavior: "smooth", // or "auto" for instant scrolling
    block: "center",
    inline: "center"
  })
}

function TitleGroup({ title, artist }: { title: number | string, artist: number | string }) {
  return <div className='TitleGroup'>
    <span className='Title'>{title}</span>
    <span className='Artist'>{artist}</span>
  </div>
}

function BPM({ value, slow }: { value: number | string, slow: number | string }) {
  if (slow) return <div className='BPM UseSlow'>{`${slow}-${value}`}</div>
  return <div className='BPM'>{value}</div>
}

interface LevelProps {
  value: number
  unlock: string
  className?: string
}

function Level({ value, className = '' }: LevelProps) {
  const classes = ['Level', className];
  const { lvFilter } = useContext(AppContext);
  const match = lvFilter.includes(value) || lvFilter.length == 0
  if (match) classes.push('Match')
  className = classes.join(' ')
  return <span className={className}>{value.toString().padStart(2, '0')}</span>
}


function LevelSelect({ value, selected, onClick }: { value: number, selected: boolean, onClick?: React.MouseEventHandler }) {
  const classes = ['LevelSelect']
  if (selected) classes.push('Selected')
  return <span className={classes.join(' ')} onClick={onClick}>{value}</span>
}

function SongEntry({ akey, value }: { akey: string, value: string | number | null }) {
  return !!value ? <div className={"SongEntry " + akey}>
    <span className="Key">{akey}</span>
    <span className="Value">{value}</span>
  </div> : null;
}

function UnlockIcon({ track }: { track: SD }) {
  const unlockKey = getUnlockKey(track)
  if (unlockKey == undefined) return <span className='Unlock'></span>
  if (unlockKey === 'pcb') return <span className='Unlock Unlock-PCB'></span>
  const className = 'Unlock Unlock-'+unlockKey.toUpperCase()
  return <span className={className}></span>
}

function SongC({ song }: { song: SD }) {
  // const [open, setOpen] = useState(false);
  const { selected, setSelected } = useContext(AppContext)
  const open = song === selected
  const { title, artist, bpm, slow, nov, adv, exh, mxm, unov, uadv, uexh, umxm, from, at, etc } = song;
  const ref = useRef<HTMLDivElement>(null)
  const onClick: React.MouseEventHandler<HTMLElement> = (e) => {
    // setOpen(!open)
    if (open) {
      setSelected(null)
    } else {
      setSelected(song)
      new Promise(() =>focus(ref.current))
    }
    
  }
  const titleTampered = title.replace(/-:/g, '')
  const search = titleTampered.length > 10? titleTampered : `${artist} ${titleTampered}`
  const searchSdvx = `${titleTampered} sdvx`
  const className = open? "Song Open" : "Song"
  const unlockKey = getUnlockKey(song)
  const unlockText = unlockKey in unlockMap? unlockMap[unlockKey] : unlockKey
  return (
    <div className={className} ref={ref}>
      <div className="Head" onClick={onClick}>
        <UnlockIcon track={song} />
        <TitleGroup title={title} artist={artist} />
        <BPM value={bpm} slow={slow} />
        <div className="Levels">
          <Level className='NOV' value={nov} unlock={unov} />
          <Level className='ADV' value={adv} unlock={uadv} />
          <Level className='EXH' value={exh} unlock={uexh} />
          <Level className='MXM' value={mxm} unlock={umxm} />
        </div>
      </div>
      {open? 
      <div className='Body'>
        <div className='JacketGroup'>
          <img src={`/sdvx/img/${song.ino}-inov.jpg`} />
          <img src={`/sdvx/img/${song.ino}-iadv.jpg`} />
          <img src={`/sdvx/img/${song.ino}-iexh.jpg`} />
          <img src={`/sdvx/img/${song.ino}-imxm.jpg`} />
        </div>
        <div className='LinkGroup'>
          <YouTubeSearchLink search={search}>title</YouTubeSearchLink>
          <YouTubeSearchLink search={searchSdvx}>"sdvx"</YouTubeSearchLink>
        </div>
        <div className="Entries">
          <SongEntry akey='Artist' value={artist} />
          <SongEntry akey='BPM' value={bpm} />
          <SongEntry akey='Unlock' value={unlockText} />
          <SongEntry akey='From' value={from} />
          <SongEntry akey='Update' value={at} />
          <SongEntry akey='Etc' value={etc} />
        </div>
      </div>
      :
      null
      }
    </div>
  )
}

function SortSelect({ akey }: { akey: string }) {
  const { sortBy, setSortBy, useReverse, setUseReverse } = useContext(AppContext);
  const classes = ['Sorter']
  if (sortBy === akey) classes.push('Selected')
  if (useReverse) classes.push('Reversed')
  const label = useMemo(() => akey[0].toUpperCase() + akey.slice(1).toLowerCase(), [akey])
  const onClick = useCallback(() => {
    if (sortBy === akey) setUseReverse(!useReverse)
    else {
      setSortBy(akey)
      setUseReverse(false)
    }
  }, [akey, sortBy, useReverse])
  return <span className={classes.join(' ')} onClick={onClick}>{label}</span>
}

function toggleValue(array: number[], v: number) {
  array = Array.from(array)
  const index = array.indexOf(v)
  if (index === -1) {
    array.push(v)
    return array
  } else {
    array.splice(index, 1)
    return array
  }
}

function App() {
  const [tracksLoaded, setTracksLoaded] = useState(false);
  const [tracks, setSongs] = useState<SD[]>(null)
  const [captions, setCaptions] = useState<C[]>(null)
  const [selected, setSelected] = useState<SD>(null)
  const [lvFilter, setLvFilter] = useState<number[]>([])
  const [titlef, setTitlef] = useState('')
  const [sortBy, setSortBy] = useState('update')
  const [useReverse, setUseReverse] = useState(false)
  const filteredList = useMemo(() => {
    if (tracks === null) return []
    let tl = Array.from(tracks)
    if (lvFilter.length > 0) {
      tl = tl.filter(t => isLevelOf(lvFilter, t))
    }
    if (titlef.trim()) {
      tl = tl.filter(t => t.title.toLowerCase().includes(titlef.trim().toLowerCase()))
    }
    switch (sortBy) {
      case 'update': default:
        if (useReverse) tl.reverse()
        break;
      case 'title':
        tl.sort(useReverse? negate(compareTitle) : compareTitle)
        break;
      case 'level':
        tl.sort(useReverse? negate(compareLevel) : compareLevel)
        break;
    }
    return tl
  }, [lvFilter, tracksLoaded, titlef, sortBy, useReverse])

  const onTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitlef(e.target.value)
  }, [])

  useEffect(() => { 
    Promise.all([load(), loadCaptions()])
    .then(([[list, lerror], [captions, cerror]]) => {
      if (!lerror && !cerror) {
        setSongs(list[0])
        setTracksLoaded(true)
        setCaptions(captions)
      }
    })
  }, [])

  return (
    <AppContext.Provider value={{ lvFilter, sortBy, setSortBy, useReverse, setUseReverse, selected, setSelected }}>
      
      <header></header>
      <div id="ScrollRoot">
        <main>{filteredList?.map(track => <SongC key={track.title} song={track} />)}</main>
      </div>
      <nav>
        <div className='NavGroup'>
          <h3>Level</h3>
          <div className='LevelSelectGroup'>
            {[15, 16, 17, 18, 19, 20].map(i => 
              <LevelSelect key={i} value={i} selected={lvFilter.includes(i)} onClick={() => setLvFilter(toggleValue(lvFilter, i))} />
            )}
          </div>
        </div>
        <div className="NavGroup">
          <h3>Title</h3>
          <input className='TitleFilter' type="text" onChange={onTitleChange} value={titlef} />
        </div>
        <div className='NavGroup'>
          <h3>Sort</h3>
          <div className="LevelSelectGroup">
            <SortSelect akey='update' />
            <SortSelect akey='title' />
            <SortSelect akey='level' />
          </div>
        </div>
      </nav>
    </AppContext.Provider>
  )
}

export default App
