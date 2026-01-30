import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class PushNotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  async registerForPushNotifications() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#00a859",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        //console.log("Failed to get push token for push notification!");
        return null;
      }

      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error("Project ID not found");
        }

        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;

        //console.log("Expo push token:", token);
        this.expoPushToken = token;
        await AsyncStorage.setItem("fcm_token", token);
      } catch (error) {
        //console.error("Error getting push token:", error);
        return null;
      }
    } else {
      //console.log("Must use physical device for Push Notifications");
      return null;
    }

    return token;
  }

  getEndpointForRole(userRole, action) {
    const endpoints = {
      dispatcher: {
        save: "/dispatch/save-fcm-token",
        remove: "/dispatch/remove-fcm-token",
      },
      vendor: {
        save: "/vendor/save-fcm-token",
        remove: "/vendor/remove-fcm-token",
      },
    };

    return endpoints[userRole]?.[action] || endpoints.user[action];
  }

  async saveFCMTokenToBackend(token = null) {
    try {
      const fcmToken =
        token ||
        this.expoPushToken ||
        (await AsyncStorage.getItem("fcm_token"));
      //console.log("Saving FCM token to backend:", fcmToken);
      const userRole = await AsyncStorage.getItem("userRole");

      if (!fcmToken) {
        //console.log("No FCM token available to save");
        return false;
      }

      if (!userRole) {
        //console.log("No user role found");
        return false;
      }

      const endpoint = this.getEndpointForRole(userRole, "save");
      const response = await api.post(endpoint, {
        fcm_token: fcmToken,
      });

      if (response.status === 200 || response.data.status) {
        //console.log("FCM token saved successfully");
        await AsyncStorage.setItem("fcm_token_sent", "true");
        return true;
      } else {
        //console.log("Failed to save FCM token:", response.data);
        return false;
      }
    } catch (error) {
      //console.error("Error saving FCM token to backend:", error);
      return false;
    }
  }

  async removeFCMTokenFromBackend() {
    try {
      const fcmToken =
        this.expoPushToken || (await AsyncStorage.getItem("fcm_token"));

      if (!fcmToken) {
        //console.log("No FCM token to remove");
        return true;
      }

      const userRole = await AsyncStorage.getItem("userRole");

      if (!userRole) {
        //console.log("No user role found");
        await AsyncStorage.removeItem("fcm_token_sent");
        return true;
      }

      const endpoint = this.getEndpointForRole(userRole, "remove");
      const response = await api.post(endpoint, {
        fcm_token: fcmToken,
      });

      if (response.status === 200 || response.data.status) {
        //console.log("FCM token removed successfully");
        await AsyncStorage.removeItem("fcm_token_sent");
        return true;
      } else {
        //console.log("Failed to remove FCM token:", response.data);
        return false;
      }
    } catch (error) {
      //console.error("Error removing FCM token from backend:", error);
      await AsyncStorage.removeItem("fcm_token_sent");
      return false;
    }
  }

  setupNotificationListeners() {
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        //console.log("Notification received:", notification);
      },
    );

    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        //console.log("Notification response:", response);
      });
  }

  removeNotificationListeners() {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }

    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }

  async initialize() {
    this.setupNotificationListeners();

    const storedToken = await AsyncStorage.getItem("fcm_token");
    if (storedToken) {
      this.expoPushToken = storedToken;
    } else {
      await this.registerForPushNotifications();
    }
  }

  async cleanup() {
    // await this.removeFCMTokenFromBackend();
    await AsyncStorage.multiRemove(["fcm_token", "fcm_token_sent"]);
    this.removeNotificationListeners();
    this.expoPushToken = null;
  }
}

export default new PushNotificationService();
