import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const VendorLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="payment-history" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default VendorLayout;
