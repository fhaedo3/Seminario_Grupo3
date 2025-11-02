import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { RegisterForm } from '../components/RegisterForm';
import { BackButton } from '../components/BackButton';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [registerError, setRegisterError] = useState('');

  const handleRegister = async (values) => {
    const payload = {
      username: values.username?.trim(),
      email: values.email?.trim(),
      phone: values.phone?.trim() || '',
      password: values.password,
      fullName: values.fullName?.trim() || values.username?.trim(),
      registerAsProfessional: Boolean(values.registerAsProfessional),
    };

    try {
      setRegisterError('');
      await register(payload);
    } catch (error) {
      const message = error?.message ?? 'No se pudo completar el registro';
      setRegisterError(message);
      throw error;
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
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
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <BackButton navigation={navigation} fallbackRoute="Login" />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>Crear cuenta</Text>
            
            <RegisterForm onSubmit={handleRegister} apiError={registerError} />
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin}>
                <Text style={styles.secondaryButtonText}>Inicia sesion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  topBar: {
    paddingHorizontal: 24,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  title: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  loginText: {
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
});