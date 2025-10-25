import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { colors } from '../theme/colors';
import { BackButton } from '../components/BackButton';

// Esquema de validación con Yup
const HireSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .required('El nombre completo es obligatorio'),
  phone: Yup.string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .required('El teléfono es obligatorio'),
  email: Yup.string()
    .email('Ingresa un email válido')
    .required('El email es obligatorio'),
  address: Yup.string()
    .min(10, 'La dirección debe ser más específica')
    .required('La dirección es obligatoria'),
  serviceType: Yup.string()
    .required('Selecciona el tipo de servicio'),
  description: Yup.string()
    .min(20, 'Describe el trabajo con más detalle (mínimo 20 caracteres)')
    .required('La descripción del trabajo es obligatoria'),
  preferredDate: Yup.string()
    .required('La fecha preferida es obligatoria'),
  budget: Yup.string()
    .required('Indica tu presupuesto estimado'),
});

export const HireFormScreen = ({ route, navigation }) => {
  const { professional } = route.params;
  const [selectedService, setSelectedService] = useState('');

  const handleSubmit = (values) => {
    // Simulamos validación y navegamos a la pantalla de pago
    const hireSummary = {
      professional,
      clientData: values,
      totalAmount: values.budget,
    };

    navigation.navigate('Payment', { hireSummary });
  };

  return (
    <LinearGradient
      colors={[colors.primaryBlue, colors.secondaryBlue]}
      style={styles.background}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <BackButton navigation={navigation} backgroundColor="rgba(0,0,0,0.3)" />
          <View style={styles.headerContent}>
            <Text style={styles.title}>Contratar Profesional</Text>
            <Text style={styles.subtitle}>
              Completá tus datos para contratar a {professional.name}
            </Text>
          </View>
        </View>

        <Formik
          initialValues={{
            fullName: '',
            phone: '',
            email: '',
            address: '',
            serviceType: '',
            description: '',
            preferredDate: '',
            budget: '',
          }}
          validationSchema={HireSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <>
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Card con información del profesional */}
                <View style={styles.professionalCard}>
                  <View style={styles.professionalInfo}>
                    <Ionicons name="person-circle" size={48} color={colors.white} />
                    <View style={styles.professionalDetails}>
                      <Text style={styles.professionalName}>{professional.name}</Text>
                      <Text style={styles.professionalProfession}>{professional.profession}</Text>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>{professional.rating} · {professional.experience} años exp.</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Formulario */}
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Datos de contacto</Text>

                  {/* Nombre completo */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nombre completo *</Text>
                    <View style={[styles.inputContainer, touched.fullName && errors.fullName && styles.inputError]}>
                      <Ionicons name="person-outline" size={20} color={colors.white} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Ej: Juan Pérez"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={values.fullName}
                        onChangeText={handleChange('fullName')}
                        onBlur={handleBlur('fullName')}
                      />
                    </View>
                    {touched.fullName && errors.fullName && (
                      <Text style={styles.errorText}>{errors.fullName}</Text>
                    )}
                  </View>

                  {/* Teléfono */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Teléfono *</Text>
                    <View style={[styles.inputContainer, touched.phone && errors.phone && styles.inputError]}>
                      <Ionicons name="call-outline" size={20} color={colors.white} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Ej: +54 9 11 1234-5678"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={values.phone}
                        onChangeText={handleChange('phone')}
                        onBlur={handleBlur('phone')}
                        keyboardType="phone-pad"
                      />
                    </View>
                    {touched.phone && errors.phone && (
                      <Text style={styles.errorText}>{errors.phone}</Text>
                    )}
                  </View>

                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email *</Text>
                    <View style={[styles.inputContainer, touched.email && errors.email && styles.inputError]}>
                      <Ionicons name="mail-outline" size={20} color={colors.white} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="tu@email.com"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                    {touched.email && errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  {/* Dirección */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Dirección del trabajo *</Text>
                    <View style={[styles.inputContainer, touched.address && errors.address && styles.inputError]}>
                      <Ionicons name="location-outline" size={20} color={colors.white} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Ej: Av. Corrientes 1234, CABA"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={values.address}
                        onChangeText={handleChange('address')}
                        onBlur={handleBlur('address')}
                      />
                    </View>
                    {touched.address && errors.address && (
                      <Text style={styles.errorText}>{errors.address}</Text>
                    )}
                  </View>
                </View>

                {/* Detalles del servicio */}
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Detalles del servicio</Text>

                  {/* Tipo de servicio */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tipo de servicio *</Text>
                    <View style={styles.servicesGrid}>
                      {professional.services.map((service, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.serviceChip,
                            values.serviceType === service && styles.serviceChipSelected,
                          ]}
                          onPress={() => setFieldValue('serviceType', service)}
                        >
                          <Text
                            style={[
                              styles.serviceChipText,
                              values.serviceType === service && styles.serviceChipTextSelected,
                            ]}
                          >
                            {service}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {touched.serviceType && errors.serviceType && (
                      <Text style={styles.errorText}>{errors.serviceType}</Text>
                    )}
                  </View>

                  {/* Descripción del trabajo */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Descripción del trabajo *</Text>
                    <View style={[styles.inputContainer, styles.textAreaContainer, touched.description && errors.description && styles.inputError]}>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe en detalle el trabajo que necesitas..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={values.description}
                        onChangeText={handleChange('description')}
                        onBlur={handleBlur('description')}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>
                    {touched.description && errors.description && (
                      <Text style={styles.errorText}>{errors.description}</Text>
                    )}
                  </View>

                  {/* Fecha preferida */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Fecha preferida *</Text>
                    <View style={[styles.inputContainer, touched.preferredDate && errors.preferredDate && styles.inputError]}>
                      <Ionicons name="calendar-outline" size={20} color={colors.white} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Ej: 25/10/2025"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={values.preferredDate}
                        onChangeText={handleChange('preferredDate')}
                        onBlur={handleBlur('preferredDate')}
                      />
                    </View>
                    {touched.preferredDate && errors.preferredDate && (
                      <Text style={styles.errorText}>{errors.preferredDate}</Text>
                    )}
                  </View>

                  {/* Presupuesto estimado */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Presupuesto estimado (ARS) *</Text>
                    <View style={[styles.inputContainer, touched.budget && errors.budget && styles.inputError]}>
                      <Ionicons name="cash-outline" size={20} color={colors.white} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Ej: 15000"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={values.budget}
                        onChangeText={handleChange('budget')}
                        onBlur={handleBlur('budget')}
                        keyboardType="numeric"
                      />
                    </View>
                    {touched.budget && errors.budget && (
                      <Text style={styles.errorText}>{errors.budget}</Text>
                    )}
                  </View>
                </View>

                {/* Nota informativa */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={24} color={colors.white} />
                  <Text style={styles.infoText}>
                    El profesional recibirá tu solicitud y se pondrá en contacto para confirmar
                    disponibilidad y presupuesto final.
                  </Text>
                </View>
              </ScrollView>

              {/* Botón de contratar */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.white} />
                  <Text style={styles.submitButtonText}>Continuar al pago</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    marginTop: 16,
  },
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.white,
    fontSize: 15,
    opacity: 0.85,
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  professionalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  professionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  professionalDetails: {
    marginLeft: 16,
    flex: 1,
  },
  professionalName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  professionalProfession: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    color: colors.white,
    fontSize: 13,
    opacity: 0.85,
  },
  formSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  serviceChipSelected: {
    backgroundColor: colors.greenButton,
    borderColor: colors.greenButton,
  },
  serviceChipText: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.8,
  },
  serviceChipTextSelected: {
    fontWeight: '600',
    opacity: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    backgroundColor: colors.primaryBlue,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.greenButton,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: colors.greenButton,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});

