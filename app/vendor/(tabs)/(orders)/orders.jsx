import React, { useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { showToast } from "@/components/ui/Toast";
import { View, Text, SectionList, RefreshControl } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

import BackgroundLayout from "@/components/layout/BackgroundLayout";
import OrderCard from "@/components/cards/VendorOrderCard";
import { formatCurrency, groupOrdersByTime } from "@/constants";

import api from "@/api";

const Order = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrderCount: 0,
    totalAmountSpent: "0.00",
  });

  useEffect(() => {
    const fetchStoredOrder = async () => {
      const storedOrder = await AsyncStorage.getItem("vendor_orders");
      const storedStats = await AsyncStorage.getItem("vendor_stats");
      if (storedOrder && storedStats) {
        const parsedOrders = JSON.parse(storedOrder);
        const parsedStats = JSON.parse(storedStats);
        setOrders(parsedOrders);
        setStats(parsedStats);
      }
    };
    fetchStoredOrder();
  }, []);

  const getOrder = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await api.get("/vendor/orders");

      if (response.status === 200 && response.data.status) {
        const { orders, totalOrderCount, totalAmountSpent } =
          response.data.data;

        // Sort orders by created_at
        const sortedData = orders.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
        const stats = { totalOrderCount, totalAmountSpent };

        setOrders(sortedData);
        setStats(stats);

        await AsyncStorage.setItem("vendor_orders", JSON.stringify(sortedData));
        await AsyncStorage.setItem("vendor_stats", JSON.stringify(stats));
        showToast("success", "Orders updated successfully!");
      }
    } catch (error) {
      //console.error("Error fetching orders:", error);

      // Fallback to stored data
      const storedOrder = await AsyncStorage.getItem("vendor_orders");
      const storedStats = await AsyncStorage.getItem("vendor_stats");
      if (storedOrder && storedStats) {
        const parsedOrders = JSON.parse(storedOrder);
        const parsedStats = JSON.parse(storedStats);
        setOrders(parsedOrders);
        setStats(parsedStats);
      }
      showToast("error", "Failed to fetch orders!");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getOrder(false);
  };

  const handleOrderProcessed = (orderId) => {
    getOrder(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      getOrder();
    }, []),
  );

  const renderOrderItem = ({ item }) => (
    <View className="px-4">
      <OrderCard
        order={item}
        showHeader={false}
        onOrderProcessed={handleOrderProcessed}
      />
    </View>
  );

  return (
    <>
      <BackgroundLayout
        header={false}
        showCart={false}
        className="flex-1"
        onPress={onRefresh}
      >
        <SectionList
          sections={groupOrdersByTime(orders)}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderOrderItem}
          renderSectionHeader={({ section: { title } }) => (
            <View className="px-4 py-3 mt-2">
              <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <LinearGradient
                  colors={
                    title === "Today"
                      ? ["#00a859", "#059669"]
                      : title === "Yesterday"
                        ? ["#fdcd11", "#f59e0b"]
                        : title === "Last Week"
                          ? ["#22c55e", "#16a34a"]
                          : ["#6b7280", "#4b5563"]
                  }
                  className="px-5 py-4"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="bg-white/20 w-8 h-8 rounded-lg items-center justify-center mr-3">
                        <Ionicons
                          name={
                            title === "Today"
                              ? "today"
                              : title === "Yesterday"
                                ? "yesterday"
                                : title === "Last Week"
                                  ? "calendar"
                                  : "time"
                          }
                          size={16}
                          color="white"
                        />
                      </View>
                      <Text className="font-SpaceGrotesk-Bold text-lg text-white">
                        {title}
                      </Text>
                    </View>
                    <View className="bg-white/20 px-3 py-1 rounded-lg">
                      <Text className="text-white text-xs font-Raleway-SemiBold">
                        {groupOrdersByTime(orders).find(
                          (section) => section.title === title,
                        )?.data.length || 0}{" "}
                        Orders
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>
          )}
          ListHeaderComponent={
            <View className="gap-y-4 mb-4 px-4">
              <LinearGradient
                colors={["#00a859", "#059669"]}
                className="p-6"
                style={{ borderRadius: 12 }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View className="bg-white/20 w-10 h-10 rounded-xl items-center justify-center mr-3">
                        <FontAwesome5 name="wallet" size={18} color="white" />
                      </View>
                      <Text className="text-white/80 font-Raleway-SemiBold text-sm uppercase tracking-wide">
                        Total Earnings
                      </Text>
                    </View>
                    <Text className="text-white font-SpaceGrotesk-Bold text-3xl mb-1">
                      {formatCurrency(parseFloat(stats.totalAmountSpent))}
                    </Text>
                    <Text className="text-white/90 font-Raleway-Medium text-sm">
                      From completed orders
                    </Text>
                  </View>
                  <View className="items-center">
                    <View className="bg-white/20 rounded-full w-16 h-16 items-center justify-center">
                      <Text className="text-white font-SpaceGrotesk-Bold text-lg">
                        {stats.totalOrderCount}
                      </Text>
                    </View>
                    <Text className="text-white/80 text-xs font-Raleway-Medium mt-1">
                      Total Orders
                    </Text>
                  </View>
                </View>

                <View className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-white rounded-full"
                    style={{
                      width:
                        stats.totalOrderCount > 0
                          ? `${Math.min((stats.totalOrderCount / 50) * 100, 100)}%`
                          : "5%",
                    }}
                  />
                </View>
              </LinearGradient>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00a859"
              colors={["#00a859"]}
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <View className="bg-gray-50 w-32 h-32 rounded-3xl items-center justify-center mb-6 shadow-sm">
                <LinearGradient
                  colors={["#f3f4f6", "#e5e7eb"]}
                  className="w-full h-full rounded-3xl items-center justify-center"
                >
                  <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
                </LinearGradient>
              </View>
              <Text className="font-SpaceGrotesk-Bold text-xl text-gray-700 mb-2">
                No Orders Yet
              </Text>
              <Text className="font-Raleway-Regular text-gray-500 text-center w-8/12 leading-5">
                Your order history will appear here once you receive your first
                order. Start serving today!
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 30 }}
          stickySectionHeadersEnabled={false}
        />
      </BackgroundLayout>
    </>
  );
};

export default Order;
