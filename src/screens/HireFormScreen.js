import React, { useMemo, useState } from 'react';
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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';
import { BackButton } from '../components/BackButton';
import { useAuth } from '../context/AuthContext';
import { serviceOrdersApi } from '../api';

// Esquema de validación con Yup
const HireSchema = Yup.object().shape({
  address: Yup.string()
    .min(10, 'La dirección debe ser más específica')
    .required('La dirección es obligatoria'),
  serviceType: Yup.array()
    .min(1, 'Selecciona al menos un tipo de servicio')
    .required('Selecciona el tipo de servicio'),
  description: Yup.string()
    .min(20, 'Describe el trabajo con más detalle (mínimo 20 caracteres)')
    .required('La descripción del trabajo es obligatoria'),
  preferredDate: Yup.string()
    .required('La fecha preferida es obligatoria'),
});

export const HireFormScreen = ({ route, navigation }) => {
  const { professional } = route.params;
  const { token, user } = useAuth();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const serviceOptions = useMemo(() => {
    const services = professional?.services || [];
    // Asegurarse de que "Otros" no esté duplicado si ya viene en los datos
    if (services.find(s => s.toLowerCase() === 'otros')) {
      return services;
    }
    return [...services, 'Otros'];
  }, [professional?.services]);

  const initialValues = useMemo(() => ({
    address: '',
    serviceType: [],
    description: '',
    preferredDate: '',
  }), []);

  const handleSubmit = async (values, helpers) => {
    if (!token) {
      Alert.alert('Debes iniciar sesión', 'Para contratar un profesional necesitas iniciar sesión.');
      return;
    }

    const payload = {
      professionalId: professional.id,
      contactName: user?.fullName || 'Cliente',
      contactPhone: user?.phone || '',
      contactEmail: user?.email || '',
      address: values.address,
      serviceType: values.serviceType,
      description: values.description,
      preferredDate: values.preferredDate,
      budget: 0, // Se definirá luego con el profesional
      paymentPreference: 'card',
    };

    try {
      const serviceOrder = await serviceOrdersApi.create(token, payload);
      
      Alert.alert(
        '¡Solicitud enviada!',
        `Tu solicitud ha sido enviada a ${professional.displayName || professional.name || 'el profesional'}. El profesional se pondrá en contacto contigo para coordinar los detalles del servicio y el presupuesto.`,
        [
          {
            text: 'Ver mis trabajos',
            onPress: () => navigation.navigate('MyJobs'),
          },
          {
            text: 'Volver al inicio',
            onPress: () => navigation.navigate('Homepage'),
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error creating service order', error);
      Alert.alert('Error', error?.message ?? 'No se pudo crear la solicitud.');
      helpers.setSubmitting(false);
    }
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
            <Text style={styles.title}>Solicitar Servicio</Text>
            <Text style={styles.subtitle}>
              Enviá una solicitud de servicio a {professional.displayName || professional.name || 'el profesional'}
            </Text>
          </View>
        </View>

        <Formik
          initialValues={initialValues}
          enableReinitialize
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
                    <Image
                      source={prof.avatarUrl ? { uri: prof.avatarUrl } : require('../assets/images/plomero1.png')}
                      style={styles.profileImage}
                    />
                    <View style={styles.professionalDetails}>
                      <Text style={styles.professionalName}>{professional.displayName || professional.name || 'Profesional'}</Text>
                      <Text style={styles.professionalProfession}>{professional.profession}</Text>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>
                          {professional.rating != null ? professional.rating.toFixed(2) : 'N/D'} · {professional.experienceYears ?? 0} años exp.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Formulario */}
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Detalles del servicio</Text>

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

                  {/* Tipo de servicio */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tipo de servicio *</Text>
                    <View style={styles.servicesGrid}>
                      {serviceOptions.map((service, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.serviceChip,
                            values.serviceType.includes(service) && styles.serviceChipSelected,
                          ]}
                          onPress={() => {
                            const currentServices = values.serviceType;
                            const newServices = currentServices.includes(service)
                              ? currentServices.filter(s => s !== service)
                              : [...currentServices, service];
                            setFieldValue('serviceType', newServices);
                          }}
                        >
                          <Text
                            style={[
                              styles.serviceChipText,
                              values.serviceType.includes(service) && styles.serviceChipTextSelected,
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
                    <TouchableOpacity
                      style={[
                        styles.inputContainer,
                        touched.preferredDate && errors.preferredDate && styles.inputError,
                      ]}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={colors.white}
                        style={styles.inputIcon}
                      />
                      <Text
                        style={[
                          styles.input,
                          {
                            color: values.preferredDate
                              ? colors.white
                              : 'rgba(255,255,255,0.5)',
                          },
                        ]}
                      >
                        {values.preferredDate || 'Ej: 25/10/2025'}
                      </Text>
                    </TouchableOpacity>
                    {touched.preferredDate && errors.preferredDate && (
                      <Text style={styles.errorText}>{errors.preferredDate}</Text>
                    )}
                    {showDatePicker && (
                      <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        minimumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) {
                            const formattedDate = selectedDate.toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            });
                            setFieldValue('preferredDate', formattedDate);
                            setDate(selectedDate);
                          }
                        }}
                      />
                    )}
                  </View>
                </View>

                {/* Nota informativa */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={24} color={colors.white} />
                  <Text style={styles.infoText}>
                    El profesional recibirá tu solicitud y se pondrá en contacto contigo para coordinar
                    disponibilidad, presupuesto y detalles del servicio.
                  </Text>
                </View>
              </ScrollView>

              {/* Botón de contratar */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.white} />
                  <Text style={styles.submitButtonText}>Enviar solicitud</Text>
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
  professionalAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
