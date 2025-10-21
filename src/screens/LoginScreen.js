import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { LoginForm } from '../components/LoginForm';
import { colors } from '../theme/colors';

export const LoginScreen = ({ navigation }) => {
  const [authError, setAuthError] = useState('');

  const handleLogin = (values) => {
    const username = values.username?.trim();
    const password = values.password;
    if (!username || !password) {
      setAuthError('Ingresa tus credenciales para continuar');
      return;
    }

    setAuthError('');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Homepage', params: { userName: username.split(' ')[0] } }],
    });
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <LinearGradient
      colors={[colors.primaryBlue, colors.secondaryBlue, colors.lightBlue]}
      style={styles.background}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Iniciar sesión</Text>
          
          <LoginForm onSubmit={handleLogin} />
          
          {authError ? <Text style={styles.authError}>{authError}</Text> : null}
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
          
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes una cuenta?</Text>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleRegister}>
              <Text style={styles.secondaryButtonText}>Registrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: colors.white,
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 32,
  },
  registerText: {
    color: colors.white,
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: colors.greenButton,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  authError: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 10,
  },
});
