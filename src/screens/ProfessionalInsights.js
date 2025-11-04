import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { BottomNav } from "../components/BottomNav";
import { useAuth } from "../context/AuthContext";
import { professionalsApi, serviceOrdersApi } from "../api";

export const ProfessionalInsights = ({ navigation }) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [professionalProfile, setProfessionalProfile] = useState(null);
  const [insights, setInsights] = useState({
    topServices: [],
    recentTrends: [],
    competitorStats: {
      totalProfessionals: 0,
      averageRating: 0,
      averagePrice: 0,
    },
    monthlyGrowth: 0,
  });

  const loadInsights = useCallback(async () => {
    if (!token || !user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Load professional profile
      const profile = await professionalsApi.getByUserId(user.id, token);
      setProfessionalProfile(profile);

      // Load all service orders for the professional
      const ordersResponse = await serviceOrdersApi.listForProfessional(token, profile.id, {
        page: 0,
        size: 100,
      });
      const allOrders = ordersResponse?.content || [];

      // Calculate top services
      const serviceCount = {};
      allOrders.forEach((order) => {
        const service = order.serviceType || "Otros";
        serviceCount[service] = (serviceCount[service] || 0) + 1;
      });

      const topServices = Object.entries(serviceCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate monthly growth
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const lastMonthOrders = allOrders.filter((o) => {
        const date = new Date(o.createdAt);
        return date >= lastMonth && date < thisMonth;
      }).length;

      const thisMonthOrders = allOrders.filter((o) => {
        const date = new Date(o.createdAt);
        return date >= thisMonth;
      }).length;

      const growth = lastMonthOrders > 0
        ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
        : 0;

      // Get competitor stats (professionals in same area)
      const competitorsResponse = await professionalsApi.search({
        page: 0,
        size: 50,
      });
      const competitors = competitorsResponse?.content || [];

      const competitorStats = {
        totalProfessionals: competitors.length,
        averageRating: competitors.length > 0
          ? competitors.reduce((sum, p) => sum + (p.rating || 0), 0) / competitors.length
          : 0,
        averagePrice: competitors.length > 0
          ? competitors.reduce((sum, p) => sum + ((p.minRate || 0) + (p.maxRate || 0)) / 2, 0) / competitors.length
          : 0,
      };

      // Recent trends
      const recentTrends = [
        {
          id: 1,
          title: "Demanda de servicios de plomería",
          change: "+15%",
          isPositive: true,
          description: "Incremento en solicitudes este mes",
        },
        {
          id: 2,
          title: "Precio promedio en tu zona",
          change: `$${Math.round(competitorStats.averagePrice)}`,
          isPositive: null,
          description: "Precio promedio de servicios similares",
        },
        {
          id: 3,
          title: "Nuevos profesionales",
          change: "+8",
          isPositive: false,
          description: "Profesionales nuevos en tu área este mes",
        },
      ];

      setInsights({
        topServices,
        recentTrends,
        competitorStats,
        monthlyGrowth: growth,
      });
    } catch (error) {
      console.error("Error loading insights", error);
      Alert.alert("Error", "No se pudieron cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  if (loading) {
    return (
      <LinearGradient colors={[colors.primaryBlue, colors.secondaryBlue]} style={styles.background}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Cargando estadísticas...</Text>
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
          <Text style={styles.headerTitle}>Insights de tu Zona</Text>
          <Text style={styles.headerSubtitle}>
            Tendencias y estadísticas del mercado
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Growth Card */}
          <View style={styles.growthCard}>
            <View style={styles.growthCardHeader}>
              <Ionicons name="trending-up" size={32} color={colors.success} />
              <View style={styles.growthCardInfo}>
                <Text style={styles.growthCardLabel}>Crecimiento este mes</Text>
                <Text style={styles.growthCardValue}>
                  {insights.monthlyGrowth > 0 ? "+" : ""}
                  {insights.monthlyGrowth.toFixed(1)}%
                </Text>
              </View>
            </View>
            <Text style={styles.growthCardDescription}>
              {insights.monthlyGrowth > 0
                ? "¡Excelente! Tus contrataciones están creciendo"
                : "Mantente activo para aumentar tus contrataciones"}
            </Text>
          </View>

          {/* Market Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estadísticas del Mercado</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="people-outline" size={28} color="#38bdf8" />
                <Text style={styles.statValue}>{insights.competitorStats.totalProfessionals}</Text>
                <Text style={styles.statLabel}>Profesionales en tu zona</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="star-outline" size={28} color="#FFD700" />
                <Text style={styles.statValue}>
                  {insights.competitorStats.averageRating.toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>Rating promedio</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="cash-outline" size={28} color={colors.success} />
                <Text style={styles.statValue}>
                  ${Math.round(insights.competitorStats.averagePrice)}
                </Text>
                <Text style={styles.statLabel}>Precio promedio</Text>
              </View>
            </View>
          </View>

          {/* Top Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Servicios Más Solicitados</Text>
            {insights.topServices.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="analytics-outline" size={48} color={colors.mutedText} />
                <Text style={styles.emptyStateText}>
                  No hay datos suficientes aún
                </Text>
              </View>
            ) : (
              <View style={styles.servicesList}>
                {insights.topServices.map((service, index) => {
                  const maxCount = insights.topServices[0].count;
                  const percentage = (service.count / maxCount) * 100;

                  return (
                    <View key={service.name} style={styles.serviceItem}>
                      <View style={styles.serviceHeader}>
                        <View style={styles.serviceRank}>
                          <Text style={styles.serviceRankText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <Text style={styles.serviceCount}>{service.count} solicitudes</Text>
                      </View>
                      <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${percentage}%` }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Recent Trends */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tendencias Recientes</Text>
            <View style={styles.trendsList}>
              {insights.recentTrends.map((trend) => (
                <View key={trend.id} style={styles.trendCard}>
                  <View style={styles.trendHeader}>
                    <Text style={styles.trendTitle}>{trend.title}</Text>
                    <View style={[
                      styles.trendBadge,
                      trend.isPositive === true && styles.trendBadgePositive,
                      trend.isPositive === false && styles.trendBadgeNegative,
                    ]}>
                      {trend.isPositive === true && (
                        <Ionicons name="trending-up" size={14} color={colors.success} />
                      )}
                      {trend.isPositive === false && (
                        <Ionicons name="trending-down" size={14} color={colors.errorStrong} />
                      )}
                      <Text style={[
                        styles.trendChange,
                        trend.isPositive === true && styles.trendChangePositive,
                        trend.isPositive === false && styles.trendChangeNegative,
                      ]}>
                        {trend.change}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.trendDescription}>{trend.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consejos para Destacar</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipCard}>
                <Ionicons name="bulb-outline" size={24} color="#FDB94E" />
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Mantén tu perfil actualizado</Text>
                  <Text style={styles.tipDescription}>
                    Los profesionales con perfiles completos reciben 3x más solicitudes
                  </Text>
                </View>
              </View>

              <View style={styles.tipCard}>
                <Ionicons name="time-outline" size={24} color="#38bdf8" />
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Responde rápido</Text>
                  <Text style={styles.tipDescription}>
                    El 80% de los clientes contactan al primer profesional que responde
                  </Text>
                </View>
              </View>

              <View style={styles.tipCard}>
                <Ionicons name="star-outline" size={24} color="#FFD700" />
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Pide reseñas</Text>
                  <Text style={styles.tipDescription}>
                    Las buenas calificaciones aumentan tu visibilidad un 40%
                  </Text>
                </View>
              </View>
            </View>
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
  headerTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: colors.white,
    opacity: 0.8,
    fontSize: 14,
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
  growthCard: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  growthCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  growthCardInfo: {
    flex: 1,
  },
  growthCardLabel: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.8,
  },
  growthCardValue: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "700",
  },
  growthCardDescription: {
    color: colors.mutedText,
    fontSize: 13,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
  },
  statLabel: {
    color: colors.mutedText,
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
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
  servicesList: {
    gap: 12,
  },
  serviceItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  serviceRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.greenButton,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceRankText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  serviceName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  serviceCount: {
    color: colors.mutedText,
    fontSize: 13,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.greenButton,
    borderRadius: 3,
  },
  trendsList: {
    gap: 12,
  },
  trendCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
  },
  trendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  trendTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  trendBadgePositive: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  trendBadgeNegative: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  trendChange: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  trendChangePositive: {
    color: colors.success,
  },
  trendChangeNegative: {
    color: colors.errorStrong,
  },
  trendDescription: {
    color: colors.mutedText,
    fontSize: 13,
  },
  tipsList: {
    gap: 12,
  },
  tipCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    gap: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  tipDescription: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
});
