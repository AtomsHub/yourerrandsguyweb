import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "@/constants";
import OptimizedImage from "../ui/OptimizedImage";

const VendorItemCard = ({ item, onEdit, onDelete, serviceType }) => {
  const isLaundry = serviceType?.toLowerCase() === "laundry";

  const renderPrice = () => {
    if (isLaundry && typeof item.price === "object") {
      const prices = [];
      if (item.price.wash)
        prices.push(`Wash: ${formatCurrency(item.price.wash)}`);
      if (item.price.iron)
        prices.push(`Iron: ${formatCurrency(item.price.iron)}`);
      if (item.price.starch)
        prices.push(`Starch: ${formatCurrency(item.price.starch)}`);

      return (
        <View className="items-center space-y-1">
          {prices.map((priceText, index) => (
            <View
              key={index}
              className="bg-primary/10 px-3 py-1.5 rounded-full"
            >
              <Text className="font-SpaceGrotesk-SemiBold text-primary text-xs">
                {priceText}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    return (
      <View className="bg-primary/10 px-4 py-2 rounded-full">
        <Text className="font-SpaceGrotesk-Bold text-primary text-base">
          {item.price ? formatCurrency(item.price) : "No Price"}
        </Text>
      </View>
    );
  };

  return (
    <View className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
      <View className="items-center mb-3">
        <View className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 shadow-md">
          <OptimizedImage
            source={{ uri: `https://yourerrandsguy.com.ng/${item.image}` }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      </View>

      <View className="items-center mb-3">
        <Text className="font-SpaceGrotesk-Bold text-lg text-gray-900 text-center mb-1">
          {item.name}
        </Text>
        {item.description && (
          <Text
            className="font-Raleway-Regular text-xs text-gray-500 text-center"
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}
      </View>

      <View className="items-center mb-3">{renderPrice()}</View>

      <View className="flex-row gap-2 px-3">
        <TouchableOpacity
          onPress={() => onEdit(item)}
          className="flex-1 bg-blue-50 p-2 rounded-full items-center justify-center flex-row"
        >
          <Ionicons name="pencil" size={16} color="#3b82f6" />
          {/* <Text className="font-Raleway-SemiBold text-blue-500 ml-2">Edit</Text> */}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDelete(item)}
          className="flex-1 bg-red-50 p-2 rounded-2xl items-center justify-center flex-row"
        >
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
          {/* <Text className="font-Raleway-SemiBold text-red-500 ml-2">
            Delete
          </Text> */}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VendorItemCard;
