import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const loginSchema = Yup.object().shape({
  username: Yup.string().required('El usuario es obligatorio'),
  password: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria')
});

export const LoginForm = ({ onSubmit }) => {
  return (
    <Formik
      validationSchema={loginSchema}
      initialValues={{ username: '', password: '' }}
      onSubmit={(values, helpers) => {
        onSubmit?.(values);
        setTimeout(() => helpers.setSubmitting(false), 1000);
      }}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={colors.white} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Usuario o Email"
                placeholderTextColor={colors.mutedText}
                autoCapitalize="none"
                onChangeText={handleChange('username')}
                onBlur={handleBlur('username')}
                value={values.username}
              />
            </View>
            {touched.username && errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.white} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={colors.mutedText}
                secureTextEntry
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
              />
            </View>
            {touched.password && errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.submitLabel}>Ingresar</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  form: {
    width: '100%'
  },
  inputGroup: {
    marginBottom: 20
  },
  inputContainer: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
  },
  errorText: {
    color: colors.errorStrong,
    backgroundColor: colors.errorBackground,
    borderColor: colors.errorBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
    fontSize: 13,
    alignSelf: 'flex-start'
  },
  submitButton: {
    backgroundColor: colors.greenButton,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: colors.greenButton,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  submitLabel: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600'
  }
});
