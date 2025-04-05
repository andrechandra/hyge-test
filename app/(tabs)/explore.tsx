import React, { useState } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  FlatList
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

export default function ExploreScreen() {
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = [
    'All',
    'Technology',
    'Business',
    'Comedy',
    'Education',
    'Health',
    'Society',
    'Music',
    'News'
  ]

  const featuredPodcasts = [
    {
      id: 'f1',
      title: 'Tech Innovations Weekly',
      creator: 'Future Tech Media',
      followers: '126K',
      image: require('../../assets/images/icon.png'),
      color: '#0a547a'
    },
    {
      id: 'f2',
      title: 'Mind Over Matter',
      creator: 'Wellness Network',
      followers: '94K',
      image: require('../../assets/images/icon.png'),
      color: '#3a5834'
    }
  ]

  const trendingPodcasts = [
    {
      id: 't1',
      title: 'The Daily Byte',
      creator: 'Tech Innovators',
      episodes: 128,
      image: require('../../assets/images/icon.png'),
      color: '#6d3030'
    },
    {
      id: 't2',
      title: 'Future Finance',
      creator: 'Money Matters',
      episodes: 96,
      image: require('../../assets/images/icon.png'),
      color: '#111'
    },
    {
      id: 't3',
      title: 'Creative Minds',
      creator: 'Art Network',
      episodes: 74,
      image: require('../../assets/images/icon.png'),
      color: '#4a3161'
    },
    {
      id: 't4',
      title: 'Health Insights',
      creator: 'Medical Today',
      episodes: 215,
      image: require('../../assets/images/icon.png'),
      color: '#614a31'
    }
  ]

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerContainer}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Explore</Text>
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoriesContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  activeCategory === item && styles.activeCategoryButton
                ]}
                onPress={() => setActiveCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === item && styles.activeCategoryText
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {featuredPodcasts.map((podcast) => (
            <TouchableOpacity key={podcast.id} style={styles.featuredItem}>
              <View
                style={[
                  styles.featuredImageContainer,
                  { backgroundColor: podcast.color }
                ]}
              >
                <Image source={podcast.image} style={styles.featuredImage} />
              </View>
              <View style={styles.featuredGradient}>
                <View>
                  <Text style={styles.featuredTitle}>{podcast.title}</Text>
                  <Text style={styles.featuredCreator}>{podcast.creator}</Text>
                  <View style={styles.followersContainer}>
                    <Ionicons name="people-outline" size={14} color="#9ca3af" />
                    <Text style={styles.followersText}>
                      {podcast.followers} followers
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.followButton}>
                  <Text style={styles.followButtonText}>Follow</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.trendingGrid}>
            {trendingPodcasts.map((podcast, index) => (
              <TouchableOpacity key={podcast.id} style={styles.trendingItem}>
                <View
                  style={[
                    styles.trendingImageContainer,
                    { backgroundColor: podcast.color }
                  ]}
                >
                  <Image source={podcast.image} style={styles.trendingImage} />
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                </View>
                <Text style={styles.trendingTitle} numberOfLines={1}>
                  {podcast.title}
                </Text>
                <Text style={styles.trendingCreator} numberOfLines={1}>
                  {podcast.creator}
                </Text>
                <Text style={styles.trendingEpisodes}>
                  {podcast.episodes} episodes
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.sectionContainer, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>For You</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {trendingPodcasts.slice(0, 2).map((podcast) => (
            <View key={podcast.id} style={styles.podcastItem}>
              <View
                style={[
                  styles.podcastImageContainer,
                  { backgroundColor: podcast.color }
                ]}
              >
                <Image source={podcast.image} style={styles.podcastImage} />
              </View>
              <View style={styles.podcastInfo}>
                <Text style={styles.podcastTitle}>{podcast.title}</Text>
                <Text style={styles.podcastMeta}>
                  {podcast.creator} • {podcast.episodes} episodes
                </Text>
              </View>
              <View style={styles.podcastActions}>
                <TouchableOpacity>
                  <Ionicons name="heart-outline" size={18} color="#9ca3af" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.playButton}>
                  <Ionicons name="play" size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    borderBottomColor: '#262626'
  },
  headerTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white'
  },
  scrollView: {
    flex: 1
  },
  scrollViewContent: {
    paddingBottom: Platform.OS === 'ios' ? 140 : 100
  },
  categoriesContainer: {
    marginTop: 16
  },
  categoriesList: {
    paddingHorizontal: 16
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#1f2937'
  },
  activeCategoryButton: {
    backgroundColor: '#ef4444'
  },
  categoryText: {
    color: '#9ca3af',
    fontWeight: '500',
    fontSize: 14
  },
  activeCategoryText: {
    color: 'white'
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16
  },
  lastSection: {
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white'
  },
  seeAllText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500'
  },
  featuredItem: {
    height: 160,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden'
  },
  featuredImageContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6
  },
  featuredGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4
  },
  featuredCreator: {
    fontSize: 14,
    color: '#e5e7eb',
    marginBottom: 8
  },
  followersContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  followersText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4
  },
  followButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  followButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  trendingItem: {
    width: '48%',
    marginBottom: 16
  },
  trendingImageContainer: {
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  trendingImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2
  },
  trendingCreator: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2
  },
  trendingEpisodes: {
    fontSize: 11,
    color: '#6b7280'
  },
  podcastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderRadius: 8
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
    width: 70,
    justifyContent: 'space-between'
  },
  playButton: {
    marginLeft: 12
  }
})
