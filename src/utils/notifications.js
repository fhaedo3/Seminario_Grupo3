import { Platform, ToastAndroid, Alert } from 'react-native';

export const showSuccessToast = (message) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert('Éxito', message);
};
