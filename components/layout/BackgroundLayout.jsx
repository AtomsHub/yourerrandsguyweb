import React from "react";
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const BackgroundLayout = ({
  children,
  colors = ["#e8faf2", "#f2fcf8", "#fff"], // Default gradient
  statusBarStyle = "dark-content",
  statusBarBackgroundColor = "transparent",
  keyboardBehavior = Platform.OS === "ios" ? "padding" : "height",
  header = false,
  title = "",
  description = "",
  showBack = true,
  showCart = true,
  handleCartPress = () => router.push("cart"),
  cartItems = [],
}) => {
  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("dispatcher/orders"); // fallback to home
    }
  };

  return (
    <>
      {/* Status Bar */}
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarBackgroundColor}
        translucent={true}
      />

      {/* Main Layout */}
      <LinearGradient
        colors={colors}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }} className="h-full w-full pt-6">
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={keyboardBehavior}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
          >
            {/* Header */}
            {header && (
              <View className="px-4 mb-8">
                <View className="flex-row justify-between items-center">
                  {showBack ? (
                    <TouchableOpacity
                      onPress={handleBackPress}
                      className="p-3 rounded-full bg-white"
                    >
                      <Ionicons name="arrow-back" size={20} color="#000" />
                    </TouchableOpacity>
                  ) : (
                    <View className="w-10" /> // placeholder for spacing
                  )}

                  <View className="flex-1 items-center">
                    <Text className="font-Raleway-SemiBold text-lg text-gray-900 text-center">
                      {title}
                    </Text>
                    {description ? (
                      <Text className="font-Raleway-Light text-sm text-gray-600 text-center w-10/12">
                        {description}
                      </Text>
                    ) : null}
                  </View>

                  <TouchableOpacity className="w-10 h-10" />
                  {showCart && (
                    <TouchableOpacity
                      onPress={handleCartPress}
                      className="p-3 rounded-full bg-white"
                    >
                      <Ionicons name="cart" size={20} color="#000" />
                      {cartItems.length > 0 && (
                        <View className="absolute top-0 right-0 bg-red-500 rounded-full h-5 w-5 items-center justify-center">
                          <Text className="text-white text-xs font-bold">
                            {cartItems.length}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {children}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

export default BackgroundLayout;
