import { View, Text, StyleSheet } from "react-native";
import { Tabs, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const TabIcon = ({
  focused,
  name,
  focusedIconName,
  IconName,
  size,
  otherStyles,
}) => {
  return (
    <View className="items-center flex-1">
      <View className={`${otherStyles}`}>
        {focused ? (
          <Ionicons name={focusedIconName} size={size} color="#00a859" />
        ) : (
          <Ionicons name={IconName} size={size} color="#a4a4a4" />
        )}
      </View>
      <Text
        className={`font-SpaceGrotesk-Regular ${focused ? " font-SpaceGrotesk-SemiBold text-primary" : "text-gray-textDisabled"} text-xs w-full`}
      >
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 55,
            paddingTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name="Home"
                focusedIconName="storefront-sharp"
                IconName="storefront-outline"
                size={24}
                otherStyles="mt-[4px]"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="(orders)"
          options={{
            title: "Orders",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name="Orders"
                focusedIconName="car-sharp"
                IconName="car-outline"
                size={30}
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="account"
          options={{
            title: "Account",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name="Account"
                focusedIconName="person-circle-sharp"
                IconName="person-circle-outline"
                size={27}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  icon: {
    marginTop: 10,
  },
});
export default TabsLayout;
