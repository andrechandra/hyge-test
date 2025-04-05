import { Tabs } from 'expo-router'
import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import CustomTab from '@/components/CustomTab'

export default function TabLayout() {
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
    { name: 'explore', label: 'Explore', iconName: 'grid-outline' },
    { name: 'favorites', label: 'Favorites', iconName: 'heart-outline' },
    { name: 'downloads', label: 'Downloads', iconName: 'download-outline' }
  ]

  const navigateTo = (routeName: string) => {
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
    <>
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
          name="explore"
          options={{
            href: '/explore'
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

      <View style={styles.tabBarContainer}>
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
    </>
  )
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: '#222',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 0,
    left: 0,
    right: 0,
    justifyContent: 'space-between',
    zIndex: 100,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15
  }
})
