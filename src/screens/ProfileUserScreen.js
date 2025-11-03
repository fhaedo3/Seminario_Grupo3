import React, { useState, useEffect } from "react";
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
import { usersApi, authApi } from '../api';

const PAYMENT_METHODS_OPTIONS = [
  { id: "efectivo", label: "Efectivo", icon: "cash" },
  { id: "credito", label: "Tarjeta de Crédito", icon: "card" },
  { id: "debito", label: "Tarjeta de Débito", icon: "card-outline" },
  { id: "mercadopago", label: "Mercado Pago", icon: "wallet" },
  { id: "transferencia", label: "Transferencia Bancaria", icon: "swap-horizontal" },
];

export const ProfileUserScreen = ({ navigation }) => {
  const { user, token, logout, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    location: "",
    phone: "",
    email: "",
  });

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar datos del usuario desde el backend
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Timeout para evitar carga infinita (2 segundos)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      );
      
      if (token) {
        try {
          // Intentar obtener datos actualizados del backend con timeout
          const userData = await Promise.race([
            authApi.me(token),
            timeoutPromise
          ]);
          
          setFormData({
            fullName: userData.fullName || "",
            location: userData.location || "",
            phone: userData.phone || "",
            email: userData.email || "",
          });
          setPaymentMethods(userData.preferredPaymentMethods || []);
        } catch (apiError) {
          // Backend no disponible, usar datos del contexto silenciosamente
          fallbackToLocalData();
        }
      } else {
        // Si no hay token, usar datos del contexto o datos vacíos
        fallbackToLocalData();
      }
    } catch (error) {
      // Error general, usar datos locales silenciosamente
      fallbackToLocalData();
    } finally {
      setLoading(false);
    }
  };

  const fallbackToLocalData = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        location: user.location || "",
        phone: user.phone || "",
        email: user.email || "",
      });
      setPaymentMethods(user.preferredPaymentMethods || []);
    } else {
      // Datos completamente vacíos si no hay usuario
      setFormData({
        fullName: "",
        location: "",
        phone: "",
        email: "",
      });
      setPaymentMethods([]);
    }
  };

  // Cargar datos del usuario cuando el componente se monta
  useEffect(() => {
    // Cargar inmediatamente los datos del contexto si están disponibles
    if (user) {
      fallbackToLocalData();
      setLoading(false);
    }
    
    // Luego intentar actualizar desde el backend en segundo plano
    if (token) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, []);

  // Actualizar datos cuando el usuario del contexto cambie
  useEffect(() => {
    if (user && !loading) {
      setFormData(prevData => ({
        fullName: prevData.fullName || user.fullName || "",
        location: prevData.location || user.location || "",
        phone: prevData.phone || user.phone || "",
        email: prevData.email || user.email || "",
      }));
      if (user.preferredPaymentMethods && user.preferredPaymentMethods.length > 0) {
        setPaymentMethods(user.preferredPaymentMethods);
      }
    }
  }, [user]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const togglePaymentMethod = (methodId) => {
    setPaymentMethods((prev) =>
      prev.includes(methodId)
        ? prev.filter((m) => m !== methodId)
        : [...prev, methodId]
    );
  };

  const handleSave = async () => {
    // Validaciones básicas
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'El nombre completo es obligatorio');
      return;
    }
    
    if (!formData.location.trim()) {
      Alert.alert('Error', 'La ubicación es obligatoria');
      return;
    }
    
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'El teléfono es obligatorio');
      return;
    }
    
    if (!formData.email.trim()) {
      Alert.alert('Error', 'El email es obligatorio');
      return;
    }

    setSaving(true);
    
    try {
      const profileData = {
        fullName: formData.fullName.trim(),
        location: formData.location.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        preferredPaymentMethods: paymentMethods,
      };

      // Enviar al backend
      await usersApi.updateProfile(token, profileData);
      
      // Refrescar datos del usuario
      if (refreshProfile) {
        await refreshProfile();
      }
      
      showSuccessToast('Datos guardados correctamente');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', error.message || 'No se pudo guardar el perfil. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <LinearGradient
        colors={[colors.primaryBlue, colors.secondaryBlue]}
        style={styles.background}
      >
        <StatusBar style="light" />
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
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
            <Text style={styles.userName}>{user?.fullName || user?.username || 'Usuario'}</Text>
          </View>



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
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) =>
                  setFormData({ ...formData, fullName: text })
                }
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Ubicacion</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) =>
                  setFormData({ ...formData, location: text })
                }
                placeholderTextColor="#999"
              />
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
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 16,
  },
});
