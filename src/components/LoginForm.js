import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { colors } from '../theme/colors';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Ingresa un correo válido').required('El correo es obligatorio'),
  password: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria')
});

export const LoginForm = ({ onSubmit }) => {
  return (
    <Formik
      validationSchema={loginSchema}
      initialValues={{ email: '', password: '' }}
      onSubmit={(values, helpers) => {
        onSubmit?.(values);
        setTimeout(() => helpers.setSubmitting(false), 1000);
      }}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={[styles.input, touched.email && errors.email ? styles.inputError : undefined]}
              placeholder="tu-correo@correo.com"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
            />
            {touched.email && errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={[styles.input, touched.password && errors.password ? styles.inputError : undefined]}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor={colors.muted}
              secureTextEntry
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
            />
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
    marginBottom: 18
  },
  label: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 6
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  inputError: {
    borderColor: colors.error
  },
  errorText: {
    color: colors.error,
    marginTop: 6,
    fontSize: 13
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  submitLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700'
  }
});
