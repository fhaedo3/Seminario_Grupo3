import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { colors } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <LoginScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  }
});
