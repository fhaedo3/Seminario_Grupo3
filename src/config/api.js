import { Platform } from 'react-native';

/**
 * Obtiene la URL base de la API según la plataforma
 * 
 * CONFIGURACIÓN PARA EXPO GO (CELULAR FÍSICO):
 * - Cambia la IP 192.168.1.4 por la IP local de tu PC
 * - Tu celular y PC deben estar en la MISMA red WiFi
 * 
 * Para otras plataformas:
 * - Web: localhost
 * - Android Emulator: 10.0.2.2
 * - iOS Simulator: localhost
 */
const getDefaultApiUrl = () => {
  // En web siempre usar localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api/v1';
  }
  
  // PARA EXPO GO EN CELULAR FÍSICO:
  // Usar la IP local de tu PC (cambiar si es necesaria)
  // Obtener con: ipconfig (Windows) o ifconfig (Mac/Linux)
  const LOCAL_IP = '192.168.1.4';
  
  // Para Android en Expo Go (celular físico), usar IP local
  // Para Android Emulator, usar 10.0.2.2
  if (Platform.OS === 'android') {
    // Por defecto usar IP local (funciona con Expo Go)
    // Si usas emulador, cambiar manualmente a 'http://10.0.2.2:8080/api/v1'
    return `http://${LOCAL_IP}:8080/api/v1`;
  }
  
  // Para iOS en Expo Go (celular físico), usar IP local
  // Para iOS Simulator, usar localhost
  if (Platform.OS === 'ios') {
    return `http://${LOCAL_IP}:8080/api/v1`;
  }
  
  return 'http://localhost:8080/api/v1';
};

// Permite sobrescribir con variable de entorno
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getDefaultApiUrl();

export const withBaseUrl = (path = '') => {
  if (!path) {
    return API_BASE_URL;
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
