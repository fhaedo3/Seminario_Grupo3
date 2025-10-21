import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from './src/screens/LoginScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { SearchProfessionalsScreen } from './src/screens/SearchProfessionalsScreen';
import { ProfileUserScreen } from './src/screens/ProfileUserScreen';
import { ProfileProfessionalScreen } from './src/screens/ProfileProfessionalScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SearchProfessionals"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="SearchProfessionals" component={SearchProfessionalsScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="ProfileUser" component={ProfileUserScreen} />
        <Stack.Screen name="ProfileProfessional" component={ProfileProfessionalScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
