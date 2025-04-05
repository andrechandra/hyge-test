import React, { createContext, useState, useContext, ReactNode } from 'react'
import { ImageSourcePropType } from 'react-native'

export interface Podcast {
  id: number
  title: string
  creator: string
  episode: string
  description: string
  duration: string
  releaseDate: string
  image: ImageSourcePropType
}

export interface DownloadedPodcast extends Podcast {
  progress: number
  downloadDate: string
}

interface PodcastContextType {
  podcasts: Podcast[]
  currentPodcast: Podcast | null
  isPlaying: boolean
  showMiniPlayer: boolean
  showFullPlayer: boolean
  favorites: Podcast[]
  downloads: DownloadedPodcast[]
  playPodcast: (podcast: Podcast) => void
  togglePlayback: () => void
  toggleFullPlayer: () => void
  toggleFavorite: (podcast: Podcast) => void
  isFavorite: (podcastId: number) => boolean
  downloadPodcast: (podcast: Podcast) => void
  isDownloaded: (podcastId: number) => boolean
  removeDownload: (podcastId: number) => void
  setShowMiniPlayer: React.Dispatch<React.SetStateAction<boolean>>
  setShowFullPlayer: React.Dispatch<React.SetStateAction<boolean>>
}

const PodcastContext = createContext<PodcastContextType | undefined>(undefined)

const initialPodcasts: Podcast[] = [
  {
    id: 1,
    title: 'Enjoy The Nature',
    creator: 'Webby',
    episode: 'Episode 01',
    description:
      'A calming episode about the natural world and how to connect with it.',
    duration: '32:45',
    releaseDate: 'Mar 15, 2023',
    image: require('../assets/images/icon.png')
  },
  {
    id: 2,
    title: 'How reboot will change...',
    creator: 'Webby',
    episode: 'Episode 01',
    description:
      'Exploring the concept of rebooting your life and starting fresh.',
    duration: '28:10',
    releaseDate: 'Mar 10, 2023',
    image: require('../assets/images/icon.png')
  },
  {
    id: 3,
    title: 'The Daily Mindfulness',
    creator: 'Sarah Johnson',
    episode: 'Episode 12',
    description: 'Practical mindfulness techniques for your everyday routine.',
    duration: '24:30',
    releaseDate: 'Mar 05, 2023',
    image: require('../assets/images/icon.png')
  },
  {
    id: 4,
    title: 'Tech Insights Weekly',
    creator: 'David Chen',
    episode: 'Episode 45',
    description: 'The latest trends and innovations in the tech world.',
    duration: '45:15',
    releaseDate: 'Feb 28, 2023',
    image: require('../assets/images/icon.png')
  },
  {
    id: 5,
    title: 'History Uncovered',
    creator: 'Emma Roberts',
    episode: 'Episode 23',
    description:
      'Fascinating stories from history that you might not know about.',
    duration: '38:20',
    releaseDate: 'Feb 20, 2023',
    image: require('../assets/images/icon.png')
  },
  {
    id: 6,
    title: 'Science Today',
    creator: 'Michael Thomas',
    episode: 'Episode 08',
    description:
      'Breaking down complex scientific concepts in an accessible way.',
    duration: '41:05',
    releaseDate: 'Feb 15, 2023',
    image: require('../assets/images/icon.png')
  },
  {
    id: 7,
    title: 'The Future of AI',
    creator: 'Tech Visionaries',
    episode: 'Episode 32',
    description:
      'Exploring the potential impact of artificial intelligence on society.',
    duration: '52:30',
    releaseDate: 'Feb 10, 2023',
    image: require('../assets/images/icon.png')
  },
  {
    id: 8,
    title: 'Financial Freedom',
    creator: 'Money Matters',
    episode: 'Episode 17',
    description:
      'Strategies for achieving financial independence and security.',
    duration: '35:45',
    releaseDate: 'Feb 05, 2023',
    image: require('../assets/images/icon.png')
  },
  {
    id: 9,
    title: 'Healthy Living',
    creator: 'Wellness Today',
    episode: 'Episode 09',
    description: 'Tips and advice for maintaining a healthy lifestyle.',
    duration: '29:15',
    releaseDate: 'Jan 30, 2023',
    image: require('../assets/images/icon.png')
  }
]

interface PodcastProviderProps {
  children: ReactNode
}

export const PodcastProvider: React.FC<PodcastProviderProps> = ({
  children
}) => {
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [showMiniPlayer, setShowMiniPlayer] = useState<boolean>(false)
  const [showFullPlayer, setShowFullPlayer] = useState<boolean>(false)

  const [favorites, setFavorites] = useState<Podcast[]>([])

  const [downloads, setDownloads] = useState<DownloadedPodcast[]>([])

  const togglePlayback = (): void => {
    setIsPlaying(!isPlaying)
  }

  const playPodcast = (podcast: Podcast): void => {
    setCurrentPodcast(podcast)
    setIsPlaying(true)
    setShowMiniPlayer(true)
  }

  const toggleFullPlayer = (): void => {
    setShowFullPlayer(!showFullPlayer)
  }

  const toggleFavorite = (podcast: Podcast): void => {
    const isFavorited = favorites.some((fav) => fav.id === podcast.id)

    if (isFavorited) {
      setFavorites(favorites.filter((fav) => fav.id !== podcast.id))
    } else {
      setFavorites([...favorites, podcast])
    }
  }

  const isFavorite = (podcastId: number): boolean => {
    return favorites.some((fav) => fav.id === podcastId)
  }

  const downloadPodcast = (podcast: Podcast): void => {
    const isAlreadyDownloaded = downloads.some((dl) => dl.id === podcast.id)

    if (!isAlreadyDownloaded) {
      const downloadWithProgress: DownloadedPodcast = {
        ...podcast,
        progress: 100,
        downloadDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }

      setDownloads([...downloads, downloadWithProgress])
    }
  }

  const isDownloaded = (podcastId: number): boolean => {
    return downloads.some((dl) => dl.id === podcastId)
  }

  const removeDownload = (podcastId: number): void => {
    setDownloads(downloads.filter((dl) => dl.id !== podcastId))
  }

  return (
    <PodcastContext.Provider
      value={{
        podcasts: initialPodcasts,
        currentPodcast,
        isPlaying,
        showMiniPlayer,
        showFullPlayer,
        favorites,
        downloads,
        playPodcast,
        togglePlayback,
        toggleFullPlayer,
        toggleFavorite,
        isFavorite,
        downloadPodcast,
        isDownloaded,
        removeDownload,
        setShowMiniPlayer,
        setShowFullPlayer
      }}
    >
      {children}
    </PodcastContext.Provider>
  )
}

export const usePodcast = (): PodcastContextType => {
  const context = useContext(PodcastContext)
  if (context === undefined) {
    throw new Error('usePodcast must be used within a PodcastProvider')
  }
  return context
}
