// app/vendor/(tabs)/(orders)/[id].jsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackgroundLayout from "@/components/layout/BackgroundLayout";
import { Ionicons } from "@expo/vector-icons";
import {
  formatCurrency,
  formatDetailedDate,
  getStatusConfig,
} from "@/constants";
import { LinearGradient } from "expo-linear-gradient";
import { showToast } from "@/components/ui/Toast";
import Modal from "react-native-modal";
import api from "@/api";

const OrderDetails = () => {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    loadOrderData();
  }, [id]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      const storedOrders = await AsyncStorage.getItem("vendor_orders");

      if (storedOrders) {
        const orders = JSON.parse(storedOrders);
        const foundOrder = orders.find(
          (order) => order.id.toString() === id.toString(),
        );

        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          showToast("error", "Order not found");
          router.back();
        }
      } else {
        showToast("error", "No orders found");
        router.back();
      }
    } catch (error) {
      //console.error("Error loading order data:", error);
      showToast("error", "Failed to load order data");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleProcessOrder = async () => {
    if (!order?.id) {
      showToast("error", "Order ID not found");
      return;
    }

    try {
      setProcessing(true);
      const response = await api.post(`/vendor/${order.id}/process`);

      if (response.status === 200 || response.data.status) {
        showToast("success", "Order processed successfully!");
        const updatedOrder = { ...order, status: "Processing" };
        setOrder(updatedOrder);

        const storedOrders = await AsyncStorage.getItem("vendor_orders");
        if (storedOrders) {
          const orders = JSON.parse(storedOrders);
          const updatedOrders = orders.map((o) =>
            o.id === order.id ? updatedOrder : o,
          );
          await AsyncStorage.setItem(
            "vendor_orders",
            JSON.stringify(updatedOrders),
          );
        }

        setShowProcessModal(false);
        setTimeout(() => {
          router.back();
        }, 1500);
      }
    } catch (error) {
      //console.error("Error processing order:", error);
      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to process order. Please try again.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleCallCustomer = () => {
    const phoneNumber = order?.form_details?.receiverPhone;
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      showToast("error", "Customer phone number not available");
    }
  };

  const renderOrderItems = () => {
    const items = order.items || [];

    return items.map((item, index) => {
      const itemPrice = item.pricePerItem || item.price || 0;
      const quantity = item.quantity || 1;

      return (
        <View
          key={index}
          className="bg-white p-4 rounded-xl mb-2 border border-gray-100"
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="font-SpaceGrotesk-Bold text-gray-900 text-base">
                {item.name}
              </Text>

              {item.serviceName && (
                <Text className="font-Raleway-Regular text-xs text-blue-600 mt-1">
                  {item.serviceName}
                </Text>
              )}

              <Text className="font-Raleway-Regular text-sm text-gray-500 mt-1">
                Qty: {quantity} × {formatCurrency(parseFloat(itemPrice))}
              </Text>

              {order.service_type === "Laundry" && item.serviceType && (
                <View className="flex-row items-center mt-2">
                  <View
                    className="px-3 py-1.5 rounded-lg flex-row items-center gap-2"
                    style={{
                      backgroundColor: `${item.serviceType.color}20`,
                    }}
                  >
                    <Ionicons
                      name={item.serviceType.icon}
                      size={14}
                      color={item.serviceType.color}
                    />
                    <Text
                      className="font-Raleway-SemiBold text-xs"
                      style={{ color: item.serviceType.color }}
                    >
                      {item.serviceType.title}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View className="items-end">
              <Text className="font-SpaceGrotesk-Bold text-primary text-lg">
                {formatCurrency(parseFloat(itemPrice) * quantity)}
              </Text>
              {quantity > 1 && (
                <Text className="font-Raleway-Regular text-xs text-gray-400 mt-1">
                  {formatCurrency(parseFloat(itemPrice))} each
                </Text>
              )}
            </View>
          </View>
        </View>
      );
    });
  };

  const renderOrderDetails = () => {
    return (
      <View className="gap-y-4">
        {/* Customer Information */}
        <View className="bg-white p-4 rounded-xl border border-gray-100">
          <Text className="font-SpaceGrotesk-Bold text-lg text-gray-900 mb-3">
            Customer Information
          </Text>

          <View className="gap-y-3">
            {order.form_details?.receiverName && (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                  <Text className="font-Raleway-Regular text-gray-600">
                    Name
                  </Text>
                </View>
                <Text className="font-Raleway-SemiBold text-gray-900">
                  {order.form_details.receiverName}
                </Text>
              </View>
            )}

            {order.form_details?.receiverPhone && (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="call-outline" size={18} color="#9CA3AF" />
                  <Text className="font-Raleway-Regular text-gray-600">
                    Phone
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleCallCustomer}
                  className="flex-row items-center gap-2"
                >
                  <Text className="font-Raleway-SemiBold text-primary">
                    {order.form_details.receiverPhone}
                  </Text>
                  <View className="bg-primary/10 w-7 h-7 rounded-full items-center justify-center">
                    <Ionicons name="call" size={14} color="#00a859" />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {order.form_details?.receiverEmail && (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
                  <Text className="font-Raleway-Regular text-gray-600">
                    Email
                  </Text>
                </View>
                <Text className="font-Raleway-SemiBold text-gray-900 text-right flex-1 ml-2">
                  {order.form_details.receiverEmail}
                </Text>
              </View>
            )}

            {order.delivery_landmark && (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="location-outline" size={18} color="#9CA3AF" />
                  <Text className="font-Raleway-Regular text-gray-600">
                    Landmark
                  </Text>
                </View>
                <Text className="font-Raleway-SemiBold text-gray-900 text-right flex-1 ml-2">
                  {order.delivery_landmark}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Order Information */}
        <View className="bg-white p-4 rounded-xl border border-gray-100">
          <Text className="font-SpaceGrotesk-Bold text-lg text-gray-900 mb-3">
            Order Information
          </Text>

          <View className="gap-y-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons name="receipt-outline" size={18} color="#9CA3AF" />
                <Text className="font-Raleway-Regular text-gray-600">
                  Order ID
                </Text>
              </View>
              <Text className="font-Raleway-SemiBold text-gray-900">
                #{order.id}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons name="barcode-outline" size={18} color="#9CA3AF" />
                <Text className="font-Raleway-Regular text-gray-600">
                  Transaction ID
                </Text>
              </View>
              <Text className="font-Raleway-SemiBold text-gray-900 text-xs">
                {order.transaction_id}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons name="cube-outline" size={18} color="#9CA3AF" />
                <Text className="font-Raleway-Regular text-gray-600">
                  Service Type
                </Text>
              </View>
              <Text className="font-Raleway-SemiBold text-gray-900">
                {order.service_type}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
                <Text className="font-Raleway-Regular text-gray-600">
                  Created Date
                </Text>
              </View>
              <Text className="font-Raleway-SemiBold text-gray-900">
                {formatDetailedDate(order.created_at)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color="#9CA3AF"
                />
                <Text className="font-Raleway-Regular text-gray-600">
                  Status
                </Text>
              </View>
              <View
                className="px-3 py-1.5 rounded-lg"
                style={{
                  backgroundColor: getStatusConfig(order.status).bgColor,
                }}
              >
                <Text
                  className="font-Raleway-SemiBold text-xs"
                  style={{ color: getStatusConfig(order.status).color }}
                >
                  {order.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dispatcher Information */}
        {order.dispatcher && (
          <View className="bg-white p-4 rounded-xl border border-gray-100">
            <Text className="font-SpaceGrotesk-Bold text-lg text-gray-900 mb-3">
              Dispatcher Information
            </Text>

            <View className="gap-y-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                  <Text className="font-Raleway-Regular text-gray-600">
                    Name
                  </Text>
                </View>
                <Text className="font-Raleway-SemiBold text-gray-900">
                  {order.dispatcher.full_name}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="call-outline" size={18} color="#9CA3AF" />
                  <Text className="font-Raleway-Regular text-gray-600">
                    Phone
                  </Text>
                </View>
                <Text className="font-Raleway-SemiBold text-gray-900">
                  {order.dispatcher.phone_number}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderOrderSummary = () => {
    return (
      <View className="bg-white p-4 rounded-xl border border-gray-100">
        <Text className="font-SpaceGrotesk-Bold text-lg text-gray-900 mb-3">
          Order Summary
        </Text>

        <View className="gap-y-3">
          <View className="flex-row justify-between">
            <Text className="font-Raleway-Regular text-gray-600">
              Item Amount
            </Text>
            <Text className="font-Raleway-SemiBold text-gray-900">
              {formatCurrency(parseFloat(order.item_amount || 0))}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="font-Raleway-Regular text-gray-600">
              Delivery Fee
            </Text>
            <Text className="font-Raleway-SemiBold text-primary">
              {formatCurrency(parseFloat(order.delivery_fee || 0))}
            </Text>
          </View>

          <View className="border-t border-gray-200 pt-3 flex-row justify-between">
            <Text className="font-SpaceGrotesk-Bold text-lg text-gray-900">
              Total
            </Text>
            <Text className="font-SpaceGrotesk-Bold text-xl text-primary">
              {formatCurrency(parseFloat(order.total_amount || 0))}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <BackgroundLayout className="flex-1">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00a859" />
          <Text className="font-Raleway-Regular text-gray-500 mt-4">
            Loading order details...
          </Text>
        </View>
      </BackgroundLayout>
    );
  }

  if (!order) {
    return (
      <BackgroundLayout className="flex-1">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="document-outline" size={64} color="#9CA3AF" />
          <Text className="font-SpaceGrotesk-Bold text-xl text-gray-700 mt-4">
            Order Not Found
          </Text>
          <Text className="font-Raleway-Regular text-gray-500 text-center mt-2">
            The order you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary px-6 py-3 rounded-xl mt-6"
          >
            <Text className="text-white font-Raleway-SemiBold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </BackgroundLayout>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const canProcess = order.status?.toLowerCase() === "payment successful";

  return (
    <BackgroundLayout
      header={true}
      title="Order Details"
      showCart={false}
      className="flex-1"
    >
      {/* Order Header */}
      <View className="bg-primary rounded-2xl p-5 mb-4 mx-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-3">
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm"
              style={{ backgroundColor: statusConfig.bgColor }}
            >
              <Ionicons
                name={statusConfig.icon}
                size={24}
                style={{ color: statusConfig.color }}
              />
            </View>
            <View>
              <Text className="font-SpaceGrotesk-Bold text-base text-white">
                Order #{order.id}
              </Text>
              <Text className="font-Raleway-SemiBold text-xs text-white/80 mt-1">
                {order.status}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="font-SpaceGrotesk-Bold text-2xl text-white">
              {formatCurrency(parseFloat(order.total_amount || 0))}
            </Text>
            <Text className="font-Raleway-Regular text-xs text-white/80 mt-1">
              {formatDetailedDate(order.created_at)}
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-gray-100 rounded-xl p-1 mb-4 mx-4">
        <TouchableOpacity
          className={`flex-1 py-3 px-4 rounded-lg ${activeTab === "details" ? "bg-white" : ""}`}
          onPress={() => setActiveTab("details")}
        >
          <Text
            className={`text-center font-Raleway-SemiBold ${activeTab === "details" ? "text-primary" : "text-gray-600"}`}
          >
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 px-4 rounded-lg ${activeTab === "items" ? "bg-white" : ""}`}
          onPress={() => setActiveTab("items")}
        >
          <Text
            className={`text-center font-Raleway-SemiBold ${activeTab === "items" ? "text-primary" : "text-gray-600"}`}
          >
            Items ({order.items?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Tab Content */}
        {activeTab === "details" ? (
          renderOrderDetails()
        ) : (
          <View className="gap-y-4">
            {renderOrderItems()}
            {renderOrderSummary()}
          </View>
        )}

        {/* Process Order Button */}
        {canProcess && (
          <TouchableOpacity
            onPress={() => setShowProcessModal(true)}
            className="mt-6"
            disabled={processing}
          >
            <LinearGradient
              colors={
                processing ? ["#9CA3AF", "#6B7280"] : ["#00a859", "#059669"]
              }
              className="py-4 px-6 rounded-2xl items-center flex-row justify-center gap-3 shadow-lg"
              style={{
                borderRadius: 16,
                shadowColor: "#00a859",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 8,
              }}
            >
              {processing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="checkmark-circle" size={24} color="white" />
              )}
              <Text className="text-white font-Raleway-Bold text-lg">
                {processing ? "Processing..." : "Process Order"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-100 py-3 px-6 rounded-xl items-center flex-row justify-center gap-2 mt-4"
        >
          <Ionicons name="arrow-back-outline" size={18} color="#374151" />
          <Text className="text-gray-700 font-Raleway-SemiBold text-sm">
            Back to Orders
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Process Order Confirmation Modal */}
      <Modal
        isVisible={showProcessModal}
        onBackdropPress={() => !processing && setShowProcessModal(false)}
        className="justify-center items-center"
        backdropOpacity={0.5}
        animationIn="zoomIn"
        animationOut="zoomOut"
      >
        <View className="bg-white rounded-2xl p-6 w-5/6 max-w-sm">
          <View className="items-center mb-4">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
              <Ionicons name="checkmark-circle" size={32} color="#059669" />
            </View>
            <Text className="font-SpaceGrotesk-Bold text-xl text-gray-900 text-center">
              Process Order
            </Text>
          </View>

          <Text className="font-Raleway-Regular text-gray-600 text-center mb-6">
            Are you sure you want to process this order? This will mark it as
            being prepared.
          </Text>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setShowProcessModal(false)}
              className="flex-1 bg-gray-100 py-3 px-4 rounded-xl items-center"
              disabled={processing}
            >
              <Text className="text-gray-700 font-Raleway-SemiBold">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleProcessOrder}
              className="flex-1 bg-primary py-3 px-4 rounded-xl items-center flex-row justify-center gap-2"
              disabled={processing}
            >
              {processing && <ActivityIndicator size="small" color="white" />}
              <Text className="text-white font-Raleway-SemiBold">
                {processing ? "Processing..." : "Confirm"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </BackgroundLayout>
  );
};

export default OrderDetails;
