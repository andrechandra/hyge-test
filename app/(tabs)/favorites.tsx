import React, { useCallback, useState, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  FlatList,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { usePodcast, Podcast } from '@/context/PodcastContext'
import MiniPlayer from '@/components/MiniPlayer'
import NowPlaying from '@/components/NowPlaying'

const PODCASTS_PER_PAGE = 10

export default function FavoritesScreen(): JSX.Element {
  const {
    favorites,
    toggleFavorite,
    downloadPodcast,
    isDownloaded,
    playPodcast
  } = usePodcast()

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [paginatedFavorites, setPaginatedFavorites] = useState<Podcast[]>([])
  const [hasMorePages, setHasMorePages] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Update paginated favorites based on current page
  useEffect(() => {
    const startIndex = 0
    const endIndex = currentPage * PODCASTS_PER_PAGE

    const favoritesToShow = favorites.slice(startIndex, endIndex)
    setPaginatedFavorites(favoritesToShow)

    // Check if we have more pages
    setHasMorePages(favorites.length > endIndex)
  }, [favorites, currentPage])

  // Load next page of favorites
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMorePages) {
      setIsLoading(true)
      // Simulate loading
      setTimeout(() => {
        setCurrentPage((prevPage) => prevPage + 1)
        setIsLoading(false)
      }, 500) // Add a small delay to simulate loading
    }
  }, [isLoading, hasMorePages])

  const renderPodcastItem = useCallback(
    ({ item, index }: { item: Podcast; index: number }) => (
      <TouchableOpacity
        style={styles.favoriteItem}
        onPress={() => playPodcast(item)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.favoriteImageContainer,
            {
              backgroundColor:
                index % 4 === 0
                  ? '#111'
                  : index % 4 === 1
                  ? '#0a547a'
                  : index % 4 === 2
                  ? '#6d3030'
                  : '#3a5834'
            }
          ]}
        >
          {typeof item.image === 'string' ? (
            <Image
              source={{ uri: item.image }}
              style={styles.favoriteImage}
              defaultSource={require('../../assets/images/icon.png')}
            />
          ) : (
            <Image source={item.image} style={styles.favoriteImage} />
          )}
        </View>
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.favoriteMeta} numberOfLines={1}>
            {item.creator} • {item.episode}
          </Text>
          <Text style={styles.favoriteDate}>Added {item.releaseDate}</Text>
        </View>
        <View style={styles.favoriteActions}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation()
              toggleFavorite(item)
            }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="heart" size={18} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={(e) => {
              e.stopPropagation()
              downloadPodcast(item)
            }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons
              name={
                isDownloaded(item.id) ? 'checkmark-circle' : 'download-outline'
              }
              size={18}
              color={isDownloaded(item.id) ? '#10b981' : '#9ca3af'}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    [playPodcast, toggleFavorite, isDownloaded, downloadPodcast]
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
    if (paginatedFavorites.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.paginationInfo}>
            Showing {paginatedFavorites.length} of {favorites.length} podcasts
          </Text>
          {renderLoadMoreButton()}
        </View>
      )
    }

    return null
  }, [paginatedFavorites.length, favorites.length, renderLoadMoreButton])

  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={60} color="#9ca3af" />
        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptyMessage}>
          Start adding podcasts to your favorites to see them here
        </Text>
      </View>
    ),
    []
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerContainer}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Favorites</Text>
          <Ionicons name="heart" size={24} color="#ef4444" />
        </View>

        <View style={styles.headerActions}>
          <Text style={styles.episodeCount}>{favorites.length} Podcasts</Text>
        </View>
      </View>

      <FlatList
        data={paginatedFavorites}
        renderItem={renderPodcastItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.favoritesListContent,
          paginatedFavorites.length === 0 && styles.emptyListContainer
        ]}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderListFooter}
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

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
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    marginBottom: 12
  },
  headerTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white'
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  filterText: {
    color: '#9ca3af',
    fontSize: 14,
    marginRight: 4
  },
  episodeCount: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500'
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  favoritesListContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 190 : 160
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8
  },
  favoriteImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  favoriteImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  },
  favoriteInfo: {
    flex: 1,
    marginRight: 8
  },
  favoriteTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white'
  },
  favoriteMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2
  },
  favoriteDate: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4
  },
  favoriteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  downloadButton: {
    marginLeft: 12
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginTop: 20,
    marginBottom: 8
  },
  emptyMessage: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20
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
