import React from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { usePodcast, Podcast } from '@/context/PodcastContext'

export default function FavoritesScreen(): JSX.Element {
  const {
    favorites,
    toggleFavorite,
    downloadPodcast,
    isDownloaded,
    playPodcast
  } = usePodcast()

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerContainer}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Favorites</Text>
          <Ionicons name="heart" size={24} color="#ef4444" />
        </View>

        <View style={styles.headerActions}>
          <View style={styles.filterButton}>
            <Text style={styles.filterText}>Recent</Text>
            <Ionicons name="chevron-down" size={16} color="#9ca3af" />
          </View>
          <Text style={styles.episodeCount}>{favorites.length} Podcasts</Text>
        </View>
      </View>

      {favorites.length > 0 ? (
        <ScrollView
          style={styles.favoritesList}
          contentContainerStyle={styles.favoritesListContent}
        >
          {favorites.map((item: Podcast, index: number) => (
            <TouchableOpacity
              key={item.id}
              style={styles.favoriteItem}
              onPress={() => playPodcast(item)}
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
                <Image source={item.image} style={styles.favoriteImage} />
              </View>
              <View style={styles.favoriteInfo}>
                <Text style={styles.favoriteTitle}>{item.title}</Text>
                <Text style={styles.favoriteMeta}>
                  {item.creator} • {item.episode}
                </Text>
                <Text style={styles.favoriteDate}>
                  Added {item.releaseDate}
                </Text>
              </View>
              <View style={styles.favoriteActions}>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation()
                    toggleFavorite(item)
                  }}
                >
                  <Ionicons name="heart" size={18} color="#ef4444" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={(e) => {
                    e.stopPropagation()
                    downloadPodcast(item)
                  }}
                >
                  <Ionicons
                    name={
                      isDownloaded(item.id)
                        ? 'checkmark-circle'
                        : 'download-outline'
                    }
                    size={18}
                    color={isDownloaded(item.id) ? '#10b981' : '#9ca3af'}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={60} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyMessage}>
            Start adding podcasts to your favorites to see them here
          </Text>
        </View>
      )}
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
  favoritesList: {
    flex: 1
  },
  favoritesListContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 190 : 160
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderRadius: 8
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
    width: 64,
    height: 64,
    borderRadius: 8
  },
  favoriteInfo: {
    flex: 1
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
    justifyContent: 'space-between'
  },
  playButton: {
    marginLeft: 12
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  }
})
