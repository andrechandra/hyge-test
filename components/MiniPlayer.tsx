import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  GestureResponderEvent
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { usePodcast } from '../context/PodcastContext'

const { width } = Dimensions.get('window')

const MiniPlayer: React.FC = () => {
  const {
    currentPodcast,
    isPlaying,
    showMiniPlayer,
    togglePlayback,
    toggleFullPlayer,
    skipForward,
    playbackPosition,
    playbackDuration,
    isBuffering,
    formatTime,
    isConnected
  } = usePodcast()

  const [isPressed, setIsPressed] = useState<boolean>(false)

  const progressPercentage = useMemo(() => {
    if (!playbackDuration || playbackDuration <= 0) return 0
    return Math.min((playbackPosition / playbackDuration) * 100, 100)
  }, [playbackPosition, playbackDuration])

  const duration = useMemo(() => {
    if (!currentPodcast) return '00:00'
    if (playbackDuration > 0) {
      return formatTime(playbackDuration)
    }
    return currentPodcast.duration
  }, [playbackDuration, currentPodcast, formatTime])

  if (!currentPodcast || !showMiniPlayer) return null

  const renderImage = (): React.ReactNode => {
    if (typeof currentPodcast.image === 'string') {
      return (
        <Image
          source={{ uri: currentPodcast.image }}
          style={styles.image}
          defaultSource={require('../assets/images/icon.png')}
        />
      )
    } else {
      return <Image source={currentPodcast.image} style={styles.image} />
    }
  }

  const handlePlayPause = (e: GestureResponderEvent): void => {
    e.stopPropagation()
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 150)

    togglePlayback()
  }

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={toggleFullPlayer}
    >
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressIndicator,
            { width: `${progressPercentage}%` }
          ]}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>{renderImage()}</View>

        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentPodcast.title}
          </Text>
          <Text style={styles.creator} numberOfLines={1}>
            {isBuffering
              ? 'Buffering...'
              : `${formatTime(playbackPosition)} / ${duration}`}
          </Text>
          {!isConnected && (
            <Text style={styles.offlineIndicator}>Offline Mode</Text>
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isPressed && styles.buttonPressed]}
            onPress={handlePlayPause}
            disabled={isBuffering}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            {isBuffering ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={24}
                color="white"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={(e: GestureResponderEvent) => {
              e.stopPropagation()
              skipForward(30)
            }}
            disabled={isBuffering}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons
              name="play-forward"
              size={24}
              color={isBuffering ? '#666' : 'white'}
            />
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
    marginRight: 12,
    backgroundColor: '#222'
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
  offlineIndicator: {
    color: '#f97316',
    fontSize: 10,
    marginTop: 2
  },
  controls: {
    flexDirection: 'row'
  },
  controlButton: {
    marginLeft: 16,
    padding: 4,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16
  },
  buttonPressed: {
    backgroundColor: 'rgba(255,255,255,0.2)'
  }
})

export default MiniPlayer
