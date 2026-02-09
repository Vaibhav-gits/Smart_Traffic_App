import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import { ViolationProvider } from './context/ViolationContext';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <ViolationProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </ViolationProvider>
    </AuthProvider>
  );
}