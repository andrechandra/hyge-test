import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
  Platform,
  PanResponder
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { usePodcast } from '../context/PodcastContext'
import { BlurView } from 'expo-blur'
import Slider from '@react-native-community/slider'

const { width, height } = Dimensions.get('window')

const NowPlaying: React.FC = () => {
  const {
    currentPodcast,
    isPlaying,
    showFullPlayer,
    togglePlayback,
    toggleFullPlayer,
    toggleFavorite,
    isFavorite,
    setShowFullPlayer,
    playbackPosition,
    playbackDuration,
    isBuffering,
    seekTo,
    skipForward,
    skipBackward,
    formatTime,
    changePlaybackRate,
    playbackRate
  } = usePodcast()

  const [sliderValue, setSliderValue] = useState<number>(0)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [playbackRates] = useState<number[]>([0.75, 1.0, 1.25, 1.5, 1.75, 2.0])
  const [showRates, setShowRates] = useState<boolean>(false)

  const slideAnim = useRef(new Animated.Value(height)).current

  const duration = useMemo(() => {
    if (playbackDuration > 0) {
      return formatTime(playbackDuration)
    }
    return currentPodcast?.duration || '00:00'
  }, [playbackDuration, currentPodcast, formatTime])

  useEffect(() => {
    if (!isDragging && playbackDuration > 0) {
      setSliderValue(playbackPosition)
    }
  }, [playbackPosition, playbackDuration, isDragging])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          gestureState.dy > 10 &&
          Math.abs(gestureState.dx) < Math.abs(gestureState.dy)
        )
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy)
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.7) {
          setShowFullPlayer(false)
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 40
          }).start()
        }
      }
    })
  ).current

  useEffect(() => {
    if (showFullPlayer) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true
      }).start()
    }
  }, [showFullPlayer])

  if (!currentPodcast) return null

  const favorited = isFavorite(currentPodcast.id)

  // Slider handlers
  const onSliderValueChange = (value: number) => {
    setSliderValue(value)
  }

  const onSliderSlidingStart = () => {
    setIsDragging(true)
  }

  const onSliderSlidingComplete = async (value: number) => {
    setIsDragging(false)
    await seekTo(value)
  }

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          transform: [{ translateY: slideAnim }]
        }
      ]}
      pointerEvents={showFullPlayer ? 'auto' : 'none'}
    >
      <BlurView intensity={90} style={StyleSheet.absoluteFill} tint="dark" />

      <SafeAreaView style={styles.container}>
        <View style={styles.header} {...panResponder.panHandlers}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={toggleFullPlayer}
          >
            <Ionicons name="chevron-down" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Now Playing</Text>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowRates(!showRates)}
          >
            <Ionicons name="options-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {showRates && (
          <View style={styles.ratesContainer}>
            <Text style={styles.ratesTitle}>Playback Speed</Text>
            <View style={styles.rateButtons}>
              {playbackRates.map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={[
                    styles.rateButton,
                    playbackRate === rate && styles.activeRateButton
                  ]}
                  onPress={() => changePlaybackRate(rate)}
                >
                  <Text
                    style={[
                      styles.rateText,
                      playbackRate === rate && styles.activeRateText
                    ]}
                  >
                    {rate}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <Image source={currentPodcast.image} style={styles.image} />
            {isBuffering && (
              <View style={styles.bufferingOverlay}>
                <Text style={styles.bufferingText}>Buffering...</Text>
              </View>
            )}
          </View>

          <View style={styles.podcastInfo}>
            <Text style={styles.title}>{currentPodcast.title}</Text>
            <Text style={styles.creator}>{currentPodcast.creator}</Text>
          </View>

          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={playbackDuration > 0 ? playbackDuration : 1}
              value={sliderValue}
              onValueChange={onSliderValueChange}
              onSlidingStart={onSliderSlidingStart}
              onSlidingComplete={onSliderSlidingComplete}
              minimumTrackTintColor="#3b82f6"
              maximumTrackTintColor="#444"
              thumbTintColor="#3b82f6"
              disabled={isBuffering || playbackDuration === 0}
            />

            <View style={styles.timeInfo}>
              <Text style={styles.timeText}>
                {formatTime(isDragging ? sliderValue : playbackPosition)}
              </Text>
              <Text style={styles.timeText}>{duration}</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.secondaryControl}>
              <Ionicons name="shuffle" size={24} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mainControl}
              onPress={() => skipBackward(30)}
              disabled={isBuffering}
            >
              <Ionicons
                name="play-skip-back"
                size={30}
                color={isBuffering ? '#666' : 'white'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playButton, isBuffering && { opacity: 0.6 }]}
              onPress={togglePlayback}
              disabled={isBuffering}
            >
              <View
                style={[
                  styles.playButtonInner,
                  { paddingLeft: isPlaying ? 0 : 3 }
                ]}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={30}
                  color="black"
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mainControl}
              onPress={() => skipForward(30)}
              disabled={isBuffering}
            >
              <Ionicons
                name="play-skip-forward"
                size={30}
                color={isBuffering ? '#666' : 'white'}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryControl}>
              <Ionicons name="repeat" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View style={styles.additionalControls}>
            <TouchableOpacity
              style={styles.additionalButton}
              onPress={() => currentPodcast && toggleFavorite(currentPodcast)}
            >
              <Ionicons
                name={favorited ? 'heart' : 'heart-outline'}
                size={24}
                color={favorited ? '#ef4444' : '#9ca3af'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.additionalButton}
              onPress={() =>
                changePlaybackRate(
                  playbackRate >= 2 ? 0.75 : playbackRate + 0.25
                )
              }
            >
              <Text style={styles.speedText}>{playbackRate}x</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.additionalButton}>
              <Ionicons name="share-social-outline" size={24} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.additionalButton}>
              <Ionicons name="list-outline" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View style={styles.episode}>
            <Text style={styles.episodeTitle}>About this episode</Text>
            <Text style={styles.episodeDescription}>
              {currentPodcast.description || 'No description available.'}
            </Text>
            <Text style={styles.episodeDate}>
              Released: {currentPodcast.releaseDate}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 1000
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 0
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500'
  },
  headerButton: {
    padding: 8
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20
  },
  imageContainer: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 30,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#222',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  bufferingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bufferingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500'
  },
  podcastInfo: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%'
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4
  },
  creator: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center'
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: -10
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  timeText: {
    color: '#9ca3af',
    fontSize: 12
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 30
  },
  secondaryControl: {
    padding: 8
  },
  mainControl: {
    padding: 8
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  playButtonInner: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 30
  },
  additionalButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  speedText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500'
  },
  episode: {
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    marginBottom: 30
  },
  episodeTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  episodeDescription: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12
  },
  episodeDate: {
    color: '#9ca3af',
    fontSize: 12
  },
  ratesContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12
  },
  ratesTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8
  },
  rateButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  rateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    marginRight: 8,
    marginBottom: 8
  },
  activeRateButton: {
    backgroundColor: '#3b82f6'
  },
  rateText: {
    color: '#9ca3af',
    fontSize: 14
  },
  activeRateText: {
    color: 'white',
    fontWeight: '500'
  }
})

export default NowPlaying
