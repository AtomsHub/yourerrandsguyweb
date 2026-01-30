import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  formatCurrency,
  getStatusConfig,
  getServiceConfig,
  formatDetailedDate,
  formatSimpleDate,
} from "@/constants";
import { router } from "expo-router";
import { showToast } from "@/components/ui/Toast";
import api from "@/api";

const OrderItem = ({ order, onProcess }) => {
  const [processing, setProcessing] = useState(false);

  const handlePress = () => {
    router.push(`/vendor/(tabs)/(orders)/${order.id}`);
  };

  const handleProcessOrder = async (e) => {
    e.stopPropagation(); // Prevent navigation when pressing button

    if (processing) return;

    try {
      setProcessing(true);
      const response = await api.post(`/vendor/${order.id}/process`);

      if (response.status === 200 || response.data.status) {
        showToast("success", "Order processed successfully!");
        if (onProcess) onProcess(order.id);
      } else {
        showToast("error", "Failed to process order");
      }
    } catch (error) {
      //console.error("Error processing order:", error);
      showToast(
        "error",
        error.response?.data?.message || "Failed to process order",
      );
    } finally {
      setProcessing(false);
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const serviceConfig = getServiceConfig(order.service_type);
  const canProcess = order.status?.toLowerCase() === "payment successful";

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row items-start justify-between mb-3">
        {/* Left Section - Service Icon and Basic Info */}
        <View className="flex-row items-start gap-3 flex-1">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm"
            style={{ backgroundColor: serviceConfig.bgColor }}
          >
            <Ionicons
              name={serviceConfig.icon}
              size={24}
              color={serviceConfig.color}
            />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="font-SpaceGrotesk-Bold text-gray-900 text-base">
                {order.service_type}
              </Text>
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusConfig.color }}
              />
            </View>

            <View
              className="px-2 py-1 rounded-lg mb-2 self-start"
              style={{ backgroundColor: statusConfig.bgColor }}
            >
              <Text
                className="font-Raleway-SemiBold text-xs"
                style={{ color: statusConfig.color }}
              >
                {order.status}
              </Text>
            </View>

            <Text className="font-Raleway-Regular text-xs text-gray-500">
              {getItemSummary(order)}
            </Text>
          </View>
        </View>

        {/* Right Section - Price */}
        <View className="items-end">
          <Text className="font-SpaceGrotesk-Bold text-primary text-xl mb-1">
            {formatCurrency(parseFloat(order.total_amount || 0))}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View className="h-px bg-gray-100 mb-3" />

      {/* Bottom Section - Date and Action */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
          <Text className="font-Raleway-Regular text-xs text-gray-500">
            {formatSimpleDate(order.created_at)}
          </Text>
        </View>

        {canProcess ? (
          <TouchableOpacity
            onPress={handleProcessOrder}
            className="bg-primary px-5 py-2.5 rounded-xl flex-row items-center gap-2 shadow-sm"
            disabled={processing}
            style={{
              shadowColor: "#00a859",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            {processing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="checkmark-circle" size={18} color="white" />
            )}
            <Text className="text-white font-Raleway-Bold text-sm">
              {processing ? "Processing..." : "Process Order"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row items-center gap-1">
            <Text className="font-Raleway-Medium text-xs text-gray-500">
              View Details
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        )}
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
  onOrderProcessed,
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
            <Text className="font-SpaceGrotesk-Bold text-lg text-gray-900">
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
            <Text className="font-SpaceGrotesk-Bold text-lg text-gray-900">
              Recent Orders
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/vendor/(tabs)/(orders)")}
            >
              <Text className="text-primary font-Raleway-SemiBold text-sm">
                View All
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="bg-white rounded-xl p-6 border border-gray-100 items-center justify-center">
          <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
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
          <Text className="font-SpaceGrotesk-Bold text-lg text-gray-900">
            Recent Orders
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/vendor/(tabs)/(orders)")}
          >
            <Text className="text-primary font-Raleway-SemiBold text-sm">
              View All
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View>
        {displayOrders.map((orderItem, index) => (
          <OrderItem
            key={`${orderItem.id}-${index}`}
            order={orderItem}
            onProcess={onOrderProcessed}
          />
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
