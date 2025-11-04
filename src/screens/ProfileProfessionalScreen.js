import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { BottomNav } from "../components/BottomNav";
import { BackButton } from "../components/BackButton";
import { showSuccessToast } from "../utils/notifications";
import { useAuth } from "../context/AuthContext";
import { professionalsApi } from "../api";
import * as ImagePicker from "expo-image-picker";

const CLOUDINARY_CLOUD_NAME = 'dtjbknm5h';
const CLOUDINARY_UPLOAD_PRESET = 'ml_default';

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

const NAME_REGEX = /^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s'-]{3,60}$/;
const LOCATION_REGEX = /^[a-zA-ZÁÉÍÓÚÑáéíóúñ0-9.,\s-]{3,80}$/;
const PHONE_REGEX = /^\+?\d{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PROFESSION_REGEX = /^[a-zA-ZÁÉÍÓÚÑáéíóúñ0-9.,\s'-]{3,80}$/;

const getApiErrorMessage = (error, fallback) => {
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
  return error?.message ?? fallback;
};

const parseDecimal = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = value.toString().trim();
  if (!trimmed) {
    return null;
  }
  const normalized = trimmed.replace(/,/g, ".");
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? NaN : parsed;
};

export const ProfileProfessionalScreen = ({ navigation }) => {
  const { user, token, logout, roles = [] } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    profession: "",
    summary: "",
    biography: "",
    experienceYears: "0",
    location: "",
    phone: "",
    email: "",
    distanceKm: "",
    minRate: "",
    maxRate: "",
    tags: "",
  });
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState({
    face: false,
    dniFront: false,
    dniBack: false,
  });
  const [expandedSection, setExpandedSection] = useState("professional");
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [professionalId, setProfessionalId] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // --- Handle new image ---
  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets || !result.assets[0]) {
      return;
    }

    setUploading(true);
    const asset = result.assets[0];

    // Prepara la imagen para Cloudinary
    const data = new FormData();
    data.append('file', {
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: asset.fileName || 'profile.jpg',
    });
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    data.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
        },
      });

      const json = await response.json();
      if (json.secure_url) {
        setAvatarUrl(json.secure_url); // <-- Guarda la nueva URL
        Alert.alert('Éxito', 'Imagen actualizada. No olvides guardar los cambios.');
      } else {
        throw new Error(json.error?.message || 'Error al subir la imagen');
      }
    } catch (err) {
      console.error('Error uploading to Cloudinary:', err);
      Alert.alert('Error', 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const isProfessionalRole = useMemo(
    () => Array.isArray(roles) && roles.includes("PROFESSIONAL"),
    [roles]
  );

  const isVerified = useMemo(
    () => verificationStatus.face && verificationStatus.dniFront && verificationStatus.dniBack,
    [verificationStatus]
  );

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
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

  const handleInputChange = (field) => (text) => {
    setFormData((prev) => ({ ...prev, [field]: text }));
    if (formErrors[field]) {
      const validation = validateField(field, text);
      if (validation) {
        setFormErrors((prev) => ({ ...prev, [field]: validation }));
        return;
      }
      clearError(field);
    }
  };

  const toggleJob = (job) => {
    setSelectedJobs((prev) => {
      const alreadySelected = prev.includes(job);
      const updated = alreadySelected ? prev.filter((item) => item !== job) : [...prev, job];
      if (updated.length > 0) {
        clearError("selectedJobs");
      }
      return updated;
    });
  };

  const togglePaymentMethod = (methodId) => {
    setSelectedPaymentMethods((prev) => {
      const alreadySelected = prev.includes(methodId);
      const updated = alreadySelected
        ? prev.filter((method) => method !== methodId)
        : [...prev, methodId];
      if (updated.length > 0) {
        clearError("selectedPaymentMethods");
      }
      return updated;
    });
  };

  const validateField = (field, rawValue) => {
    const value = rawValue?.toString?.().trim?.() ?? "";

    switch (field) {
      case "fullName":
        if (!value) {
          return "Ingresa tu nombre completo";
        }
        if (!NAME_REGEX.test(value)) {
          return "Usa solo letras y entre 3 y 60 caracteres";
        }
        return null;
      case "profession":
        if (!value) {
          return "Indicá tu profesión principal";
        }
        if (!PROFESSION_REGEX.test(value)) {
          return "Usa solo letras y 3 a 80 caracteres";
        }
        return null;
      case "summary":
        if (!value) {
          return "Escribe un resumen de tus servicios";
        }
        if (value.length < 10) {
          return "Usa al menos 10 caracteres";
        }
        if (value.length > 180) {
          return "Máximo 180 caracteres";
        }
        return null;
      case "biography":
        if (!value) {
          return "Contanos más sobre tu experiencia";
        }
        if (value.length < 30) {
          return "La biografía debe tener al menos 30 caracteres";
        }
        if (value.length > 5000) {
          return "La biografía es demasiado extensa";
        }
        return null;
      case "experienceYears":
        if (!value) {
          return "Indica tus años de experiencia";
        }
        if (!/^\d+$/.test(value)) {
          return "Usa solo números enteros";
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
      case "distanceKm": {
        if (!value) {
          return null;
        }
        const parsed = parseDecimal(value);
        if (Number.isNaN(parsed)) {
          return "Ingresa una distancia válida";
        }
        if (parsed < 0) {
          return "La distancia no puede ser negativa";
        }
        return null;
      }
      case "minRate":
      case "maxRate": {
        if (!value) {
          return null;
        }
        const parsed = parseDecimal(value);
        if (Number.isNaN(parsed)) {
          return "Ingresa un monto válido";
        }
        if (parsed < 0) {
          return "No puede ser negativo";
        }
        return null;
      }
      default:
        return null;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    Object.entries(formData).forEach(([field, value]) => {
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (selectedJobs.length === 0) {
      newErrors.selectedJobs = "Seleccioná al menos un servicio";
    }

    if (selectedPaymentMethods.length === 0) {
      newErrors.selectedPaymentMethods = "Seleccioná al menos un método de cobro";
    }

    const experience = parseInt(formData.experienceYears, 10);
    if (Number.isNaN(experience) || experience < 0) {
      newErrors.experienceYears = "Usa un número válido";
    }

    const minRateValue = parseDecimal(formData.minRate);
    const maxRateValue = parseDecimal(formData.maxRate);
    if (!Number.isNaN(minRateValue) && !Number.isNaN(maxRateValue) && minRateValue !== null && maxRateValue !== null) {
      if (minRateValue > maxRateValue) {
        newErrors.maxRate = "El máximo debe ser mayor o igual al mínimo";
      }
    }

    return newErrors;
  };

  const loadProfessionalProfile = useCallback(async () => {
    if (!token || !user?.id) {
      setProfileLoaded(true);
      return;
    }
    setLoading(true);
    try {
      const profile = await professionalsApi.getByUserId(user.id, token);
      setProfessionalId(profile.id);

      // Cargar el avatar si existe
      if (profile.avatarUrl) {
        setAvatarUrl(profile.avatarUrl);
      }

      const combinedServices = new Set([
        ...(Array.isArray(profile.services) ? profile.services : []),
        ...(Array.isArray(profile.availableJobs) ? profile.availableJobs : []),
      ]);

      setSelectedJobs(Array.from(combinedServices));
      setSelectedPaymentMethods(Array.isArray(profile.paymentMethods) ? profile.paymentMethods : []);
      setVerificationStatus({
        face: Boolean(profile.verificationStatus?.faceVerified),
        dniFront: Boolean(profile.verificationStatus?.dniFrontVerified),
        dniBack: Boolean(profile.verificationStatus?.dniBackVerified),
      });
      setFormData({
        fullName: profile.displayName || user.fullName || "",
        profession: profile.profession || "",
        summary: profile.summary || "",
        biography: profile.biography || "",
        experienceYears: String(profile.experienceYears ?? 0),
        location: profile.address || user.location || "",
        phone: profile.contactPhone || user.phone || "",
        email: profile.contactEmail || user.email || "",
        distanceKm: profile.distanceKm !== undefined && profile.distanceKm !== null ? String(profile.distanceKm) : "",
        minRate: profile.minRate !== undefined && profile.minRate !== null ? String(profile.minRate) : "",
        maxRate: profile.maxRate !== undefined && profile.maxRate !== null ? String(profile.maxRate) : "",
        tags: Array.isArray(profile.tags) ? profile.tags.join(", ") : "",
      });
      setFormErrors({});
      setExpandedSection("professional");
    } catch (error) {
      if (error.status === 404) {
        setProfessionalId(null);
        setSelectedJobs([]);
        setSelectedPaymentMethods([]);
        setVerificationStatus({ face: false, dniFront: false, dniBack: false });
        setFormData({
          fullName: user?.fullName || "",
          profession: "",
          summary: "",
          biography: "",
          experienceYears: "0",
          location: user?.location || "",
          phone: user?.phone || "",
          email: user?.email || "",
          distanceKm: "",
          minRate: "",
          maxRate: "",
          tags: "",
        });
      } else {
        console.error("Error loading professional profile", error);
        Alert.alert(
          "No se pudo cargar",
          getApiErrorMessage(error, "Intenta nuevamente más tarde.")
        );
      }
    } finally {
      setLoading(false);
      setProfileLoaded(true);
    }
  }, [token, user]);

  useEffect(() => {
    loadProfessionalProfile();
  }, [loadProfessionalProfile]);

  const handleSave = async () => {
    if (!token || !user?.id) {
      Alert.alert("Sesión expirada", "Volvé a iniciar sesión para actualizar tu perfil.");
      return;
    }

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      Alert.alert("Revisá los datos", "Corregí los campos marcados antes de guardar.");
      return;
    }

    const trimmedFullName = formData.fullName.trim();
    const trimmedProfession = formData.profession.trim();
    const trimmedSummary = formData.summary.trim();
    const trimmedBiography = formData.biography.trim();
    const trimmedLocation = formData.location.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedEmail = formData.email.trim();
    const experience = parseInt(formData.experienceYears.trim(), 10) || 0;
    const distanceValue = parseDecimal(formData.distanceKm);
    const minRateValue = parseDecimal(formData.minRate);
    const maxRateValue = parseDecimal(formData.maxRate);
    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const services = selectedJobs;

    const basePayload = {
      displayName: trimmedFullName,
      profession: trimmedProfession,
      summary: trimmedSummary,
      biography: trimmedBiography,
      experienceYears: experience,
      services,
      tags,
      distanceKm: distanceValue ?? undefined,
      address: trimmedLocation,
      minRate: minRateValue ?? undefined,
      maxRate: maxRateValue ?? undefined,
      avatarUrl: avatarUrl,
      contactEmail: trimmedEmail,
      contactPhone: trimmedPhone,
      paymentMethods: selectedPaymentMethods,
      availableJobs: services,
      faceVerified: verificationStatus.face,
      dniFrontVerified: verificationStatus.dniFront,
      dniBackVerified: verificationStatus.dniBack,
      active: true,
    };

    setSaving(true);
    try {
      let response;
      if (professionalId) {
        response = await professionalsApi.update(token, professionalId, basePayload);
      } else {
        response = await professionalsApi.create(token, {
          userId: user.id,
          ...basePayload,
        });
      }

      setProfessionalId(response.id);
      const combinedServices = new Set([
        ...(Array.isArray(response.services) ? response.services : []),
        ...(Array.isArray(response.availableJobs) ? response.availableJobs : []),
      ]);
      setSelectedJobs(Array.from(combinedServices));
      setSelectedPaymentMethods(Array.isArray(response.paymentMethods) ? response.paymentMethods : []);
      setVerificationStatus({
        face: Boolean(response.verificationStatus?.faceVerified),
        dniFront: Boolean(response.verificationStatus?.dniFrontVerified),
        dniBack: Boolean(response.verificationStatus?.dniBackVerified),
      });
      setFormData({
        fullName: response.displayName || trimmedFullName,
        profession: response.profession || trimmedProfession,
        summary: response.summary || trimmedSummary,
        biography: response.biography || trimmedBiography,
        experienceYears: String(response.experienceYears ?? experience),
        location: response.address || trimmedLocation,
        phone: response.contactPhone || trimmedPhone,
        email: response.contactEmail || trimmedEmail,
        distanceKm:
          response.distanceKm !== undefined && response.distanceKm !== null
            ? String(response.distanceKm)
            : basePayload.distanceKm !== undefined && basePayload.distanceKm !== null
              ? String(basePayload.distanceKm)
              : "",
        minRate:
          response.minRate !== undefined && response.minRate !== null
            ? String(response.minRate)
            : basePayload.minRate !== undefined && basePayload.minRate !== null
              ? String(basePayload.minRate)
              : "",
        maxRate:
          response.maxRate !== undefined && response.maxRate !== null
            ? String(response.maxRate)
            : basePayload.maxRate !== undefined && basePayload.maxRate !== null
              ? String(basePayload.maxRate)
              : "",
        tags: Array.isArray(response.tags) ? response.tags.join(", ") : tags.join(", "),
      });
      setFormErrors({});
      showSuccessToast("Datos guardados correctamente");
    } catch (error) {
      console.error("Error saving professional profile", error);
      Alert.alert("No se pudo guardar", getApiErrorMessage(error, "Intentá nuevamente más tarde."));
    } finally {
      setSaving(false);
    }
  };

  const handleScanFace = () => {
    setVerificationStatus((prev) => ({ ...prev, face: true }));
  };

  const handleScanDNI = (side) => {
    setVerificationStatus((prev) => ({
      ...prev,
      [side === "front" ? "dniFront" : "dniBack"]: true,
    }));
  };

  return (
    <LinearGradient colors={[colors.primaryBlue, colors.secondaryBlue]} style={styles.background}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <BackButton navigation={navigation} fallbackRoute="Homepage" />
            <Text style={styles.headerTitle}>Perfil profesional</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color={colors.white} />
              <Text style={styles.logoutText}>Salir</Text>
            </TouchableOpacity>
          </View>
          {!isProfessionalRole && (
            <Text style={styles.noticeText}>
              Activá la opción "Quiero ofrecer mis servicios" al registrarte para habilitar todas las funciones
              profesionales.
            </Text>
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePickImage} disabled={uploading}>
              <View style={styles.avatarCircle}>
                {uploading ? (
                  <ActivityIndicator color={colors.white} />
                ) : avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                ) : (
                  // Tu placeholder actual
                  <View style={styles.avatarPlaceholder}>
                    <View style={styles.avatarHead} />
                    <View style={styles.avatarBody} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.white} />
              <Text style={styles.loadingText}>Cargando perfil profesional...</Text>
            </View>
          )}

          {profileLoaded && (
            <>
              <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection("professional")}>
                <Text style={styles.sectionTitle}>Información profesional</Text>
                <Ionicons
                  name={expandedSection === "professional" ? "chevron-down" : "chevron-forward"}
                  size={24}
                  color={colors.white}
                />
              </TouchableOpacity>

              {expandedSection === "professional" && (
                <View style={styles.sectionContent}>
                  <Text style={styles.label}>Nombre a mostrar</Text>
                  <TextInput
                    style={[styles.input, formErrors.fullName && styles.inputError]}
                    value={formData.fullName}
                    onChangeText={handleInputChange("fullName")}
                    placeholder="Ej: Juan Pérez"
                    placeholderTextColor="#999"
                  />
                  {formErrors.fullName && <Text style={styles.errorText}>{formErrors.fullName}</Text>}

                  <Text style={styles.label}>Profesión</Text>
                  <TextInput
                    style={[styles.input, formErrors.profession && styles.inputError]}
                    value={formData.profession}
                    onChangeText={handleInputChange("profession")}
                    placeholder="Ej: Plomero matriculado"
                    placeholderTextColor="#999"
                  />
                  {formErrors.profession && <Text style={styles.errorText}>{formErrors.profession}</Text>}

                  <Text style={styles.label}>Resumen (se muestra en las búsquedas)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea, formErrors.summary && styles.inputError]}
                    value={formData.summary}
                    onChangeText={handleInputChange("summary")}
                    placeholder="Contá brevemente qué servicios ofrecés"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  {formErrors.summary && <Text style={styles.errorText}>{formErrors.summary}</Text>}

                  <Text style={styles.label}>Biografía</Text>
                  <TextInput
                    style={[styles.input, styles.textAreaLarge, formErrors.biography && styles.inputError]}
                    value={formData.biography}
                    onChangeText={handleInputChange("biography")}
                    placeholder="Compartí más detalles sobre tu experiencia, certificaciones y trabajos realizados"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />
                  {formErrors.biography && <Text style={styles.errorText}>{formErrors.biography}</Text>}

                  <Text style={styles.label}>Años de experiencia</Text>
                  <TextInput
                    style={[styles.input, formErrors.experienceYears && styles.inputError]}
                    value={formData.experienceYears}
                    onChangeText={handleInputChange("experienceYears")}
                    keyboardType="numeric"
                    placeholder="Ej: 5"
                    placeholderTextColor="#999"
                  />
                  {formErrors.experienceYears && <Text style={styles.errorText}>{formErrors.experienceYears}</Text>}

                  <Text style={styles.label}>Zona / Dirección de trabajo</Text>
                  <TextInput
                    style={[styles.input, formErrors.location && styles.inputError]}
                    value={formData.location}
                    onChangeText={handleInputChange("location")}
                    placeholder="Ej: CABA, GBA norte"
                    placeholderTextColor="#999"
                  />
                  {formErrors.location && <Text style={styles.errorText}>{formErrors.location}</Text>}

                  <Text style={styles.label}>Radio de cobertura (km)</Text>
                  <TextInput
                    style={[styles.input, formErrors.distanceKm && styles.inputError]}
                    value={formData.distanceKm}
                    onChangeText={handleInputChange("distanceKm")}
                    keyboardType="numeric"
                    placeholder="Ej: 15"
                    placeholderTextColor="#999"
                  />
                  {formErrors.distanceKm && <Text style={styles.errorText}>{formErrors.distanceKm}</Text>}

                  <Text style={styles.label}>Trabajos / Servicios</Text>
                  <View style={styles.checkboxContainer}>
                    {AVAILABLE_JOBS.map((job) => (
                      <TouchableOpacity key={job} style={styles.checkboxItem} onPress={() => toggleJob(job)}>
                        <View
                          style={[
                            styles.checkbox,
                            selectedJobs.includes(job) && styles.checkboxChecked,
                          ]}
                        >
                          {selectedJobs.includes(job) && (
                            <Ionicons name="checkmark" size={16} color={colors.white} />
                          )}
                        </View>
                        <Text style={styles.checkboxLabel}>{job}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {formErrors.selectedJobs && <Text style={styles.errorText}>{formErrors.selectedJobs}</Text>}

                  <Text style={styles.label}>Etiquetas (separadas por coma)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.tags}
                    onChangeText={handleInputChange("tags")}
                    placeholder="Ej: Verificado, Matriculado"
                    placeholderTextColor="#999"
                  />
                </View>
              )}

              <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection("contacto")}>
                <Text style={styles.sectionTitle}>Contacto</Text>
                <Ionicons
                  name={expandedSection === "contacto" ? "chevron-down" : "chevron-forward"}
                  size={24}
                  color={colors.white}
                />
              </TouchableOpacity>

              {expandedSection === "contacto" && (
                <View style={styles.sectionContent}>
                  <Text style={styles.label}>Teléfono</Text>
                  <TextInput
                    style={[styles.input, formErrors.phone && styles.inputError]}
                    value={formData.phone}
                    onChangeText={handleInputChange("phone")}
                    keyboardType="phone-pad"
                    placeholder="Ej: +54 9 11 1234 5678"
                    placeholderTextColor="#999"
                  />
                  {formErrors.phone && <Text style={styles.errorText}>{formErrors.phone}</Text>}

                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[styles.input, formErrors.email && styles.inputError]}
                    value={formData.email}
                    onChangeText={handleInputChange("email")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="tucorreo@ejemplo.com"
                    placeholderTextColor="#999"
                  />
                  {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}
                </View>
              )}

              <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection("rates")}>
                <Text style={styles.sectionTitle}>Tarifas y cobros</Text>
                <Ionicons
                  name={expandedSection === "rates" ? "chevron-down" : "chevron-forward"}
                  size={24}
                  color={colors.white}
                />
              </TouchableOpacity>

              {expandedSection === "rates" && (
                <View style={styles.sectionContent}>
                  <Text style={styles.label}>Tarifa mínima estimada (ARS)</Text>
                  <TextInput
                    style={[styles.input, formErrors.minRate && styles.inputError]}
                    value={formData.minRate}
                    onChangeText={handleInputChange("minRate")}
                    keyboardType="numeric"
                    placeholder="Ej: 8000"
                    placeholderTextColor="#999"
                  />
                  {formErrors.minRate && <Text style={styles.errorText}>{formErrors.minRate}</Text>}

                  <Text style={styles.label}>Tarifa máxima estimada (ARS)</Text>
                  <TextInput
                    style={[styles.input, formErrors.maxRate && styles.inputError]}
                    value={formData.maxRate}
                    onChangeText={handleInputChange("maxRate")}
                    keyboardType="numeric"
                    placeholder="Ej: 25000"
                    placeholderTextColor="#999"
                  />
                  {formErrors.maxRate && <Text style={styles.errorText}>{formErrors.maxRate}</Text>}

                  <Text style={styles.label}>Métodos de cobro</Text>
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
                            selectedPaymentMethods.includes(method.id) && styles.checkboxChecked,
                          ]}
                        >
                          {selectedPaymentMethods.includes(method.id) && (
                            <Ionicons name="checkmark" size={16} color={colors.white} />
                          )}
                        </View>
                        <Text style={styles.checkboxLabel}>{method.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {formErrors.selectedPaymentMethods && (
                    <Text style={styles.errorText}>{formErrors.selectedPaymentMethods}</Text>
                  )}
                </View>
              )}

              <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection("identity")}>
                <Text style={styles.sectionTitle}>Verificación de identidad</Text>
                <Ionicons
                  name={expandedSection === "identity" ? "chevron-down" : "chevron-forward"}
                  size={24}
                  color={colors.white}
                />
              </TouchableOpacity>

              {expandedSection === "identity" && (
                <View style={styles.sectionContent}>
                  <Text style={styles.infoText}>
                    Completá los pasos para verificar tu identidad y generar confianza en tus clientes.
                  </Text>

                  <TouchableOpacity
                    style={[styles.scanButton, verificationStatus.face && styles.scanButtonCompleted]}
                    onPress={handleScanFace}
                  >
                    <Ionicons
                      name={verificationStatus.face ? "checkmark-circle" : "camera"}
                      size={24}
                      color={verificationStatus.face ? colors.success : colors.white}
                    />
                    <Text style={styles.scanButtonText}>
                      {verificationStatus.face ? "Rostro verificado" : "Escanear rostro"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.scanButton, verificationStatus.dniFront && styles.scanButtonCompleted]}
                    onPress={() => handleScanDNI("front")}
                  >
                    <Ionicons
                      name={verificationStatus.dniFront ? "checkmark-circle" : "card"}
                      size={24}
                      color={verificationStatus.dniFront ? colors.success : colors.white}
                    />
                    <Text style={styles.scanButtonText}>
                      {verificationStatus.dniFront ? "DNI frente verificado" : "Escanear DNI (frente)"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.scanButton, verificationStatus.dniBack && styles.scanButtonCompleted]}
                    onPress={() => handleScanDNI("back")}
                  >
                    <Ionicons
                      name={verificationStatus.dniBack ? "checkmark-circle" : "card"}
                      size={24}
                      color={verificationStatus.dniBack ? colors.success : colors.white}
                    />
                    <Text style={styles.scanButtonText}>
                      {verificationStatus.dniBack ? "DNI dorso verificado" : "Escanear DNI (dorso)"}
                    </Text>
                  </TouchableOpacity>

                  {isVerified && (
                    <View style={styles.successMessage}>
                      <Ionicons name="shield-checkmark" size={32} color={colors.gold} />
                      <Text style={styles.successText}>
                        ¡Verificación completa! Nuestro equipo revisará la información a la brevedad.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </>
          )}

          <TouchableOpacity
            style={[styles.saveButton, (saving || loading) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving || loading}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="save" size={20} color={colors.white} />
                <Text style={styles.saveButtonText}>Guardar cambios</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>

        <BottomNav navigation={navigation} />
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
    fontSize: 28,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  logoutText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  noticeText: {
    marginTop: 12,
    color: colors.mutedText,
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 220,
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
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    color: colors.white,
    fontSize: 26,
    fontWeight: "700",
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
  inputError: {
    borderWidth: 1,
    borderColor: colors.errorStrong,
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
  },
  textAreaLarge: {
    height: 150,
    textAlignVertical: "top",
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
  checkboxContainer: {
    marginTop: 4,
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
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.greenButton,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
  },
  loadingText: {
    color: colors.white,
    opacity: 0.8,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
});

