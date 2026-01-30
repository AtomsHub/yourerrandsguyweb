import React, { useState, useEffect, useRef } from "react";
import { View, Image, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const OptimizedImage = ({
  source,
  fallbackSource,
  containerStyle = "w-[80px] h-[80px] rounded-xl overflow-hidden bg-white items-center justify-center",
  resizeMode = "cover",
  showShimmer = true,
  shimmerDuration = 1500,
  placeholderIcon = "image-outline",
  placeholderIconSize = 28,
  placeholderIconColor = "#9CA3AF",
  onLoad,
  onError,
  ...imageProps
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  // Shimmer animation effect
  useEffect(() => {
    if (imageLoading && !imageError && showShimmer) {
      const startShimmer = () => {
        shimmerAnimation.setValue(0);
        Animated.loop(
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: shimmerDuration,
            useNativeDriver: false,
          })
        ).start();
      };

      startShimmer();
      return () => shimmerAnimation.stopAnimation();
    }
  }, [imageLoading, imageError, shimmerAnimation, showShimmer, shimmerDuration]);

  const shimmerTranslate = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const handleImageError = (error) => {
    setImageError(true);
    setImageLoading(false);
    if (onError) onError(error);
  };

  const handleImageLoad = (event) => {
    setImageLoading(false);
    if (onLoad) onLoad(event);
  };

  return (
    <View className={containerStyle}>
      {!imageError ? (
        <Image
          source={source}
          className="w-full h-full"
          resizeMode={resizeMode}
          onError={handleImageError}
          onLoad={handleImageLoad}
          {...imageProps}
        />
      ) : (
        // Fallback image or icon
        fallbackSource ? (
          <Image
            source={fallbackSource}
            resizeMode={resizeMode}
            className="w-full h-full"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-gray-100">
            <Ionicons 
              name={placeholderIcon} 
              size={placeholderIconSize} 
              color={placeholderIconColor} 
            />
          </View>
        )
      )}

      {imageLoading && !imageError && showShimmer && (
        <View className="absolute inset-0 bg-gray-100 items-center justify-center">
          {/* Shimmer animation */}
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transform: [{ translateX: shimmerTranslate }],
            }}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                shadowColor: "#fff",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
              }}
            />
          </Animated.View>
          <Ionicons 
            name={placeholderIcon} 
            size={placeholderIconSize} 
            color={placeholderIconColor} 
          />
        </View>
      )}
    </View>
  );
};

export default OptimizedImage;

// ========================================
// Updated PopularCard Component
// ========================================



// ========================================
// Usage Examples
// ========================================

// Example 1: Basic usage (matches PopularCard style)
// <OptimizedImage
//   source={{ uri: 'https://example.com/image.jpg' }}
//   fallbackSource={images.placeholder}
// />

// Example 2: Custom container style
// <OptimizedImage
//   source={{ uri: 'https://example.com/image.jpg' }}
//   fallbackSource={images.placeholder}
//   containerStyle="w-[120px] h-[120px] rounded-full overflow-hidden bg-gray-200"
// />

// Example 3: Profile picture style
// <OptimizedImage
//   source={{ uri: userProfileImage }}
//   fallbackSource={images.defaultAvatar}
//   containerStyle="w-[60px] h-[60px] rounded-full overflow-hidden bg-blue-100"
//   placeholderIcon="person-outline"
//   placeholderIconSize={24}
// />

// Example 4: Product image with different shimmer settings
// <OptimizedImage
//   source={{ uri: productImage }}
//   fallbackSource={images.productPlaceholder}
//   containerStyle="w-full h-[200px] rounded-2xl overflow-hidden bg-white"
//   shimmerDuration={2000}
//   placeholderIcon="cube-outline"
// />

// Example 5: Disable shimmer animation
// <OptimizedImage
//   source={{ uri: imageUrl }}
//   fallbackSource={images.fallback}
//   containerStyle="w-[100px] h-[100px] rounded-lg overflow-hidden"
//   showShimmer={false}
// />