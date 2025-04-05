import React from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Pressable
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

export default function DownloadsScreen() {
  const downloads = [
    {
      id: 1,
      title: 'The Future of AI',
      creator: 'Tech Visionaries',
      episode: 'Episode 32',
      downloadDate: 'Mar 30, 2023',
      progress: 75,
      image: require('../../assets/images/icon.png')
    },
    {
      id: 2,
      title: 'Financial Freedom',
      creator: 'Money Matters',
      episode: 'Episode 17',
      downloadDate: 'Mar 28, 2023',
      progress: 100,
      image: require('../../assets/images/icon.png')
    },
    {
      id: 3,
      title: 'Healthy Living',
      creator: 'Wellness Today',
      episode: 'Episode 09',
      downloadDate: 'Mar 25, 2023',
      progress: 30,
      image: require('../../assets/images/icon.png')
    }
  ]

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerContainer}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Downloads</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerActions}>
          <Text style={styles.episodeCount}>{downloads.length} Episodes</Text>
          <TouchableOpacity>
            <Ionicons name="options-outline" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      {downloads.length > 0 ? (
        <ScrollView
          style={styles.downloadsList}
          contentContainerStyle={styles.downloadsListContent}
        >
          {downloads.map((item, index) => (
            <Pressable
              key={item.id}
              style={styles.downloadItem}
              android_ripple={{ color: '#333333' }}
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
                <Image source={item.image} style={styles.downloadImage} />
                {item.progress < 100 && (
                  <View style={styles.progressIndicator}>
                    <Text style={styles.progressText}>{item.progress}%</Text>
                  </View>
                )}
              </View>
              <View style={styles.downloadInfo}>
                <Text style={styles.downloadTitle}>{item.title}</Text>
                <Text style={styles.downloadMeta}>
                  {item.creator} • {item.episode}
                </Text>
                <View style={styles.downloadDetails}>
                  <Text style={styles.downloadDate}>{item.downloadDate}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.downloadActions}>
                <Ionicons
                  name={
                    item.progress < 100
                      ? 'pause-circle-outline'
                      : 'play-circle-outline'
                  }
                  size={28}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="download-outline" size={60} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No downloads</Text>
          <Text style={styles.emptyMessage}>
            Downloaded episodes will appear here for offline listening
          </Text>
        </View>
      )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white'
  },
  downloadsList: {
    flex: 1
  },
  downloadsListContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 140 : 100
  },
  downloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderRadius: 8
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
    width: 64,
    height: 64,
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
    flex: 1
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
    marginLeft: 8,
    padding: 4
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  }
})
