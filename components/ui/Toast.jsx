// components/Toast.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const styles = StyleSheet.create({
  toastContainer: {
    minHeight: 60,
    width: "92%",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999999999999999,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerText: {
    fontFamily: "SpaceGrotesk-SemiBold",
    fontSize: 16,
    marginBottom: 2,
  },
  messageText: {
    fontFamily: "Raleway-Regular",
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  successContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ccf2e0",
  },
  errorContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fed7d7",
  },
  infoContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#bee3f8",
  },
  warningContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fef6d8",
  },
});

export const toastConfig = {
  success: ({ text2 }) => (
    <View style={[styles.toastContainer, styles.successContainer]}>
      <View style={[styles.iconContainer, { backgroundColor: "#00a859" }]}>
        <Ionicons name="checkmark" size={22} color="white" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.headerText, { color: "#00a859" }]}>Success</Text>
        <Text style={[styles.messageText, { color: "#0f613f" }]} numberOfLines={0}>
          {text2}
        </Text>
      </View>
    </View>
  ),
  
  error: ({ text2 }) => (
    <View style={[styles.toastContainer, styles.errorContainer]}>
      <View style={[styles.iconContainer, { backgroundColor: "#e53e3e" }]}>
        <Ionicons name="close" size={22} color="white" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.headerText, { color: "#e53e3e" }]}>Error</Text>
        <Text style={[styles.messageText, { color: "#c53030" }]} numberOfLines={0}>
          {text2}
        </Text>
      </View>
    </View>
  ),
  
  info: ({ text2 }) => (
    <View style={[styles.toastContainer, styles.infoContainer]}>
      <View style={[styles.iconContainer, { backgroundColor: "#3182ce" }]}>
        <Ionicons name="information" size={22} color="white" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.headerText, { color: "#3182ce" }]}>Info</Text>
        <Text style={[styles.messageText, { color: "#2c5282" }]} numberOfLines={0}>
          {text2}
        </Text>
      </View>
    </View>
  ),
  
  warning: ({ text2 }) => (
    <View style={[styles.toastContainer, styles.warningContainer]}>
      <View style={[styles.iconContainer, { backgroundColor: "#fdcd11" }]}>
        <Ionicons name="warning" size={22} color="#4a5568" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.headerText, { color: "#d69e2e" }]}>Warning</Text>
        <Text style={[styles.messageText, { color: "#b7791f" }]} numberOfLines={0}>
          {text2}
        </Text>
      </View>
    </View>
  ),
};

export const CustomToast = () => {
  return <Toast config={toastConfig} />;
};

export const showToast = (type, message, options = {}) => {
  Toast.show({
    type,
    text2: message,
    position: options.position || "top",
    visibilityTime: options.duration || 4000,
    autoHide: options.autoHide !== false,
    topOffset: options.topOffset || 60,
    bottomOffset: options.bottomOffset || 40,
    ...options,
  });
};