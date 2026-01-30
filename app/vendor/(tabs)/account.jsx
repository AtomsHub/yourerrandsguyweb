import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useEffect, useState, useRef, useCallback } from "react";
import { FontAwesome5, AntDesign, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { images, getVendorMenuItems, formatCurrency } from "@/constants";
import useAuth from "@/hooks/useAuth";
import BackgroundLayout from "@/components/layout/BackgroundLayout";
import OptimizedImage from "../../../components/ui/OptimizedImage";

const Account = () => {
  const { handleLogout } = useAuth();
  const [personalDetails, setPersonalDetails] = useState({});

  // Bottom Sheet refs
  const personalDetailsBottomSheetRef = useRef(null);
  const documentsBottomSheetRef = useRef(null);

  // Bottom Sheet snap points
  const personalDetailsSnapPoints = ["25%", "85%"];
  const documentsSnapPoints = ["25%", "80%"];

  // Bottom Sheet handlers
  const handleOpenPersonalDetails = useCallback(() => {
    personalDetailsBottomSheetRef.current?.expand();
  }, []);

  const handleOpenDocuments = useCallback(() => {
    documentsBottomSheetRef.current?.expand();
  }, []);

  const handleClosePersonalDetails = useCallback(() => {
    personalDetailsBottomSheetRef.current?.close();
  }, []);

  // Custom backdrop component
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const menuItems = getVendorMenuItems(
    handleLogout,
    handleOpenPersonalDetails,
    handleOpenDocuments
  );

  useEffect(() => {
    const fetchstoredUserDataData = async () => {
      try {
        // Try to get dispatcher data first
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const dispatcherData = JSON.parse(storedUserData);
          setPersonalDetails(dispatcherData);
          //console.log(`[${new Date().toISOString()}] dispatcher retrieved:`, dispatcherData );
        }
      } catch (error) {
        //console.error("Error fetching dispatcher data:", error);
      }
    };

    fetchstoredUserDataData();
  }, []);

  return (
    <>
      <BackgroundLayout className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Header Section */}
          <View className="px-6 pb-8">
            <View className="items-center pt-10">
              {/* Profile Avatar with Status Indicator */}
              <OptimizedImage
                source={{
                  uri: `https://yourerrandsguy.com.ng/${personalDetails.image}`,
                }}
                fallbackSource={images.avatar}
                containerStyle="w-32 h-32 rounded-full  overflow-hidden bg-white items-center justify-center"
              />

              {/* User Info */}
              <Text className="text-2xl font-SpaceGrotesk-Bold text-gray-900 mt-4">
                {personalDetails.name ||
                  personalDetails.fullname ||
                  "Dispatcher"}
              </Text>
              <Text className="text-gray-500 font-Raleway-Medium">
                {personalDetails.address || "No address Found"}
              </Text>

              {/* Phone Number */}
              {personalDetails.phone_number && (
                <Text className="text-gray-600 font-Raleway-Regular text-sm mt-1">
                  📞 {personalDetails.phone_number}
                </Text>
              )}

              {/* Stats Cards */}
              <View className="flex-row mt-6 ">
                <LinearGradient
                  colors={["#00a859", "#33d66a"]}
                  className="px-5 py-3 shadow-md"
                  style={{
                    borderTopLeftRadius: 16,
                    borderBottomLeftRadius: 16,
                  }}
                >
                  <Text className="text-white font-SpaceGrotesk-Bold text-xl text-center">
                    {formatCurrency(
                      parseFloat(personalDetails.walletBalance) || 0
                    )}
                  </Text>
                  <Text className="text-white/90 text-sm font-Raleway-Medium text-center">
                    Wallet Balance
                  </Text>
                </LinearGradient>

                <LinearGradient
                  colors={["#fdcd11", "#fce77f"]}
                  className="px-5 py-3 shadow-md"
                  style={{
                    borderTopRightRadius: 16,
                    borderBottomRightRadius: 16,
                  }}
                >
                  <Text className="text-gray-800 font-SpaceGrotesk-Bold text-xl text-center">
                    {personalDetails.username}
                  </Text>
                  <Text className="text-gray-700 text-sm font-Raleway-Medium text-center">
                    Username
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Menu Sections */}
          <View className="px-6 pb-8">
            {menuItems.map((section, sectionIndex) => (
              <View key={sectionIndex} className="mb-8">
                <Text className="text-gray-500 font-SpaceGrotesk-Semibold text-sm mb-4 uppercase tracking-wider">
                  {section.category}
                </Text>
                <View className="gap-y-3">
                  {section.items.map((item, itemIndex) => (
                    <TouchableOpacity
                      key={itemIndex}
                      onPress={item.action}
                      activeOpacity={0.7}
                      className="overflow-hidden rounded-2xl shadow-sm"
                    >
                      <View className="bg-white p-5 border border-gray-100">
                        <View className="flex-row items-center">
                          {/* Icon Container */}
                          <LinearGradient
                            colors={item.gradient}
                            className="w-14 h-14 items-center justify-center shadow-md"
                            style={{ borderRadius: 16 }}
                          >
                            <item.icon
                              name={item.iconName}
                              size={22}
                              color={
                                item.gradient[0] === "#fdcd11" ||
                                item.gradient[0] === "#f7a505"
                                  ? "#4a5568"
                                  : "white"
                              }
                            />
                          </LinearGradient>

                          {/* Content */}
                          <View className="flex-1 ml-4">
                            <Text className="text-gray-900 font-SpaceGrotesk-Semibold text-lg">
                              {item.title}
                            </Text>
                            <Text className="text-gray-500 font-Raleway-Regular text-sm mt-1">
                              {item.subtitle}
                            </Text>
                          </View>

                          {/* Arrow */}
                          <View className="bg-gray-100 w-10 h-10 rounded-full items-center justify-center">
                            <FontAwesome5
                              name="chevron-right"
                              size={12}
                              color="#6B7280"
                            />
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </BackgroundLayout>

      {/* Personal Details Bottom Sheet */}
      <BottomSheet
        ref={personalDetailsBottomSheetRef}
        index={-1}
        snapPoints={personalDetailsSnapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        handleIndicatorStyle={{
          backgroundColor: "#D1D5DB",
          width: 50,
        }}
        backgroundStyle={{
          backgroundColor: "white",
          borderRadius: 24,
        }}
      >
        <View className="flex-1">
          {/* Bottom Sheet Header */}
          <LinearGradient
            colors={["#00a859", "#33d66a"]}
            className="px-6 py-6"
            style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-white font-SpaceGrotesk-Bold text-2xl">
                  Personal Details
                </Text>
                <Text className="text-white/90 font-Raleway-Regular text-sm mt-1">
                  Your account information
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClosePersonalDetails}
                className="bg-white/20 w-10 h-10 rounded-full items-center justify-center"
              >
                <AntDesign name="close" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Bottom Sheet Content */}
          <BottomSheetScrollView
            contentContainerStyle={{
              padding: 24,
              paddingBottom: 40,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-y-6">
              <View className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                <Text className="text-gray-500 font-SpaceGrotesk-Medium text-sm mb-2">
                  Name
                </Text>
                <Text className="text-gray-900 font-Raleway-SemiBold text-lg">
                  {personalDetails.name ||
                    personalDetails.fullname ||
                    "Not provided"}
                </Text>
              </View>

              <View className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                <Text className="text-gray-500 font-SpaceGrotesk-Medium text-sm mb-2">
                  Username
                </Text>
                <Text className="text-gray-900 font-Raleway-SemiBold text-lg">
                  {personalDetails.username || "Not provided"}
                </Text>
              </View>

              <View className="flex-row gap-x-4">
                <View className="flex-1 bg-gray-50 p-5 rounded-2xl border border-gray-200">
                  <Text className="text-gray-500 font-SpaceGrotesk-Medium text-sm mb-2">
                    Address
                  </Text>
                  <Text className="text-gray-900 font-Raleway-SemiBold text-lg">
                    {personalDetails.address ||
                      personalDetails.phone ||
                      "Not provided"}
                  </Text>
                </View>

                <View className="flex-1 bg-gray-50 p-5 rounded-2xl border border-gray-200">
                  <Text className="text-gray-500 font-SpaceGrotesk-Medium text-sm mb-2">
                    Description
                  </Text>
                  <Text className="text-gray-900 font-Raleway-SemiBold text-lg">
                    {personalDetails.description ||
                      personalDetails.dob ||
                      "Not provided"}
                  </Text>
                </View>
              </View>

              {/* Status Card */}
              <View className="mt-4 p-5 bg-primary-100 rounded-2xl border border-primary-200">
                <View className="flex-row items-center mb-3">
                  <LinearGradient
                    colors={["#00a859", "#33d66a"]}
                    className="w-8 h-8 rounded-full items-center justify-center"
                  >
                    <FontAwesome5 name="shield-alt" size={14} color="white" />
                  </LinearGradient>
                  <Text className="text-primary-800 font-SpaceGrotesk-Semibold text-base ml-3">
                    Vendor Status
                  </Text>
                </View>
                <Text className="text-primary-700 font-Raleway-Medium">
                  Your Vendor account is active and verified
                </Text>
              </View>
            </View>
          </BottomSheetScrollView>
        </View>
      </BottomSheet>
    </>
  );
};

export default Account;
