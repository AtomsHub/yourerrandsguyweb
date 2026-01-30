import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  SectionList,
} from "react-native";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import api from "@/api";
import Loading from "@/components/Loading";
import { images } from "@/constants";
import { formatCurrency, groupOrdersByTime } from "@/constants";
import { showToast } from "@/components/ui/Toast";
import BackgroundLayout from "@/components/layout/BackgroundLayout";
import TransactionCard from "../../components/cards/TransactionCard";

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dummy data following API structure
  const dummyTransactions = [
    {
      id: 1,
      dispatcher_id: null,
      vendor_id: 1,
      amount: "5000.00",
      bank_name: "Access Bank Plc",
      account_number: "0123456789",
      account_name: "John Doe",
      status: "successful",
      created_at: "2024-12-09T10:30:00.000000Z",
      updated_at: "2024-12-09T10:30:00.000000Z",
    },
    {
      id: 2,
      dispatcher_id: null,
      vendor_id: 1,
      amount: "1500.00",
      bank_name: "GTBank Plc (Guaranty Trust Bank)",
      account_number: "0234567890",
      account_name: "Jane Smith",
      status: "successful",
      created_at: "2024-12-08T14:22:00.000000Z",
      updated_at: "2024-12-08T14:22:00.000000Z",
    },
    {
      id: 3,
      dispatcher_id: null,
      vendor_id: 1,
      amount: "3200.00",
      bank_name: "First Bank of Nigeria Limited",
      account_number: "3012345678",
      account_name: "Ahmed Musa",
      status: "pending",
      created_at: "2024-12-08T09:15:00.000000Z",
      updated_at: "2024-12-08T09:15:00.000000Z",
    },
    {
      id: 4,
      dispatcher_id: null,
      vendor_id: 1,
      amount: "2500.00",
      bank_name: "Zenith Bank Plc",
      account_number: "2012345678",
      account_name: "Chioma Okafor",
      status: "successful",
      created_at: "2024-12-07T16:45:00.000000Z",
      updated_at: "2024-12-07T16:45:00.000000Z",
    },
    {
      id: 5,
      dispatcher_id: null,
      vendor_id: 1,
      amount: "800.00",
      bank_name: "OPay Digital Services Limited (OPay)",
      account_number: "8102458866",
      account_name: "Opay",
      status: "failed",
      created_at: "2024-12-07T11:20:00.000000Z",
      updated_at: "2024-12-07T11:20:00.000000Z",
    },
    {
      id: 6,
      dispatcher_id: null,
      vendor_id: 1,
      amount: "4500.00",
      bank_name: "United Bank for Africa Plc (UBA)",
      account_number: "2023456789",
      account_name: "Ibrahim Yusuf",
      status: "successful",
      created_at: "2024-12-06T13:55:00.000000Z",
      updated_at: "2024-12-06T13:55:00.000000Z",
    },
    {
      id: 7,
      dispatcher_id: null,
      vendor_id: 1,
      amount: "1200.00",
      bank_name: "Kuda Microfinance Bank",
      account_number: "2000123456",
      account_name: "Blessing Eze",
      status: "successful",
      created_at: "2024-12-05T18:10:00.000000Z",
      updated_at: "2024-12-05T18:10:00.000000Z",
    },
    {
      id: 8,
      dispatcher_id: null,
      vendor_id: 1,
      amount: "6000.00",
      bank_name: "Wema Bank Plc (ALAT by Wema)",
      account_number: "0112345678",
      account_name: "Tunde Bakare",
      status: "pending",
      created_at: "2024-12-05T08:30:00.000000Z",
      updated_at: "2024-12-05T08:30:00.000000Z",
    },
    {
      id: 9,
      dispatcher_id: null,
      vendor_id: 1,
      amount: "950.00",
      bank_name: "Sterling Bank Plc",
      account_number: "0082345678",
      account_name: "Grace Adebayo",
      status: "successful",
      created_at: "2024-12-04T19:45:00.000000Z",
      updated_at: "2024-12-04T19:45:00.000000Z",
    },
    {
      id: 10,
      dispatcher_id: null,
      vendor_id: 1,
      amount: "3800.00",
      bank_name: "Access Bank Plc",
      account_number: "0123456789",
      account_name: "Emeka Obi",
      status: "successful",
      created_at: "2024-11-28T15:30:00.000000Z",
      updated_at: "2024-11-28T15:30:00.000000Z",
    },
  ];

  const fetchTransactionOrder = async () => {
    const storedTransactions = await AsyncStorage.getItem(
      "transactions_history",
    );

    if (storedTransactions) {
      const parsedTransactions = JSON.parse(storedTransactions);
      setTransactions(parsedTransactions);
    }
  };

  useEffect(() => {
    fetchTransactionOrder();
  }, []);

  const getTransactions = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const response = await api.get("/vendor/transactions");
      //console.log("Transactions response:", response.data);
      if (response.data.status) {
        const transactions_history = response.data.data;
        setTransactions(transactions_history);
        await AsyncStorage.setItem(
          "transactions_history",
          JSON.stringify(transactions_history),
        );
        showToast("success", "Transactions updated successfully!");
      }
    } catch (err) {
      //console.error("Transaction fetch error:", err);
      showToast("error", "Failed to fetch Transactions!");
      // Use dummy data as fallback for development
      setTransactions(dummyTransactions);
      await AsyncStorage.setItem(
        "transactions_history",
        JSON.stringify(dummyTransactions),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getTransactions(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      getTransactions();
    }, []),
  );

  const renderTransactionItem = ({ item }) => (
    <View className="px-4">
      <TransactionCard transaction={item} />
    </View>
  );

  const renderSectionHeader = ({ section: { title } }) => (
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
                {groupOrdersByTime(transactions).find(
                  (section) => section.title === title,
                )?.data.length || 0}{" "}
                Transactions
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <BackgroundLayout
      header={true}
      title="Payment History"
      showCart={false}
      className="flex-1"
    >
      <SectionList
        sections={groupOrdersByTime(transactions)}
        renderItem={renderTransactionItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={{ paddingBottom: 30 }}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00a859"
            colors={["#00a859"]}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <View className="bg-gray-50 w-32 h-32 rounded-full overflow-hidden items-center justify-center mb-6 shadow-sm">
              <LinearGradient
                colors={["#f3f4f6", "#e5e7eb"]}
                className="w-full h-full rounded-full items-center justify-center"
              >
                <Ionicons name="wallet-outline" size={48} color="#9ca3af" />
              </LinearGradient>
            </View>
            <Text className="font-SpaceGrotesk-Bold text-xl text-gray-700 mb-2">
              No Transactions Yet
            </Text>
            <Text className="font-Raleway-Regular text-gray-500 text-center w-8/12 leading-5">
              Your transaction history will appear here once you make your first
              withdrawal.
            </Text>
          </View>
        }
      />
    </BackgroundLayout>
  );
}
