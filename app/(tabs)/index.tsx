import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { usePodcast, Podcast } from '@/context/PodcastContext'
import MiniPlayer from '@/components/MiniPlayer'
import NowPlaying from '@/components/NowPlaying'

export default function HomeScreen(): JSX.Element {
  const {
    podcasts,
    playPodcast,
    toggleFavorite,
    isFavorite,
    downloadPodcast,
    isDownloaded
  } = usePodcast()

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filteredPodcasts, setFilteredPodcasts] = useState<Podcast[]>(podcasts)

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
  }, [searchTerm, podcasts])

  const clearSearch = () => {
    setSearchTerm('')
  }

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
            <Text style={styles.userName}>Joe Doe</Text>
          </View>
        </View>
        <Ionicons name="notifications-outline" size={20} color="#9ca3af" />
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
        <ScrollView
          style={styles.podcastList}
          contentContainerStyle={styles.podcastListContent}
        >
          {filteredPodcasts.length > 0 ? (
            filteredPodcasts.map((podcast: Podcast, index: number) => (
              <TouchableOpacity
                key={podcast.id}
                style={styles.podcastItem}
                onPress={() => playPodcast(podcast)}
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
                  <Image source={podcast.image} style={styles.podcastImage} />
                </View>
                <View style={styles.podcastInfo}>
                  <Text style={styles.podcastTitle}>{podcast.title}</Text>
                  <Text style={styles.podcastMeta}>
                    {podcast.creator} • {podcast.episode}
                  </Text>
                </View>
                <View style={styles.podcastActions}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation()
                      toggleFavorite(podcast)
                    }}
                  >
                    <Ionicons
                      name={isFavorite(podcast.id) ? 'heart' : 'heart-outline'}
                      size={18}
                      color={isFavorite(podcast.id) ? '#ef4444' : '#9ca3af'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={(e) => {
                      e.stopPropagation()
                      downloadPodcast(podcast)
                    }}
                  >
                    <Ionicons
                      name={
                        isDownloaded(podcast.id)
                          ? 'checkmark-circle'
                          : 'download-outline'
                      }
                      size={18}
                      color={isDownloaded(podcast.id) ? '#10b981' : '#9ca3af'}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color="#6b7280" />
              <Text style={styles.noResultsText}>
                No podcasts found for "{searchTerm}"
              </Text>
            </View>
          )}
        </ScrollView>
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
  searchText: {
    color: '#6b7280',
    fontSize: 14,
    flex: 1
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
  podcastList: {
    flex: 1
  },
  podcastListContent: {
    paddingBottom: Platform.OS === 'ios' ? 190 : 160
  },
  podcastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
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
    width: 64,
    height: 64,
    borderRadius: 8
  },
  podcastInfo: {
    flex: 1
  },
  podcastTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white'
  },
  podcastMeta: {
    fontSize: 12,
    color: '#9ca3af'
  },
  podcastActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
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
    marginTop: 16
  }
})
