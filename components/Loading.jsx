import { View, ActivityIndicator } from 'react-native';
import React from 'react';
import { BlurView } from 'expo-blur';

const Loading = () => {
  return (
    <BlurView
      intensity={20} 
      tint="default"
      experimentalBlurMethod="dimezisBlurView" 
      className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center"
    >
      <ActivityIndicator size="large" color="black" />
    </BlurView>
  );
};

export default Loading;