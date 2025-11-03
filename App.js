import React, { useEffect, useRef, useState } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, Platform, View } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { Homepage } from './src/screens/Homepage';
import { SearchProfessionalsScreen } from './src/screens/SearchProfessionalsScreen';
import { MyJobsScreen } from './src/screens/MyJobsScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ProfileUserScreen } from './src/screens/ProfileUserScreen';
import { ProfileProfessionalScreen } from './src/screens/ProfileProfessionalScreen';
import { ProfessionalDetails } from './src/screens/ProfessionalDetails';
import { HireFormScreen } from './src/screens/HireFormScreen';
import { PaymentScreen } from './src/screens/PaymentScreen';
import { ReviewProfessional } from './src/screens/ReviewProfessional'

import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createStackNavigator();

const LoadingView = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e3a8a' }}>
    <ActivityIndicator size="large" color="#fff" />
  </View>
);

const RootNavigator = () => {
  const { isAuthenticated, initializing } = useAuth();
  const navigationRef = useRef();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isReady || initializing) return;

    const targetRoute = isAuthenticated ? 'Homepage' : 'Login';
    
    if (navigationRef.current) {
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: targetRoute }],
      });
    }
  }, [isAuthenticated, isReady, initializing]);

  if (initializing) {
    return <LoadingView />;
  }

  const getInitialRouteName = () => {
    return isAuthenticated ? 'Homepage' : 'Login';
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => setIsReady(true)}
    >
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Pantallas de autenticación */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        
        {/* Pantallas principales */}
        <Stack.Screen name="Homepage" component={Homepage} />
        <Stack.Screen name="SearchProfessionals" component={SearchProfessionalsScreen} />
        <Stack.Screen name="MyJobs" component={MyJobsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="ReviewProfessional" component={ReviewProfessional} />
        <Stack.Screen name="ProfileUser" component={ProfileUserScreen} />
        <Stack.Screen name="ProfileProfessional" component={ProfileProfessionalScreen} />
        <Stack.Screen name="ProfessionalDetails" component={ProfessionalDetails} />
        <Stack.Screen name="HireForm" component={HireFormScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  useEffect(() => {
    const configureNavigationBar = async () => {
      if (Platform.OS !== 'android') {
        return;
      }

      try {
        await NavigationBar.setBehaviorAsync('overlay-swipe');
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBackgroundColorAsync('#1e3a8a');
      } catch (error) {
        console.warn('NavigationBar configuration failed', error);
      }
    };

    configureNavigationBar();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
