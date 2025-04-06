import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useRef
} from 'react'
import { ImageSourcePropType, AppState, AppStateStatus } from 'react-native'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface Podcast {
  id: number
  title: string
  creator: string
  episode: string
  description: string
  duration: string
  releaseDate: string
  image: ImageSourcePropType
  audioUrl?: string | number
}

export interface DownloadedPodcast extends Podcast {
  progress: number
  downloadDate: string
  localAudioPath?: string
}

interface PodcastContextType {
  podcasts: Podcast[]
  currentPodcast: Podcast | null
  isPlaying: boolean
  showMiniPlayer: boolean
  showFullPlayer: boolean
  favorites: Podcast[]
  downloads: DownloadedPodcast[]
  // Audio state
  soundObject: Audio.Sound | null
  playbackPosition: number
  playbackDuration: number
  isBuffering: boolean
  playbackRate: number
  // Methods
  playPodcast: (podcast: Podcast) => Promise<void>
  togglePlayback: () => Promise<void>
  toggleFullPlayer: () => void
  toggleFavorite: (podcast: Podcast) => void
  isFavorite: (podcastId: number) => boolean
  downloadPodcast: (podcast: Podcast) => Promise<void>
  isDownloaded: (podcastId: number) => boolean
  removeDownload: (podcastId: number) => void
  setShowMiniPlayer: React.Dispatch<React.SetStateAction<boolean>>
  setShowFullPlayer: React.Dispatch<React.SetStateAction<boolean>>
  // Audio control methods
  seekTo: (position: number) => Promise<void>
  skipForward: (seconds?: number) => Promise<void>
  skipBackward: (seconds?: number) => Promise<void>
  changePlaybackRate: (rate: number) => Promise<void>
  formatTime: (milliseconds: number) => string
  loadPreviousSession: () => Promise<void>
}

const PodcastContext = createContext<PodcastContextType | undefined>(undefined)

// Sample data with working audio URLs
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
    image: require('../assets/images/icon.png'),
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
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
    image: require('../assets/images/icon.png'),
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 3,
    title: 'The Daily Mindfulness',
    creator: 'Sarah Johnson',
    episode: 'Episode 12',
    description: 'Practical mindfulness techniques for your everyday routine.',
    duration: '24:30',
    releaseDate: 'Mar 05, 2023',
    image: require('../assets/images/icon.png'),
    audioUrl: require('../assets/audio/sample_audio.mp3') // Local asset for testing
  },
  {
    id: 4,
    title: 'Tech Insights Weekly',
    creator: 'David Chen',
    episode: 'Episode 45',
    description: 'The latest trends and innovations in the tech world.',
    duration: '45:15',
    releaseDate: 'Feb 28, 2023',
    image: require('../assets/images/icon.png'),
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
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
    image: require('../assets/images/icon.png'),
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
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
    image: require('../assets/images/icon.png'),
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
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
    image: require('../assets/images/icon.png'),
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
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
    image: require('../assets/images/icon.png'),
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
  },
  {
    id: 9,
    title: 'Healthy Living',
    creator: 'Wellness Today',
    episode: 'Episode 09',
    description: 'Tips and advice for maintaining a healthy lifestyle.',
    duration: '29:15',
    releaseDate: 'Jan 30, 2023',
    image: require('../assets/images/icon.png'),
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  }
]

// Storage keys
const STORAGE_KEYS = {
  CURRENT_PODCAST: '@podcast_app/current_podcast',
  PLAYBACK_POSITION: '@podcast_app/playback_position',
  FAVORITES: '@podcast_app/favorites',
  DOWNLOADS: '@podcast_app/downloads'
}

interface PodcastProviderProps {
  children: ReactNode
}

