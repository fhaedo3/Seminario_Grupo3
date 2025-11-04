import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { serviceOrdersApi, professionalsApi } from '../api';

const statusStyles = {
  PENDING: { label: 'Pendiente', color: '#FCD34D', icon: 'time-outline' },
  PROPOSAL_SENT: { label: 'Presupuesto enviado', color: '#60A5FA', icon: 'document-text-outline' },
  SCHEDULED: { label: 'Agendado', color: '#38bdf8', icon: 'calendar-outline' },
  IN_PROGRESS: { label: 'En curso', color: '#facc15', icon: 'construct-outline' },
  COMPLETED: { label: 'Finalizado', color: colors.greenButton, icon: 'checkmark-done-outline' },
  CANCELLED: { label: 'Cancelado', color: colors.error, icon: 'close-circle-outline' },
};

export const MyJobsScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [serviceOrders, setServiceOrders] = useState([]);
  const [professionalsMap, setProfessionalsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formattedJobs = useMemo(() => {
    return serviceOrders.map((order) => {
      const professional = professionalsMap[order.professionalId];
      return {
        ...order,
        professional,
      };
    });
  }, [professionalsMap, serviceOrders]);

  const formatSchedule = (dateString) => {
    if (!dateString) {
      return 'A coordinar';
    }
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'A coordinar';
    }
    const dateText = date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
    const timeText = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    return `${dateText} · ${timeText}`;
  };

  const loadJobs = useCallback(async () => {
    if (!token) {
      setServiceOrders([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await serviceOrdersApi.listMine(token, { page: 0, size: 20 });
      const orders = Array.isArray(response?.content) ? response.content : [];
      setServiceOrders(orders);

      const professionalIds = Array.from(new Set(orders.map((order) => order.professionalId).filter(Boolean)));
      const entries = await Promise.all(
        professionalIds.map(async (id) => {
          try {
            const profile = await professionalsApi.getById(id);
            return [id, profile];
          } catch (error) {
            console.warn('No se pudo cargar el profesional', id, error);
            return [id, null];
          }
        })
      );
      setProfessionalsMap(Object.fromEntries(entries));
    } catch (err) {
      console.error('Error fetching jobs', err);
      setError(err?.message ?? 'No se pudieron cargar tus trabajos.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [loadJobs])
  );

  const handleOpenChat = (job) => {
    navigation.navigate('Chat', {
      professional: {
        id: job.professional?.id,
        name: job.professional?.displayName || job.professional?.name,
        profession: job.professional?.profession,
        avatar: null,
      },
      jobSummary: job.serviceType,
      serviceOrderId: job.id,
    });
  };

  const handleOpenReviewScreen = (job) => {
    navigation.navigate('ReviewProfessional', job)
  }

  return (
    <LinearGradient colors={[colors.primaryBlue, colors.secondaryBlue]} style={styles.background}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis trabajos</Text>
          <Text style={styles.headerSubtitle}>Seguimiento rápido de tus servicios activos</Text>
        </View>

        <ScrollView
          style={[styles.list, styles.scroll]}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.white} />
              <Text style={styles.loadingText}>Cargando tus trabajos...</Text>
            </View>
          ) : formattedJobs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={40} color={colors.white} />
              <Text style={styles.emptyTitle}>Todavía no tenés trabajos</Text>
              <Text style={styles.emptySubtitle}>Contratá un profesional para ver tus solicitudes aquí.</Text>
            </View>
          ) : (
            formattedJobs.map((job) => {
              const status = statusStyles[job.status] ?? statusStyles.PENDING;
              return (
                <View key={job.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Image
                      source={job.professional?.avatarUrl ? { uri: job.professional.avatarUrl } : require('../assets/images/plomero1.png')}
                      style={styles.avatar}
                    />
                    <View style={styles.cardTitleArea}>
                      <Text style={styles.professionalName}>{job.professional?.displayName || job.professional?.name || 'Profesional'}</Text>
                      <Text style={styles.professionalProfession}>{job.professional?.profession || 'Servicio'}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: status.color }]}>
                      <Ionicons name={status.icon} size={14} color={colors.white} style={styles.statusIcon} />
                      <Text style={styles.statusText}>{status.label}</Text>
                    </View>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.issueLabel}>Trabajo</Text>
                    <Text style={styles.issueText}>{job.serviceType}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={16} color={colors.white} />
                        <Text style={styles.metaText}>{formatSchedule(job.scheduledAt)}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.white} />
                        <Text style={styles.metaText}>Último mensaje</Text>
                      </View>
                    </View>
                    <Text style={styles.lastMessage}>{job.lastMessagePreview || 'Sin mensajes aún.'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleOpenChat(job)}>
                  <View style={styles.cardFooter}>
                      <Text style={styles.cardFooterText}>Tocar para abrir el chat</Text>
                      <Ionicons name="arrow-forward-circle" size={24} color={colors.white} />
                    </View>
                  </TouchableOpacity>
                  { 
                (job.status.toLowerCase() === 'finalizado') &&
                <TouchableOpacity onPress={() => handleOpenReviewScreen(job)}>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardFooterText}>Tocar para calificar</Text>
                    <Ionicons name="arrow-forward-circle" size={24} color={colors.white} />
                  </View>
                </TouchableOpacity>
                }
              </View>
            );
            })
          )}
          {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
        </ScrollView>

        <BottomNav navigation={navigation} jobsRoute="MyJobs" />
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
    paddingBottom: 110,
  },
  scroll: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.mutedText,
    fontSize: 14,
  },
  list: {
    flex: 1,
    marginTop: 6,
  },
  listContent: {
    paddingBottom: 200,
    paddingHorizontal: 20,
    gap: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 14,
  },
  cardTitleArea: {
    flex: 1,
  },
  professionalName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  professionalProfession: {
    color: colors.mutedText,
    fontSize: 13,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  statusIcon: {
    marginTop: 1,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 14,
  },
  issueLabel: {
    color: colors.mutedText,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  issueText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: colors.white,
    fontSize: 12,
  },
  lastMessage: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardFooterText: {
    color: colors.mutedText,
    fontSize: 13,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  loadingText: {
    color: colors.white,
    opacity: 0.8,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 60,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: colors.mutedText,
    fontSize: 14,
    textAlign: 'center',
  },
  errorMessage: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 16,
  },
});
