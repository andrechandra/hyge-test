// Import NetInfo at the top of your file with other imports
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useRef
} from 'react'
import {
  ImageSourcePropType,
  AppState,
  AppStateStatus,
  Platform
} from 'react-native'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo, { NetInfoState } from '@react-native-community/netinfo'

export interface Podcast {
  id: string
  title: string
  creator: string
  episode: string
  description: string
  duration: string
  releaseDate: string
  image: ImageSourcePropType | string
  audioUrl?: string
}

export interface DownloadedPodcast extends Podcast {
  progress: number
  downloadDate: string
  localAudioPath?: string
}

// Update the PodcastContextType interface to include isConnected
interface PodcastContextType {
  podcasts: Podcast[]
  currentPodcast: Podcast | null
  isPlaying: boolean
  showMiniPlayer: boolean
  showFullPlayer: boolean
  favorites: Podcast[]
  downloads: DownloadedPodcast[]
  // Add isConnected property
  isConnected: boolean
  // API and loading states
  isLoading: boolean
  hasError: boolean
  loadMore: () => void
  refreshPodcasts: () => Promise<void>
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
  isFavorite: (podcastId: string) => boolean
  downloadPodcast: (podcast: Podcast) => Promise<void>
  isDownloaded: (podcastId: string) => boolean
  removeDownload: (podcastId: string) => void
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

// Storage keys
const STORAGE_KEYS = {
  CURRENT_PODCAST: '@podcast_app/current_podcast',
  PLAYBACK_POSITION: '@podcast_app/playback_position',
  FAVORITES: '@podcast_app/favorites',
  DOWNLOADS: '@podcast_app/downloads'
}

// SimipleCast API Configuration
const API_BASE_URL = 'https://api.simplecast.com'
const PODCAST_ID = '2de31959-5831-476e-8c89-02a2a32885ef'
const EPISODES_PER_PAGE = 20 // Using larger page size to reduce API calls

// Helper function for formatting duration
const formatDuration = (seconds: number): string => {
  if (!seconds) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Helper function for formatting date
const formatDate = (dateString: string): string => {
  if (!dateString) return 'Unknown Date'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Unknown Date'
  }
}

// Sample data for testing - remove this when connecting to real API
const generateSamplePodcasts = (page = 1, limit = 10): Podcast[] => {
  return Array(limit)
    .fill(null)
    .map((_, i) => ({
      id: `episode-${(page - 1) * limit + i + 1}`,
      title: `Episode ${(page - 1) * limit + i + 1}: React Native Development`,
      creator: 'React Native Radio',
      episode: `Episode ${(page - 1) * limit + i + 1}`,
      description:
        'A podcast discussing React Native development strategies and best practices.',
      duration: `${Math.floor(20 + Math.random() * 40)}:${Math.floor(
        Math.random() * 60
      )
        .toString()
        .padStart(2, '0')}`,
      releaseDate: new Date(
        Date.now() - ((page - 1) * limit + i) * 86400000 * 3
      ).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      image: require('../assets/images/icon.png'),
      // This field would be populated with enclosure_url from the actual API
      audioUrl: ''
    }))
}

interface PodcastProviderProps {
  children: ReactNode
}

// Custom hook to use the podcast context
export const usePodcast = (): PodcastContextType => {
  const context = useContext(PodcastContext)
  if (context === undefined) {
    throw new Error('usePodcast must be used within a PodcastProvider')
  }
  return context
}

export const PodcastProvider: React.FC<PodcastProviderProps> = ({
  children
}) => {
  // Add state for network connectivity
  const [isConnected, setIsConnected] = useState<boolean>(true)

  // API and data state
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasError, setHasError] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [hasMorePages, setHasMorePages] = useState<boolean>(true)

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
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)
  const isMounted = useRef<boolean>(true)

  // Initialize audio, load saved data, and set up network listener
  useEffect(() => {
    const init = async (): Promise<void> => {
      try {
        await setupAudio()
        await loadSavedData()

        // Try to connect to the real API
        try {
          await fetchPodcasts(1, true)
        } catch (apiError) {
          console.error(
            'Error connecting to API, falling back to sample data:',
            apiError
          )
          // Fallback to sample data if API fails
          const sampleData = generateSamplePodcasts(1)
          setPodcasts(sampleData)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error during initialization:', error)
        if (isMounted.current) {
          setHasError(true)
          setIsLoading(false)
        }
      }
    }

    init()

    // Set up network connectivity listener
    const unsubscribeNetInfo = NetInfo.addEventListener(
      (state: NetInfoState) => {
        if (isMounted.current) {
          setIsConnected(state.isConnected ?? false)

          // If connection was lost and regained, we might want to refresh data
          if (state.isConnected && !isConnected) {
            refreshPodcasts().catch((error) =>
              console.error('Error refreshing after reconnection:', error)
            )
          }
        }
      }
    )

    // Handle app state changes
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    )

    return () => {
      isMounted.current = false

      // Cleanup
      if (playbackUpdateInterval.current) {
        clearInterval(playbackUpdateInterval.current)
      }

      unloadSound()
      subscription.remove()
      unsubscribeNetInfo() // Clean up NetInfo listener
    }
  }, [isConnected])

  // Load saved data (favorites, downloads, current podcast)
  const loadSavedData = async (): Promise<void> => {
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
      console.error('Error loading saved data:', error)
    }
  }

  // Fetch podcasts from Simplecast API
  const fetchPodcasts = async (
    pageNumber: number,
    isRefresh = false
  ): Promise<void> => {
    if ((isLoading && !isRefresh) || (!hasMorePages && !isRefresh)) return

    try {
      setIsLoading(true)
      setHasError(false)

      // Build API URL with pagination
      const apiUrl = `${API_BASE_URL}/podcasts/${PODCAST_ID}/episodes?limit=${EPISODES_PER_PAGE}&offset=${
        (pageNumber - 1) * EPISODES_PER_PAGE
      }`

      console.log(`Fetching podcasts from: ${apiUrl}`)

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
          // Add any required authentication headers here
          // 'Authorization': 'Bearer YOUR_TOKEN'
        }
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()

      if (!data || !Array.isArray(data.collection)) {
        throw new Error('Invalid API response format')
      }

      console.log(`Received ${data.collection.length} episodes from API`)

      // Map API data to our Podcast interface
      const formattedEpisodes: Podcast[] = data.collection.map(
        (episode: any) => ({
          id: episode.id || '',
          title: episode.title || 'Untitled Episode',
          creator: 'React Native Radio',
          episode: `Episode ${
            episode.number || episode.next_episode_number || '?'
          }`,
          description: episode.description || '',
          duration: formatDuration(episode.duration || 0),
          releaseDate: formatDate(episode.published_at || ''),
          image: episode.image_url || require('../assets/images/icon.png'),
          audioUrl: episode.enclosure_url || ''
        })
      )

      // Update state based on whether this is a refresh or pagination
      if (isRefresh) {
        if (isMounted.current) {
          setPodcasts(formattedEpisodes)
          setPage(1)
        }
      } else {
        if (isMounted.current) {
          setPodcasts((prev) => [...prev, ...formattedEpisodes])
          setPage(pageNumber)
        }
      }

      // Check if there are more pages based on pagination info
      const hasNext = data.pages && data.pages.next
      if (isMounted.current) {
        setHasMorePages(!!hasNext)
      }
    } catch (error) {
      console.error('Error fetching podcasts:', error)
      if (isMounted.current) {
        setHasError(true)
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }

  // Load more podcasts function for pagination
  const loadMore = (): void => {
    if (!isLoading && hasMorePages) {
      fetchPodcasts(page + 1)
    }
  }

  // Refresh podcasts function
  const refreshPodcasts = async (): Promise<void> => {
    return fetchPodcasts(1, true)
  }

  // Setup Audio
  const setupAudio = async (): Promise<void> => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        // Use numerical values instead of enum constants
        interruptionModeIOS: 1, // INTERRUPTION_MODE_IOS_DO_NOT_MIX
        playsInSilentModeIOS: true,
        interruptionModeAndroid: 1, // INTERRUPTION_MODE_ANDROID_DO_NOT_MIX
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false
      })
    } catch (error) {
      console.error('Error setting up audio:', error)
      throw error
    }
  }

  // App state change handler
  const handleAppStateChange = async (
    nextAppState: AppStateStatus
  ): Promise<void> => {
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
  const loadPreviousSession = async (): Promise<void> => {
    try {
      await loadSavedData()
    } catch (error) {
      console.error('Error loading previous session:', error)
    }
  }

  // Save current session
  const saveCurrentSession = async (): Promise<void> => {
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
      console.error('Error saving session:', error)
    }
  }

  // Unload sound
  const unloadSound = async (): Promise<void> => {
    if (soundObject) {
      try {
        const status = await soundObject.getStatusAsync()
        if (status.isLoaded) {
          await soundObject.unloadAsync()
        }
      } catch (error) {
        console.error('Error unloading sound:', error)
      }

      setSoundObject(null)
    }
  }

  // Start playback updates
  const startPlaybackUpdates = (): void => {
    if (playbackUpdateInterval.current) {
      clearInterval(playbackUpdateInterval.current)
    }

    playbackUpdateInterval.current = setInterval(async () => {
      if (soundObject && isPlaying) {
        try {
          const status = await soundObject.getStatusAsync()
          if (status.isLoaded) {
            setPlaybackPosition(status.positionMillis)
            setPlaybackDuration(status.durationMillis || 0)
          }
        } catch (error) {
          console.error('Error getting playback status:', error)
        }
      }
    }, 1000)
  }

  // Stop playback updates
  const stopPlaybackUpdates = (): void => {
    if (playbackUpdateInterval.current) {
      clearInterval(playbackUpdateInterval.current)
      playbackUpdateInterval.current = null
    }
  }

  // Playback status update handler
  const onPlaybackStatusUpdate = (status: any): void => {
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

    if (status.didJustFinish && !status.isLooping) {
      setIsPlaying(false)
      setPlaybackPosition(0)
    }
  }

  // Improved togglePlayback function
  const togglePlayback = async (): Promise<void> => {
    if (!soundObject) {
      if (currentPodcast) {
        await playPodcast(currentPodcast)
      }
      return
    }

    try {
      const status = await soundObject.getStatusAsync()

      if (!status.isLoaded) {
        console.error('Sound object not loaded')
        return
      }

      if (status.isPlaying) {
        setIsPlaying(false) // Update state immediately for UI responsiveness
        await soundObject.pauseAsync()
        stopPlaybackUpdates()
      } else {
        setIsPlaying(true) // Update state immediately for UI responsiveness
        await soundObject.playAsync()
        startPlaybackUpdates()
      }
    } catch (error) {
      console.error('Error toggling playback:', error)
    }
  }

  // Updated playPodcast function to check connectivity
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
      // Then handle remote URLs, but check connectivity first
      else if (podcast.audioUrl && podcast.audioUrl.startsWith('http')) {
        if (!isConnected) {
          setIsBuffering(false)
          alert(
            "No internet connection. Please try again when you're online or play a downloaded podcast."
          )
          return
        }

        console.log('Playing from remote URL:', podcast.audioUrl)
        source = { uri: podcast.audioUrl }
      }
      // Fallback if no audio source
      else {
        console.error('No valid audio source available for this podcast')
        setIsBuffering(false)
        alert('Unable to play podcast: No valid audio source found')
        return
      }

      try {
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
        setIsPlaying(true) // Set playing state when sound is loaded
        startPlaybackUpdates()
      } catch (audioError) {
        console.error('Audio loading error:', audioError)
        setIsBuffering(false)
        setShowMiniPlayer(false)
        setIsPlaying(false) // Ensure playing state is reset on error

        // Show a more user-friendly error
        if (Platform.OS === 'web') {
          alert(
            'This audio format may not be supported by your browser. Please try another podcast.'
          )
        } else {
          alert(
            'Unable to play this podcast. The audio format may not be supported.'
          )
        }
      }
    } catch (error) {
      console.error('Error playing podcast:', error)
      setIsBuffering(false)
      setShowMiniPlayer(false)
      setIsPlaying(false) // Ensure playing state is reset on error
    }
  }

  // Seek to position
  const seekTo = async (position: number): Promise<void> => {
    if (!soundObject) return

    try {
      await soundObject.setPositionAsync(position)
      setPlaybackPosition(position)
    } catch (error) {
      console.error('Error seeking:', error)
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
      console.error('Error skipping forward:', error)
    }
  }

  // Skip backward
  const skipBackward = async (seconds: number = 15): Promise<void> => {
    if (!soundObject) return

    try {
      const newPosition = Math.max(playbackPosition - seconds * 1000, 0)
      await seekTo(newPosition)
    } catch (error) {
      console.error('Error skipping backward:', error)
    }
  }

  // Change playback rate
  const changePlaybackRate = async (rate: number): Promise<void> => {
    if (!soundObject) return

    try {
      await soundObject.setRateAsync(rate, true)
      setPlaybackRate(rate)
    } catch (error) {
      console.error('Error changing playback rate:', error)
    }
  }

  // Format time
  const formatTime = (milliseconds: number): string => {
    if (!milliseconds || isNaN(milliseconds)) return '00:00'

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

    let updatedFavorites: Podcast[]
    if (isFavorited) {
      updatedFavorites = favorites.filter((fav) => fav.id !== podcast.id)
    } else {
      updatedFavorites = [...favorites, podcast]
    }

    setFavorites(updatedFavorites)

    // Save to storage
    AsyncStorage.setItem(
      STORAGE_KEYS.FAVORITES,
      JSON.stringify(updatedFavorites)
    ).catch((err) => console.error('Error saving favorites:', err))
  }

  // Check if podcast is favorite
  const isFavorite = (podcastId: string): boolean => {
    return favorites.some((fav) => fav.id === podcastId)
  }

  // Download podcast
  const downloadPodcast = async (podcast: Podcast): Promise<void> => {
    const isAlreadyDownloaded = downloads.some((dl) => dl.id === podcast.id)

    if (isAlreadyDownloaded || !podcast.audioUrl) {
      return
    }

    try {
      // Handle remote audio URLs
      if (podcast.audioUrl && podcast.audioUrl.startsWith('http')) {
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

        const updatedDownloads = [...downloads, downloadWithProgress]
        setDownloads(updatedDownloads)

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
          const finalDownloads = downloads.map((dl) =>
            dl.id === podcast.id
              ? { ...dl, progress: 100, localAudioPath: result.uri }
              : dl
          )

          setDownloads(finalDownloads)
          AsyncStorage.setItem(
            STORAGE_KEYS.DOWNLOADS,
            JSON.stringify(finalDownloads)
          ).catch((err) => console.error('Error saving downloads:', err))
        }
      }
    } catch (error) {
      console.error('Error downloading podcast:', error)

      // Remove failed download
      setDownloads(downloads.filter((dl) => dl.id !== podcast.id))
    }
  }

  // Check if podcast is downloaded
  const isDownloaded = (podcastId: string): boolean => {
    return downloads.some((dl) => dl.id === podcastId && dl.progress === 100)
  }

  // Remove download
  const removeDownload = (podcastId: string): void => {
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
    ).catch((err) =>
      console.error('Error saving downloads after removal:', err)
    )
  }

  // Add isConnected to the provider value
  return (
    <PodcastContext.Provider
      value={{
        podcasts,
        currentPodcast,
        isPlaying,
        showMiniPlayer,
        showFullPlayer,
        favorites,
        downloads,
        isConnected, // Add this to the context
        // API and loading states
        isLoading,
        hasError,
        loadMore,
        refreshPodcasts,
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
