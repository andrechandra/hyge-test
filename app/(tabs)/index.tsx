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

export default function HomeScreen() {
  const podcasts = [
    {
      id: 1,
      title: 'Enjoy The Nature',
      creator: 'Webby',
      episode: 'Episode 01',
      image: require('../../assets/images/icon.png')
    },
    {
      id: 2,
      title: 'How reboot will change...',
      creator: 'Webby',
      episode: 'Episode 01',
      image: require('../../assets/images/icon.png')
    },
    {
      id: 3,
      title: 'Enjoy The Nature',
      creator: 'Webby',
      episode: 'Episode 01',
      image: require('../../assets/images/icon.png')
    }
  ]

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
          <Text style={styles.searchText}>Search your favorite podcast...</Text>
          <Ionicons name="search" size={18} color="#9ca3af" />
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Podcasts</Text>
        <ScrollView
          style={styles.podcastList}
          contentContainerStyle={styles.podcastListContent}
        >
          {podcasts.map((podcast, index) => (
            <View key={podcast.id} style={styles.podcastItem}>
              <View
                style={[
                  styles.podcastImageContainer,
                  {
                    backgroundColor:
                      index === 0 ? '#111' : index === 1 ? '#0a547a' : '#6d3030'
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
                <TouchableOpacity>
                  <Ionicons name="heart-outline" size={18} color="#9ca3af" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.playButton}>
                  <Ionicons name="play" size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
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
    paddingVertical: 12
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
    paddingBottom: Platform.OS === 'ios' ? 140 : 100
  },
  podcastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  podcastImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  podcastImage: {
    width: 56,
    height: 56,
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
