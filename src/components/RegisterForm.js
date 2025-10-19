import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const registerSchema = Yup.object().shape({
  username: Yup.string().min(3, 'El usuario debe tener al menos 3 caracteres').required('El usuario es obligatorio'),
  email: Yup.string().email('Ingresa un correo válido').required('El correo es obligatorio'),
  phone: Yup.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  password: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
  acceptTerms: Yup.boolean().oneOf([true], 'Debes aceptar los términos y condiciones')
});

export const RegisterForm = ({ onSubmit }) => {
  return (
    <Formik
      validationSchema={registerSchema}
      initialValues={{ 
        username: '', 
        email: '', 
        phone: '', 
        password: '', 
        confirmPassword: '', 
        acceptTerms: false 
      }}
      onSubmit={(values, helpers) => {
        onSubmit?.(values);
        setTimeout(() => helpers.setSubmitting(false), 1000);
      }}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, setFieldValue }) => (
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={colors.white} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email o Usuario"
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
              <Ionicons name="mail-outline" size={20} color={colors.white} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.mutedText}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
              />
            </View>
            {touched.email && errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={colors.white} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Teléfono (opcional)"
                placeholderTextColor={colors.mutedText}
                keyboardType="phone-pad"
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                value={values.phone}
              />
            </View>
            {touched.phone && errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
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

          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.white} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor={colors.mutedText}
                secureTextEntry
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                value={values.confirmPassword}
              />
            </View>
            {touched.confirmPassword && errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setFieldValue('acceptTerms', !values.acceptTerms)}
            >
              {values.acceptTerms && (
                <Ionicons name="checkmark" size={16} color={colors.white} />
              )}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>
              Acepto los <Text style={styles.linkText}>Términos y Condiciones</Text>
            </Text>
          </View>
          {touched.acceptTerms && errors.acceptTerms ? <Text style={styles.errorText}>{errors.acceptTerms}</Text> : null}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitLabel}>Registrarme</Text>
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
    marginBottom: 16
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
    color: colors.error,
    marginTop: 6,
    fontSize: 13
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxText: {
    color: colors.white,
    fontSize: 14,
    flex: 1,
  },
  linkText: {
    color: colors.greenButton,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.greenButton,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
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