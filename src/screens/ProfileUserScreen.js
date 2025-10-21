import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { BottomNav } from '../components/BottomNav';

const PAYMENT_METHODS_OPTIONS = [
  { id: "efectivo", label: "Efectivo", icon: "cash" },
  { id: "credito", label: "Tarjeta de Crédito", icon: "card" },
  { id: "debito", label: "Tarjeta de Débito", icon: "card-outline" },
  { id: "mercadopago", label: "Mercado Pago", icon: "wallet" },
  { id: "transferencia", label: "Transferencia Bancaria", icon: "swap-horizontal" },
];

export const ProfileUserScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    location: "",
    phone: "",
    email: "",
  });

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);

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

  const handleSave = () => {
    console.log("Guardando cambios:", formData);
    console.log("Métodos de pago:", paymentMethods);
    // Aquí iría la lógica para guardar los cambios
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
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                })
              }
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
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  placeholderText: {
    color: colors.mutedText,
    fontSize: 14,
    fontStyle: "italic",
  },
  saveButton: {
    backgroundColor: colors.greenButton,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
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
