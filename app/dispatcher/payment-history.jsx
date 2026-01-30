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
  const transaction = [
    {
      id: 1,
      title: "Salary Payment",
      type: "credit",
      status: "completed",
      amount: 5000.0,
      created_at: "2024-01-15T10:30:00Z",
      description: "Monthly salary deposit from company",
    },
    {
      id: 2,
      title: "Grocery Store Purchase",
      type: "debit",
      status: "completed",
      amount: 87.45,
      created_at: "2024-01-14T16:22:00Z",
      description: "Payment to SuperMart for groceries",
    },
    {
      id: 3,
      title: "ATM Withdrawal",
      type: "debit",
      status: "completed",
      amount: 200.0,
      created_at: "2024-01-14T14:15:00Z",
      description: "Cash withdrawal from First Bank ATM",
    },
    {
      id: 4,
      title: "Freelance Payment",
      type: "credit",
      status: "pending",
      amount: 1250.0,
      created_at: "2024-01-13T09:45:00Z",
      description: "Payment for web development project",
    },
    {
      id: 5,
      title: "Online Shopping",
      type: "debit",
      status: "completed",
      amount: 156.78,
      created_at: "2024-01-12T20:30:00Z",
      description: "Purchase from Amazon",
    },
    {
      id: 6,
      title: "Bank Transfer",
      type: "debit",
      status: "failed",
      amount: 500.0,
      created_at: "2024-01-12T11:20:00Z",
      description: "Transfer to savings account - insufficient funds",
    },
    {
      id: 7,
      title: "Refund",
      type: "credit",
      status: "completed",
      amount: 89.99,
      created_at: "2024-01-11T13:55:00Z",
      description: "Refund from cancelled subscription",
    },
    {
      id: 8,
      title: "Gas Station",
      type: "debit",
      status: "completed",
      amount: 65.2,
      created_at: "2024-01-10T18:10:00Z",
      description: "Fuel purchase at Shell Station",
    },
    {
      id: 9,
      title: "Investment Dividend",
      type: "credit",
      status: "pending",
      amount: 320.5,
      created_at: "2024-01-10T08:30:00Z",
      description: "Quarterly dividend payment",
    },
    {
      id: 10,
      title: "Restaurant Bill",
      type: "debit",
      status: "completed",
      amount: 42.85,
      created_at: "2024-01-09T19:45:00Z",
      description: "Dinner at Italian Restaurant",
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

      const response = await api.get("/dispatch/transactions");
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
      showToast("error", "Failed to fetch Transactions!");
      fetchTransactionOrder();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getTransactions(false);
  };

  // Fetch data every time the screen is focused
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

  return (
    <BackgroundLayout
      header={true}
      title="Payment History"
      showCart={false}
      className="flex-1"
      // onPress={onRefresh}
    >
      <SectionList
        sections={groupOrdersByTime(transactions)}
        renderItem={renderTransactionItem}
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
            <Image
              source={images.noResult}
              className="w-60 h-60"
              alt="No recent rides found"
              resizeMode="contain"
            />
            <Text className="text-base font-Raleway-Regular">
              No transactions found
            </Text>
          </View>
        }
      />
    </BackgroundLayout>
  );
}
