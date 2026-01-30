import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth as useAuthContext } from "../context/AuthContext";
import { showToast } from "../components/ui/Toast";
import PushNotificationService from "../services/PushNotificationService";

const useAuth = () => {
  const { logout: contextLogout } = useAuthContext();

  const handleLogout = async () => {
    try {
      await PushNotificationService.cleanup();

      await AsyncStorage.multiRemove([
        "userData",
        "token",
        "isLoggedIn",
        "userRole",
        "user",
        "fcm_token",
        "fcm_token_sent",
      ]);
      await AsyncStorage.clear();

      await contextLogout();

      showToast("info", "Logged out successfully.");
    } catch (error) {
      //console.error("Error during logout:", error);
      showToast("error", "Error occurred during logout.");
    }
  };

  return { handleLogout };
};

export default useAuth;
