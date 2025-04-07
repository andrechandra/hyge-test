import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { usePodcast, Podcast } from '@/context/PodcastContext'
import MiniPlayer from '@/components/MiniPlayer'
import NowPlaying from '@/components/NowPlaying'
import DownloadButton from '@/components/DownloadButton'
import NotificationCenter from '@/components/NotificationCenter'

const PODCASTS_PER_PAGE = 10

export default function HomeScreen(): JSX.Element {
  const {
    podcasts,
    isLoading,
    hasError,
    loadMore,
    refreshPodcasts,
    playPodcast,
    toggleFavorite,
    isFavorite,
    downloadPodcast,
    isDownloaded
  } = usePodcast()

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filteredPodcasts, setFilteredPodcasts] = useState<Podcast[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [paginatedPodcasts, setPaginatedPodcasts] = useState<Podcast[]>([])
  const [hasMorePages, setHasMorePages] = useState<boolean>(true)

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPodcasts(podcasts)
    } else {
      const filtered = podcasts.filter(
        (podcast) =>
          podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          podcast.creator.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPodcasts(filtered)
    }
    setCurrentPage(1)
  }, [searchTerm, podcasts])

  useEffect(() => {
    const startIndex = 0
    const endIndex = currentPage * PODCASTS_PER_PAGE

    const podcastsToShow = filteredPodcasts.slice(startIndex, endIndex)
    setPaginatedPodcasts(podcastsToShow)

    setHasMorePages(filteredPodcasts.length > endIndex)
  }, [filteredPodcasts, currentPage])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setCurrentPage(1)
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refreshPodcasts()
      setCurrentPage(1)
    } catch (error) {
      console.error('Error refreshing podcasts:', error)
    } finally {
      setRefreshing(false)
    }
  }, [refreshPodcasts])

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMorePages) {
      if (filteredPodcasts.length <= currentPage * PODCASTS_PER_PAGE) {
        loadMore()
      }
      setCurrentPage((prevPage) => prevPage + 1)
    }
  }, [isLoading, hasMorePages, filteredPodcasts.length, currentPage, loadMore])

  const renderPodcastItem = useCallback(
    ({ item: podcast, index }: { item: Podcast; index: number }) => {
      return (
        <TouchableOpacity
          style={styles.podcastItem}
          onPress={() => playPodcast(podcast)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.podcastImageContainer,
              {
                backgroundColor:
                  index % 3 === 0
                    ? '#111'
                    : index % 3 === 1
                    ? '#0a547a'
                    : '#6d3030'
              }
            ]}
          >
            {typeof podcast.image === 'string' ? (
              <Image
                source={{ uri: podcast.image }}
                style={styles.podcastImage}
                defaultSource={require('../../assets/images/icon.png')}
              />
            ) : (
              <Image source={podcast.image} style={styles.podcastImage} />
            )}
          </View>
          <View style={styles.podcastInfo}>
            <Text style={styles.podcastTitle} numberOfLines={1}>
              {podcast.title}
            </Text>
            <Text style={styles.podcastMeta} numberOfLines={1}>
              {podcast.creator} • {podcast.episode}
            </Text>
          </View>
          <View style={styles.podcastActions}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation()
                toggleFavorite(podcast)
              }}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons
                name={isFavorite(podcast.id) ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite(podcast.id) ? '#ef4444' : '#9ca3af'}
              />
            </TouchableOpacity>
            <DownloadButton podcast={podcast} style={styles.downloadButton} />
          </View>
        </TouchableOpacity>
      )
    },
    [playPodcast, toggleFavorite, isFavorite, downloadPodcast, isDownloaded]
  )

  const renderLoadMoreButton = useCallback(() => {
    if (!hasMorePages) return null

    return (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={handleLoadMore}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Text style={styles.loadMoreText}>Load More</Text>
            <Ionicons name="chevron-down" size={16} color="white" />
          </>
        )}
      </TouchableOpacity>
    )
  }, [hasMorePages, handleLoadMore, isLoading])

  const renderListFooter = useCallback(() => {
    if (isLoading && !refreshing && paginatedPodcasts.length > 0) {
      return (
        <View style={styles.loaderFooter}>
          <ActivityIndicator size="small" color="#9ca3af" />
        </View>
      )
    }

    if (paginatedPodcasts.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.paginationInfo}>
            Showing {paginatedPodcasts.length} of {filteredPodcasts.length}{' '}
            podcasts
          </Text>
          {renderLoadMoreButton()}
        </View>
      )
    }

    return null
  }, [
    isLoading,
    refreshing,
    paginatedPodcasts.length,
    filteredPodcasts.length,
    renderLoadMoreButton
  ])

  const renderEmptyList = useCallback(() => {
    if (isLoading && podcasts.length === 0 && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9ca3af" />
          <Text style={styles.loadingText}>Loading podcasts...</Text>
        </View>
      )
    }

    if (searchTerm) {
      return (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={48} color="#6b7280" />
          <Text style={styles.noResultsText}>
            No podcasts found for "{searchTerm}"
          </Text>
        </View>
      )
    }

    if (!isLoading && podcasts.length === 0) {
      return (
        <View style={styles.noResultsContainer}>
          <Ionicons name="radio-outline" size={48} color="#6b7280" />
          <Text style={styles.noResultsText}>No podcasts available</Text>
        </View>
      )
    }

    return null
  }, [isLoading, podcasts.length, searchTerm, refreshing])

  const renderErrorState = useCallback(
    () => (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>
          Unable to load podcasts. Please check your connection.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    ),
    [handleRefresh]
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.profileBar}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={{ color: 'white' }}>👤</Text>
          </View>
          <View>
            <Text style={styles.helloText}>Hello</Text>
            <Text style={styles.userName}>Andre Chandra</Text>
          </View>
        </View>
        {/* Replace the existing notifications icon with NotificationCenter component */}
        <NotificationCenter />
      </View>

      <View style={styles.headingContainer}>
        <Text style={styles.headingText}>Explore New Podcasts</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your favorite podcast..."
            placeholderTextColor="#6b7280"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm ? (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="search" size={18} color="#9ca3af" />
          )}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>
          {searchTerm ? 'Search Results' : 'Podcasts'}
          {searchTerm ? ` (${filteredPodcasts.length})` : ''}
        </Text>

        {hasError ? (
          renderErrorState()
        ) : (
          <FlatList
            data={paginatedPodcasts}
            renderItem={renderPodcastItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.podcastListContent,
              paginatedPodcasts.length === 0 && styles.emptyListContainer
            ]}
            ListEmptyComponent={renderEmptyList}
            ListFooterComponent={renderListFooter}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#9ca3af"
                colors={['#9ca3af']}
              />
            }
            removeClippedSubviews={Platform.OS === 'android'}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        )}
      </View>

      <MiniPlayer />
      <NowPlaying />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000'
  },
  profileBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#262626'
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4b5563',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  helloText: {
    fontSize: 12,
    color: '#9ca3af'
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white'
  },
  headingContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12
  },
  headingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white'
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 24
  },
  searchBar: {
    backgroundColor: '#1f2937',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'space-between'
  },
  searchInput: {
    color: 'white',
    fontSize: 14,
    flex: 1,
    padding: 0
  },
  sectionContainer: {
    paddingHorizontal: 16,
    flex: 1
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8
  },
  podcastListContent: {
    paddingBottom: Platform.OS === 'ios' ? 190 : 160
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  podcastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4
  },
  podcastImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  podcastImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  },
  podcastInfo: {
    flex: 1,
    marginRight: 8
  },
  podcastTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginBottom: 4
  },
  podcastMeta: {
    fontSize: 12,
    color: '#9ca3af'
  },
  podcastActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  downloadButton: {
    marginLeft: 12
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  noResultsText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 16
  },
  loaderFooter: {
    paddingVertical: 20,
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  errorText: {
    color: '#f87171',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 10
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1f2937',
    borderRadius: 8
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500'
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 16
  },
  paginationInfo: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 8
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center'
  },
  loadMoreText: {
    color: 'white',
    fontWeight: '500',
    marginRight: 4
  }
})
