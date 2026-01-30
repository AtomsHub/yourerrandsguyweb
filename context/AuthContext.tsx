import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PushNotificationService from "../services/PushNotificationService";

// Define the shape of the auth context
interface AuthContextType {
  isLoggedIn: boolean;
  userRole: string | null;
  userData: any;
  token: string | null;
  isLoading: boolean;
  login: (userData: any, token: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

// Create context with proper typing
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
    initializePushNotifications();
  }, []);

  // Initialize push notifications on app start
  const initializePushNotifications = async () => {
    try {
      await PushNotificationService.initialize();
    } catch (error) {
      //console.error("Error initializing push notifications:", error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);

      const [storedIsLoggedIn, storedUserRole, storedUserData, storedToken] =
        await Promise.all([
          AsyncStorage.getItem("isLoggedIn"),
          AsyncStorage.getItem("userRole"),
          AsyncStorage.getItem("userData"),
          AsyncStorage.getItem("token"),
        ]);

      //console.log("Stored auth data:", {
      //   isLoggedIn: storedIsLoggedIn,
      //   userRole: storedUserRole,
      //   hasUserData: !!storedUserData,
      //   hasToken: !!storedToken,
      // });

      // If logged in but no role found, clear auth state
      if (storedIsLoggedIn === "true" && !storedUserRole) {
        //console.log("Logged in but no role found, clearing auth state");
        await clearAuthData();
        return;
      }

      // Validate role if logged in
      if (storedIsLoggedIn === "true" && storedUserRole) {
        const validRoles = ["dispatcher", "vendor"];
        if (!validRoles.includes(storedUserRole)) {
          //console.log("Invalid role found, clearing auth state");
          await clearAuthData();
          return;
        }
      }

      // Set auth state
      const isUserLoggedIn = storedIsLoggedIn === "true";
      setIsLoggedIn(isUserLoggedIn);
      setUserRole(storedUserRole);
      setUserData(storedUserData ? JSON.parse(storedUserData) : null);
      setToken(storedToken);

      // If user is logged in, ensure FCM token is sent to backend
      if (isUserLoggedIn && storedToken) {
        await setupPushNotifications();
      }
    } catch (error) {
      //console.error("Error checking auth status:", error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const setupPushNotifications = async () => {
    try {
      // Check if FCM token was already sent
      const fcmTokenSent = await AsyncStorage.getItem("fcm_token_sent");

      if (fcmTokenSent !== "true") {
        // Register for notifications and send token to backend
        const fcmToken =
          await PushNotificationService.registerForPushNotifications();
        if (fcmToken) {
          await PushNotificationService.saveFCMTokenToBackend(fcmToken as any);
          //console.log("Push notifications setup completed");
        }
      }
    } catch (error) {
      //console.error("Error setting up push notifications:", error);
      // Don't fail the auth process if push notification setup fails
    }
  };

  const login = async (userData: any, token: string, role: string) => {
    try {
      // Validate role
      const validRoles = ["dispatcher", "vendor"];
      if (!validRoles.includes(role)) {
        throw new Error("Invalid user role");
      }

      // Store in AsyncStorage
      await Promise.all([
        AsyncStorage.setItem("userData", JSON.stringify(userData)),
        AsyncStorage.setItem("token", token),
        AsyncStorage.setItem("isLoggedIn", "true"),
        AsyncStorage.setItem("userRole", role),
      ]);

      // Update state
      setIsLoggedIn(true);
      setUserRole(role);
      setUserData(userData);
      setToken(token);

      //console.log("Login successful:", { role, userId: userData?.id });

      // Setup push notifications after successful login
      await setupPushNotifications();
    } catch (error) {
      //console.error("Error during login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clean up push notifications first
      await PushNotificationService.cleanup();

      // Then clear auth data
      await clearAuthData();

      //console.log("Logout successful");
    } catch (error) {
      //console.error("Error during logout:", error);
    }
  };

  const clearAuthData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem("userData"),
        AsyncStorage.removeItem("token"),
        AsyncStorage.removeItem("isLoggedIn"),
        AsyncStorage.removeItem("userRole"),
      ]);

      setIsLoggedIn(false);
      setUserRole(null);
      setUserData(null);
      setToken(null);
    } catch (error) {
      //console.error("Error clearing auth data:", error);
    }
  };

  const value: AuthContextType = {
    isLoggedIn,
    userRole,
    userData,
    token,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
