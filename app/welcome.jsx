import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import CustomButtom from "../components/ui/CustomButton";
import { images } from "../constants";
const { width } = Dimensions.get("window");

const OnboardingScreen = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const screens = [
    {
      id: 1,
      icon: "🍔",
      title: "Search for favorite food near you",
      subtitle: "Discover the best foods from over 3250 restaurants.",
      illustration: "da",
    },
    {
      id: 2,
      icon: "🛵",
      title: "Fast delivery to your place",
      subtitle: "Fast delivery to your home, office and wherever you are.",
      illustration: <Image source={images.onboarding2} />,
    },
    {
      id: 3,
      icon: "📍",
      title: "Tracking shipper on the map",
      subtitle: "Discover the foods from over 3250 restaurants.",
      illustration: "<Onboarding2 height={250} width={250} />",
    },
  ];

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  const scrollToIndex = (index) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
  };

  return (
    <View className="flex-1 ">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* Scrollable Content */}
      <View className="bg-primary-500 flex-1">
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          className="flex-1"
        >
          {screens.map((screen, index) => (
            <View
              key={screen.id}
              style={{ width }}
              className="flex-1 bg-white px-6 rounded-b-[40px] justify-center"
            >
              {/* Illustration */}
              <View className="items-center  justify-center">
                <Image
                  source={images.onboarding2}
                  className="w-[80vh] h-[45vh]"
                  resizeMode="contain"
                />
              </View>

              {/* Content */}
              <View className="pb-8">
                {/* Page Indicators */}
                <View className="flex-row justify-center mb-8">
                  {screens.map((_, dotIndex) => (
                    <View
                      key={dotIndex}
                      className={`w-2 h-2 rounded-full mx-1 ${
                        dotIndex === activeIndex
                          ? "bg-primary-500"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </View>

                {/* Title and Subtitle */}
                <View className=" items-center">
                  <Text className="text-3xl w-9/12 font-SpaceGrotesk-Bold  text-primary-900 text-center mb-2 leading-tight">
                    {screen.title}
                  </Text>
                  <Text className="text-base  font-Raleway-Regular text-gray-600 text-center leading-relaxed px-4">
                    {screen.subtitle}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      <View className="px-6 pb-16 pt-8 bg-primary">
        <View className="flex-row items-center justify-center pb-4 px-8 gap-x-5">
          <View className="h-0.5 bg-secondary-200 flex-1 rounded-full" />
          <Text className="text-white font-Raleway-Medium">Login as </Text>
          <View className="h-0.5 bg-secondary-200 flex-1 rounded-full" />
        </View>
        <View className="flex-row gap-x-4">
          <CustomButtom
            title={"Dispatcher"}
            containerStyles={"bg-secondary-900 flex-1"}
            textStyles={"text-white"}
            handlePress={() =>
              router.push({
                pathname: "./login",
                params: { role: "dispatcher" },
              })
            }
            // handlePress={() => router.replace("/dispatcher")}
          />

          <CustomButtom
            title={" Vendor"}
            containerStyles={"bg-white border-secondary flex-1"}
            textStyles={"text-primary"}
            handlePress={() =>
              router.push({
                pathname: "./login",
                params: { role: "vendor" },
              })
            }
          />
        </View>
      </View>
    </View>
  );
};

export default OnboardingScreen;
