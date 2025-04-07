import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,  // Setting to false to avoid issues
  }),
});

// Type for notification data
interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// A simplified function that doesn't require projectId
export async function registerForPushNotificationsAsync() {
  // On Android, create a notification channel
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('downloads', {
        name: 'Downloads',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
      });
    } catch (error) {
      console.log('Error setting up Android notification channel:', error);
    }
  }
  
  // Request permissions
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission for notifications was denied');
    }
  } catch (error) {
    console.log('Error requesting notification permissions:', error);
  }
  
  // We don't attempt to get a push token since we're only using local notifications
  return null;
}

// Function to send a local notification
export async function sendLocalNotification({
  title,
  body,
  data = {}
}: NotificationData) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // null means the notification shows immediately
    });
    
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

// Function to handle download complete notifications
export async function sendDownloadCompleteNotification(podcastTitle: string, podcastId: string) {
  return sendLocalNotification({
    title: 'Download Complete',
    body: `"${podcastTitle}" is ready to listen offline`,
    data: { type: 'download_complete' }
  });
}

// Function to handle download error notifications
export async function sendDownloadErrorNotification(podcastTitle: string, podcastId: string) {
  return sendLocalNotification({
    title: 'Download Failed',
    body: `"${podcastTitle}" could not be downloaded`,
    data: { type: 'download_error' }
  });
}