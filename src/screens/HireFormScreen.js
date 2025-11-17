import React, { useMemo, useState, useEffect } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';
import { BackButton } from '../components/BackButton';
import { useAuth } from '../context/AuthContext';
import { serviceOrdersApi } from '../api';
import { pricedServicesApi } from '../api';


// ✅ VALIDACIÓN
const HireSchema = Yup.object().shape({
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
});


export const HireFormScreen = ({ route, navigation }) => {
  const { professional } = route.params;
  const { token, user } = useAuth();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [availableJobTypes, setAvailableJobTypes] = useState([]);
  const [pricedServices, setPricedServices] = useState([]);

  useEffect(() => {
    loadTradesAndServices();
    loadPricedServices();
  }, []);

  const loadTradesAndServices = async () => {
    try {
      const servicesData = await pricedServicesApi.getServicesByTrade();

      const profession = professional.profession;

      let list = servicesData[profession];

      if (!Array.isArray(list)) {
        // fallback case insensitive
        const matchedKey = Object.keys(servicesData).find(
          (k) => k.toLowerCase() === profession.toLowerCase()
        );
        list = matchedKey ? servicesData[matchedKey] : [];
      }

      setAvailableJobTypes(
        [...new Set(list.map((t) => t.trim()))]
      );
    } catch (err) {
      console.log("Error loading services", err);
      setAvailableJobTypes([]);
    }
  };
  const loadPricedServices = async () => {
    try {
      const services = await pricedServicesApi.listByProfessional(professional.id);
      setPricedServices(Array.isArray(services) ? services : []);
    } catch (err) {
      console.log("Error loading priced services", err);
      setPricedServices([]);
    }
  };
const priceMap = useMemo(() => {
  const map = {};
  pricedServices.forEach((s) => {
    map[s.serviceName] = s.finalPrice; // Cliente ve SOLO el precio final
  });
  return map;
}, [pricedServices]);



  // Servicios del profesional → para el dropdown
  const serviceOptions = useMemo(() => {
    const base = professional?.services || [];
    return base.includes("Otros") ? base : [...base, "Otros"];
  }, [professional?.services]);

  // Precios si existen
  const servicePrices = professional?.servicePrices || {}; // ejemplo {"Instalacion": 20000}

  const initialValues = {
    address: '',
    serviceType: '',
    description: '',
    preferredDate: '',
  };

  // ======================
  //  SUBMIT
  // ======================
  const handleSubmit = async (values, helpers) => {
    if (!token) {
      return Alert.alert('Debes iniciar sesión', 'Iniciá sesión para continuar.');
    }

    if (!user?.phone || !user?.email) {
      return Alert.alert(
        'Información incompleta',
        'Debés completar teléfono y email en tu perfil antes de solicitar un servicio.'
      );
    }

    const payload = {
      professionalId: professional.id,
      contactName: user?.fullName || 'Cliente',
      contactPhone: user.phone,
      contactEmail: user.email,
      address: values.address,
      serviceType: values.serviceType,
      description: values.description,
      preferredDate: values.preferredDate,
      budget: 0,
      paymentPreference: 'card',
    };

    try {
      const serviceOrder = await serviceOrdersApi.create(token, payload);

      navigation.navigate('Payment', {
        hireSummary: {
          serviceOrder,
          professional,
          clientData: {
            serviceType: values.serviceType,
            address: values.address,
            description: values.description,
            preferredDate: values.preferredDate,
          },
          depositAmount: 5000, // seña fija
          servicePrice: servicePrices[values.serviceType] || 0, // precio real del servicio
          totalAmount: 5000, // solo se paga la seña ahora
        },
      });

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo crear la solicitud.");
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
      >
        {/* HEADER */}
        <View style={styles.header}>
          <BackButton navigation={navigation} backgroundColor="rgba(0,0,0,0.3)" />
          <View style={styles.headerContent}>
            <Text style={styles.title}>Solicitar Servicio</Text>
            <Text style={styles.subtitle}>
              Enviá una solicitud a {professional.displayName || professional.name}
            </Text>
          </View>
        </View>


        {/* FORM */}
        <Formik
          initialValues={initialValues}
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

                {/* CARD PROFESIONAL */}
                <View style={styles.professionalCard}>
                  <View style={styles.professionalInfo}>
                    <Image
                      source={professional.avatarUrl ? { uri: professional.avatarUrl } : require('../assets/images/plomero1.png')}
                      style={styles.professionalImage}
                    />
                    <View style={styles.professionalDetails}>
                      <Text style={styles.professionalName}>{professional.displayName}</Text>
                      <Text style={styles.professionalProfession}>{professional.profession}</Text>
                    </View>
                  </View>
                </View>

                {/* FORMULARIO */}
                <View style={styles.formSection}>

                  {/* DIRECCIÓN */}
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
                    {touched.address && errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
                  </View>

                  {/* TIPO DE SERVICIO - PICKER */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tipo de servicio *</Text>

                    <View style={styles.pickerContainer}>
                      <Ionicons name="hammer-outline" size={20} color={colors.white} style={styles.inputIcon} />

                      <Picker
                        selectedValue={values.serviceType}
                        onValueChange={(itemValue) => setFieldValue('serviceType', itemValue)}
                        style={styles.picker}
                        dropdownIconColor={colors.white}
                      >
                        <Picker.Item label="Seleccioná un servicio" value="" />
                        {availableJobTypes.map((service, idx) => (
                          <Picker.Item key={idx} label={service} value={service} />
                        ))}
                      </Picker>
                    </View>

                    {touched.serviceType && errors.serviceType && <Text style={styles.errorText}>{errors.serviceType}</Text>}
                  </View>

                  {/* PRECIO REFERENCIA */}
                  {values.serviceType && (
                    priceMap[values.serviceType] ? (
                      <Text style={styles.priceReference}>
                        💵 Precio referencia: ${priceMap[values.serviceType]}
                      </Text>
                    ) : (
                      <Text style={[styles.priceReference, { color: '#ffcccc' }]}>
                        ⚠️ No se encuentra precio para este tipo de servicio
                      </Text>
                    )
                  )}

                  {/* DESCRIPCIÓN */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Descripción del trabajo *</Text>
                    <View
                      style={[
                        styles.inputContainer,
                        styles.textAreaContainer,
                        touched.description && errors.description && styles.inputError,
                      ]}
                    >
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Contanos qué necesitás..."
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

                  {/* FECHA */}
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
                        {values.preferredDate || 'Seleccioná una fecha'}
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
                            const formatted = selectedDate.toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            });
                            setFieldValue('preferredDate', formatted);
                            setDate(selectedDate);
                          }
                        }}
                      />
                    )}
                  </View>
                </View>

                {/* INFO */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={24} color={colors.white} />
                  <Text style={styles.infoText}>
                    El profesional recibirá tu solicitud y te contactará para coordinar detalles,
                    disponibilidad y presupuesto estimado.
                  </Text>
                </View>
              </ScrollView>

              {/* FOOTER BUTTON */}
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

// ======================
//     ESTILOS
// ======================

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
  professionalImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.white,
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 8 : 0,
  },
  picker: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
  },
  priceReference: {
    color: colors.white,
    marginTop: -10,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '600',
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
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.greenButton,
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
