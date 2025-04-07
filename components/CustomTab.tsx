import React, { useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { usePodcast } from '@/context/PodcastContext'

interface CustomTabProps {
  label: string
  iconName: keyof typeof Ionicons.glyphMap
  isActive: boolean
  onPress: () => void
}

export default function CustomTab({
  label,
  iconName,
  isActive,
  onPress
}: CustomTabProps) {
  const { showMiniPlayer } = usePodcast()
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start()

    onPress()
  }

  const tabButtonStyle = showMiniPlayer
    ? [styles.tabButton, styles.tabButtonWithPlayer]
    : styles.tabButton

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={tabButtonStyle}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {isActive ? (
          <View style={styles.activeTabContainer}>
            <Ionicons name={iconName} size={20} color="white" />
            <Text
              style={styles.activeTabLabel}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {label}
            </Text>
          </View>
        ) : (
          <Ionicons name={iconName} size={20} color="#9ca3af" />
        )}
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8
  },
  tabButtonWithPlayer: {
    paddingBottom: 4
  },
  activeTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    width: 120,
    borderRadius: 20
  },
  activeTabLabel: {
    color: 'white',
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '500'
  }
})
