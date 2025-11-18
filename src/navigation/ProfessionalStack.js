import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfessionalDashboard } from '../screens/ProfessionalDashboard';
import { ProfessionalInsights } from '../screens/ProfessionalInsights';
import { ProfessionalViewProfile } from '../screens/ProfessionalViewProfile';
import { ProfileProfessionalScreen } from '../screens/ProfileProfessionalScreen';
import { MyJobsScreen } from '../screens/MyJobsScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ReplyToReview } from '../screens/ReplyToReview';
import { SearchProfessionalsScreen } from '../screens/SearchProfessionalsScreen';
import { ProfessionalDetails } from '../screens/ProfessionalDetails';
import { EditPricedServicesScreen } from '../screens/EditPricedServicesScreen';

const Stack = createStackNavigator();

export const ProfessionalStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Dashboard principal del profesional - Home */}
      <Stack.Screen name="Dashboard" component={ProfessionalDashboard} />

      {/* Insights y estadísticas de zona */}
      <Stack.Screen name="Insights" component={ProfessionalInsights} />

      {/* Ver perfil público del profesional */}
      <Stack.Screen name="ViewProfile" component={ProfessionalViewProfile} />

      {/* Editar perfil profesional */}
      <Stack.Screen name="EditProfile" component={ProfileProfessionalScreen} />

      {/* Editar servicios con precio */}
      <Stack.Screen name="EditPricedService" component={EditPricedServicesScreen} />

      {/* Trabajos del profesional */}
      <Stack.Screen name="MyJobs" component={MyJobsScreen} />

      {/* Chat */}
      <Stack.Screen name="Chat" component={ChatScreen} />

      {/* Responder a reviews */}
      <Stack.Screen name="ReplyToReview" component={ReplyToReview} />

      {/* Búsqueda de profesionales (por si quiere ver a otros) */}
      <Stack.Screen name="SearchProfessionals" component={SearchProfessionalsScreen} />

      {/* Detalles de otros profesionales */}
      <Stack.Screen name="ProfessionalDetails" component={ProfessionalDetails} />
    </Stack.Navigator>
  );
};
