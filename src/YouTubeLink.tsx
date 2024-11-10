import React from "react";
import { Youtube } from 'react-feather'

export function YouTubeSearchLink({ search, children }: { search: string } & React.PropsWithChildren) {
  const appLink = `youtube://results?search_query=${encodeURIComponent(search)}`
  const webLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(search)}`
  return <a
  href={webLink}
  target="_blank" itemRef="noopener noreferrer">
    <Youtube />
  </a>
}