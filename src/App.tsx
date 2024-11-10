import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { AppContext } from './context'
import { isLevelOf, load, loadCaptions, unlockMap, unlockString } from './data'
import { YouTubeSearchLink } from './YouTubeLink'

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

function Level({ value, unlock, className = '' }: LevelProps) {
  const classes = ['Level', className];
  if (unlock) classes.push('Unlock', 'Unlock-' + unlock.toString().toUpperCase());
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

function TrackEntry({ akey, value }: { akey: string, value: string | number | null }) {
  return !!value ? <div className={"TrackEntry " + akey}>
    <span className="Key">{akey}</span>
    <span className="Value">{value}</span>
  </div> : null;
}

function Track({ track }: { track: Track }) {
  const [open, setOpen] = useState(false);
  const { title, artist, bpm, slow, nov, adv, exh, mxm, unov, uadv, uexh, umxm, from, at, etc } = track;
  const ref = useRef<HTMLDivElement>(null)
  const onClick: React.MouseEventHandler<HTMLElement> = (e) => {
    setOpen(!open)
    if (!open) {
      new Promise(() =>
      (ref.current).scrollIntoView({
        behavior: "smooth", // or "auto" for instant scrolling
        block: "center",
        inline: "center"
      })
      )
    }
  }
  const search = title.length > 10? title : `${artist} ${title}`
  const className = open? "Song Open" : "Song"
  const unlockKey = unlockString(track)
  const unlockText = unlockKey in unlockMap? unlockMap[unlockKey] : unlockKey
  return (
    <div className={className} ref={ref}>
      <div className="Head" onClick={onClick}>
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
        <div>
          <YouTubeSearchLink search={search} />
        </div>
        <div className="Entries">
          <TrackEntry akey='Artist' value={artist} />
          <TrackEntry akey='BPM' value={bpm} />
          <TrackEntry akey='Unlock' value={unlockText} />
          <TrackEntry akey='In' value={from} />
          <TrackEntry akey='Update' value={at} />
          <TrackEntry akey='Etc' value={etc} />
        </div>
      </div>
      :
      null
      }
    </div>
  )
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
  const [tracks, setSongs] = useState<Track[]>(null)
  const [captions, setCaptions] = useState<C[]>(null)
  const [lvFilter, setLvFilter] = useState<number[]>([])
  const [titlef, setTitlef] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const filteredList = useMemo(() => {
    if (tracks === null) return []
    let tl = Array.from(tracks)
    if (lvFilter.length > 0) {
      tl = tl.filter(t => isLevelOf(lvFilter, t))
    }
    if (titlef.trim()) {
      tl = tl.filter(t => t.title.toLowerCase().includes(titlef.trim().toLowerCase()))
    }
    return tl
    // if (filter) {
    //   return tracks.filter(filter)
    // } else {
    //   return tracks
    // }
  }, [lvFilter, tracksLoaded, titlef])

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
    <AppContext.Provider value={{ lvFilter }}>
      
      <header></header>
      <div id="ScrollRoot">
        <div className="Gradient" />
        <main>{filteredList?.map(track => <Track key={track.title} track={track} />)}</main>
      </div>
      <nav>
        <div className='NavGroup'>
          <h3>Level</h3>
          <div className='LevelSelectGroup'>
            {[14, 15, 16, 17, 18, 19, 20].map(i => 
              <LevelSelect key={i} value={i} selected={lvFilter.includes(i)} onClick={() => setLvFilter(toggleValue(lvFilter, i))} />
            )}
          </div>
        </div>
        <div className="NavGroup">
          <h3>Title</h3>
          <input className='TitleFilter' type="text" onChange={onTitleChange} value={titlef} />
        </div>
        <div className='NavGroup'>
          <h3>Sort By</h3>
        </div>
      </nav>
    </AppContext.Provider>
  )
}

export default App
