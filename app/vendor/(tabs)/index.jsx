import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import BackgroundLayout from "@/components/layout/BackgroundLayout";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import OptimizedImage from "@/components/ui/OptimizedImage";
import images from "@/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency, formatDetailedDate } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/api";
import { router } from "expo-router";
import Modal from "react-native-modal";
import FormField from "@/components/inputs/FormField";
import CustomButton from "@/components/ui/CustomButton";
import OrderCard from "@/components/cards/VendorOrderCard";

const Home = () => {
  const [personalDetails, setPersonalDetails] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchStoredUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const vendorData = JSON.parse(storedUserData);
          setPersonalDetails(vendorData);
        }

        // Get the last updated timestamp
        const lastUpdate = await AsyncStorage.getItem("lastDashboardUpdate");
        if (lastUpdate) {
          setLastUpdated(new Date(lastUpdate));
        }
      } catch (error) {
        //console.error("Error fetching Vendor data:", error);
      }
    };
    fetchStoredUserData();
  }, []);

  useEffect(() => {
    // Validate amount
    const amountErrors = { ...errors };

    if (amount.length > 0) {
      const isNumber = /^\d*\.?\d+$/.test(amount);
      const parsedAmount = parseFloat(amount);

      if (!isNumber || parsedAmount <= 0) {
        amountErrors.amount = "Amount must be a positive number.";
      } else {
        amountErrors.amount = "";
      }
    } else {
      amountErrors.amount = "";
    }
    setErrors(amountErrors);

    // Check form validity
    const isAmountValid = amount.length > 0 && !amountErrors.amount;
    setIsFormValid(isAmountValid);
  }, [amount]);

  const withdraw = async () => {
    setCompleting(true);
    try {
      const response = await api.post("/vendor/sendMoney", {
        amount,
      });

      if (response.data.status) {
        setIsModalVisible(false);
        showToast("success", response.data.message || "Transfer successful");
        setAmount("");
        // router.push("/history");
      }
    } catch (error) {
      setIsModalVisible(false);
      const errorMsg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Transfer failed";
      showToast("error", errorMsg);
    } finally {
      setCompleting(false);
    }
  };

  const getDashboard = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const response = await api.get("/vendor/dashboard");

      if (response.data.status) {
        const { user, orders } = response.data.data;
        //console.log("Fetched:", JSON.stringify(orders[0], null, 2));

        // Sort orders by created_at
        const sortedData = orders.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );

        setOrders(sortedData);

        // Set the update timestamp
        const updateTime = new Date();
        setLastUpdated(updateTime);

        await Promise.all([
          AsyncStorage.setItem("userData", JSON.stringify(user)),
          AsyncStorage.setItem("dashboardOrder", JSON.stringify(sortedData)),
          AsyncStorage.setItem("lastDashboardUpdate", updateTime.toISOString()),
        ]);
      }
    } catch (error) {
      //console.error("Error fetching orders:", error);

      // Fallback to stored data
      const storedOrder = await AsyncStorage.getItem("dashboardOrder");
      if (storedOrder) {
        const parsedOrders = JSON.parse(storedOrder);
        setOrders(parsedOrders);
      }

      // Get the last updated timestamp from storage
      const lastUpdate = await AsyncStorage.getItem("lastDashboardUpdate");
      if (lastUpdate) {
        setLastUpdated(new Date(lastUpdate));
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleRefresh = () => {
    getDashboard(true);
  };

  useEffect(() => {
    getDashboard(false);
  }, []);

  return (
    <BackgroundLayout className="flex-1">
      <View className="px-6 mb-4 gap-4">
        {/* Top Bar */}
        <View className="flex flex-row justify-between items-center">
          <View className="flex-row gap-x-3 items-center">
            <OptimizedImage
              source={{
                uri: personalDetails.image,
              }}
              fallbackSource={images.avatar}
              containerStyle="w-[45px] h-[45px] rounded-full overflow-hidden bg-white items-center justify-center"
            />
            <View>
              <Text className="font-Raleway-Light text-xs text-gray-600">
                Welcome Back 👋
              </Text>
              <Text className="font-Raleway-SemiBold text-xl">
                {personalDetails.name || "Guest User"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRefresh}
            className="bg-white border border-gray-200 p-4 rounded-full shadow-sm"
          >
            <FontAwesome
              name={loading ? "refresh" : "bell-o"}
              size={18}
              color={loading ? "#00a859" : "black"}
              style={loading ? { transform: [{ rotate: "180deg" }] } : {}}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 w-full h-full px-6"
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={["#00a859"]}
            tintColor="#00a859"
          />
        }
      >
        <View className="gap-6 pt-6">
          {/* Wallet Card */}
          <View className="rounded-3xl overflow-hidden shadow-lg">
            <LinearGradient
              colors={["#009a51", "#006a3c"]}
              className="px-6 py-6"
            >
              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row gap-x-3 items-center">
                  <View className="bg-white/20 p-3 rounded-xl backdrop-blur">
                    <Ionicons name="wallet-outline" size={20} color="white" />
                  </View>
                  <Text className="font-Raleway-SemiBold text-white text-lg">
                    YourErrandGuy wallet
                  </Text>
                </View>
                <TouchableOpacity onPress={handleRefresh}>
                  <Ionicons
                    name={loading ? "refresh" : "trending-up"}
                    size={24}
                    color="white"
                    style={loading ? { transform: [{ rotate: "180deg" }] } : {}}
                  />
                </TouchableOpacity>
              </View>

              <View className="mb-6">
                <Text className="font-SpaceGrotesk-Bold text-white text-3xl mb-1">
                  {formatCurrency(
                    parseFloat(personalDetails.walletBalance) || 0,
                  )}
                </Text>
                <Text className="font-Raleway-Regular text-sm text-white/80">
                  {lastUpdated
                    ? `Updated ${formatDetailedDate(lastUpdated.toISOString())}`
                    : "Loading balance..."}
                </Text>
              </View>

              <View className="flex-row gap-x-4">
                <TouchableOpacity
                  onPress={() => setIsModalVisible(true)}
                  className="flex-1 bg-white/20 border border-white/30 py-3 px-4 rounded-xl flex-row items-center justify-center gap-2"
                >
                  <Ionicons name="arrow-down" size={16} color="white" />
                  <Text className="text-white font-Raleway-SemiBold">
                    Withdraw
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("vendor/payment-history")}
                  className="flex-1 bg-white/20 border border-white/30 py-3 px-4 rounded-xl flex-row items-center justify-center gap-2"
                >
                  <Ionicons name="trending-up" size={16} color="white" />
                  <Text className="text-white font-Raleway-SemiBold">
                    Payment History
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          <OrderCard
            orders={orders}
            showHeader={true}
            maxItems={10}
            loading={loading}
          />

          <Modal
            isVisible={isModalVisible}
            onBackdropPress={() => !completing && setIsModalVisible(false)}
            className="justify-center items-center"
            backdropOpacity={0.5}
            animationIn="zoomIn"
            animationOut="zoomOut"
          >
            <View className="bg-white rounded-xl p-5 pt-10 w-11/12 max-w-sm">
              <Text className="font-Raleway-Regular text-gray-600 text-center mb-5">
                To proceed with your withdrawal, please enter the amount.
              </Text>

              <FormField
                title="Amount"
                placeholder="Enter Amount"
                value={amount}
                handleChangeText={(text) => setAmount(text)}
                error={errors.amount}
                keyboardType="numeric"
                otherStyles="mb-4"
              />

              <View className="flex flex-row justify-between items-center w-full">
                <CustomButton
                  title={completing ? "Processing..." : "Withdraw"}
                  containerStyles="bg-primary flex-1"
                  textStyles="text-white"
                  handlePress={withdraw}
                  disabled={!isFormValid || loading}
                />
                <CustomButton
                  title="Close"
                  containerStyles="border ml-4 w-20"
                  textStyles="text-primary"
                  handlePress={() => {
                    setIsModalVisible(false);
                    setErrors({});
                    setAmount("");
                  }}
                />
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </BackgroundLayout>
  );
};

export default Home;
