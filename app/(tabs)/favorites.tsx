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

export default function FavoritesScreen() {
  const favorites = [
    {
      id: 1,
      title: 'The Daily Mindfulness',
      creator: 'Sarah Johnson',
      episode: 'Episode 12',
      dateAdded: '2 days ago',
      image: require('../../assets/images/icon.png')
    },
    {
      id: 2,
      title: 'Tech Insights Weekly',
      creator: 'David Chen',
      episode: 'Episode 45',
      dateAdded: '3 days ago',
      image: require('../../assets/images/icon.png')
    },
    {
      id: 3,
      title: 'History Uncovered',
      creator: 'Emma Roberts',
      episode: 'Episode 23',
      dateAdded: '1 week ago',
      image: require('../../assets/images/icon.png')
    },
    {
      id: 4,
      title: 'Science Today',
      creator: 'Michael Thomas',
      episode: 'Episode 08',
      dateAdded: '2 weeks ago',
      image: require('../../assets/images/icon.png')
    }
  ]

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
          {favorites.map((item, index) => (
            <View key={item.id} style={styles.favoriteItem}>
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
                <Text style={styles.favoriteDate}>Added {item.dateAdded}</Text>
              </View>
              <View style={styles.favoriteActions}>
                <TouchableOpacity>
                  <Ionicons name="heart" size={18} color="#ef4444" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.playButton}>
                  <Ionicons name="play" size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>
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
    paddingBottom: Platform.OS === 'ios' ? 140 : 100
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
    width: 70,
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
