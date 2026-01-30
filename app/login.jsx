import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import api from "../api"; // Your API instance
import FormField from "../components/inputs/FormField";
import BackgroundLayout from "../components/layout/BackgroundLayout";
import Loading from "../components/Loading";
import CustomButton from "../components/ui/CustomButton";
import { showToast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", username: "" });
  const [passwordError, setPasswordError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [loading, setLoading] = useState(false);

  const params = useLocalSearchParams();
  const { role } = params;

  if (!role) {
    router.push("welcome");
  }

  const isVendor = role === "vendor";

  const getRoleName = (roleValue) => {
    return roleValue === "vendor"
      ? "Vendor"
      : roleValue === "dispatcher"
        ? "Dispatcher"
        : "User";
  };

  const getEndpoint = (roleValue) => {
    return roleValue === "vendor"
      ? "vendor/login"
      : roleValue === "dispatcher"
        ? "dispatch/login"
        : "login";
  };

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Vendor username validation
    let usernameErrorMsg = "";
    let isUsernameValid = true;

    if (isVendor) {
      if (form.username.length > 0 && form.username.length < 3) {
        usernameErrorMsg = "Username must be at least 3 characters";
        isUsernameValid = false;
      }
      setUsernameError(usernameErrorMsg);
    }

    // Email validation (for non-vendor roles)
    let emailErrorMsg = "";
    let isEmailValid = true;

    if (!isVendor) {
      if (form.email.length >= 1 && !emailRegex.test(form.email)) {
        emailErrorMsg = "Invalid email format";
        isEmailValid = false;
      }
      setEmailError(emailErrorMsg);
    }

    // Password validation
    let passwordErrorMsg = "";
    let isPasswordValid = true;

    if (form.password.length > 0 && form.password.length < 6) {
      passwordErrorMsg = "Password must be at least 6 characters";
      isPasswordValid = false;
    }
    setPasswordError(passwordErrorMsg);

    // Check if all fields are filled based on role
    const areAllFieldsFilled = isVendor
      ? form.username.trim() !== "" && form.password.trim() !== ""
      : form.email.trim() !== "" && form.password.trim() !== "";

    const isFormComplete = isVendor
      ? areAllFieldsFilled && isUsernameValid && isPasswordValid
      : areAllFieldsFilled && isEmailValid && isPasswordValid;

    setIsFormValid(isFormComplete);
  }, [form, isVendor]);

  const handleSubmit = async () => {
    if (!isFormValid || loading) return;

    setLoading(true);
    try {
      const endpoint = getEndpoint(role);
      //console.log("Logging in to endpoint:", endpoint);

      // Prepare request body based on role
      const requestBody = isVendor
        ? {
            username: form.username,
            password: form.password,
          }
        : {
            email: form.email,
            password: form.password,
          };

      // Make API call without token for login
      const response = await api.post(`/${endpoint}`, requestBody, {
        requiresToken: false,
      });

      //console.log("Login response:", response.data);

      if (response.data.status) {
        const { user, token } = response.data.data;

        try {
          await login(user, token, role);

          showToast("success", "Login successful!");
        } catch (authError) {
          //console.error("Auth context error:", authError);
          showToast("error", "Authentication setup failed. Please try again.");
        }
      } else {
        showToast(
          "error",
          response.data?.message || "Login failed. Please try again.",
        );
      }
    } catch (error) {
      //console.log("Login error:", error);
      if (error.response) {
        const { data } = error.response;
        showToast(
          "error",
          data?.message || "Login failed. Please try again.",
          "bottom",
        );
      } else {
        showToast("error", "Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundLayout
      colors={["#ccf2e0", "#f2f9f5", "#f2f9f5", "#ffffff"]}
      header={false}
    >
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="flex-1 px-6">
          {/* Header Section */}
          <View className="pt-8 pb-12">
            {/* Welcome Text */}
            <View className="mb-2">
              <Text className="font-Raleway-Bold text-gray-900 text-4xl mb-2">
                Welcome Back!
              </Text>
              <Text className="font-SpaceGrotesk-Medium text-gray-600 text-lg">
                Sign in as {getRoleName(role)}
              </Text>
            </View>
          </View>

          {/* Form Section */}
          <View className="space-y-6">
            {isVendor ? (
              // Username field for vendors
              <FormField
                title="Username"
                placeholder="Enter your username"
                error={usernameError}
                value={form.username}
                handleChangeText={(e) => setForm({ ...form, username: e })}
                otherStyles="mb-6"
                autoCapitalize="none"
                iconBrand={Ionicons}
                iconName="person-outline"
                iconColor="#9CA3AF"
                textInputBgStyles={"h-[60]"}
                size={20}
              />
            ) : (
              // Email field for other roles
              <FormField
                title="Email Address"
                placeholder="Enter your email"
                error={emailError}
                value={form.email}
                handleChangeText={(e) => setForm({ ...form, email: e })}
                otherStyles="mb-6"
                keyboardType="email-address"
                autoCapitalize="none"
                iconBrand={Ionicons}
                iconName="mail-outline"
                iconColor="#9CA3AF"
                textInputBgStyles={"h-[60]"}
                size={20}
              />
            )}

            <FormField
              title="Password"
              placeholder="Enter your password"
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              error={passwordError}
              otherStyles="mb-6"
              password={true}
              size={20}
              iconBrand={Ionicons}
              iconName="lock-closed-outline"
              iconColor="#9CA3AF"
            />
          </View>

          {/* Login Button */}
          <View className="mt-8 mb-4">
            <CustomButton
              title={loading ? "Signing in..." : "Sign In"}
              containerStyles={`bg-primary h-14`}
              textStyles={`text-white text-lg`}
              handlePress={handleSubmit}
              disabled={!isFormValid || loading}
            />
          </View>

          {/* Footer */}
          <View className="items-center pb-8">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.push(`/welcome`)}
                className="flex-row items-center gap-3"
              >
                <Ionicons name="arrow-back" />
                <Text className="text-primary font-Raleway-SemiBold">
                  Go Back
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {loading && <Loading />}
      <StatusBar style="dark" />
    </BackgroundLayout>
  );
};

export default Login;
