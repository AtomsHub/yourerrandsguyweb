// app/order/[id].jsx
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
  const [completing, setCompleting] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // 'details', 'items', 'timeline'

  useEffect(() => {
    loadOrderData();
  }, [id]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      const storedOrders = await AsyncStorage.getItem("orders");

      if (storedOrders) {
        const orders = JSON.parse(storedOrders);
        const foundOrder = orders.find(
          (order) => order.id.toString() === id.toString(),
        );

        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          showToast("error", "Order not found");
          router.replace("./orders");
        }
      } else {
        showToast("error", "No orders found");
        router.replace("./orders");
      }
    } catch (error) {
      //console.error("Error loading order data:", error);
      showToast("error", "Failed to load order data");
      router.replace("./orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!order?.transaction_id) {
      showToast("error", "Transaction ID not found");
      return;
    }

    try {
      setCompleting(true);
      const response = await api.post("/dispatch/order-complete", {
        trans_id: order.transaction_id,
      });

      if (response.status === 200) {
        showToast("success", "Order completed successfully!");
        const updatedOrder = { ...order, status: "Completed" };
        setOrder(updatedOrder);

        const storedOrders = await AsyncStorage.getItem("orders");
        if (storedOrders) {
          const orders = JSON.parse(storedOrders);
          const updatedOrders = orders.map((o) =>
            o.id === order.id ? updatedOrder : o,
          );
          await AsyncStorage.setItem("orders", JSON.stringify(updatedOrders));
        }

        setShowCompleteModal(false);
        setTimeout(() => {
          router.back();
        }, 1500);
      }
    } catch (error) {
      //console.error("Error completing order:", error);
      showToast(
        "error",
        error.response.data.message ||
          "Failed to complete order. Please try again.",
      );
    } finally {
      setCompleting(false);
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
    const items = order.cart_items || order.items || [];

    return items.map((item, index) => {
      const getItemName = () => {
        if (item.name) return item.name;
        if (item.description) return item.description;
        return "Item";
      };

      const getItemPrice = () => {
        if (item.pricePerItem) return parseFloat(item.pricePerItem);
        if (item.price_per_item && parseFloat(item.price_per_item) > 0) {
          return parseFloat(item.price_per_item);
        }
        if (item.price) return parseFloat(item.price);
        if (item.rate) return parseFloat(item.rate);
        if (item.total) return parseFloat(item.total);
        return 0;
      };

      const itemPrice = getItemPrice();
      const quantity = item.quantity || 1;

      return (
        <View key={index} className="bg-white p-4 rounded-lg mb-2">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="font-Raleway-SemiBold text-gray-900">
                {getItemName()}
              </Text>

              {item.serviceName && (
                <Text className="font-Raleway-Regular text-xs text-blue-600 mt-1">
                  {item.serviceName}
                </Text>
              )}

              <Text className="font-Raleway-Regular text-sm text-gray-500 mt-1">
                Qty: {quantity} × {formatCurrency(itemPrice)}
              </Text>

              {order.service_type === "Laundry" && item.serviceType && (
                <View className="flex-row items-center mt-2">
                  <View
                    className="px-2 py-1 rounded-lg"
                    style={{
                      backgroundColor: `${item.serviceType.color}20`,
                    }}
                  >
                    <Text
                      className="font-Raleway-Medium text-xs"
                      style={{ color: item.serviceType.color }}
                    >
                      {item.serviceType.title}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View className="items-end">
              <Text className="font-SpaceGrotesk-Semibold text-gray-900">
                {formatCurrency(itemPrice * quantity)}
              </Text>
              {quantity > 1 && (
                <Text className="font-Raleway-Regular text-xs text-gray-400 mt-1">
                  {formatCurrency(itemPrice)} each
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
        {/* Receiver's Information */}
        <View className="bg-white p-4 rounded-lg">
          <Text className="font-Raleway-SemiBold text-lg text-gray-900 mb-3">
            Receiver Information
          </Text>

          <View className="gap-y-2">
            {order.form_details?.receiverName && (
              <View className="flex-row justify-between">
                <Text className="font-Raleway-Regular text-gray-600">Name</Text>
                <Text className="font-Raleway-SemiBold text-gray-900">
                  {order.form_details.receiverName}
                </Text>
              </View>
            )}

            {order.form_details?.receiverPhone && (
              <TouchableOpacity
                onPress={handleCallCustomer}
                className="flex-row justify-between"
              >
                <Text className="font-Raleway-Regular text-gray-600">
                  Phone
                </Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity onPress={handleCallCustomer}>
                    <Ionicons name="call" size={12} color="#00a859" />
                  </TouchableOpacity>
                  <Text className="font-Raleway-SemiBold text-gray-900">
                    {order.form_details.receiverPhone}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {order.form_details?.deliveryAddress ? (
              <View className="flex-row justify-between">
                <Text className="font-Raleway-Regular text-gray-600">
                  Delivery Address
                </Text>
                <Text className="font-Raleway-SemiBold text-gray-900">
                  {order.form_details.deliveryAddress}
                </Text>
              </View>
            ) : order.form_details?.receiverEmail ? (
              <View className="flex-row justify-between">
                <Text className="font-Raleway-Regular text-gray-600">
                  Email
                </Text>
                <Text className="font-Raleway-SemiBold text-gray-900">
                  {order.form_details.receiverEmail}
                </Text>
              </View>
            ) : null}

            {order.delivery_landmark && (
              <View className="flex-row justify-between">
                <Text className="font-Raleway-Regular text-gray-600">
                  Delivery Landmark
                </Text>
                <Text className="font-Raleway-SemiBold text-gray-900">
                  {order.delivery_landmark}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Package Information for Package Service Type */}
        {order.service_type === "Package" && order.form_details && (
          <View className="bg-white p-4 rounded-lg">
            <Text className="font-Raleway-SemiBold text-lg text-gray-900 mb-3">
              Package Details
            </Text>

            <View className="gap-y-2">
              {order.form_details.senderName && (
                <View className="flex-row justify-between">
                  <Text className="font-Raleway-Regular text-gray-600">
                    Sender Name
                  </Text>
                  <Text className="font-Raleway-SemiBold text-gray-900">
                    {order.form_details.senderName}
                  </Text>
                </View>
              )}

              {order.form_details.senderPhone && (
                <TouchableOpacity
                  className="flex-row justify-between"
                  onPress={handleCallCustomer}
                >
                  <Text className="font-Raleway-Regular text-gray-600">
                    Sender Phone
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity onPress={handleCallCustomer}>
                      <Ionicons name="call" size={12} color="#00a859" />
                    </TouchableOpacity>
                    <Text className="font-Raleway-SemiBold text-gray-900">
                      {order.form_details.senderPhone}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {order.form_details.packageWorth && (
                <View className="flex-row justify-between">
                  <Text className="font-Raleway-Regular text-gray-600">
                    Package Worth
                  </Text>
                  <Text className="font-Raleway-SemiBold text-gray-900">
                    {formatCurrency(
                      parseFloat(order.form_details.packageWorth),
                    )}
                  </Text>
                </View>
              )}

              {order.form_details.selectedErrandArea && (
                <View className="flex-row justify-between">
                  <Text className="font-Raleway-Regular text-gray-600">
                    Pickup Landmark
                  </Text>
                  <Text className="font-Raleway-SemiBold text-gray-900 text-right">
                    {order.form_details.selectedErrandArea.title}
                  </Text>
                </View>
              )}

              {order.form_details.errandLocation && (
                <View className="flex-row justify-between">
                  <Text className="font-Raleway-Regular text-gray-600">
                    Pickup Location
                  </Text>
                  <Text className="font-Raleway-SemiBold flex-1 text-gray-900 text-right">
                    {order.form_details.errandLocation}
                  </Text>
                </View>
              )}

              {order.form_details.selectedDropOffArea && (
                <View className="flex-row justify-between">
                  <Text className="font-Raleway-Regular text-gray-600">
                    Dropoff Landmark
                  </Text>
                  <Text className="font-Raleway-SemiBold text-gray-900 text-right">
                    {order.form_details.selectedDropOffArea.title}
                  </Text>
                </View>
              )}

              {order.form_details.dropoffLocation && (
                <View className="flex-row justify-between">
                  <Text className="font-Raleway-Regular text-gray-600">
                    Dropoff Location
                  </Text>
                  <Text className="font-Raleway-SemiBold flex-1 text-gray-900 text-right">
                    {order.form_details.dropoffLocation}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Errand Information for Errand Service Type */}
        {order.service_type === "Errand" && order.form_details && (
          <View className="bg-white p-4 rounded-lg">
            <Text className="font-Raleway-SemiBold text-lg text-gray-900 mb-3">
              Errand Details
            </Text>

            <View className="gap-y-2">
              {order.form_details.selectedErrandArea && (
                <View className="flex-row justify-between">
                  <Text className="font-Raleway-Regular text-gray-600">
                    Errand Landmark
                  </Text>
                  <Text className="font-Raleway-SemiBold text-gray-900 text-right">
                    {order.form_details.selectedErrandArea.title}
                  </Text>
                </View>
              )}

              {order.form_details.errandLocation && (
                <View className="flex-row justify-between">
                  <Text className="font-Raleway-Regular text-gray-600">
                    Errand Location
                  </Text>
                  <Text className="font-Raleway-SemiBold flex-1 text-gray-900 text-right">
                    {order.form_details.errandLocation}
                  </Text>
                </View>
              )}

              {order.form_details.selectedDropOffArea && (
                <View className="flex-row justify-between">
                  <Text className="font-Raleway-Regular text-gray-600">
                    Dropoff Landmark
                  </Text>
                  <Text className="font-Raleway-SemiBold text-gray-900 text-right">
                    {order.form_details.selectedDropOffArea.title}
                  </Text>
                </View>
              )}

              {order.form_details.dropoffLocation && (
                <View className="flex-row justify-between">
                  <Text className="font-Raleway-Regular text-gray-600">
                    Dropoff Location
                  </Text>
                  <Text className="font-Raleway-SemiBold flex-1 text-gray-900 text-right">
                    {order.form_details.dropoffLocation}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Vendor Information */}
        {order.vendor && (
          <View className="bg-white p-4 rounded-lg">
            <Text className="font-Raleway-SemiBold text-lg text-gray-900 mb-3">
              Vendor Information
            </Text>

            <View className="gap-y-2">
              <View className="flex-row justify-between">
                <Text className="font-Raleway-Regular text-gray-600">Name</Text>
                <Text className="font-Raleway-SemiBold text-gray-900">
                  {order.vendor.name}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="font-Raleway-Regular text-gray-600">
                  Service Type
                </Text>
                <Text className="font-Raleway-SemiBold text-gray-900">
                  {order.vendor.service_type}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="font-Raleway-Regular text-gray-600">
                  Address
                </Text>
                <Text className="font-Raleway-SemiBold text-gray-900 text-right">
                  {order.vendor.address}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Order Information */}
        <View className="bg-white p-4 rounded-lg">
          <Text className="font-Raleway-SemiBold text-lg text-gray-900 mb-3">
            Order Information
          </Text>

          <View className="gap-y-2">
            <View className="flex-row justify-between">
              <Text className="font-Raleway-Regular text-gray-600">
                Order ID
              </Text>
              <Text className="font-Raleway-SemiBold text-gray-900">
                #{order.id}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="font-Raleway-Regular text-gray-600">
                Transaction ID
              </Text>
              <Text className="font-Raleway-SemiBold text-gray-900">
                {order.transaction_id}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="font-Raleway-Regular text-gray-600">
                Service Type
              </Text>
              <Text className="font-Raleway-SemiBold text-gray-900">
                {order.service_type}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="font-Raleway-Regular text-gray-600">
                Created Date
              </Text>
              <Text className="font-Raleway-SemiBold text-gray-900">
                {formatDetailedDate(order.created_at)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="font-Raleway-Regular text-gray-600">Status</Text>
              <View className="flex-row items-center">
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{
                    backgroundColor: getStatusConfig(order.status).color,
                  }}
                />
                <Text className="font-Raleway-SemiBold text-gray-900">
                  {order.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dispatcher Information */}
        {order.dispatcher && (
          <View className="bg-white p-4 rounded-lg">
            <Text className="font-Raleway-SemiBold text-lg text-gray-900 mb-3">
              Dispatcher Information
            </Text>

            <View className="gap-y-2">
              <View className="flex-row justify-between">
                <Text className="font-Raleway-Regular text-gray-600">Name</Text>
                <Text className="font-Raleway-SemiBold text-gray-900">
                  {order.dispatcher.full_name}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="font-Raleway-Regular text-gray-600">
                  Phone
                </Text>
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
      <View className="bg-white p-4 rounded-lg">
        <Text className="font-Raleway-SemiBold text-lg text-gray-900 mb-3">
          Order Summary
        </Text>

        <View className="gap-y-2">
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
            <Text className="font-Raleway-SemiBold text-lg text-gray-900">
              Total
            </Text>
            <Text className="font-SpaceGrotesk-Semibold text-lg text-gray-900">
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
          <Text className="font-Raleway-SemiBold text-xl text-gray-700 mt-4">
            Order Not Found
          </Text>
          <Text className="font-Raleway-Regular text-gray-500 text-center mt-2">
            The order you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("./orders")}
            className="bg-blue-600 px-6 py-3 rounded-xl mt-6"
          >
            <Text className="text-white font-Raleway-SemiBold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </BackgroundLayout>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const canComplete =
    order.status === "Dispatcher Assigned" ||
    order.status === "Dispatched Assigned";

  return (
    <BackgroundLayout
      header={true}
      title="Order Details"
      showCart={false}
      className="flex-1"
    >
      {/* Order Header */}
      <View className="bg-primary rounded-xl p-4 mb-4 mx-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-3">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: statusConfig.bgColor }}
            >
              <Ionicons
                name={statusConfig.icon}
                size={20}
                style={{ color: statusConfig.color }}
              />
            </View>
            <View>
              <Text className="font-Raleway-SemiBold text-base text-gray-50">
                Order #{order.id}
              </Text>
              <Text className="font-Raleway-SemiBold text-xs text-secondary-100">
                {order.status}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="font-SpaceGrotesk-Bold text-lg text-white">
              {formatCurrency(parseFloat(order.delivery_fee || 0))}
            </Text>
            <Text className="font-Raleway-Regular text-xs text-gray-50 mt-1">
              {formatDetailedDate(order.created_at)}
            </Text>
          </View>
        </View>
      </View>
      {/* Tab Navigation */}
      <View className="flex-row bg-gray-100 rounded-lg p-1 mb-4 mx-4">
        <TouchableOpacity
          className={`flex-1 py-2 px-4 rounded-lg ${activeTab === "details" ? "bg-white" : ""}`}
          onPress={() => setActiveTab("details")}
        >
          <Text
            className={`text-center font-Raleway-SemiBold ${activeTab === "details" ? "text-primary" : "text-gray-600"}`}
          >
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2 px-4 rounded-lg ${activeTab === "items" ? "bg-white" : ""}`}
          onPress={() => setActiveTab("items")}
        >
          <Text
            className={`text-center font-Raleway-SemiBold ${activeTab === "items" ? "text-primary" : "text-gray-600"}`}
          >
            Items ({order.items?.length || order.cart_items?.length || 0})
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

        {/* Complete Order Button */}
        {canComplete && (
          <TouchableOpacity
            onPress={() => setShowCompleteModal(true)}
            className="mt-6"
            disabled={completing}
          >
            <LinearGradient
              colors={
                completing ? ["#9CA3AF", "#6B7280"] : ["#00a859", "#33d66a"]
              }
              className="py-4 px-6 rounded-xl items-center flex-row justify-center gap-3"
              style={{ borderRadius: 12 }}
            >
              {completing && <ActivityIndicator size="small" color="white" />}
              <Text className="text-white font-Raleway-Bold text-base">
                {completing ? "Completing..." : "Complete Order"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Back to Orders Button */}
        <TouchableOpacity
          onPress={() => router.push("dispatcher/orders")}
          className="bg-gray-100 py-3 px-6 rounded-xl items-center flex-row justify-center gap-2 mt-4"
        >
          <Ionicons name="list-outline" size={18} color="#374151" />
          <Text className="text-gray-700 font-Raleway-SemiBold text-sm">
            View All Orders
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Complete Order Confirmation Modal */}
      <Modal
        isVisible={showCompleteModal}
        onBackdropPress={() => !completing && setShowCompleteModal(false)}
        className="justify-center items-center"
        backdropOpacity={0.5}
        animationIn="zoomIn"
        animationOut="zoomOut"
      >
        <View className="bg-white rounded-xl p-5 w-5/6 max-w-sm">
          <View className="items-center mb-4">
            <View className="w-14 h-14 bg-green-100 rounded-full items-center justify-center mb-3">
              <Ionicons
                name="checkmark-circle-outline"
                size={28}
                color="#059669"
              />
            </View>
            <Text className="font-Raleway-Bold text-lg text-gray-900 text-center">
              Complete Order
            </Text>
          </View>

          <Text className="font-Raleway-Regular text-gray-600 text-center mb-5">
            Are you sure you want to mark this order as completed? This action
            cannot be undone.
          </Text>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setShowCompleteModal(false)}
              className="flex-1 bg-gray-100 py-3 px-4 rounded-xl items-center"
              disabled={completing}
            >
              <Text className="text-gray-700 font-Raleway-SemiBold">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCompleteOrder}
              className="flex-1 bg-green-600 py-3 px-4 rounded-xl items-center flex-row justify-center gap-2"
              disabled={completing}
            >
              {completing && <ActivityIndicator size="small" color="white" />}
              <Text className="text-white font-Raleway-SemiBold">
                {completing ? "Completing..." : "Complete"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </BackgroundLayout>
  );
};

export default OrderDetails;
