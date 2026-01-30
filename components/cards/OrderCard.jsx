// components/OrderCard.jsx
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  formatCurrency,
  getStatusConfig,
  getServiceConfig,
  formatDetailedDate,
  formatSimpleDate,
} from "@/constants";
import { router } from "expo-router";

const OrderItem = ({ order }) => {
  const handlePress = () => {
    router.push(`/dispatcher/(tabs)/(orders)/${order.id}`);
  };

  const statusConfig = getStatusConfig(order.status);
  const serviceConfig = getServiceConfig(order.service_type);

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="p-4 bg-white rounded-xl border-l-4 mb-3 shadow-sm"
      style={{
        borderLeftColor: statusConfig.color,
      }}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start justify-between">
        {/* Left Section - Service Icon and Basic Info */}
        <View className="flex-row items-start gap-3 flex-1">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: serviceConfig.bgColor }}
          >
            <Ionicons
              name={serviceConfig.icon}
              size={20}
              color={serviceConfig.color}
            />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="font-Raleway-SemiBold text-gray-900 text-base">
                {order.service_type}
              </Text>
              <View
                className="px-2 py-1 rounded-md"
                style={{ backgroundColor: statusConfig.bgColor }}
              >
                <Text
                  className="font-Raleway-Medium text-xs"
                  style={{ color: statusConfig.color }}
                >
                  {order.status}
                </Text>
              </View>
            </View>

            <Text className="font-Raleway-Regular text-sm text-gray-600 mb-1">
              {formatDetailedDate(order.created_at)}
            </Text>

            <Text className="font-Raleway-Regular text-xs text-gray-500">
              {getItemSummary(order)}
            </Text>
          </View>
        </View>

        {/* Right Section - Price and Status Indicator */}
        <View className="items-end">
          <Text className="font-SpaceGrotesk-Bold text-primary text-lg">
            {formatCurrency(parseFloat(order.total_amount || 0))}
          </Text>

          <View className="flex-row items-center mt-2">
            <View
              className="w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: statusConfig.color }}
            />
            <Text className="font-Raleway-Regular text-xs text-gray-500">
              {formatSimpleDate(order.created_at)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const OrderCard = ({
  order = null,
  orders = [],
  showHeader = true,
  maxItems = null,
  loading = false,
}) => {
  // Handle single order vs array of orders
  const displayOrders = order
    ? [order]
    : maxItems
      ? orders.slice(0, maxItems)
      : orders;

  // Loading state
  if (loading) {
    return (
      <View>
        {showHeader && (
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-Raleway-SemiBold text-lg text-gray-900">
              Recent Orders
            </Text>
          </View>
        )}

        <View className="bg-white rounded-xl p-6 border border-gray-100 items-center justify-center">
          <ActivityIndicator size="large" color="#00a859" />
          <Text className="text-gray-500 font-Raleway-Regular mt-3">
            Loading orders...
          </Text>
        </View>
      </View>
    );
  }

  // Empty state
  if (!displayOrders || displayOrders.length === 0) {
    return (
      <View>
        {showHeader && (
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-Raleway-SemiBold text-lg text-gray-900">
              Recent Orders
            </Text>
            <TouchableOpacity onPress={() => router.push("dispatcher/orders")}>
              <Text className="text-primary font-Raleway-SemiBold text-sm">
                View All
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="bg-white rounded-xl p-6 border border-gray-100 items-center justify-center">
          <Ionicons name="document-outline" size={48} color="#9CA3AF" />
          <Text className="text-gray-500 font-Raleway-Regular mt-3 text-center">
            No orders found
          </Text>
          <Text className="text-gray-400 font-Raleway-Light text-xs mt-1 text-center">
            You don't have any orders yet
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      {showHeader && (
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-Raleway-SemiBold text-lg text-gray-900">
            Recent Orders
          </Text>
          <TouchableOpacity onPress={() => router.push("dispatcher/orders")}>
            <Text className="text-primary font-Raleway-SemiBold text-sm">
              View All
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View>
        {displayOrders.map((orderItem, index) => (
          <OrderItem key={`${orderItem.id}-${index}`} order={orderItem} />
        ))}
      </View>
    </View>
  );
};

// Generate item summary text
export const getItemSummary = (order) => {
  const items = order.items || order.cart_items || [];

  if (items.length === 0) return "No items";

  if (items.length === 1) {
    const item = items[0];
    const name = item.name || item.description || "Item";
    return `${name} (x${item.quantity || 1})`;
  }

  const firstItem = items[0];
  const firstName = firstItem.name || firstItem.description || "Item";

  return `${firstName} +${items.length - 1} more`;
};

export default OrderCard;