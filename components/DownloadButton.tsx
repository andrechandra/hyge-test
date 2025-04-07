import React, { useState, useCallback } from 'react'
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  View,
  Text,
  Image,
  TouchableWithoutFeedback
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import {
  usePodcast,
  Podcast,
  DownloadedPodcast
} from '@/context/PodcastContext'

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

  // Add state for the confirmation modal
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [podcastToDelete, setPodcastToDelete] =
    useState<DownloadedPodcast | null>(null)

  const downloadItem = downloads.find((dl) => dl.id === podcast.id)
  const isDownloadComplete = isDownloaded(podcast.id)
  const isDownloading =
    downloadItem && downloadItem.progress > 0 && downloadItem.progress < 100

  const handlePress = async (e: any) => {
    e.stopPropagation()

    if (isDownloadComplete && downloadItem) {
      setPodcastToDelete(downloadItem)
      setModalVisible(true)
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

  const dismissModal = useCallback(() => {
    setModalVisible(false)
    setPodcastToDelete(null)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (podcastToDelete) {
      removeDownload(podcastToDelete.id)
      setModalVisible(false)
      setPodcastToDelete(null)
    }
  }, [podcastToDelete, removeDownload])

  const renderIcon = () => {
    if (isProcessing || isDownloading) {
      return <ActivityIndicator size="small" color="#9ca3af" />
    }

    if (isDownloadComplete) {
      return <Ionicons name="checkmark-circle" size={size} color="#10b981" />
    }

    return <Ionicons name="download-outline" size={size} color="#9ca3af" />
  }

  const renderConfirmationModal = useCallback(() => {
    if (!podcastToDelete) return null

    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={dismissModal}
      >
        <TouchableWithoutFeedback onPress={dismissModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Confirm Deletion</Text>
                  <TouchableOpacity onPress={dismissModal}>
                    <Ionicons name="close" size={24} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalContent}>
                  <View style={styles.modalPodcastInfo}>
                    <View style={styles.modalImageContainer}>
                      {typeof podcastToDelete.image === 'string' ? (
                        <Image
                          source={{ uri: podcastToDelete.image }}
                          style={styles.modalImage}
                          defaultSource={require('../assets/images/icon.png')}
                        />
                      ) : (
                        <Image
                          source={podcastToDelete.image}
                          style={styles.modalImage}
                        />
                      )}
                    </View>
                    <View style={styles.modalTextContainer}>
                      <Text style={styles.modalPodcastTitle} numberOfLines={2}>
                        {podcastToDelete.title}
                      </Text>
                      <Text style={styles.modalPodcastMeta}>
                        {podcastToDelete.creator} • {podcastToDelete.episode}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.modalMessage}>
                    Are you sure you want to delete this downloaded episode?
                    This action cannot be undone.
                  </Text>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={dismissModal}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.deleteButton]}
                      onPress={handleDeleteConfirm}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }, [modalVisible, podcastToDelete, dismissModal, handleDeleteConfirm])

  return (
    <>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={handlePress}
        disabled={isProcessing || isDownloading}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        {renderIcon()}
      </TouchableOpacity>
      {renderConfirmationModal()}
    </>
  )
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: 340
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white'
  },
  modalContent: {
    padding: 16
  },
  modalPodcastInfo: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center'
  },
  modalImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#0a547a'
  },
  modalImage: {
    width: '100%',
    height: '100%'
  },
  modalTextContainer: {
    flex: 1
  },
  modalPodcastTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginBottom: 4
  },
  modalPodcastMeta: {
    fontSize: 14,
    color: '#9ca3af'
  },
  modalMessage: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 20,
    lineHeight: 20
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8
  },
  cancelButton: {
    backgroundColor: '#374151'
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14
  },
  deleteButton: {
    backgroundColor: '#ef4444'
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14
  }
})

export default DownloadButton
