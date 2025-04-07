import React, { useState } from 'react'
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { usePodcast, Podcast } from '@/context/PodcastContext'

interface DownloadButtonProps {
  podcast: Podcast
  size?: number
  style?: any
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  podcast,
  size = 18,
  style
}) => {
  const {
    downloadPodcast,
    isDownloaded,
    removeDownload,
    downloads,
    isConnected
  } = usePodcast()
  const [isProcessing, setIsProcessing] = useState(false)

  const downloadItem = downloads.find((dl) => dl.id === podcast.id)
  const isDownloadComplete = isDownloaded(podcast.id)
  const isDownloading =
    downloadItem && downloadItem.progress > 0 && downloadItem.progress < 100

  const handlePress = async (e: any) => {
    e.stopPropagation()

    if (isDownloadComplete) {
      removeDownload(podcast.id)
      return
    }

    if (isDownloading) {
      return
    }

    if (!isConnected) {
      alert('No internet connection. Please connect to download podcasts.')
      return
    }

    if (!podcast.audioUrl) {
      alert('This podcast has no audio available for download.')
      return
    }

    setIsProcessing(true)
    try {
      await downloadPodcast(podcast)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const renderIcon = () => {
    if (isProcessing || isDownloading) {
      return <ActivityIndicator size="small" color="#9ca3af" />
    }

    if (isDownloadComplete) {
      return <Ionicons name="checkmark-circle" size={size} color="#10b981" />
    }

    return <Ionicons name="download-outline" size={size} color="#9ca3af" />
  }

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      disabled={isProcessing || isDownloading}
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
    >
      {renderIcon()}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default DownloadButton
