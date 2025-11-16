import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { BackButton } from '../components/BackButton';
import { pricedServicesApi, professionalsApi } from '../api';
import { CABA_NEIGHBORHOODS } from '../constants/neighborhoods';

export const AdvancedSearchScreen = ({ navigation }) => {
  const [profession, setProfession] = useState('VER_TODOS');
  const [jobType, setJobType] = useState('SIN_ESPECIFICACION');
  const [location, setLocation] = useState('TODOS');
  const [professions, setProfessions] = useState([]);
  const [servicesByTrade, setServicesByTrade] = useState({});
  const [availableJobTypes, setAvailableJobTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTradesAndServices();
  }, []);

  const loadTradesAndServices = async () => {
    try {
      setLoading(true);
      const [tradesData, servicesData] = await Promise.all([
        pricedServicesApi.getAllTrades(),
        pricedServicesApi.getServicesByTrade(),
      ]);
      
      console.log('Trades loaded:', tradesData);
      console.log('Services by trade loaded:', servicesData);

      // Cargar datos principales
      const trades = Array.isArray(tradesData) ? tradesData : [];
      const servicesMap = servicesData && typeof servicesData === 'object' ? servicesData : {};

      // Fallback: si no hay oficios desde /trades, derivarlos de la lista de profesionales
      if (trades.length === 0) {
        try {
          const resp = await professionalsApi.search({ page: 0, size: 50 });
          const content = Array.isArray(resp?.content) ? resp.content : [];
          const derived = [...new Set(content
            .map((p) => p?.profession)
            .filter((p) => typeof p === 'string' && p.trim().length > 0)
          )].sort();
          setProfessions(derived);
        } catch (fallbackErr) {
          console.warn('Fallback to professionals failed:', fallbackErr?.message || fallbackErr);
          setProfessions([]);
        }
      } else {
        setProfessions(trades);
      }

      setServicesByTrade(servicesMap);
    } catch (err) {
      console.error('Error loading trades and services:', err);
      setError('No se pudieron cargar los oficios disponibles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Profession changed:', profession);
    console.log('Current jobType:', jobType);
    console.log('ServicesByTrade:', servicesByTrade);
    
    // Actualizar tipos de trabajo disponibles cuando cambia el oficio
    if (profession && profession !== 'VER_TODOS') {
      const map = servicesByTrade || {};
      // Intento exacto y luego case-insensitive
      let list = map[profession];
      if (!Array.isArray(list)) {
        const matchedKey = Object.keys(map).find(
          (k) => typeof k === 'string' && k.toLowerCase() === String(profession).toLowerCase()
        );
        list = matchedKey ? map[matchedKey] : [];
      }

      const validTypes = [...new Set(
        (Array.isArray(list) ? list : [])
          .filter((type) => typeof type === 'string')
          .map((type) => type.trim())
          .filter((type) => type.length > 0)
      )];

      console.log(`Job types for ${profession}:`, validTypes);
      setAvailableJobTypes(validTypes);

      // Siempre resetear a SIN_ESPECIFICACION al cambiar de oficio si el actual no es válido
      if (!jobType || jobType === 'undefined' ||
          (!validTypes.includes(jobType) && jobType !== 'SIN_ESPECIFICACION' && jobType !== 'OTRO')) {
        console.log('Resetting jobType to SIN_ESPECIFICACION');
        setJobType('SIN_ESPECIFICACION');
      }
    } else {
      console.log('Clearing job types - profession is VER_TODOS or not set');
      setAvailableJobTypes([]);
      // Siempre resetear cuando no hay oficio o es VER_TODOS
      setJobType('SIN_ESPECIFICACION');
    }
  }, [profession, servicesByTrade]);

  const handleSearch = () => {
    // Preparar filtros
    const filters = {
      profession: null,
      jobType: null,
      location: null,
    };

    // Si el usuario NO seleccionó "Ver todos", enviamos el oficio específico
    if (profession && profession !== 'VER_TODOS') {
      filters.profession = profession;
    }

    // Si el usuario seleccionó "Sin especificación" o "Otro", no enviamos jobType
    // (mostrará todos los profesionales de ese oficio)
    if (jobType && jobType !== 'SIN_ESPECIFICACION' && jobType !== 'OTRO') {
      filters.jobType = jobType;
    }

    // Si el usuario NO seleccionó "Todos los barrios", enviamos la ubicación
    if (location && location !== 'TODOS') {
      filters.location = location;
    }

    // Navegar a la pantalla de resultados con los filtros
    navigation.navigate('SearchResults', { filters });
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.primaryBlue, colors.secondaryBlue]}
        style={styles.background}
      >
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Cargando oficios...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={[colors.primaryBlue, colors.secondaryBlue]}
        style={styles.background}
      >
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.white} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTradesAndServices}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primaryBlue, colors.secondaryBlue]}
      style={styles.background}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <BackButton navigation={navigation} />
          <Text style={styles.title}>Búsqueda Avanzada</Text>
          <Text style={styles.subtitle}>Encuentra al profesional perfecto para tu necesidad.</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formSection}>
            {/* Trade */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Oficio del Profesional *</Text>
              <View style={styles.pickerContainer}>
                <Ionicons name="construct-outline" size={20} color={colors.white} style={styles.inputIcon} />
                <Picker
                  selectedValue={profession}
                  onValueChange={(itemValue) => setProfession(itemValue)}
                  style={styles.picker}
                  dropdownIconColor={colors.white}
                >
                  <Picker.Item label="Ver todos los profesionales" value="VER_TODOS" />
                  {professions.map((prof) => (
                    <Picker.Item key={prof} label={prof} value={prof} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Job Type (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Trabajo (Opcional)</Text>
              <View style={styles.pickerContainer}>
                <Ionicons name="hammer-outline" size={20} color={colors.white} style={styles.inputIcon} />
                <Picker
                  selectedValue={(jobType === 'OTRO') ? 'OTRO' : (availableJobTypes.includes(jobType) ? jobType : 'SIN_ESPECIFICACION')}
                  onValueChange={(itemValue) => {
                    // Protegernos ante valores inválidos provenientes del Picker
                    const safeValue = (typeof itemValue === 'string' && itemValue.trim().length > 0)
                      ? itemValue.trim()
                      : 'SIN_ESPECIFICACION';
                    console.log('Job type selected:', itemValue, '=>', safeValue);
                    setJobType(safeValue);
                  }}
                  style={styles.picker}
                  dropdownIconColor={colors.white}
                  enabled={!!profession && profession !== 'VER_TODOS'}
                >
                  {(!profession || profession === 'VER_TODOS') && (
                    <Picker.Item label="Primero selecciona un oficio" value="SIN_ESPECIFICACION" />
                  )}
                  {(profession && profession !== 'VER_TODOS') && [
                    <Picker.Item key="__none__" label="Sin especificación" value="SIN_ESPECIFICACION" />,
                    ...availableJobTypes
                      .filter((type) => typeof type === 'string' && type.trim().length > 0)
                      .map((type, idx) => {
                        const val = type.trim();
                        return (
                          <Picker.Item key={`${val}-${idx}`} label={val} value={val} />
                        );
                      }),
                    <Picker.Item key="__other__" label="Otro..." value="OTRO" />,
                  ]}
                </Picker>
              </View>
            </View>

            {/* Neighborhood (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Barrio (Opcional)</Text>
              <View style={styles.pickerContainer}>
                <Ionicons name="location-outline" size={20} color={colors.white} style={styles.inputIcon} />
                <Picker
                  selectedValue={location}
                  onValueChange={(itemValue) => setLocation(itemValue)}
                  style={styles.picker}
                  dropdownIconColor={colors.white}
                >
                  <Picker.Item label="Todos los barrios" value="TODOS" />
                  {CABA_NEIGHBORHOODS.map((neighborhood) => (
                    <Picker.Item key={neighborhood} label={neighborhood} value={neighborhood} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={24} color={colors.white} />
            <Text style={styles.searchButtonText}>Buscar Profesionales</Text>
          </TouchableOpacity>
        </ScrollView>
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
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
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
  inputIcon: {
    marginRight: 12,
  },
  picker: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
  },
  searchButton: {
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
  searchButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: colors.greenButton,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
