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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { BottomNav } from "../components/BottomNav";
import { useAuth } from "../context/AuthContext";
import { professionalsApi, reviewsApi, serviceOrdersApi } from "../api";

export const ProfessionalDashboard = ({ navigation }) => {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [professionalProfile, setProfessionalProfile] = useState(null);
  const [upcomingJobs, setUpcomingJobs] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    pendingJobs: 0,
    inProgressJobs: 0,
    completedThisMonth: 0,
    averageRating: 0,
    totalReviews: 0,
  });

  const loadDashboardData = useCallback(async () => {
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
        size: 50,
      });
      const allOrders = ordersResponse?.content || [];

      // Filter upcoming jobs (pending or in progress)
      const upcoming = allOrders
        .filter((o) => o.status === "PENDING" || o.status === "IN_PROGRESS")
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .slice(0, 5);
      setUpcomingJobs(upcoming);

      // Calculate stats
      const pendingJobs = allOrders.filter((o) => o.status === "PENDING").length;
      const inProgressJobs = allOrders.filter((o) => o.status === "IN_PROGRESS").length;

      // Completed this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const completedThisMonth = allOrders.filter(
        (o) => o.status === "COMPLETED" && new Date(o.updatedAt) >= firstDayOfMonth
      ).length;

      // Load recent reviews
      const reviewsResponse = await reviewsApi.listByProfessional(profile.id, {
        page: 0,
        size: 3,
      });
      const reviewsList = reviewsResponse?.content || [];
      setRecentReviews(reviewsList);

      setStats({
        totalJobs: allOrders.length,
        pendingJobs,
        inProgressJobs,
        completedThisMonth,
        averageRating: profile.rating || 0,
        totalReviews: profile.reviewsCount || 0,
      });
    } catch (error) {
      console.error("Error loading dashboard data", error);
      Alert.alert("Error", "No se pudo cargar la información del dashboard");
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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
          <Text style={styles.loadingText}>Cargando dashboard...</Text>
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
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Hola,</Text>
              <Text style={styles.userName}>{professionalProfile?.displayName || user?.fullName}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Rating Card */}
          <View style={styles.ratingCard}>
            <View style={styles.ratingCardContent}>
              <Ionicons name="star" size={40} color="#FFD700" />
              <View style={styles.ratingCardInfo}>
                <Text style={styles.ratingCardValue}>
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/D"}
                </Text>
                <Text style={styles.ratingCardLabel}>Rating Promedio</Text>
                <Text style={styles.ratingCardSubtext}>{stats.totalReviews} reseñas</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCardSmall}>
              <Ionicons name="hourglass-outline" size={24} color="#FDB94E" />
              <Text style={styles.statCardValueSmall}>{stats.pendingJobs}</Text>
              <Text style={styles.statCardLabelSmall}>Pendientes</Text>
            </View>

            <View style={styles.statCardSmall}>
              <Ionicons name="construct-outline" size={24} color="#38bdf8" />
              <Text style={styles.statCardValueSmall}>{stats.inProgressJobs}</Text>
              <Text style={styles.statCardLabelSmall}>En Progreso</Text>
            </View>

            <View style={styles.statCardSmall}>
              <Ionicons name="checkmark-done-outline" size={24} color={colors.success} />
              <Text style={styles.statCardValueSmall}>{stats.completedThisMonth}</Text>
              <Text style={styles.statCardLabelSmall}>Completados</Text>
            </View>
          </View>

          {/* Upcoming Jobs */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Próximos Trabajos</Text>
              <TouchableOpacity onPress={() => navigation.navigate("MyJobs")}>
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            {upcomingJobs.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={colors.mutedText} />
                <Text style={styles.emptyStateText}>No tienes trabajos próximos</Text>
              </View>
            ) : (
              <View style={styles.jobsList}>
                {upcomingJobs.map((job) => (
                  <TouchableOpacity
                    key={job.id}
                    style={styles.jobCard}
                    onPress={() => navigation.navigate("Chat", { serviceOrderId: job.id })}
                  >
                    <View style={styles.jobCardHeader}>
                      <View style={styles.jobCardLeft}>
                        <View style={[styles.jobStatusDot, { backgroundColor: getStatusColor(job.status) }]} />
                        <View style={styles.jobCardInfo}>
                          <Text style={styles.jobCardTitle}>{job.serviceType}</Text>
                          <Text style={styles.jobCardClient}>
                            <Ionicons name="person-outline" size={14} color={colors.mutedText} />
                            {" "}{job.clientName || "Cliente"}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.jobStatusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                        <Text style={styles.jobStatusText}>{getStatusLabel(job.status)}</Text>
                      </View>
                    </View>
                    <Text style={styles.jobCardDescription} numberOfLines={2}>
                      {job.description}
                    </Text>
                    <View style={styles.jobCardFooter}>
                      <View style={styles.jobCardDate}>
                        <Ionicons name="calendar-outline" size={14} color={colors.mutedText} />
                        <Text style={styles.jobCardDateText}>
                          {new Date(job.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      {job.scheduledDate && (
                        <View style={styles.jobCardScheduled}>
                          <Ionicons name="time-outline" size={14} color={colors.success} />
                          <Text style={styles.jobCardScheduledText}>
                            Agendado: {new Date(job.scheduledDate).toLocaleDateString()}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Recent Reviews */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reseñas Recientes</Text>
              <TouchableOpacity onPress={() => navigation.navigate("ViewProfile")}>
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            </View>

            {recentReviews.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="star-outline" size={48} color={colors.mutedText} />
                <Text style={styles.emptyStateText}>No tienes reseñas aún</Text>
              </View>
            ) : (
              <View style={styles.reviewsList}>
                {recentReviews.map((review) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewUser}>
                        <Ionicons name="person-circle" size={40} color={colors.white} />
                        <View style={styles.reviewUserInfo}>
                          <Text style={styles.reviewUserName}>{review.userDisplayName || "Usuario"}</Text>
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
                    {review.comment && (
                      <Text style={styles.reviewComment} numberOfLines={3}>
                        {review.comment}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    color: colors.white,
    fontSize: 16,
    opacity: 0.8,
  },
  userName: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "700",
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
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
  ratingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  ratingCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  ratingCardInfo: {
    flex: 1,
  },
  ratingCardValue: {
    color: colors.white,
    fontSize: 36,
    fontWeight: "700",
  },
  ratingCardLabel: {
    color: colors.white,
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  ratingCardSubtext: {
    color: colors.mutedText,
    fontSize: 13,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCardSmall: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statCardValueSmall: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
  },
  statCardLabelSmall: {
    color: colors.mutedText,
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "700",
  },
  seeAllText: {
    color: colors.greenButton,
    fontSize: 14,
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
  jobsList: {
    gap: 12,
  },
  jobCard: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#38bdf8",
  },
  jobCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  jobCardLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
  },
  jobStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  jobCardInfo: {
    flex: 1,
  },
  jobCardTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  jobCardClient: {
    color: colors.mutedText,
    fontSize: 13,
  },
  jobStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  jobStatusText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "600",
  },
  jobCardDescription: {
    color: colors.white,
    opacity: 0.8,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  jobCardFooter: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  jobCardDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  jobCardDateText: {
    color: colors.mutedText,
    fontSize: 12,
  },
  jobCardScheduled: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  jobCardScheduledText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "600",
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
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
    fontSize: 15,
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
    opacity: 0.9,
    fontSize: 14,
    lineHeight: 20,
  },
});
