// components/cards/TransactionCard.jsx
import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  formatCurrency,
  formatDetailedDate,
  formatSimpleDate,
} from "@/constants";

const getTransactionConfig = (status) => {
  const configs = {
    successful: {
      icon: "checkmark-circle",
      iconColor: "#22C55E",
      iconBg: "#F0FDF4",
      amountColor: "#059669",
      statusColor: "#22C55E",
      statusBg: "#F0FDF4",
      borderColor: "#22C55E",
    },
    pending: {
      icon: "time",
      iconColor: "#F59E0B",
      iconBg: "#FFFBEB",
      amountColor: "#D97706",
      statusColor: "#F59E0B",
      statusBg: "#FFFBEB",
      borderColor: "#F59E0B",
    },
    failed: {
      icon: "close-circle",
      iconColor: "#EF4444",
      iconBg: "#FEF2F2",
      amountColor: "#DC2626",
      statusColor: "#EF4444",
      statusBg: "#FEF2F2",
      borderColor: "#EF4444",
    },
  };
  return configs[status?.toLowerCase()] || configs.pending;
};

const TransactionCard = ({ transaction, onPress }) => {
  const config = getTransactionConfig(transaction.status);
  const title = transaction.title || "Wallet Withdrawal";

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1 gap-3">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm"
            style={{ backgroundColor: config.iconBg }}
          >
            <Ionicons name={config.icon} size={24} color={config.iconColor} />
          </View>

          <View className="flex-1">
            <Text className="font-SpaceGrotesk-Bold text-gray-900 text-base mb-1">
              {title}
            </Text>
            <View className="flex-row items-center gap-2">
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: config.statusColor }}
              />
              <Text
                className="font-Raleway-SemiBold text-xs capitalize"
                style={{ color: config.statusColor }}
              >
                {transaction.status}
              </Text>
            </View>
          </View>
        </View>

        <View className="items-end">
          <Text
            className="font-SpaceGrotesk-Bold text-xl mb-1"
            style={{ color: config.amountColor }}
          >
            {formatCurrency(parseFloat(transaction.amount || 0))}
          </Text>
        </View>
      </View>

      <View className="h-px mb-3" style={{ backgroundColor: "#f3f4f6" }} />

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
          <Text className="font-Raleway-Regular text-xs text-gray-500">
            {formatSimpleDate(transaction.created_at)}
          </Text>
        </View>

        {transaction.bank_name && (
          <View className="flex-row items-center gap-2">
            <Ionicons name="business-outline" size={14} color="#9CA3AF" />
            <Text
              className="font-Raleway-Medium text-xs text-gray-600"
              numberOfLines={1}
            >
              {transaction.bank_name.split("(")[0].trim()}
            </Text>
          </View>
        )}
      </View>

      {transaction.account_number && (
        <View className="mt-2 pt-2 border-t border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="card-outline" size={14} color="#9CA3AF" />
              <Text className="font-Raleway-Regular text-xs text-gray-500">
                {transaction.account_number}
              </Text>
            </View>
            {transaction.account_name && (
              <Text className="font-Raleway-SemiBold text-xs text-gray-700">
                {transaction.account_name}
              </Text>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default TransactionCard;
