import React from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { usePodcast } from '../context/PodcastContext'

const { width } = Dimensions.get('window')

const MiniPlayer: React.FC = () => {
  const {
    currentPodcast,
    isPlaying,
    togglePlayback,
    toggleFullPlayer,
    showMiniPlayer
  } = usePodcast()

  if (!currentPodcast || !showMiniPlayer) return null

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={toggleFullPlayer}
    >
      <View style={styles.progressBar}>
        <Animated.View
          style={[styles.progressIndicator, { width: width * 0.3 }]}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={currentPodcast.image} style={styles.image} />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentPodcast.title}
          </Text>
          <Text style={styles.creator} numberOfLines={1}>
            {currentPodcast.creator}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={(e) => {
              e.stopPropagation()
              togglePlayback()
            }}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={(e) => {
              e.stopPropagation()
            }}
          >
            <Ionicons name="play-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 115 : 90,
    left: 0,
    right: 0,
    backgroundColor: '#111',
    borderRadius: 8,
    marginHorizontal: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 99
  },
  progressBar: {
    height: 2,
    backgroundColor: '#333',
    width: '100%'
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: '#3b82f6'
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12
  },
  imageContainer: {
    width: 40,
    height: 40,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12
  },
  image: {
    width: '100%',
    height: '100%'
  },
  infoContainer: {
    flex: 1,
    marginRight: 12
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500'
  },
  creator: {
    color: '#9ca3af',
    fontSize: 12
  },
  controls: {
    flexDirection: 'row'
  },
  controlButton: {
    marginLeft: 16
  }
})

export default MiniPlayer
