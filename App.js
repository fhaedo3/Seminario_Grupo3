import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // <-- 1. IMPORTAR

// Importa tus íconos. Si no tienes @expo/vector-icons, instálalo
// npm install @expo/vector-icons
import { Ionicons } from '@expo/vector-icons'; 

// Importa tus pantallas
import { LoginScreen } from './src/screens/LoginScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { SearchProfessionalsScreen } from './src/screens/SearchProfessionalsScreen';
import { ProfileUserScreen } from './src/screens/ProfileUserScreen';
import { ProfileProfessionalScreen } from './src/screens/ProfileProfessionalScreen';
import MisTrabajosScreen from './src/screens/MisTrabajosScreen'; // <-- ¡Esta es tu nueva pantalla!

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator(); // <-- 2. CREAR NAVEGADOR DE TABS

// --- 3. CREAR EL COMPONENTE DE TABS ---
// Este componente define las 4 pestañas principales de tu app
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Ocultamos el header de las pestañas
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          // Asignar íconos a cada ruta
          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Buscar') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Mis Trabajos') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db', // Color activo (azul)
        tabBarInactiveTintColor: 'gray', // Color inactivo
        tabBarStyle: { backgroundColor: 'white' }, // Estilo de la barra
      })}
    >
      {/* Estas son las 4 pantallas de tu barra inferior */}
      <Tab.Screen name="Inicio" component={SearchProfessionalsScreen} />
      <Tab.Screen name="Buscar" component={SearchProfessionalsScreen} />
      <Tab.Screen name="Mis Trabajos" component={MisTrabajosScreen} />
      <Tab.Screen name="Perfil" component={ProfileUserScreen} />
    </Tab.Navigator>
  );
}

// --- 4. CONFIGURAR EL STACK NAVIGATOR PRINCIPAL ---
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        // Para probar, empezamos en "AppHome", que son las tabs
        // Cambia esto a "Login" cuando quieras el flujo completo
        initialRouteName="AppHome" 
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Pantallas del flujo de autenticación */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* El navegador de TABS se anida como UNA SOLA pantalla */}
        <Stack.Screen name="AppHome" component={MainTabNavigator} />

        {/* Otras pantallas a las que navegas DESDE las tabs */}
        {/* (Ej: al hacer clic en un perfil de profesional) */}
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="ProfileProfessional" component={ProfileProfessionalScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}