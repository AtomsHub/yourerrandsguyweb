import { MaterialIcons, Octicons, FontAwesome5 } from "@expo/vector-icons";
import icons from "./icons";
import images from "./images";
import { router } from "expo-router";

export { icons, images };

export const getVendorMenuItems = (
  handleLogout,
  setIsModalVisible,
  setIsDocumentModalVisible
) => [
  {
    category: "Personal",
    items: [
      {
        title: "Profile Details",
        subtitle: "Manage your personal information",
        icon: Octicons,
        iconName: "person",
        gradient: ["#00a859", "#33d66a"],
        action: () => setIsModalVisible(true),
      },
    ],
  },
  {
    category: "Shopping",
    items: [
      {
        title: "Order History",
        subtitle: "Track your past orders",
        icon: FontAwesome5,
        iconName: "history",
        gradient: ["#0f613f", "#00a859"],
        action: () => router.push("vendor/orders"),
      },
    ],
  },

  {
    category: "Account",
    items: [
      {
        title: "Sign Out",
        subtitle: "Logout from your account",
        icon: MaterialIcons,
        iconName: "logout",
        gradient: ["#f7a505", "#fdcd11"],
        action: handleLogout,
      },
    ],
  },
];

export const getMenuItems = (
  handleLogout,
  setIsModalVisible,
  setIsDocumentModalVisible
) => [
  {
    category: "Personal",
    items: [
      {
        title: "Profile Details",
        subtitle: "Manage your personal information",
        icon: Octicons,
        iconName: "person",
        gradient: ["#00a859", "#33d66a"],
        action: () => setIsModalVisible(true),
      },
    ],
  },
  {
    category: "Shopping",
    items: [
      {
        title: "Order History",
        subtitle: "Track your past orders",
        icon: FontAwesome5,
        iconName: "history",
        gradient: ["#0f613f", "#00a859"],
        action: () => router.push("dispatcher/orders"),
      },
    ],
  },
  {
    category: "DISPATCHER INFO",
    items: [
      {
        title: "Vehicle & Documents",
        subtitle: "View license and vehicle details",
        icon: FontAwesome5,
        iconName: "motorcycle",
        gradient: ["#8B5CF6", "#A855F7"],
        action: () => setIsDocumentModalVisible(true),
      },
    ],
  },
  {
    category: "Account",
    items: [
      {
        title: "Sign Out",
        subtitle: "Logout from your account",
        icon: MaterialIcons,
        iconName: "logout",
        gradient: ["#f7a505", "#fdcd11"],
        action: handleLogout,
      },
    ],
  },
];

// Service type configuration
export const getServiceConfig = (serviceType) => {
  const serviceConfigs = {
    Restaurant: {
      color: "#EA580C",
      bgColor: "#FFEDD5",
      icon: "restaurant-outline",
    },
    Laundry: {
      color: "#2563EB",
      bgColor: "#DBEAFE",
      icon: "shirt-outline",
    },
    Package: {
      color: "#7C3AED",
      bgColor: "#EDE9FE",
      icon: "cube-outline",
    },
    Errand: {
      color: "#059669",
      bgColor: "#D1FAE5",
      icon: "walk-outline",
    },
  };

  return (
    serviceConfigs[serviceType] || {
      color: "#6B7280",
      bgColor: "#F3F4F6",
      icon: "document-outline",
    }
  );
};

// Status configuration with only two states
export const getStatusConfig = (status) => {
  // Active states (should be visually distinct)
  const activeStates = [
    "Processing",
    "Dispatcher Assigned",
    "Dispatched Assigned",
    "Make Payment",
    "Pending",
  ];

  // Check if status is active
  const isActive = activeStates.includes(status);

  if (isActive) {
    return {
      color: "#F59E0B", // Amber for active
      bgColor: "#FEF3C7", // Light amber background
      icon: "time-outline",
    };
  }

  // Completed state
  if (status === "Completed" || status === "Delivered") {
    return {
      color: "#10B981", // Green for completed
      bgColor: "#D1FAE5", // Light green background
      icon: "checkmark-circle-outline",
    };
  }

  // Cancelled state
  if (status === "Cancelled") {
    return {
      color: "#EF4444", // Red for cancelled
      bgColor: "#FEE2E2", // Light red background
      icon: "close-circle-outline",
    };
  }

  // Default state
  return {
    color: "#6B7280", // Gray for unknown
    bgColor: "#F3F4F6", // Light gray background
    icon: "ellipse-outline",
  };
};

// Format date to "Thu, 17 May, 2000 9:30pm" format
export const formatDetailedDate = (dateString) => {
  const date = new Date(dateString);

  // Format day name (Thu)
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

  // Format date (17 May, 2000)
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();

  // Format time (9:30pm)
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  minutes = minutes < 10 ? "0" + minutes : minutes;

  return `${dayName}, ${day} ${month}, ${year} ${hours}:${minutes}${ampm}`;
};

// Simple date format for the small text
export const formatSimpleDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Today";
  if (diffDays === 2) return "Yesterday";
  if (diffDays <= 7) return `${diffDays - 1} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Today";
  if (diffDays === 2) return "Yesterday";
  if (diffDays <= 7) return `${diffDays - 1} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatCurrency = (amount, isKobo = false, decimalPlaces = 2) => {
  // Convert kobo to naira if needed
  const numericValue = isKobo ? amount / 100 : amount;

  // Format with commas and fixed decimal places
  return `\u20A6${numericValue.toLocaleString("en-NG", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  })}`;
};

export const groupOrdersByTime = (orders) => {
  if (!orders || orders.length === 0) return [];

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const lastWeekStart = new Date(todayStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const grouped = {
    Today: [],
    Yesterday: [],
    "Last Week": [],
    Earlier: [],
  };

  orders.forEach((order) => {
    const orderDate = new Date(order.created_at);

    if (orderDate >= todayStart) {
      grouped["Today"].push(order);
    } else if (orderDate >= yesterdayStart && orderDate < todayStart) {
      grouped["Yesterday"].push(order);
    } else if (orderDate >= lastWeekStart && orderDate < yesterdayStart) {
      grouped["Last Week"].push(order);
    } else {
      grouped["Earlier"].push(order);
    }
  });

  return Object.entries(grouped)
    .filter(([_, items]) => items.length > 0)
    .map(([title, data]) => ({ title, data }));
};

export const getTransactionType = (transactionType) => {
  const transactionConfigs = {
    Restaurant: {
      color: "#EA580C",
      bgColor: "#FFEDD5",
      icon: "restaurant-outline",
    },
    Laundry: {
      color: "#2563EB",
      bgColor: "#DBEAFE",
      icon: "shirt-outline",
    },
    Package: {
      color: "#7C3AED",
      bgColor: "#EDE9FE",
      icon: "cube-outline",
    },
    Errand: {
      color: "#059669",
      bgColor: "#D1FAE5",
      icon: "walk-outline",
    },
  };

  return (
    serviceConfigs[serviceType] || {
      color: "#6B7280",
      bgColor: "#F3F4F6",
      icon: "document-outline",
    }
  );
};
