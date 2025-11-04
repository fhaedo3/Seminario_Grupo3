import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { BottomNav } from "../components/BottomNav";
import { BackButton } from "../components/BackButton";
import { useAuth } from "../context/AuthContext";
import { professionalsApi, reviewsApi, serviceOrdersApi } from "../api";

export const ProfessionalViewProfile = ({ navigation }) => {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [professionalProfile, setProfessionalProfile] = useState(null);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    averageRating: 0,
    totalReviews: 0,
  });

  const loadProfessionalData = useCallback(async () => {
    if (!token || !user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Load professional profile
      const profile = await professionalsApi.getByUserId(user.id, token);
      setProfessionalProfile(profile);

      // Load service orders
      const ordersResponse = await serviceOrdersApi.listForProfessional(token, profile.id, {
        page: 0,
        size: 10,
      });
      const orders = ordersResponse?.content || [];
      setServiceOrders(orders);

      // Load reviews
      const reviewsResponse = await reviewsApi.listByProfessional(profile.id, {
        page: 0,
        size: 10,
      });
      const reviewsList = reviewsResponse?.content || [];
      setReviews(reviewsList);

      // Calculate stats
      const activeJobs = orders.filter((o) => o.status === "IN_PROGRESS" || o.status === "PENDING").length;
      const completedJobs = orders.filter((o) => o.status === "COMPLETED").length;

      setStats({
        totalJobs: orders.length,
        activeJobs,
        completedJobs,
        averageRating: profile.rating || 0,
        totalReviews: profile.reviewsCount || 0,
      });
    } catch (error) {
      console.error("Error loading professional data", error);
      Alert.alert("Error", "No se pudo cargar la información del perfil profesional");
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    loadProfessionalData();
  }, [loadProfessionalData]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#FDB94E";
      case "IN_PROGRESS":
        return "#38bdf8";
      case "COMPLETED":
        return colors.success;
      case "CANCELLED":
        return colors.errorStrong;
      default:
        return colors.white;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "Pendiente";
      case "IN_PROGRESS":
        return "En Progreso";
      case "COMPLETED":
        return "Completado";
      case "CANCELLED":
        return "Cancelado";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={[colors.primaryBlue, colors.secondaryBlue]} style={styles.background}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Cargando perfil profesional...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.primaryBlue, colors.secondaryBlue]} style={styles.background}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <BackButton navigation={navigation} fallbackRoute="Dashboard" />
            <Text style={styles.headerTitle}>Mi Perfil Público</Text>
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("EditProfile")}>
              <Ionicons name="create-outline" size={20} color={colors.white} />
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Summary */}
          {professionalProfile && (
            <View style={styles.profileSummary}>
              <View style={styles.avatarSection}>
                {professionalProfile.avatarUrl ? (
                  <Image source={{ uri: professionalProfile.avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={50} color={colors.white} />
                  </View>
                )}
              </View>
              <Text style={styles.profileName}>{professionalProfile.displayName}</Text>
              <Text style={styles.profileProfession}>{professionalProfile.profession}</Text>

              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={20} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "Sin calificaciones"}
                </Text>
                <Text style={styles.reviewCount}>({stats.totalReviews} reseñas)</Text>
              </View>

            </View>
          )}

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="briefcase-outline" size={24} color={colors.white} />
              <Text style={styles.statNumber}>{stats.totalJobs}</Text>
              <Text style={styles.statLabel}>Total Trabajos</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={24} color="#FDB94E" />
              <Text style={styles.statNumber}>{stats.activeJobs}</Text>
              <Text style={styles.statLabel}>Activos</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
              <Text style={styles.statNumber}>{stats.completedJobs}</Text>
              <Text style={styles.statLabel}>Completados</Text>
            </View>
          </View>

          {/* Service Orders Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trabajos Recibidos</Text>
              <Ionicons name="briefcase" size={20} color={colors.white} />
            </View>
            {serviceOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={48} color={colors.mutedText} />
                <Text style={styles.emptyStateText}>No tienes trabajos aún</Text>
              </View>
            ) : (
              serviceOrders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderTitle}>{order.serviceType}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                      <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
                    </View>
                  </View>
                  <Text style={styles.orderDescription} numberOfLines={2}>
                    {order.description}
                  </Text>
                  <View style={styles.orderFooter}>
                    <View style={styles.orderInfo}>
                      <Ionicons name="person-outline" size={16} color={colors.mutedText} />
                      <Text style={styles.orderInfoText}>{order.clientName || "Cliente"}</Text>
                    </View>
                    <View style={styles.orderInfo}>
                      <Ionicons name="calendar-outline" size={16} color={colors.mutedText} />
                      <Text style={styles.orderInfoText}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Reviews Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Calificaciones Recibidas</Text>
              <Ionicons name="star" size={20} color="#FFD700" />
            </View>
            {reviews.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="star-outline" size={48} color={colors.mutedText} />
                <Text style={styles.emptyStateText}>No tienes calificaciones aún</Text>
              </View>
            ) : (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUser}>
                      <Ionicons name="person-circle" size={40} color={colors.white} />
                      <View style={styles.reviewUserInfo}>
                        <Text style={styles.reviewUserName}>{review.reviewerName || "Usuario"}</Text>
                        <View style={styles.reviewRating}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={star <= review.rating ? "star" : "star-outline"}
                              size={14}
                              color="#FFD700"
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
                </View>
              ))
            )}
          </View>
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
    paddingBottom: 80,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.greenButton,
  },
  editButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: colors.white,
    fontSize: 16,
  },
  profileSummary: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  avatarSection: {
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  profileProfession: {
    color: colors.mutedText,
    fontSize: 16,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  ratingText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  reviewCount: {
    color: colors.mutedText,
    fontSize: 14,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.greenButton,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  editProfileText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
  },
  statLabel: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
  },
  emptyStateText: {
    color: colors.mutedText,
    fontSize: 14,
    marginTop: 12,
  },
  orderCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  orderDescription: {
    color: colors.mutedText,
    fontSize: 14,
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: "row",
    gap: 16,
  },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderInfoText: {
    color: colors.mutedText,
    fontSize: 12,
  },
  reviewCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  reviewUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    color: colors.mutedText,
    fontSize: 12,
  },
  reviewComment: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
  },
});
