import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { showToast } from "../components/ui/Toast";
import useAuth from "../hooks/useAuth";

// Base URL from environment variable
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Function to get the token from storage
const getToken = async () => {
  return await AsyncStorage.getItem("token");
};

// Request interceptor to attach the Bearer token
api.interceptors.request.use(
  async (config) => {
    // Check if the request should include the token
    if (config.requiresToken !== false) {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Handle HTTP errors (e.g., 401 Unauthorized)
      if (error.response.status === 401) {
        const { handleLogout } = useAuth(); // Use the custom hook
        await handleLogout();
      } else {
        showToast("error", error.response?.data?.message);
      }
    } else if (error.request) {
      // Handle network errors (e.g., no internet connection)
      showToast(
        "error",
        "Unable to connect to the server. Please check your internet connection.",
      );
    } else {
      // Handle other errors
      // //console.error("Error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
