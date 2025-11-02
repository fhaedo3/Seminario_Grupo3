import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { BottomNav } from '../components/BottomNav';
import { BackButton } from '../components/BackButton';
import { showSuccessToast } from '../utils/notifications';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api';

const PAYMENT_METHODS_OPTIONS = [
  { id: "efectivo", label: "Efectivo", icon: "cash" },
  { id: "credito", label: "Tarjeta de Crédito", icon: "card" },
  { id: "debito", label: "Tarjeta de Débito", icon: "card-outline" },
  { id: "mercadopago", label: "Mercado Pago", icon: "wallet" },
  { id: "transferencia", label: "Transferencia Bancaria", icon: "swap-horizontal" },
];

const NAME_REGEX = /^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s'-]{3,60}$/;
const LOCATION_REGEX = /^[a-zA-ZÁÉÍÓÚÑáéíóúñ0-9.,\s-]{3,80}$/;
const PHONE_REGEX = /^\+?\d{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getApiErrorMessage = (error, fallbackMessage) => {
  const payload = error?.payload;
  if (payload) {
    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      return payload.errors.join("\n");
    }
    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }
    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }
  }
  return error?.message ?? fallbackMessage;
};

export const ProfileUserScreen = ({ navigation }) => {
  const { user, token, logout, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    location: "",
    phone: "",
    email: "",
  });

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [expandedSection, setExpandedSection] = useState("personal");
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      fullName: user.fullName || "",
      location: user.location || "",
      phone: user.phone || "",
      email: user.email || "",
    });

    setPaymentMethods(Array.isArray(user.preferredPaymentMethods) ? user.preferredPaymentMethods : []);
  }, [user]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const togglePaymentMethod = (methodId) => {
    setPaymentMethods((prev) => {
      const updated = prev.includes(methodId)
        ? prev.filter((m) => m !== methodId)
        : [...prev, methodId];

      if (updated.length > 0) {
        clearError("paymentMethods");
      }

      return updated;
    });
  };

  const clearError = (field) => {
    setFormErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const validateField = (field, rawValue) => {
    const value = rawValue?.trim?.() ?? "";

    switch (field) {
      case "fullName":
        if (!value) {
          return "Ingresa tu nombre completo";
        }
        if (!NAME_REGEX.test(value)) {
          return "Usa solo letras y entre 3 y 60 caracteres";
        }
        return null;
      case "location":
        if (!value) {
          return "Ingresa tu ubicación";
        }
        if (!LOCATION_REGEX.test(value)) {
          return "La ubicación contiene caracteres inválidos";
        }
        return null;
      case "phone":
        if (!value) {
          return "Ingresa tu teléfono";
        }
        if (!PHONE_REGEX.test(value)) {
          return "Ingresa un teléfono válido (7 a 15 dígitos)";
        }
        return null;
      case "email":
        if (!value) {
          return "Ingresa tu correo electrónico";
        }
        if (!EMAIL_REGEX.test(value)) {
          return "Ingresa un correo electrónico válido";
        }
        return null;
      default:
        return null;
    }
  };

  const handleInputChange = (field) => (text) => {
    setFormData((prev) => ({ ...prev, [field]: text }));

    if (formErrors[field]) {
      const fieldError = validateField(field, text);
      if (fieldError) {
        setFormErrors((prev) => ({ ...prev, [field]: fieldError }));
        return;
      }
      clearError(field);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    Object.entries(formData).forEach(([field, value]) => {
      const fieldError = validateField(field, value);
      if (fieldError) {
        newErrors[field] = fieldError;
      }
    });

    if (paymentMethods.length === 0) {
      newErrors.paymentMethods = "Seleccioná al menos un método de pago";
    }

    return newErrors;
  };

  const handleSave = async () => {
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      Alert.alert('Revisa los datos', 'Corregí los campos marcados antes de guardar.');
      return;
    }

    if (!token) {
      Alert.alert('Sesión expirada', 'Volvé a iniciar sesión para actualizar tus datos.');
      return;
    }

    try {
      setSaving(true);
      await usersApi.updateProfile(token, {
        fullName: formData.fullName.trim(),
        location: formData.location.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        preferredPaymentMethods: paymentMethods,
      });
      await refreshProfile();
      setFormErrors({});
      showSuccessToast('Datos guardados correctamente');
    } catch (error) {
      console.error('Error updating profile', error);
      Alert.alert('No se pudo guardar', getApiErrorMessage(error, 'Intentá nuevamente más tarde.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.primaryBlue, colors.secondaryBlue]}
      style={styles.background}
    >
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <BackButton navigation={navigation} fallbackRoute="Homepage" />
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={logout}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.white} />
              <Text style={styles.logoutText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Section */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {/* Avatar and Name */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <View style={styles.avatarPlaceholder}>
                <View style={styles.avatarHead} />
                <View style={styles.avatarBody} />
              </View>
            </View>
            <Text style={styles.userName}>Nombre</Text>
          </View>

          <TouchableOpacity
            style={styles.switchProfileButton}
            onPress={() => navigation.navigate('ProfileProfessional')}
          >
            <Ionicons name="briefcase" size={18} color={colors.white} />
            <Text style={styles.switchProfileText}>Ir al perfil profesional</Text>
          </TouchableOpacity>

          {/* Información Personal Section */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("personal")}
          >
            <Text style={styles.sectionTitle}>Información Personal</Text>
            <Ionicons
              name={expandedSection === "personal" ? "chevron-down" : "chevron-forward"}
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>

          {expandedSection === "personal" && (
            <View style={styles.sectionContent}>
              <Text style={styles.label}>Nombre Completo</Text>
              <TextInput
                style={[styles.input, formErrors.fullName && styles.inputError]}
                value={formData.fullName}
                onChangeText={handleInputChange("fullName")}
                placeholderTextColor="#999"
              />
              {formErrors.fullName && (
                <Text style={styles.errorText}>{formErrors.fullName}</Text>
              )}

              <Text style={styles.label}>Ubicacion</Text>
              <TextInput
                style={[styles.input, formErrors.location && styles.inputError]}
                value={formData.location}
                onChangeText={handleInputChange("location")}
                placeholderTextColor="#999"
              />
              {formErrors.location && (
                <Text style={styles.errorText}>{formErrors.location}</Text>
              )}
            </View>
          )}

          {/* Contacto Section */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("contacto")}
          >
            <Text style={styles.sectionTitle}>Contacto</Text>
            <Ionicons
              name={expandedSection === "contacto" ? "chevron-down" : "chevron-forward"}
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>

          {expandedSection === "contacto" && (
            <View style={styles.sectionContent}>
              <Text style={styles.label}>Telefono</Text>
              <TextInput
                style={[styles.input, formErrors.phone && styles.inputError]}
                value={formData.phone}
                onChangeText={handleInputChange("phone")}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
              {formErrors.phone && (
                <Text style={styles.errorText}>{formErrors.phone}</Text>
              )}

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, formErrors.email && styles.inputError]}
                value={formData.email}
                onChangeText={handleInputChange("email")}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
              {formErrors.email && (
                <Text style={styles.errorText}>{formErrors.email}</Text>
              )}
            </View>
          )}

          {/* Métodos de Pago Section */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("payment")}
          >
            <Text style={styles.sectionTitle}>Métodos de pago</Text>
            <Ionicons
              name={expandedSection === "payment" ? "chevron-down" : "chevron-forward"}
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>

          {expandedSection === "payment" && (
            <View style={styles.sectionContent}>
              <Text style={styles.label}>
                Selecciona tus métodos de pago preferidos
              </Text>
              <Text style={styles.infoText}>
                Puedes seleccionar múltiples opciones
              </Text>
              {formErrors.paymentMethods && (
                <Text style={styles.errorText}>{formErrors.paymentMethods}</Text>
              )}
              <View style={styles.paymentMethodsContainer}>
                {PAYMENT_METHODS_OPTIONS.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethodCard,
                      paymentMethods.includes(method.id) &&
                        styles.paymentMethodCardSelected,
                    ]}
                    onPress={() => togglePaymentMethod(method.id)}
                  >
                    <View style={styles.paymentMethodContent}>
                      <Ionicons
                        name={method.icon}
                        size={28}
                        color={
                          paymentMethods.includes(method.id)
                            ? colors.success
                            : colors.white
                        }
                      />
                      <Text
                        style={[
                          styles.paymentMethodLabel,
                          paymentMethods.includes(method.id) &&
                            styles.paymentMethodLabelSelected,
                        ]}
                      >
                        {method.label}
                      </Text>
                    </View>
                    {paymentMethods.includes(method.id) && (
                      <View style={styles.checkmarkCircle}>
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.white}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Navigation (reemplazado por componente) */}
        <BottomNav navigation={navigation} profileRoute="ProfileUser" />
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
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 110,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "700",
    flex: 1,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)'
  },
  logoutText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600'
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 240,
    flexGrow: 1,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  switchProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    marginBottom: 24,
  },
  switchProfileText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FDB94E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    position: "relative",
  },
  avatarHead: {
    position: "absolute",
    top: 20,
    left: "50%",
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000",
  },
  avatarBody: {
    position: "absolute",
    bottom: 0,
    left: "50%",
    marginLeft: -30,
    width: 60,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#5DC1D4",
  },
  userName: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.4)",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  sectionContent: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  label: {
    color: colors.white,
    fontSize: 14,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: "rgba(96, 165, 250, 0.3)",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: colors.white,
    fontSize: 16,
    marginBottom: 8,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.errorStrong,
  },
  placeholderText: {
    color: colors.mutedText,
    fontSize: 14,
    fontStyle: "italic",
  },
  errorText: {
    color: colors.errorStrong,
    backgroundColor: colors.errorBackground,
    borderColor: colors.errorBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: colors.greenButton,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  infoText: {
    color: colors.mutedText,
    fontSize: 14,
    marginBottom: 16,
  },
  paymentMethodsContainer: {
    gap: 12,
  },
  paymentMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentMethodCardSelected: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderColor: colors.success,
  },
  paymentMethodContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  paymentMethodLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  paymentMethodLabelSelected: {
    color: colors.success,
    fontWeight: "600",
  },
  checkmarkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    justifyContent: "center",
    alignItems: "center",
  },
});
