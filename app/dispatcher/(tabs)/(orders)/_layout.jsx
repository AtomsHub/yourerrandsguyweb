import { Stack } from "expo-router";

export default function HomeTabLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="orders" options={{ headerShown: false }} />
        <Stack.Screen name="[id]" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
