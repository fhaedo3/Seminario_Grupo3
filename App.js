import React, { useEffect, useRef, useState } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, Platform, View } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { UserStack } from './src/navigation/UserStack';
import { ProfessionalStack } from './src/navigation/ProfessionalStack';

import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createStackNavigator();

const LoadingView = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e3a8a' }}>
    <ActivityIndicator size="large" color="#fff" />
  </View>
);

const RootNavigator = () => {
  const { isAuthenticated, initializing, roles } = useAuth();
  const navigationRef = useRef();
  const [isReady, setIsReady] = useState(false);

  const isProfessional = Array.isArray(roles) && roles.includes('PROFESSIONAL');

  useEffect(() => {
    if (!isReady || initializing) return;

    let targetRoute = 'Login';
    if (isAuthenticated) {
      targetRoute = isProfessional ? 'ProfessionalApp' : 'UserApp';
    }

    if (navigationRef.current) {
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: targetRoute }],
      });
    }
  }, [isAuthenticated, isReady, initializing, isProfessional]);

  if (initializing) {
    return <LoadingView />;
  }

  const getInitialRouteName = () => {
    if (!isAuthenticated) return 'Login';
    return isProfessional ? 'ProfessionalApp' : 'UserApp';
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

        {/* Stacks principales */}
        <Stack.Screen name="UserApp" component={UserStack} />
        <Stack.Screen name="ProfessionalApp" component={ProfessionalStack} />
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
