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

const AVAILABLE_JOBS = [
  "Plomería",
  "Grifería",
  "Gas",
  "Electricidad",
  "Revoque",
  "Mudanza",
  "Pintura",
  "Carpintería",
  "Albañilería",
];

const PAYMENT_METHODS = [
  { id: "efectivo", label: "Efectivo" },
  { id: "mercadopago", label: "Mercado Pago" },
  { id: "cuenta_bancaria", label: "Cuenta Bancaria" },
  { id: "transferencia", label: "Transferencia" },
];

export const ProfileProfessionalScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    location: "",
    phone: "",
    email: "",
  });

  const [isVerified, setIsVerified] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState({
    face: false,
    dniFront: false,
    dniBack: false,
  });

  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleJob = (job) => {
    setSelectedJobs((prev) =>
      prev.includes(job) ? prev.filter((j) => j !== job) : [...prev, job]
    );
  };

  const togglePaymentMethod = (methodId) => {
    setSelectedPaymentMethods((prev) =>
      prev.includes(methodId)
        ? prev.filter((m) => m !== methodId)
        : [...prev, methodId]
    );
  };

  const handleScanFace = () => {
    console.log("Iniciando escaneo facial...");
    // Aquí iría la lógica para abrir la cámara y escanear la cara
    const newStatus = { ...verificationStatus, face: true };
    setVerificationStatus(newStatus);

    // Verificar si se completaron todos los pasos
    if (newStatus.face && newStatus.dniFront && newStatus.dniBack) {
      setIsVerified(true);
    }
  };

  const handleScanDNI = (side) => {
    console.log(`Escaneando DNI ${side}...`);
    // Aquí iría la lógica para abrir la cámara y escanear el DNI
    let newStatus;
    if (side === "front") {
      newStatus = { ...verificationStatus, dniFront: true };
    } else {
      newStatus = { ...verificationStatus, dniBack: true };
    }
    setVerificationStatus(newStatus);

    // Verificar si se completaron todos los pasos
    if (newStatus.face && newStatus.dniFront && newStatus.dniBack) {
      setIsVerified(true);
    }
  };

  const handleSave = () => {
    console.log("Guardando cambios:", formData);
    console.log("Trabajos seleccionados:", selectedJobs);
    console.log("Métodos de pago:", selectedPaymentMethods);
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
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>Nombre</Text>
              {isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={16} color={colors.white} />
                </View>
              )}
            </View>
          </View>

          {/* Información Profesional Section */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("professional")}
          >
            <Text style={styles.sectionTitle}>Información Profesional</Text>
            <Ionicons
              name={
                expandedSection === "professional"
                  ? "chevron-down"
                  : "chevron-forward"
              }
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>

          {expandedSection === "professional" && (
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

              <Text style={styles.label}>Trabajos / Oficios</Text>
              <View style={styles.checkboxContainer}>
                {AVAILABLE_JOBS.map((job) => (
                  <TouchableOpacity
                    key={job}
                    style={styles.checkboxItem}
                    onPress={() => toggleJob(job)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedJobs.includes(job) && styles.checkboxChecked,
                      ]}
                    >
                      {selectedJobs.includes(job) && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.white}
                        />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{job}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Contacto Section */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("contacto")}
          >
            <Text style={styles.sectionTitle}>Contacto</Text>
            <Ionicons
              name={
                expandedSection === "contacto"
                  ? "chevron-down"
                  : "chevron-forward"
              }
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

          {/* Métodos de Cobro Section */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("payment")}
          >
            <Text style={styles.sectionTitle}>Métodos de cobro</Text>
            <Ionicons
              name={
                expandedSection === "payment" ? "chevron-down" : "chevron-forward"
              }
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>

          {expandedSection === "payment" && (
            <View style={styles.sectionContent}>
              <Text style={styles.label}>Selecciona tus métodos de cobro</Text>
              <View style={styles.checkboxContainer}>
                {PAYMENT_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={styles.checkboxItem}
                    onPress={() => togglePaymentMethod(method.id)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedPaymentMethods.includes(method.id) &&
                          styles.checkboxChecked,
                      ]}
                    >
                      {selectedPaymentMethods.includes(method.id) && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.white}
                        />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{method.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Verificar Identidad Section */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("identity")}
          >
            <Text style={styles.sectionTitle}>Verificar Identidad</Text>
            <Ionicons
              name={
                expandedSection === "identity"
                  ? "chevron-down"
                  : "chevron-forward"
              }
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>

          {expandedSection === "identity" && (
            <View style={styles.sectionContent}>
              <Text style={styles.label}>Verificación de Identidad</Text>
              <Text style={styles.infoText}>
                Completa los siguientes pasos para verificar tu identidad
              </Text>

              {/* Face Scan */}
              <TouchableOpacity
                style={[
                  styles.scanButton,
                  verificationStatus.face && styles.scanButtonCompleted,
                ]}
                onPress={handleScanFace}
              >
                <Ionicons
                  name={verificationStatus.face ? "checkmark-circle" : "camera"}
                  size={24}
                  color={verificationStatus.face ? colors.success : colors.white}
                />
                <Text style={styles.scanButtonText}>
                  {verificationStatus.face
                    ? "Rostro verificado"
                    : "Escanear rostro"}
                </Text>
              </TouchableOpacity>

              {/* DNI Front */}
              <TouchableOpacity
                style={[
                  styles.scanButton,
                  verificationStatus.dniFront && styles.scanButtonCompleted,
                ]}
                onPress={() => handleScanDNI("front")}
              >
                <Ionicons
                  name={
                    verificationStatus.dniFront ? "checkmark-circle" : "card"
                  }
                  size={24}
                  color={
                    verificationStatus.dniFront ? colors.success : colors.white
                  }
                />
                <Text style={styles.scanButtonText}>
                  {verificationStatus.dniFront
                    ? "DNI frente verificado"
                    : "Escanear DNI (Frente)"}
                </Text>
              </TouchableOpacity>

              {/* DNI Back */}
              <TouchableOpacity
                style={[
                  styles.scanButton,
                  verificationStatus.dniBack && styles.scanButtonCompleted,
                ]}
                onPress={() => handleScanDNI("back")}
              >
                <Ionicons
                  name={verificationStatus.dniBack ? "checkmark-circle" : "card"}
                  size={24}
                  color={
                    verificationStatus.dniBack ? colors.success : colors.white
                  }
                />
                <Text style={styles.scanButtonText}>
                  {verificationStatus.dniBack
                    ? "DNI dorso verificado"
                    : "Escanear DNI (Dorso)"}
                </Text>
              </TouchableOpacity>

              {verificationStatus.face &&
                verificationStatus.dniFront &&
                verificationStatus.dniBack && (
                  <View style={styles.successMessage}>
                    <Ionicons
                      name="shield-checkmark"
                      size={32}
                      color={colors.success}
                    />
                    <Text style={styles.successText}>
                      ¡Verificación completa! Tu perfil será verificado pronto.
                    </Text>
                  </View>
                )}
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Navigation (reemplazado por componente) */}
        <BottomNav navigation={navigation} profileRoute="ProfileProfessional" />
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
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verifiedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    justifyContent: "center",
    alignItems: "center",
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
  checkboxContainer: {
    marginTop: 8,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.white,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.secondaryBlue,
    borderColor: colors.secondaryBlue,
  },
  checkboxLabel: {
    color: colors.white,
    fontSize: 16,
  },
  infoText: {
    color: colors.mutedText,
    fontSize: 14,
    marginBottom: 16,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.5)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    gap: 12,
  },
  scanButtonCompleted: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderWidth: 1,
    borderColor: colors.success,
  },
  scanButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    padding: 16,
    borderRadius: 10,
    marginTop: 8,
    gap: 12,
  },
  successText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
});
