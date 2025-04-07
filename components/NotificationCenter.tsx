import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
  Dimensions,
  Platform
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { usePodcast, Notification } from '@/context/PodcastContext'
import { BlurView } from 'expo-blur'

// Toast notification that appears and disappears
const ToastNotification: React.FC<{ notification: Notification }> = ({
  notification
}) => {
  const { markNotificationAsRead } = usePodcast()
  const [fadeAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()

    // Fade out after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        markNotificationAsRead(notification.id)
      })
    }, 3000)

    return () => clearTimeout(timer)
  }, [notification.id])

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'rgba(16, 185, 129, 0.9)'
      case 'error':
        return 'rgba(239, 68, 68, 0.9)'
      default:
        return 'rgba(59, 130, 246, 0.9)'
    }
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return 'checkmark-circle'
      case 'error':
        return 'alert-circle'
      default:
        return 'information-circle'
    }
  }

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: getBackgroundColor(),
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              })
            }
          ]
        }
      ]}
    >
      <Ionicons name={getIcon()} size={22} color="white" />
      <Text style={styles.toastText}>{notification.message}</Text>
    </Animated.View>
  )
}

const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications
  } = usePodcast()

  const [showModal, setShowModal] = useState(false)
  // Get most recent unread notification for toast
  const latestUnread = notifications.find((n) => !n.read)

  const handleNotificationPress = (notification: Notification) => {
    // Only mark the notification as read when clicked
    markNotificationAsRead(notification.id)
  }

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const date = new Date(item.timestamp)
    const formattedTime = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })

    const getIcon = () => {
      switch (item.type) {
        case 'success':
          return 'checkmark-circle'
        case 'error':
          return 'alert-circle'
        default:
          return 'information-circle'
      }
    }

    const getIconColor = () => {
      switch (item.type) {
        case 'success':
          return '#10b981'
        case 'error':
          return '#ef4444'
        default:
          return '#3b82f6'
      }
    }

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.read && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationIcon}>
          <Ionicons name={getIcon()} size={20} color={getIconColor()} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{formattedTime}</Text>
        </View>
        {!item.read && <View style={styles.unreadIndicator} />}
      </TouchableOpacity>
    )
  }

  return (
    <>
      {/* Toast for latest unread notification */}
      {latestUnread && <ToastNotification notification={latestUnread} />}

      {/* Notification Bell Icon */}
      <TouchableOpacity
        style={styles.bellContainer}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="notifications-outline" size={20} color="#9ca3af" />
        {unreadNotificationsCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Notification Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 40 : 100}
          style={styles.blurView}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Notifications</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={markAllNotificationsAsRead}
                >
                  <Text style={styles.actionButtonText}>Mark All as Read</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.clearButton]}
                  onPress={clearNotifications}
                >
                  <Text style={styles.actionButtonText}>Clear All</Text>
                </TouchableOpacity>
              </View>

              {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={48}
                    color="#6b7280"
                  />
                  <Text style={styles.emptyText}>No notifications yet</Text>
                </View>
              ) : (
                <FlatList
                  data={notifications}
                  renderItem={renderNotificationItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.notificationList}
                />
              )}
            </View>
          </View>
        </BlurView>
      </Modal>
    </>
  )
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  bellContainer: {
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
  toast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    zIndex: 1000
  },
  toastText: {
    color: 'white',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500'
  },
  blurView: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    height: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1f2937',
    borderRadius: 20
  },
  clearButton: {
    backgroundColor: '#4b5563'
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500'
  },
  notificationList: {
    paddingHorizontal: 20
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    marginBottom: 10,
    padding: 12
  },
  unreadNotification: {
    backgroundColor: '#262f3f'
  },
  notificationIcon: {
    marginRight: 12
  },
  notificationContent: {
    flex: 1
  },
  notificationMessage: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4
  },
  notificationTime: {
    color: '#9ca3af',
    fontSize: 12
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginLeft: 8
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 16
  }
})

export default NotificationCenter
