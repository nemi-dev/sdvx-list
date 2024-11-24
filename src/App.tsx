import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { AppContext } from './context'
import { compareLevel, compareTitle, isLevelOf, load, loadCaptions, negate, unlockMap, compareUpdate } from './data'
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
  className?: string
}

function Level({ value, className = '' }: LevelProps) {
  const classes = ['Level', className];
  const { lvFilter } = useContext(AppContext);
  const match = lvFilter.includes(value)
  if (match) classes.push('Match')
  className = classes.join(' ')
  return <span className={className}>{value.toString().padStart(2, '0')}</span>
}

function JacketGroup({ ino, iuse }: { ino: string, iuse: string }) {
  const iuseArray = iuse?.split(',')
  const classList = ['JacketGroup']
  if (iuseArray?.length > 1) classList.push('UseVary')
  return (
    <div className={classList.join(' ')}>
      {iuseArray?.map(i => <img key={i} src={`/sdvx/img/${ino}-${i}.jpg`} />)}
    </div>
  )
}

function LevelSelect({ value, selected, onClick }: { value: number, selected: boolean, onClick?: React.MouseEventHandler }) {
  const classes = ['LevelSelect']
  if (selected) classes.push('Selected')
  return <span className={classes.join(' ')} onClick={onClick}>{value}</span>
}

function SongProp({ akey, value }: { akey: string, value: string | number | null }) {
  return !!value ? <div className={"SongProp " + akey}>
    <span className="Key">{akey}</span>
    <span className="Value">{value}</span>
  </div> : null;
}

function UnlockIcon({ song }: { song: SD }) {
  const unlockKey = song.unlock
  if (unlockKey == undefined) return <span className='Unlock'></span>
  if (unlockKey === 'pcb') return <span className='Unlock Unlock-PCB'></span>
  const className = 'Unlock Unlock-'+unlockKey.toUpperCase()
  return <span className={className}></span>
}

function SongC({ song }: { song: SD }) {
  const { selected, setSelected } = useContext(AppContext)
  const open = song === selected
  const { title, artist, bpm, slow, nov, adv, exh, mxm, unlock, from, at, etc, ino, iuse } = song;
  const ref = useRef<HTMLDivElement>(null)
  const onClick: React.MouseEventHandler<HTMLElement> =(e) => {
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
  const unlockKey = song.unlock
  const unlockText = unlockKey in unlockMap? unlockMap[unlockKey] : unlockKey
  return (
    <div className={className} ref={ref}>
      <div className="Head" onClick={onClick}>
        <UnlockIcon song={song} />
        <TitleGroup title={title} artist={artist} />
        <BPM value={bpm} slow={slow} />
        <div className="Levels">
          <Level className='NOV' value={nov} />
          <Level className='ADV' value={adv} />
          <Level className='EXH' value={exh} />
          <Level className='MXM' value={mxm} />
        </div>
      </div>
      {open? 
      <div className='Body'>
        <JacketGroup ino={ino} iuse={iuse} />
        <div className="Details">
          <div className='LinkGroup'>
            <YouTubeSearchLink search={search}>"title"</YouTubeSearchLink>
            <YouTubeSearchLink search={searchSdvx}>"title+sdvx"</YouTubeSearchLink>
          </div>
          <SongProp akey='Artist' value={artist} />
          <SongProp akey='BPM' value={bpm} />
          <SongProp akey='Unlock' value={unlockText} />
          <SongProp akey='From' value={from} />
          <SongProp akey='Update' value={at} />
          <SongProp akey='Etc' value={etc} />
        </div>
      </div>
      :
      null
      }
    </div>
  )
}

function SortSelect({ akey, label = akey }: { akey: string, label?: string }) {
  const { sortBy, setSortBy, useReverse, setUseReverse } = useContext(AppContext);
  const classes = ['Sorter']
  if (sortBy === akey) classes.push('Selected')
  if (useReverse) classes.push('Reversed')
  // const label = useMemo(() => akey[0].toUpperCase() + label, [akey])
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
        <main className={lvFilter.length > 0 ? 'UseLvFilter' : null}>
          {filteredList?.map(track => <SongC key={track.title} song={track} />)}
        </main>
      </div>
      <nav>
        <div className='NavGroup'>
          <h3>레벨</h3>
          <div className='LevelSelectGroup'>
            {[15, 16, 17, 18, 19, 20].map(i => 
              <LevelSelect key={i} value={i} selected={lvFilter.includes(i)} onClick={() => setLvFilter(toggleValue(lvFilter, i))} />
            )}
          </div>
        </div>
        <div className='NavGroup'>
          <h3>정렬</h3>
          <div className="LevelSelectGroup">
            <SortSelect akey='update' label='업데이트' />
            <SortSelect akey='title' label='곡명' />
            <SortSelect akey='level' label='레벨' />
          </div>
        </div>
        <div className="NavGroup Search">
          <h3>곡명 검색</h3>
          <input className='TitleFilter' type="text" onChange={onTitleChange} value={titlef} />
        </div>
      </nav>
    </AppContext.Provider>
  )
}

export default App
