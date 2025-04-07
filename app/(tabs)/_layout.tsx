import { Tabs } from 'expo-router'
import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import CustomTab from '@/components/CustomTab'
import { PodcastProvider } from '@/context/PodcastContext'
import MiniPlayer from '@/components/MiniPlayer'
import NowPlaying from '@/components/NowPlaying'

export default function TabLayout(): JSX.Element {
  const pathname = usePathname()
  const router = useRouter()
  const isHomeActive = pathname === '/' || pathname === '/index'

  type TabItem = {
    name: string
    label: string
    iconName: keyof typeof Ionicons.glyphMap
  }

  const tabs: TabItem[] = [
    { name: '', label: 'Home', iconName: 'home-outline' },
    { name: 'favorites', label: 'Favorites', iconName: 'heart-outline' },
    { name: 'downloads', label: 'Downloads', iconName: 'download-outline' }
  ]

  const navigateTo = (routeName: string): void => {
    if (
      (routeName === '' && isHomeActive) ||
      (routeName !== '' && pathname === `/${routeName}`)
    ) {
      return
    }

    if (routeName === '') {
      router.replace('/')
    } else {
      router.replace(`/${routeName}` as any)
    }
  }

  return (
    <PodcastProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: 'none'
          }
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            href: '/'
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            href: '/favorites'
          }}
        />
        <Tabs.Screen
          name="downloads"
          options={{
            href: '/downloads'
          }}
        />
      </Tabs>
      <MiniPlayer />
      <NowPlaying />
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBarBackground} />
        {tabs.map((tab) => (
          <CustomTab
            key={tab.name}
            label={tab.label}
            iconName={tab.iconName}
            isActive={
              tab.name === '' ? isHomeActive : pathname === `/${tab.name}`
            }
            onPress={() => navigateTo(tab.name)}
          />
        ))}
      </View>
    </PodcastProvider>
  )
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'space-around',
    zIndex: 90,
    paddingBottom: Platform.OS === 'ios' ? 35 : 15
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderColor: '#222'
  }
})