export const PodcastProvider: React.FC<PodcastProviderProps> = ({
  children
}) => {
  // Original state
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [showMiniPlayer, setShowMiniPlayer] = useState<boolean>(false)
  const [showFullPlayer, setShowFullPlayer] = useState<boolean>(false)
  const [favorites, setFavorites] = useState<Podcast[]>([])
  const [downloads, setDownloads] = useState<DownloadedPodcast[]>([])

  // Audio state
  const [soundObject, setSoundObject] = useState<Audio.Sound | null>(null)
  const [playbackPosition, setPlaybackPosition] = useState<number>(0)
  const [playbackDuration, setPlaybackDuration] = useState<number>(0)
  const [isBuffering, setIsBuffering] = useState<boolean>(false)
  const [playbackRate, setPlaybackRate] = useState<number>(1.0)

  // Refs
  const playbackUpdateInterval = useRef<NodeJS.Timeout | null>(null)
  const appStateRef = useRef(AppState.currentState)

  // Initialize Audio
  useEffect(() => {
    const setupAudio = async () => {
      try {
        // Fix for interruptionModeIOS error - use numeric values instead of constants
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          // Using numeric values instead of potentially undefined constants
          interruptionModeIOS: 1, // This is equivalent to INTERRUPTION_MODE_IOS_DO_NOT_MIX
          playsInSilentModeIOS: true,
          interruptionModeAndroid: 1, // This is equivalent to INTERRUPTION_MODE_ANDROID_DO_NOT_MIX
          shouldDuckAndroid: true,
          staysActiveInBackground: true,
          playThroughEarpieceAndroid: false
        })

        // Load previous session
        await loadPreviousSession()
      } catch (error) {
        console.error('Error setting up audio', error)
      }
    }

    setupAudio()

    // Handle app state changes
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    )

    return () => {
      // Cleanup
      if (playbackUpdateInterval.current) {
        clearInterval(playbackUpdateInterval.current)
      }

      unloadSound()
      subscription.remove()
    }
  }, [])

  // App state change handler
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appStateRef.current === 'active' &&
      nextAppState.match(/inactive|background/)
    ) {
      // App is going to background
      await saveCurrentSession()
    }

    appStateRef.current = nextAppState
  }

  // Load previous session
  const loadPreviousSession = async () => {
    try {
      // Load favorites
      const storedFavorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES)
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites))
      }

      // Load downloads
      const storedDownloads = await AsyncStorage.getItem(STORAGE_KEYS.DOWNLOADS)
      if (storedDownloads) {
        setDownloads(JSON.parse(storedDownloads))
      }

      // Load current podcast and position
      const storedPodcast = await AsyncStorage.getItem(
        STORAGE_KEYS.CURRENT_PODCAST
      )
      const storedPosition = await AsyncStorage.getItem(
        STORAGE_KEYS.PLAYBACK_POSITION
      )

      if (storedPodcast) {
        const podcast = JSON.parse(storedPodcast)
        setCurrentPodcast(podcast)
        setShowMiniPlayer(true)

        if (storedPosition) {
          setPlaybackPosition(parseInt(storedPosition, 10))
        }
      }
    } catch (error) {
      console.error('Error loading previous session', error)
    }
  }

  // Save current session
  const saveCurrentSession = async () => {
    try {
      if (currentPodcast) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.CURRENT_PODCAST,
          JSON.stringify(currentPodcast)
        )
      }

      if (playbackPosition > 0) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.PLAYBACK_POSITION,
          playbackPosition.toString()
        )
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.FAVORITES,
        JSON.stringify(favorites)
      )
      await AsyncStorage.setItem(
        STORAGE_KEYS.DOWNLOADS,
        JSON.stringify(downloads)
      )
    } catch (error) {
      console.error('Error saving session', error)
    }
  }

  // Unload sound
  const unloadSound = async () => {
    if (soundObject) {
      try {
        await soundObject.unloadAsync()
      } catch (error) {
        console.error('Error unloading sound', error)
      }

      setSoundObject(null)
    }
  }

  // Start playback updates
  const startPlaybackUpdates = () => {
    if (playbackUpdateInterval.current) {
      clearInterval(playbackUpdateInterval.current)
    }

    playbackUpdateInterval.current = setInterval(async () => {
      if (soundObject && isPlaying) {
        try {
          const status = (await soundObject.getStatusAsync()) as any
          if (status.isLoaded) {
            setPlaybackPosition(status.positionMillis)
            setPlaybackDuration(status.durationMillis || 0)
          }
        } catch (error) {
          console.error('Error getting playback status', error)
        }
      }
    }, 1000)
  }

  // Stop playback updates
  const stopPlaybackUpdates = () => {
    if (playbackUpdateInterval.current) {
      clearInterval(playbackUpdateInterval.current)
      playbackUpdateInterval.current = null
    }
  }

  // Playback status update handler
  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error(`Audio playback error: ${status.error}`)
      }
      setIsBuffering(false)
      return
    }

    setIsBuffering(status.isBuffering || false)

    if (status.isPlaying !== isPlaying) {
      setIsPlaying(status.isPlaying)
    }

    setPlaybackPosition(status.positionMillis)
    setPlaybackDuration(status.durationMillis || 0)

    // Debug log for tracking playback status (in development only)
    // if (__DEV__) {
    //   console.log(
    //     `Playback: ${formatTime(status.positionMillis)}/${formatTime(
    //       status.durationMillis
    //     )}`
    //   )
    // }

    if (status.didJustFinish && !status.isLooping) {
      setIsPlaying(false)
      setPlaybackPosition(0)
    }
  }

  // Play podcast
  const playPodcast = async (podcast: Podcast): Promise<void> => {
    try {
      await unloadSound()

      setCurrentPodcast(podcast)
      setShowMiniPlayer(true)
      setIsBuffering(true)

      const downloadedPodcast = downloads.find((dl) => dl.id === podcast.id)
      let source

      // First, check if we have a downloaded local version
      if (downloadedPodcast?.localAudioPath) {
        console.log(
          'Playing from downloaded path:',
          downloadedPodcast.localAudioPath
        )
        source = { uri: downloadedPodcast.localAudioPath }
      }
      // Then handle remote URLs
      else if (
        typeof podcast.audioUrl === 'string' &&
        podcast.audioUrl.startsWith('http')
      ) {
        console.log('Playing from remote URL:', podcast.audioUrl)
        source = { uri: podcast.audioUrl }
      }
      // Finally, handle local assets (numbers from require())
      else if (typeof podcast.audioUrl === 'number') {
        console.log('Playing from local asset ID:', podcast.audioUrl)
        source = podcast.audioUrl
      } else {
        console.error('No valid audio source available for this podcast')
        setIsBuffering(false)
        return
      }

      console.log('Creating sound with source:', JSON.stringify(source))

      const { sound } = await Audio.Sound.createAsync(
        source,
        {
          positionMillis: 0,
          shouldPlay: true,
          rate: playbackRate,
          progressUpdateIntervalMillis: 1000,
          volume: 1.0
        },
        onPlaybackStatusUpdate
      )

      setSoundObject(sound)
      setIsPlaying(true)
      startPlaybackUpdates()
    } catch (error) {
      console.error('Error playing podcast:', error)
      setIsBuffering(false)
    }
  }

  // Toggle playback
  const togglePlayback = async (): Promise<void> => {
    if (!soundObject) {
      if (currentPodcast) {
        await playPodcast(currentPodcast)
      }
      return
    }

    try {
      const status = (await soundObject.getStatusAsync()) as any

      if (!status.isLoaded) {
        console.error('Sound object not loaded')
        return
      }

      if (status.isPlaying) {
        await soundObject.pauseAsync()
        stopPlaybackUpdates()
      } else {
        await soundObject.playAsync()
        startPlaybackUpdates()
      }
    } catch (error) {
      console.error('Error toggling playback', error)
    }
  }

  // Seek to position
  const seekTo = async (position: number): Promise<void> => {
    if (!soundObject) return

    try {
      await soundObject.setPositionAsync(position)
      setPlaybackPosition(position)
    } catch (error) {
      console.error('Error seeking', error)
    }
  }

  // Skip forward
  const skipForward = async (seconds: number = 15): Promise<void> => {
    if (!soundObject) return

    try {
      const newPosition = Math.min(
        playbackPosition + seconds * 1000,
        playbackDuration
      )
      await seekTo(newPosition)
    } catch (error) {
      console.error('Error skipping forward', error)
    }
  }

  // Skip backward
  const skipBackward = async (seconds: number = 15): Promise<void> => {
    if (!soundObject) return

    try {
      const newPosition = Math.max(playbackPosition - seconds * 1000, 0)
      await seekTo(newPosition)
    } catch (error) {
      console.error('Error skipping backward', error)
    }
  }

  // Change playback rate
  const changePlaybackRate = async (rate: number): Promise<void> => {
    if (!soundObject) return

    try {
      await soundObject.setRateAsync(rate, true)
      setPlaybackRate(rate)
    } catch (error) {
      console.error('Error changing playback rate', error)
    }
  }

  // Format time
  const formatTime = (milliseconds: number): string => {
    if (!milliseconds) return '00:00'

    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  }

  // Toggle full player
  const toggleFullPlayer = (): void => {
    setShowFullPlayer(!showFullPlayer)
  }

  // Toggle favorite
  const toggleFavorite = (podcast: Podcast): void => {
    const isFavorited = favorites.some((fav) => fav.id === podcast.id)

    if (isFavorited) {
      setFavorites(favorites.filter((fav) => fav.id !== podcast.id))
    } else {
      setFavorites([...favorites, podcast])
    }

    // Save to storage
    AsyncStorage.setItem(
      STORAGE_KEYS.FAVORITES,
      JSON.stringify(
        isFavorited
          ? favorites.filter((fav) => fav.id !== podcast.id)
          : [...favorites, podcast]
      )
    )
  }

  // Check if podcast is favorite
  const isFavorite = (podcastId: number): boolean => {
    return favorites.some((fav) => fav.id === podcastId)
  }

  // Download podcast
  const downloadPodcast = async (podcast: Podcast): Promise<void> => {
    const isAlreadyDownloaded = downloads.some((dl) => dl.id === podcast.id)

    if (isAlreadyDownloaded || !podcast.audioUrl) {
      return
    }

    try {
      // Handle string URLs for remote files
      if (
        typeof podcast.audioUrl === 'string' &&
        podcast.audioUrl.startsWith('http')
      ) {
        const fileName = `podcast-${podcast.id}.mp3`
        const filePath = `${FileSystem.documentDirectory}${fileName}`

        // Create download with progress indicator
        const downloadWithProgress: DownloadedPodcast = {
          ...podcast,
          progress: 0,
          downloadDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          localAudioPath: filePath
        }

        setDownloads([...downloads, downloadWithProgress])

        // Start download
        const downloadResumable = FileSystem.createDownloadResumable(
          podcast.audioUrl,
          filePath,
          {},
          (downloadProgress) => {
            const progress =
              (downloadProgress.totalBytesWritten /
                downloadProgress.totalBytesExpectedToWrite) *
              100

            // Update progress
            setDownloads((currentDownloads) =>
              currentDownloads.map((dl) =>
                dl.id === podcast.id
                  ? { ...dl, progress: Math.round(progress) }
                  : dl
              )
            )
          }
        )

        // Complete download
        const result = await downloadResumable.downloadAsync()

        if (result && result.uri) {
          // Update with completed status
          const updatedDownloads = downloads.map((dl) =>
            dl.id === podcast.id
              ? { ...dl, progress: 100, localAudioPath: result.uri }
              : dl
          )

          setDownloads(updatedDownloads)
          AsyncStorage.setItem(
            STORAGE_KEYS.DOWNLOADS,
            JSON.stringify(updatedDownloads)
          )
        }
      } else {
        // For local assets, simulate a download
        const downloadWithProgress: DownloadedPodcast = {
          ...podcast,
          progress: 100,
          downloadDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }

        const updatedDownloads = [...downloads, downloadWithProgress]
        setDownloads(updatedDownloads)
        AsyncStorage.setItem(
          STORAGE_KEYS.DOWNLOADS,
          JSON.stringify(updatedDownloads)
        )
      }
    } catch (error) {
      console.error('Error downloading podcast:', error)

      // Remove failed download
      setDownloads(downloads.filter((dl) => dl.id !== podcast.id))
    }
  }

  // Check if podcast is downloaded
  const isDownloaded = (podcastId: number): boolean => {
    return downloads.some((dl) => dl.id === podcastId)
  }

  // Remove download
  const removeDownload = (podcastId: number): void => {
    const podcastToRemove = downloads.find((dl) => dl.id === podcastId)

    if (podcastToRemove?.localAudioPath) {
      // Delete the file
      FileSystem.deleteAsync(podcastToRemove.localAudioPath, {
        idempotent: true
      }).catch((error) => console.error('Error deleting file:', error))
    }

    const updatedDownloads = downloads.filter((dl) => dl.id !== podcastId)
    setDownloads(updatedDownloads)
    AsyncStorage.setItem(
      STORAGE_KEYS.DOWNLOADS,
      JSON.stringify(updatedDownloads)
    )
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
        // Audio state
        soundObject,
        playbackPosition,
        playbackDuration,
        isBuffering,
        playbackRate,
        // Methods
        playPodcast,
        togglePlayback,
        toggleFullPlayer,
        toggleFavorite,
        isFavorite,
        downloadPodcast,
        isDownloaded,
        removeDownload,
        setShowMiniPlayer,
        setShowFullPlayer,
        // Audio control methods
        seekTo,
        skipForward,
        skipBackward,
        changePlaybackRate,
        formatTime,
        loadPreviousSession
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
