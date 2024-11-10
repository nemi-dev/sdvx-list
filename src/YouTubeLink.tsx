import React from "react";
import { Youtube } from 'react-feather'

export function YouTubeSearchLink({ search, children }: { search: string } & React.PropsWithChildren) {
  const webLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(search)}`
  return <a className="YTLink"
  href={webLink}
  target="_blank" itemRef="noopener noreferrer">
    <Youtube /> {children}
  </a>
}