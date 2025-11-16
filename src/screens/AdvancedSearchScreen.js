import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { BackButton } from '../components/BackButton';

export const AdvancedSearchScreen = ({ navigation }) => {
  const [profession, setProfession] = useState('');
  const [jobType, setJobType] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    if (!profession.trim()) {
      Alert.alert('Campo obligatorio', 'Por favor, ingresa un oficio para buscar.');
      return;
    }

    const filters = {
      profession: profession.trim(),
      jobType: jobType.trim() || null,
      location: location.trim() || null,
    };

    // Navegar a la pantalla de resultados con los filtros
    navigation.navigate('SearchResults', { filters });
  };

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
            {/* Oficio */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Oficio del Profesional *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="construct-outline" size={20} color={colors.white} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Plomero, Electricista..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={profession}
                  onChangeText={setProfession}
                />
              </View>
            </View>

            {/* Tipo de Trabajo (Opcional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Trabajo (Opcional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="hammer-outline" size={20} color={colors.white} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Cambio de grifería, Instalar enchufe..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={jobType}
                  onChangeText={setJobType}
                />
              </View>
            </View>

            {/* Barrio (Opcional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Barrio (Opcional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color={colors.white} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Palermo, Caballito..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={location}
                  onChangeText={setLocation}
                />
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
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
});
