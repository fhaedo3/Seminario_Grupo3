import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Homepage } from '../screens/Homepage';
import { SearchProfessionalsScreen } from '../screens/SearchProfessionalsScreen';
import { MyJobsScreen } from '../screens/MyJobsScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ProfileUserScreen } from '../screens/ProfileUserScreen';
import { ProfessionalDetails } from '../screens/ProfessionalDetails';
import { HireFormScreen } from '../screens/HireFormScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { ReviewProfessional } from '../screens/ReviewProfessional';

const Stack = createStackNavigator();

export const UserStack = () => {
  return (
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
      <Stack.Screen name="ProfessionalDetails" component={ProfessionalDetails} />
      <Stack.Screen name="HireForm" component={HireFormScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="ReviewProfessional" component={ReviewProfessional} />
    </Stack.Navigator>
  );
};
