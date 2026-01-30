import { useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function NotFoundScreen() {
  const router = useRouter();
  const { isLoggedIn, userRole } = useAuth();

  const handleGoHome = () => {
    if (!isLoggedIn) {
      router.replace("/welcome");
    } else if (userRole === "dispatcher") {
      router.replace("/dispatcher");
    } else if (userRole === "vendor") {
      router.replace("/vendor");
    } else {
      // Fallback to welcome if role is somehow invalid
      router.replace("/welcome");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🤔</Text>
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.message}>
        This page doesn't exist or you don't have access to it.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleGoHome}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {isLoggedIn ? "Go to Dashboard" : "Go to Welcome"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#00a859",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
