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
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { colors } from "../theme/colors";
import { BottomNav } from '../components/BottomNav';
import { showSuccessToast } from '../utils/notifications';
import { useAuth } from '../context/AuthContext';
import { usersApi, authApi } from '../api';
import { cloudinaryConfig } from '../config/cloudinary';

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
    avatarUrl: "",
  });

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    setLoading(true);
    try {
      if (token) {
        const userData = await authApi.me(token);
        setFormData({
          fullName: userData.fullName || "",
          location: userData.location || "",
          phone: userData.phone || "",
          email: userData.email || "",
          avatarUrl: userData.avatarUrl || "",
        });
        setPaymentMethods(userData.preferredPaymentMethods || []);
      }
    } catch (error) {
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
        avatarUrl: user.avatarUrl || "",
      });
      setPaymentMethods(user.preferredPaymentMethods || []);
    }
  };

  useEffect(() => {
    if (user) {
      fallbackToLocalData();
      setLoading(false);
    }
    if (token) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const handleSelectAndUploadImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para cambiar la foto de perfil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) {
      return;
    }

    const localUri = result.assets[0].uri;
    const filename = localUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    const cloudinaryData = new FormData();
    cloudinaryData.append('file', { uri: localUri, name: filename, type });
    cloudinaryData.append('upload_preset', cloudinaryConfig.upload_preset);
    cloudinaryData.append('cloud_name', cloudinaryConfig.cloud_name);

    setSaving(true);
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/image/upload`, {
        method: 'POST',
        body: cloudinaryData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      if (data.secure_url) {
        setFormData({ ...formData, avatarUrl: data.secure_url });
        showSuccessToast('Imagen de perfil actualizada. No olvides guardar los cambios.');
      } else {
        throw new Error('No se pudo obtener la URL de la imagen.');
      }
    } catch (err) {
      console.error('Error uploading to Cloudinary:', err);
      Alert.alert('Error de subida', 'No se pudo subir la imagen. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

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
    if (!formData.fullName.trim() || !formData.location.trim() || !formData.phone.trim() || !formData.email.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios.');
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
        avatarUrl: formData.avatarUrl ? formData.avatarUrl.trim() : null,
      };

      await usersApi.updateProfile(token, profileData);
      if (refreshProfile) {
        await refreshProfile();
      }
      showSuccessToast('Datos guardados correctamente');
    } catch (error) {
      console.error('Error saving profile:', error);
      const errorMessage = error.message?.includes('Network request failed')
        ? 'Sin conexión al servidor. Verifica tu conexión.'
        : 'No se pudo guardar el perfil. Intenta nuevamente.';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={[colors.primaryBlue, colors.secondaryBlue]} style={styles.background}>
        <StatusBar style="light" />
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.primaryBlue, colors.secondaryBlue]} style={styles.background}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color={colors.white} />
              <Text style={styles.logoutText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handleSelectAndUploadImage} disabled={saving}>
              <View style={styles.avatarCircle}>
                {formData.avatarUrl ? (
                  <Image source={{ uri: formData.avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={70} color="rgba(255,255,255,0.8)" />
                )}
                <View style={styles.editIconOverlay}>
                  <Ionicons name="pencil" size={20} color={colors.white} />
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.userName}>{formData.fullName || user?.username || 'Usuario'}</Text>
          </View>

          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection("personal")}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            <Ionicons name={expandedSection === "personal" ? "chevron-down" : "chevron-forward"} size={24} color={colors.white} />
          </TouchableOpacity>

          {expandedSection === "personal" && (
            <View style={styles.sectionContent}>
              <Text style={styles.label}>Nombre Completo</Text>
              <TextInput style={styles.input} value={formData.fullName} onChangeText={(text) => setFormData({ ...formData, fullName: text })} />

              <Text style={styles.label}>Ubicación</Text>
              <TextInput style={styles.input} value={formData.location} onChangeText={(text) => setFormData({ ...formData, location: text })} />
            </View>
          )}

          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection("contacto")}>
            <Text style={styles.sectionTitle}>Contacto</Text>
            <Ionicons name={expandedSection === "contacto" ? "chevron-down" : "chevron-forward"} size={24} color={colors.white} />
          </TouchableOpacity>

          {expandedSection === "contacto" && (
            <View style={styles.sectionContent}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput style={styles.input} value={formData.phone} onChangeText={(text) => setFormData({ ...formData, phone: text })} keyboardType="phone-pad" />

              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={formData.email} onChangeText={(text) => setFormData({ ...formData, email: text })} keyboardType="email-address" autoCapitalize="none" />
            </View>
          )}

          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection("payment")}>
            <Text style={styles.sectionTitle}>Métodos de pago</Text>
            <Ionicons name={expandedSection === "payment" ? "chevron-down" : "chevron-forward"} size={24} color={colors.white} />
          </TouchableOpacity>

          {expandedSection === "payment" && (
            <View style={styles.sectionContent}>
              <Text style={styles.label}>Selecciona tus métodos de pago preferidos</Text>
              <View style={styles.paymentMethodsContainer}>
                {PAYMENT_METHODS_OPTIONS.map((method) => (
                  <TouchableOpacity key={method.id} style={[styles.paymentMethodCard, paymentMethods.includes(method.id) && styles.paymentMethodCardSelected]} onPress={() => togglePaymentMethod(method.id)}>
                    <View style={styles.paymentMethodContent}>
                      <Ionicons name={method.icon} size={28} color={paymentMethods.includes(method.id) ? colors.success : colors.white} />
                      <Text style={[styles.paymentMethodLabel, paymentMethods.includes(method.id) && styles.paymentMethodLabelSelected]}>{method.label}</Text>
                    </View>
                    {paymentMethods.includes(method.id) && (
                      <View style={styles.checkmarkCircle}><Ionicons name="checkmark" size={16} color={colors.white} /></View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveButtonText}>Guardar Cambios</Text>}
          </TouchableOpacity>
        </ScrollView>

        <BottomNav navigation={navigation} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, paddingTop: Platform.OS === "ios" ? 50 : 40, paddingBottom: 80 },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 },
  headerTitle: { color: colors.white, fontSize: 32, fontWeight: "700", textAlign: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, position: 'relative' },
  logoutButton: { position: 'absolute', right: 0, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  logoutText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100, flexGrow: 1 },
  avatarSection: { alignItems: "center", marginBottom: 32 },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    position: 'relative',
  },
  avatarImage: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden' },
  editIconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    zIndex: 999,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  userName: { color: colors.white, fontSize: 28, fontWeight: "700" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(59, 130, 246, 0.4)", paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, marginBottom: 8 },
  sectionTitle: { color: colors.white, fontSize: 18, fontWeight: "600" },
  sectionContent: { backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: 12, padding: 20, marginBottom: 16 },
  label: { color: colors.white, fontSize: 14, marginBottom: 8, marginTop: 8 },
  input: { backgroundColor: "rgba(96, 165, 250, 0.3)", borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16, color: colors.white, fontSize: 16, marginBottom: 8 },
  saveButton: { backgroundColor: colors.greenButton, paddingVertical: 18, borderRadius: 12, alignItems: "center", marginTop: 32, marginBottom: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: colors.white, fontSize: 18, fontWeight: "600" },
  paymentMethodsContainer: { gap: 12 },
  paymentMethodCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(59, 130, 246, 0.3)", paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, borderColor: "transparent" },
  paymentMethodCardSelected: { backgroundColor: "rgba(16, 185, 129, 0.2)", borderColor: colors.success },
  paymentMethodContent: { flexDirection: "row", alignItems: "center", gap: 16 },
  paymentMethodLabel: { color: colors.white, fontSize: 16, fontWeight: "500" },
  paymentMethodLabelSelected: { color: colors.success, fontWeight: "600" },
  checkmarkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.success, justifyContent: "center", alignItems: "center" },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.white, fontSize: 16, marginTop: 16 },
});
