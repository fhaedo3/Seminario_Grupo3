import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { pricedServicesApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { showSuccessToast } from '../utils/notifications';
import { BackButton } from '../components/BackButton';

const getApiErrorMessage = (error, fallback) => {
  const payload = error?.payload;
  if (payload) {
    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      return payload.errors.join('\n');
    }
    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }
    if (typeof payload.error === 'string' && payload.error.trim()) {
      return payload.error;
    }
  }
  return error?.message ?? fallback;
};

export const EditPricedServicesScreen = ({ navigation, route }) => {
  const { token } = useAuth();
  const { professionalId, service: existingService, onGoBack } = route.params || {};

  const [formData, setFormData] = useState({
    serviceName: existingService?.serviceName || '',
    description: existingService?.description || '',
    basePrice: existingService?.basePrice?.toString() || '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const isEditing = !!existingService;

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar Servicio' : 'Agregar Servicio',
    });
  }, [isEditing, navigation]);

  const handleInputChange = (field) => (text) => {
    setFormData((prev) => ({ ...prev, [field]: text }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.serviceName.trim()) {
      errors.serviceName = 'El nombre del servicio es requerido.';
    }
    if (!formData.basePrice.trim()) {
      errors.basePrice = 'El precio base es requerido.';
    } else if (isNaN(Number(formData.basePrice)) || Number(formData.basePrice) < 0) {
      errors.basePrice = 'Ingresa un precio válido.';
    }
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        professionalId,
        serviceName: formData.serviceName.trim(),
        description: formData.description.trim(),
        basePrice: Number(formData.basePrice),
      };

      if (isEditing) {
        await pricedServicesApi.update(token, existingService.id, payload);
        showSuccessToast('Servicio actualizado con éxito');
      } else {
        await pricedServicesApi.create(token, payload);
        showSuccessToast('Servicio agregado con éxito');
      }
      
      onGoBack?.(); // Callback para refrescar la lista
      navigation.goBack();

    } catch (error) {
      console.error('Error saving priced service:', error);
      Alert.alert('Error', getApiErrorMessage(error, 'No se pudo guardar el servicio.'));
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!isEditing) return;

    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro de que quieres eliminar este servicio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await pricedServicesApi.remove(token, existingService.id);
              showSuccessToast('Servicio eliminado con éxito');
              onGoBack?.();
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting service:', error);
              Alert.alert('Error', getApiErrorMessage(error, 'No se pudo eliminar el servicio.'));
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={[colors.primaryBlue, colors.secondaryBlue]} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton navigation={navigation} />
          <Text style={styles.headerTitle}>{isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <Text style={styles.label}>Nombre del Servicio</Text>
            <TextInput
              style={[styles.input, formErrors.serviceName && styles.inputError]}
              value={formData.serviceName}
              onChangeText={handleInputChange('serviceName')}
              placeholder="Ej: Instalación de grifería de cocina"
              placeholderTextColor="#999"
            />
            {formErrors.serviceName && <Text style={styles.errorText}>{formErrors.serviceName}</Text>}

            <Text style={styles.label}>Descripción (Opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, formErrors.description && styles.inputError]}
              value={formData.description}
              onChangeText={handleInputChange('description')}
              placeholder="Detalles sobre el servicio"
              placeholderTextColor="#999"
              multiline
            />
            {formErrors.description && <Text style={styles.errorText}>{formErrors.description}</Text>}

            <Text style={styles.label}>Precio Base (ARS)</Text>
            <TextInput
              style={[styles.input, formErrors.basePrice && styles.inputError]}
              value={formData.basePrice}
              onChangeText={handleInputChange('basePrice')}
              placeholder="Ej: 5000"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            {formErrors.basePrice && <Text style={styles.errorText}>{formErrors.basePrice}</Text>}

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity
                style={[styles.deleteButton, saving && styles.saveButtonDisabled]}
                onPress={handleDelete}
                disabled={saving}
              >
                <Ionicons name="trash-outline" size={20} color={colors.errorStrong} />
                <Text style={styles.deleteButtonText}>Eliminar Servicio</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 16,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  label: {
    color: colors.white,
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'rgba(96, 165, 250, 0.3)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: colors.white,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.errorStrong,
  },
  errorText: {
    color: colors.errorStrong,
    fontSize: 13,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: colors.greenButton,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.errorStrong,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  deleteButtonText: {
    color: colors.errorStrong,
    fontSize: 16,
    fontWeight: '600',
  },
});
