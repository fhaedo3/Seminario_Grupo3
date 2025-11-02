import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;
const PHONE_REGEX = /^\+?\d{7,15}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const NAME_REGEX = /^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s'.-]{3,60}$/;

const registerSchema = Yup.object().shape({
  fullName: Yup.string()
    .trim()
    .matches(NAME_REGEX, 'Ingresa un nombre válido (solo letras)')
    .required('El nombre completo es obligatorio'),
  username: Yup.string()
    .trim()
    .matches(USERNAME_REGEX, 'Usa de 3 a 30 caracteres alfanuméricos (., _, - permitidos)')
    .required('El usuario es obligatorio'),
  email: Yup.string().trim().email('Ingresa un correo válido').required('El correo es obligatorio'),
  phone: Yup.string()
    .trim()
    .matches(PHONE_REGEX, {
      message: 'Ingresa un teléfono válido. Solo números y un + opcional',
      excludeEmptyString: true,
    }),
  password: Yup.string()
    .matches(PASSWORD_REGEX, 'Mínimo 8 caracteres, con mayúscula, minúscula y número')
    .required('La contraseña es obligatoria'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
  acceptTerms: Yup.boolean().oneOf([true], 'Debes aceptar los términos y condiciones'),
});

export const RegisterForm = ({ onSubmit, apiError }) => {
  return (
    <Formik
      validationSchema={registerSchema}
      initialValues={{
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
        registerAsProfessional: false,
      }}
      onSubmit={async (values, helpers) => {
        try {
          await onSubmit?.(values);
        } finally {
          helpers.setSubmitting(false);
        }
      }}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
        isSubmitting,
        setFieldValue,
      }) => {
        const showAcceptError = touched.acceptTerms && Boolean(errors.acceptTerms);

        return (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color={colors.white} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo"
                  placeholderTextColor={colors.mutedText}
                  onChangeText={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  value={values.fullName}
                />
              </View>
              {touched.fullName && errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={colors.white} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email o Usuario"
                  placeholderTextColor={colors.mutedText}
                  autoCapitalize="none"
                  autoCorrect={false}
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
                  autoCorrect={false}
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
              {touched.confirmPassword && errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            <View style={[styles.checkboxContainer, showAcceptError && styles.checkboxContainerError]}>
              <TouchableOpacity
                style={[styles.checkbox, showAcceptError && styles.checkboxError]}
                onPress={() => setFieldValue('acceptTerms', !values.acceptTerms)}
              >
                {values.acceptTerms && <Ionicons name="checkmark" size={16} color={colors.white} />}
              </TouchableOpacity>
              <Text style={[styles.checkboxText, showAcceptError && styles.checkboxTextError]}>
                Acepto los <Text style={styles.linkText}>Términos y Condiciones</Text>
              </Text>
            </View>
            {showAcceptError ? <Text style={styles.errorText}>{errors.acceptTerms}</Text> : null}

            <View style={styles.switchContainer}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchLabel}>Quiero ofrecer mis servicios</Text>
                <Text style={styles.switchDescription}>
                  Activá esta opción si querés registrarte como profesional
                </Text>
              </View>
              <Switch
                value={values.registerAsProfessional}
                onValueChange={(value) => setFieldValue('registerAsProfessional', value)}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: colors.greenButton }}
                thumbColor={values.registerAsProfessional ? colors.white : '#f4f3f4'}
              />
            </View>

            {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitLabel}>Registrarme</Text>}
            </TouchableOpacity>
          </View>
        );
      }}
    </Formik>
  );
};

const styles = StyleSheet.create({
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
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
    alignSelf: 'flex-start',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  checkboxContainerError: {
    backgroundColor: colors.errorBackground,
    borderColor: colors.errorBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  checkboxError: {
    borderColor: colors.errorStrong,
  },
  checkboxText: {
    color: colors.white,
    fontSize: 14,
    flex: 1,
  },
  checkboxTextError: {
    color: colors.errorStrong,
    fontWeight: '600',
  },
  linkText: {
    color: colors.greenButton,
    fontWeight: '600',
  },
  switchContainer: {
    marginTop: 4,
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  switchTextContainer: {
    flex: 1,
  },
  switchLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  switchDescription: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: 4,
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
    elevation: 4,
  },
  submitLabel: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  apiError: {
    color: colors.errorStrong,
    backgroundColor: colors.errorBackground,
    borderColor: colors.errorBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: 'center',
    marginBottom: 12,
  },
});
