import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LiveDetectionScreen from '../screens/detection/LiveDetectionScreen';
import UploadDetectionScreen from '../screens/detection/UploadDetectionScreen';
import ResultScreen from '../screens/detection/ResultScreen';

const Stack = createNativeStackNavigator();

const DetectionStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Live Detection" component={LiveDetectionScreen} />
      <Stack.Screen name="Upload Detection" component={UploadDetectionScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  );
};

export default DetectionStackNavigator;





