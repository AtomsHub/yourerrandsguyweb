import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";

import { AuthProvider, useAuth } from "../context/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { View, ActivityIndicator } from "react-native";

import "../global.css";
import { CustomToast } from "../components/ui/Toast";

SplashScreen.preventAutoHideAsync();

const AppStack = () => {
  const { isLoggedIn, userRole, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "welcome" || segments[0] === "login";
    const inDispatcherGroup = segments[0] === "dispatcher";
    const inVendorGroup = segments[0] === "vendor";
    const inNotFound = segments[0] === "+not-found";

    if (!isLoggedIn) {
      // Not logged in - redirect to welcome if not already in auth screens
      if (!inAuthGroup && !inNotFound) {
        router.replace("/welcome");
      }
    } else {
      // Logged in - redirect based on role
      if (userRole === "dispatcher" && !inDispatcherGroup && !inNotFound) {
        router.replace("/dispatcher");
      } else if (userRole === "vendor" && !inVendorGroup && !inNotFound) {
        router.replace("/vendor");
      }
    }
  }, [isLoggedIn, userRole, isLoading, segments]);

  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#00a859" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="dispatcher" options={{ headerShown: false }} />
      <Stack.Screen name="vendor" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
    </Stack>
  );
};

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "SpaceGrotesk-Light": require("../assets/fonts/SpaceGrotesk-Light.ttf"),
    "SpaceGrotesk-SemiBold": require("../assets/fonts/SpaceGrotesk-SemiBold.ttf"),
    SpaceGrotesk: require("../assets/fonts/SpaceGrotesk-Regular.ttf"),
    "SpaceGrotesk-Medium": require("../assets/fonts/SpaceGrotesk-Medium.ttf"),
    "SpaceGrotesk-Bold": require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
    "Raleway-Black": require("../assets/fonts/Raleway-Black.ttf"),
    "Raleway-BlackItalic": require("../assets/fonts/Raleway-BlackItalic.ttf"),
    "Raleway-Bold": require("../assets/fonts/Raleway-Bold.ttf"),
    "Raleway-BoldItalic": require("../assets/fonts/Raleway-BoldItalic.ttf"),
    "Raleway-ExtraBold": require("../assets/fonts/Raleway-ExtraBold.ttf"),
    "Raleway-ExtraBoldItalic": require("../assets/fonts/Raleway-ExtraBoldItalic.ttf"),
    "Raleway-ExtraLight": require("../assets/fonts/Raleway-ExtraLight.ttf"),
    "Raleway-ExtraLightItalic": require("../assets/fonts/Raleway-ExtraLightItalic.ttf"),
    "Raleway-Light": require("../assets/fonts/Raleway-Light.ttf"),
    "Raleway-LightItalic": require("../assets/fonts/Raleway-LightItalic.ttf"),
    "Raleway-Medium": require("../assets/fonts/Raleway-Medium.ttf"),
    "Raleway-MediumItalic": require("../assets/fonts/Raleway-MediumItalic.ttf"),
    "Raleway-Regular": require("../assets/fonts/Raleway-Regular.ttf"),
    "Raleway-Italic": require("../assets/fonts/Raleway-Italic.ttf"),
    "Raleway-SemiBold": require("../assets/fonts/Raleway-SemiBold.ttf"),
    "Raleway-SemiBoldItalic": require("../assets/fonts/Raleway-SemiBoldItalic.ttf"),
    "Raleway-Thin": require("../assets/fonts/Raleway-Thin.ttf"),
    "Raleway-ThinItalic": require("../assets/fonts/Raleway-ThinItalic.ttf"),
  });

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded || error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AutocompleteDropdownContextProvider>
          <AppStack />
          <CustomToast />
        </AutocompleteDropdownContextProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
