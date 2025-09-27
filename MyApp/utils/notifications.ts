// utils/notifications.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request notification permissions
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminder-channel', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2196F3',
      sound: null,
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }
    
    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
    } catch (error) {
      console.warn('Error getting push token:', error);
    }
  } else {
    console.warn('Must use physical device for Push Notifications');
  }

  return token;
}

// Reminder type definition
export type Reminder = {
  id: string;
  reminder_type: string;
  due_date: string; // format: 'YYYY-MM-DD'
  due_time: string; // format: 'HH:mm' or 'HH:mm AM/PM'
  presentation_type?: string;
};

// Schedule a notification
export async function scheduleReminderNotification(reminder: Reminder) {
  try {
    // Parse the date and time
    const [year, month, day] = reminder.due_date.split('-');
    const timeStr = reminder.due_time;
    
    // Parse time (handles both 12-hour and 24-hour formats)
    let hours, minutes;
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      const [time, period] = timeStr.split(' ');
      const [h, m] = time.split(':');
      hours = parseInt(h);
      minutes = parseInt(m);
      
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
    } else {
      const [h, m] = timeStr.split(':');
      hours = parseInt(h);
      minutes = parseInt(m);
    }
    
    const notificationDate = new Date(
      parseInt(year),
      parseInt(month) - 1, // Month is 0-indexed
      parseInt(day),
      hours,
      minutes
    );

    // Check if the date is in the future
    if (notificationDate <= new Date()) {
      console.warn('Cannot schedule notification for past date');
      return null;
    }

    // Create notification content
    let title = `${reminder.reminder_type} Reminder`;
    let body = reminder.reminder_type;
    
    if (reminder.presentation_type) {
      body += ` - ${reminder.presentation_type}`;
    }
    
    // Add emoji based on reminder type
    if (reminder.reminder_type.toLowerCase().includes('exam')) {
      title = '' + title;
    } else if (reminder.reminder_type.toLowerCase().includes('presentation')) {
      title = '' + title;
    } else if (reminder.reminder_type.toLowerCase().includes('cat')) {
      title = ' ' + title;
    } else {
      title = '' + title;
    }

    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: { 
          reminderId: reminder.id,
          type: reminder.reminder_type 
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: notificationDate,
        channelId: 'reminder-channel',
      },
    });

    // Store notification ID for later cancellation
    await storeNotificationId(reminder.id, notificationId);
    
    console.log(`Notification scheduled for ${notificationDate.toLocaleString()}`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

// Store notification ID in AsyncStorage
export async function storeNotificationId(reminderId: string, notificationId: string) {
  try {
    const existingIds = await AsyncStorage.getItem('notificationIds');
    const notificationIds = existingIds ? JSON.parse(existingIds) : {};
    notificationIds[reminderId] = notificationId;
    await AsyncStorage.setItem('notificationIds', JSON.stringify(notificationIds));
  } catch (error) {
    console.error('Error storing notification ID:', error);
  }
}

// Get notification ID from AsyncStorage
export async function getNotificationId(reminderId: string) {
  try {
    const existingIds = await AsyncStorage.getItem('notificationIds');
    const notificationIds = existingIds ? JSON.parse(existingIds) : {};
    return notificationIds[reminderId];
  } catch (error) {
    console.error('Error getting notification ID:', error);
    return null;
  }
}

// Cancel a scheduled notification
export async function cancelReminderNotification(reminderId: string) {
  try {
    const notificationId = await getNotificationId(reminderId);
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      
      // Remove from storage
      const existingIds = await AsyncStorage.getItem('notificationIds');
      const notificationIds = existingIds ? JSON.parse(existingIds) : {};
      delete notificationIds[reminderId];
      await AsyncStorage.setItem('notificationIds', JSON.stringify(notificationIds));
      
      console.log('Notification cancelled for reminder:', reminderId);
    }
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

// Get all scheduled notifications (for debugging)
export async function getAllScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}