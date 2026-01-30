import React, { useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { showToast } from "@/components/ui/Toast";
import { View, Text, FlatList, RefreshControl, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Modal from "react-native-modal";

import BackgroundLayout from "@/components/layout/BackgroundLayout";
import FormField from "@/components/inputs/FormField";
import CustomButton from "@/components/ui/CustomButton";
import VendorItemCard from "@/components/cards/VendorItemCard";
import api from "@/api";
import Loading from "../../../components/Loading";

const Items = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState([]);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [isDeleting, setisDeleting] = useState(false);

  // Form fields for different service types
  const [price, setPrice] = useState("");
  const [washPrice, setWashPrice] = useState("");
  const [ironPrice, setIronPrice] = useState("");
  const [starchPrice, setStarchPrice] = useState("");
  const [errors, setErrors] = useState({});

  const isLaundry = vendorInfo?.serviceType?.toLowerCase() === "laundry";

  useEffect(() => {
    const fetchStoredData = async () => {
      const storedItems = await AsyncStorage.getItem("vendorItems");
      const storedVendor = await AsyncStorage.getItem("vendorInfo");
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
      if (storedVendor) {
        setVendorInfo(JSON.parse(storedVendor));
      }
    };
    fetchStoredData();
  }, []);

  const getItems = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await api.get("/vendor/show");

      if (response.status === 200 && response.data.status) {
        const { vendor } = response.data.data;
        const itemsData = vendor.items || [];

        setItems(itemsData);
        setVendorInfo(vendor);

        await AsyncStorage.setItem("vendorItems", JSON.stringify(itemsData));
        await AsyncStorage.setItem("vendorInfo", JSON.stringify(vendor));
        showToast("success", "Items updated successfully!");
      }
    } catch (error) {
      //console.error("Error fetching items:", error);

      const storedItems = await AsyncStorage.getItem("vendorItems");
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
      showToast("error", "Failed to fetch items!");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getItems(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      getItems();
    }, []),
  );

  const handleEditPress = (item) => {
    setSelectedItem(item);
    setErrors({});

    if (isLaundry && typeof item.price === "object") {
      setWashPrice(item.price.wash?.toString() || "");
      setIronPrice(item.price.iron?.toString() || "");
      setStarchPrice(item.price.starch?.toString() || "");
    } else {
      setPrice(item.price?.toString() || "");
    }

    setIsModalVisible(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (isLaundry) {
      if (!washPrice && !ironPrice && !starchPrice) {
        newErrors.general = "At least one price field is required";
        return newErrors;
      }

      if (washPrice && parseFloat(washPrice) <= 0) {
        newErrors.wash = "Please enter a valid wash price";
      }
      if (ironPrice && parseFloat(ironPrice) <= 0) {
        newErrors.iron = "Please enter a valid iron price";
      }
      if (starchPrice && parseFloat(starchPrice) <= 0) {
        newErrors.starch = "Please enter a valid starch price";
      }
    } else {
      if (!price || parseFloat(price) <= 0) {
        newErrors.price = "Please enter a valid price";
      }
    }

    return newErrors;
  };

  const handleUpdateItem = async () => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setUpdating(true);
    try {
      let requestBody;

      if (isLaundry) {
        requestBody = {};
        if (washPrice) requestBody.wash = parseFloat(washPrice);
        if (ironPrice) requestBody.iron = parseFloat(ironPrice);
        if (starchPrice) requestBody.starch = parseFloat(starchPrice);
      } else {
        requestBody = { price: parseFloat(price) };
      }

      const response = await api.put(
        `/vendor/vendoritem/${selectedItem.id}`,
        requestBody,
      );

      if (response.status === 200 || response.data.status) {
        showToast("success", "Item updated successfully!");
        closeModal();
        getItems(false);
      } else {
        showToast("error", "Failed to update item");
      }
    } catch (error) {
      //console.error("Error updating item:", error);
      showToast(
        "error",
        error.response?.data?.message || "Failed to update item",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePress = (item) => {
    setSelectedItem(item);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      setisDeleting(true);
      const response = await api.delete(`/vendor/${selectedItem.id}`);
      if (response.status === 200 || response.data.status) {
        showToast("success", "Item deleted successfully!");
        closeDeleteModal();
        getItems(false);
      } else {
        showToast("error", "Failed to delete item");
      }
    } catch (error) {
      //console.error("Error deleting item:", error);
      showToast("error", "Failed to delete item");
    } finally {
      setisDeleting(false);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setErrors({});
    setPrice("");
    setWashPrice("");
    setIronPrice("");
    setStarchPrice("");
    setSelectedItem(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setSelectedItem(null);
  };

  return (
    <>
      <BackgroundLayout
        header={false}
        showCart={false}
        className="flex-1 px-6"
        onPress={onRefresh}
      >
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          columnWrapperStyle={{ gap: 8 }}
          renderItem={({ item, index }) => {
            // Calculate if this is the last row and needs special handling
            const totalItems = items.length;
            const itemsInLastRow = totalItems % 3;
            const isInLastRow =
              index >= totalItems - itemsInLastRow && itemsInLastRow !== 0;

            return (
              <View
                className="mb-3"
                style={{
                  flex: isInLastRow ? 0 : 1,
                  width: isInLastRow ? "32%" : undefined,
                  maxWidth: isInLastRow ? "32%" : undefined,
                }}
              >
                <VendorItemCard
                  item={item}
                  onEdit={handleEditPress}
                  onDelete={handleDeletePress}
                  serviceType={vendorInfo?.serviceType}
                />
              </View>
            );
          }}
          ListHeaderComponent={
            <View className="gap-y-4 mb-4">
              <LinearGradient
                colors={["#00a859", "#059669"]}
                className="p-6"
                style={{ borderRadius: 12 }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View className="bg-white/20 w-10 h-10 rounded-xl items-center justify-center mr-3">
                        <Ionicons name="grid" size={20} color="white" />
                      </View>
                      <Text className="text-white/80 font-Raleway-SemiBold text-sm uppercase tracking-wide">
                        Your Items
                      </Text>
                    </View>
                    <Text className="text-white font-SpaceGrotesk-Bold text-3xl mb-1">
                      {items.length}
                    </Text>
                    <Text className="text-white/90 font-Raleway-Medium text-sm">
                      {vendorInfo?.serviceType || "Services"}
                    </Text>
                  </View>
                  <View className="items-center">
                    <View className="bg-white/20 rounded-full w-16 h-16 items-center justify-center">
                      <Ionicons name="storefront" size={28} color="white" />
                    </View>
                  </View>
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
                  <Ionicons name="grid-outline" size={48} color="#9ca3af" />
                </LinearGradient>
              </View>
              <Text className="font-SpaceGrotesk-Bold text-xl text-gray-700 mb-2">
                No Items Yet
              </Text>
              <Text className="font-Raleway-Regular text-gray-500 text-center w-8/12 leading-5">
                Your items will appear here. Add your first item to get started!
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 16 }}
        />
      </BackgroundLayout>

      {/* Edit Modal */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => !updating && closeModal()}
        className="justify-center items-center"
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver={true}
      >
        <View className="bg-white rounded-xl p-5 pt-10 w-11/12 max-w-sm">
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="items-center mb-4">
              {selectedItem && (
                <Text className="font-Raleway-SemiBold text-xl text-gray-600 text-center">
                  {selectedItem.name}
                </Text>
              )}
            </View>

            {errors.general && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <Text className="font-Raleway-Regular text-red-600 text-sm text-center">
                  {errors.general}
                </Text>
              </View>
            )}

            {isLaundry ? (
              <>
                <FormField
                  title="Wash Price"
                  placeholder="Enter wash price (optional)"
                  value={washPrice}
                  handleChangeText={(text) => {
                    setWashPrice(text);
                    setErrors({});
                  }}
                  error={errors.wash}
                  keyboardType="numeric"
                  otherStyles="mb-3"
                  iconBrand={Ionicons}
                  iconName="water-outline"
                  iconColor="#9CA3AF"
                />

                <FormField
                  title="Iron Price"
                  placeholder="Enter iron price (optional)"
                  value={ironPrice}
                  handleChangeText={(text) => {
                    setIronPrice(text);
                    setErrors({});
                  }}
                  error={errors.iron}
                  keyboardType="numeric"
                  otherStyles="mb-3"
                  iconBrand={Ionicons}
                  iconName="flame-outline"
                  iconColor="#9CA3AF"
                />

                <FormField
                  title="Starch Price"
                  placeholder="Enter starch price (optional)"
                  value={starchPrice}
                  handleChangeText={(text) => {
                    setStarchPrice(text);
                    setErrors({});
                  }}
                  error={errors.starch}
                  keyboardType="numeric"
                  otherStyles="mb-4"
                  iconBrand={Ionicons}
                  iconName="sparkles-outline"
                  iconColor="#9CA3AF"
                />
              </>
            ) : (
              <FormField
                title="Price"
                placeholder="Enter price"
                value={price}
                handleChangeText={(text) => {
                  setPrice(text);
                  setErrors({});
                }}
                error={errors.price}
                keyboardType="numeric"
                otherStyles="mb-4"
                iconBrand={Ionicons}
                iconName="cash-outline"
                iconColor="#9CA3AF"
              />
            )}

            <View className="flex flex-row justify-between items-center w-full">
              <CustomButton
                title={updating ? "Updating..." : "Update"}
                containerStyles="bg-primary flex-1"
                textStyles="text-white"
                handlePress={handleUpdateItem}
                disabled={updating}
              />
              <CustomButton
                title="Close"
                containerStyles="bg-red-500 ml-4 w-20"
                textStyles="text-white"
                handlePress={closeModal}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isVisible={isDeleteModalVisible}
        onBackdropPress={() => !isDeleting && closeDeleteModal()}
        className="justify-center items-center"
        backdropOpacity={0.5}
        animationIn="bounceIn"
        animationOut="bounceOut"
        useNativeDriver={true}
      >
        <View className="bg-white rounded-2xl p-6 w-11/12 max-w-sm">
          <View className="items-center mb-5">
            <View className="bg-red-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Ionicons name="trash-outline" size={40} color="#ef4444" />
            </View>
            <Text className="font-SpaceGrotesk-Bold text-2xl text-gray-900 mb-2">
              Delete Item?
            </Text>
            {selectedItem && (
              <Text className="font-Raleway-Medium text-base text-gray-600 text-center">
                Are you sure you want to delete{"\n"}
                <Text className="font-Raleway-SemiBold text-gray-900">
                  "{selectedItem.name}"
                </Text>
                ?
              </Text>
            )}
            <Text className="font-Raleway-Regular text-sm text-gray-500 text-center mt-2">
              This action cannot be undone.
            </Text>
          </View>

          <View className="flex-row gap-3">
            <CustomButton
              title="Cancel"
              containerStyles="bg-gray-200 flex-1"
              textStyles="text-gray-700"
              handlePress={closeDeleteModal}
              disabled={isDeleting}
            />
            <CustomButton
              title={isDeleting ? "Deleting..." : "Delete"}
              containerStyles="bg-red-500 flex-1"
              textStyles="text-white"
              handlePress={confirmDelete}
              disabled={isDeleting}
            />
          </View>
        </View>
      </Modal>

      {isDeleting && <Loading />}
    </>
  );
};

export default Items;
