import React, { useCallback, useState, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  FlatList,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { usePodcast, DownloadedPodcast } from '@/context/PodcastContext'
import MiniPlayer from '@/components/MiniPlayer'
import NowPlaying from '@/components/NowPlaying'

const PODCASTS_PER_PAGE = 10

export default function DownloadsScreen(): JSX.Element {
  const { downloads, removeDownload, playPodcast } = usePodcast()

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [paginatedDownloads, setPaginatedDownloads] = useState<
    DownloadedPodcast[]
  >([])
  const [hasMorePages, setHasMorePages] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [podcastToDelete, setPodcastToDelete] =
    useState<DownloadedPodcast | null>(null)

  useEffect(() => {
    const sortedDownloads = [...downloads].sort((a, b) => {
      if (a.progress === 100 && b.progress < 100) return -1
      if (a.progress < 100 && b.progress === 100) return 1

      const dateA = new Date(a.downloadDate).getTime()
      const dateB = new Date(b.downloadDate).getTime()
      return dateB - dateA
    })

    const startIndex = 0
    const endIndex = currentPage * PODCASTS_PER_PAGE

    const downloadsToShow = sortedDownloads.slice(startIndex, endIndex)
    setPaginatedDownloads(downloadsToShow)

    setHasMorePages(sortedDownloads.length > endIndex)
  }, [downloads, currentPage])

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMorePages) {
      setIsLoading(true)
      setTimeout(() => {
        setCurrentPage((prevPage) => prevPage + 1)
        setIsLoading(false)
      }, 500)
    }
  }, [isLoading, hasMorePages])

  const handleDeleteConfirm = useCallback(() => {
    if (podcastToDelete) {
      removeDownload(podcastToDelete.id)
      setModalVisible(false)
      setPodcastToDelete(null)
    }
  }, [podcastToDelete, removeDownload])

  const handleDeleteRequest = useCallback((podcast: DownloadedPodcast) => {
    setPodcastToDelete(podcast)
    setModalVisible(true)
  }, [])

  const dismissModal = useCallback(() => {
    setModalVisible(false)
    setPodcastToDelete(null)
  }, [])

  const renderDownloadItem = useCallback(
    ({ item, index }: { item: DownloadedPodcast; index: number }) => (
      <TouchableOpacity
        key={item.id}
        style={styles.downloadItem}
        onPress={() => playPodcast(item)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.downloadImageContainer,
            {
              backgroundColor:
                index % 3 === 0
                  ? '#0a547a'
                  : index % 3 === 1
                  ? '#3a5834'
                  : '#6d3030'
            }
          ]}
        >
          {typeof item.image === 'string' ? (
            <Image
              source={{ uri: item.image }}
              style={styles.downloadImage}
              defaultSource={require('../../assets/images/icon.png')}
            />
          ) : (
            <Image source={item.image} style={styles.downloadImage} />
          )}
          {item.progress < 100 ? (
            <View style={styles.progressIndicator}>
              <Text style={styles.progressText}>{item.progress}%</Text>
            </View>
          ) : (
            <View style={styles.downloadedIndicator}>
              <Ionicons name="checkmark-circle" size={12} color="#10b981" />
            </View>
          )}
        </View>
        <View style={styles.downloadInfo}>
          <Text style={styles.downloadTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.downloadMeta} numberOfLines={1}>
            {item.creator} • {item.episode}
          </Text>
          <View style={styles.downloadDetails}>
            <Text style={styles.downloadDate}>
              {item.progress < 100 ? 'Downloading... ' : 'Downloaded: '}
              {item.downloadDate}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.downloadActions}
          onPress={(e) => {
            e.stopPropagation()
            handleDeleteRequest(item)
          }}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons
            name={
              item.progress === 100 ? 'trash-outline' : 'close-circle-outline'
            }
            size={18}
            color="#9ca3af"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [playPodcast, handleDeleteRequest]
  )

  const renderLoadMoreButton = useCallback(() => {
    if (!hasMorePages) return null

    return (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={handleLoadMore}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Text style={styles.loadMoreText}>Load More</Text>
            <Ionicons name="chevron-down" size={16} color="white" />
          </>
        )}
      </TouchableOpacity>
    )
  }, [hasMorePages, handleLoadMore, isLoading])

  const renderListFooter = useCallback(() => {
    if (paginatedDownloads.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.paginationInfo}>
            Showing {paginatedDownloads.length} of {downloads.length} episodes
          </Text>
          {renderLoadMoreButton()}
        </View>
      )
    }

    return null
  }, [paginatedDownloads.length, downloads.length, renderLoadMoreButton])

  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="download-outline" size={60} color="#9ca3af" />
        <Text style={styles.emptyTitle}>No downloads</Text>
        <Text style={styles.emptyMessage}>
          Downloaded episodes will appear here for offline listening
        </Text>
      </View>
    ),
    []
  )

  const renderConfirmationModal = useCallback(
    () => (
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

                {podcastToDelete && (
                  <View style={styles.modalContent}>
                    <View style={styles.modalPodcastInfo}>
                      <View style={styles.modalImageContainer}>
                        {typeof podcastToDelete.image === 'string' ? (
                          <Image
                            source={{ uri: podcastToDelete.image }}
                            style={styles.modalImage}
                            defaultSource={require('../../assets/images/icon.png')}
                          />
                        ) : (
                          <Image
                            source={podcastToDelete.image}
                            style={styles.modalImage}
                          />
                        )}
                      </View>
                      <View style={styles.modalTextContainer}>
                        <Text
                          style={styles.modalPodcastTitle}
                          numberOfLines={2}
                        >
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
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    ),
    [modalVisible, podcastToDelete, dismissModal, handleDeleteConfirm]
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerContainer}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Downloads</Text>
        </View>

        <View style={styles.headerActions}>
          <Text style={styles.episodeCount}>{downloads.length} Episodes</Text>
        </View>
      </View>

      <FlatList
        data={paginatedDownloads}
        renderItem={renderDownloadItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.downloadsListContent,
          paginatedDownloads.length === 0 && styles.emptyListContainer
        ]}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderListFooter}
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      {renderConfirmationModal()}
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
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  headerButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500'
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  episodeCount: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500'
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  downloadsListContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 190 : 160
  },
  downloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8
  },
  downloadImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  downloadImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  },
  progressIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 2,
    alignItems: 'center'
  },
  progressText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600'
  },
  downloadInfo: {
    flex: 1,
    marginRight: 8
  },
  downloadTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white'
  },
  downloadMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2
  },
  downloadDetails: {
    flexDirection: 'row',
    marginTop: 4
  },
  downloadDate: {
    fontSize: 11,
    color: '#6b7280'
  },
  downloadActions: {
    padding: 4
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 16
  },
  paginationInfo: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 8
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center'
  },
  loadMoreText: {
    color: 'white',
    fontWeight: '500',
    marginRight: 4
  },
  downloadedIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    padding: 2
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
