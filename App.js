import React, { useEffect } from 'react';
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
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createStackNavigator();

const LoadingView = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e3a8a' }}>
    <ActivityIndicator size="large" color="#fff" />
  </View>
);

const AuthStack = () => (
  <Stack.Navigator
    initialRouteName="Login"
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    initialRouteName="Homepage"
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Homepage" component={Homepage} />
    <Stack.Screen name="SearchProfessionals" component={SearchProfessionalsScreen} />
    <Stack.Screen name="MyJobs" component={MyJobsScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="ProfileUser" component={ProfileUserScreen} />
    <Stack.Screen name="ProfileProfessional" component={ProfileProfessionalScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ProfessionalDetails" component={ProfessionalDetails} options={{ headerShown: false }} />
    <Stack.Screen name="HireForm" component={HireFormScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return <LoadingView />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
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
