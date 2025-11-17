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
import { Modal, TextInput, Alert } from 'react-native';


const statusStyles = {
  PENDING: { label: 'Pendiente', color: '#FCD34D', icon: 'time-outline' },
  PROPOSAL_SENT: { label: 'Presupuesto enviado', color: '#60A5FA', icon: 'document-text-outline' },
  SCHEDULED: { label: 'Agendado', color: '#38bdf8', icon: 'calendar-outline' },
  IN_PROGRESS: { label: 'En curso', color: '#facc15', icon: 'construct-outline' },
  COMPLETED: { label: 'Finalizado', color: colors.greenButton, icon: 'checkmark-done-outline' },
  CANCELLED: { label: 'Cancelado', color: colors.error, icon: 'close-circle-outline' },
  AWAITING_RATING: { label: 'Esperando calificación', color: '#9333ea', icon: 'star-half-outline' },
};

export const MyJobsScreen = ({ navigation }) => {
  const { token, roles, user } = useAuth();
  const [serviceOrders, setServiceOrders] = useState([]);
  const [professionalsMap, setProfessionalsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);


  const [cancelReason, setCancelReason] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const isProfessional = useMemo(() => {
    return Array.isArray(roles) && roles.includes('PROFESSIONAL');
  }, [roles]);

  const formattedJobs = useMemo(() => {
    return serviceOrders.map((order) => {
      const professional = professionalsMap[order.professionalId];
      return {
        ...order,
        professional,
      };
    });
    // El ordenamiento ya viene del backend (createdAt desc)
  }, [professionalsMap, serviceOrders]);

  // Determinar el estado visual del trabajo según las calificaciones
  const getJobDisplayStatus = (job) => {
    // Si el trabajo tiene el status COMPLETED final, mostrarlo como completado
    if (job.status === 'COMPLETED') {
      return 'COMPLETED';
    }

    // Si tiene calificaciones parciales pero no está COMPLETED, mostrar "Esperando calificación"
    if (job.completedByClient || job.completedByProfessional) {
      return 'AWAITING_RATING';
    }

    // En cualquier otro caso, mostrar el status original
    return job.status;
  };

  const formatSchedule = (job) => {
    // Si hay fecha programada (scheduledAt), usarla
    if (job.scheduledAt) {
      const date = new Date(job.scheduledAt);
      if (!Number.isNaN(date.getTime())) {
        const dateText = date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
        const timeText = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        return `${dateText} · ${timeText}`;
      }
    }
    
    // Si no hay fecha programada pero sí fecha preferida, mostrarla
    if (job.preferredDate) {
      const date = new Date(job.preferredDate);
      if (!Number.isNaN(date.getTime())) {
        const dateText = date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
        return `${dateText} (preferida)`;
      }
    }
    
    return 'A coordinar';
  };

  const loadJobs = useCallback(async () => {
    if (!token) {
      setServiceOrders([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      let response;

      if (isProfessional) {
        // Si es profesional, necesitamos primero obtener su perfil profesional
        try {
          const myProfessionalProfile = await professionalsApi.getByUserId(user.id, token);
          if (myProfessionalProfile?.id) {
            // Cargar trabajos donde este profesional fue contratado
            response = await serviceOrdersApi.listForProfessional(token, myProfessionalProfile.id, { page: 0, size: 20 });
          } else {
            throw new Error('No se encontró tu perfil profesional');
          }
        } catch (error) {
          console.error('Error loading professional profile:', error);
          setError('No se pudo cargar tu perfil profesional');
          setLoading(false);
          return;
        }
      } else {
        // Si es cliente, cargar trabajos que él creó
        response = await serviceOrdersApi.listMine(token, { page: 0, size: 20 });
      }

      const orders = Array.isArray(response?.content) ? response.content : [];
      setServiceOrders(orders);

      // Cargar información de los profesionales
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
  }, [token, isProfessional, user]);

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [loadJobs])
  );

  const handleOpenChat = (job) => {
    const chatParams = {
      jobSummary: job.serviceType,
      serviceOrderId: job.id,
      jobStatus: job.status,
    };

    if (isProfessional) {
      // Si soy profesional, paso los datos del cliente
      chatParams.clientData = {
        name: job.contactName || 'Cliente',
        username: job.userId || 'Cliente',
        address: job.address || '',
        avatarUrl: null, // No tenemos avatar del cliente por ahora
      };
      chatParams.professional = {}; // Datos vacíos ya que no se usarán
    } else {
      // Si soy cliente, paso los datos del profesional
      chatParams.professional = {
        id: job.professional?.id,
        name: job.professional?.displayName || job.professional?.name,
        profession: job.professional?.profession,
        avatarUrl: job.professional?.avatarUrl,
      };
    }

    navigation.navigate('Chat', chatParams);
  };

  return (
    <LinearGradient colors={[colors.primaryBlue, colors.secondaryBlue]} style={styles.background}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isProfessional ? 'Mis trabajos asignados' : 'Mis trabajos'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isProfessional
              ? 'Servicios donde fuiste contratado'
              : 'Seguimiento rápido de tus servicios activos'}
          </Text>
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
              <Text style={styles.emptySubtitle}>
                {isProfessional
                  ? 'Cuando te contraten, verás tus trabajos aquí.'
                  : 'Contratá un profesional para ver tus solicitudes aquí.'}
              </Text>
            </View>
          ) : (
            formattedJobs.map((job) => {
              const displayStatus = getJobDisplayStatus(job);
              const status = statusStyles[displayStatus] ?? statusStyles.PENDING;
              return (
                <View key={job.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Image
                      source={
                        isProfessional
                          ? require('../assets/images/plomero1.png') // Icono genérico para cliente
                          : (job.professional?.avatarUrl ? { uri: job.professional.avatarUrl } : require('../assets/images/plomero1.png'))
                      }
                      style={styles.avatar}
                    />
                    <View style={styles.cardTitleArea}>
                      <Text style={styles.professionalName}>
                        {isProfessional
                          ? (job.contactName || 'Cliente')
                          : (job.professional?.displayName || job.professional?.name || 'Profesional')}
                      </Text>
                      <Text style={styles.professionalProfession}>
                        {isProfessional
                          ? job.address || 'Dirección no especificada'
                          : (job.professional?.profession || 'Servicio')}
                      </Text>
                    </View>
                    <TouchableOpacity
                      disabled={!isProfessional || displayStatus !== "PENDING"}
                      onPress={() => {
                        if (displayStatus !== "PENDING") return; // seguridad extra
                        setSelectedJob(job);
                        setActionModalVisible(true);
                      }}
                    >

                      <View style={[styles.statusPillBig, { backgroundColor: status.color }]}>
                        <Ionicons name={status.icon} size={18} color={colors.white} />
                        <Text style={styles.statusTextBig}>{status.label}</Text>
                      </View>
                    </TouchableOpacity>

                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.issueLabel}>Trabajo</Text>
                    <Text style={styles.issueText}>{job.serviceType}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={16} color={colors.white} />
                        <Text style={styles.metaText}>{formatSchedule(job)}</Text>
                      </View>
                    </View>
                  </View>
                  {/* Indicador de calificaciones mutuas */}
                  {(job.completedByClient || job.completedByProfessional) && job.status !== 'COMPLETED' && (
                    <View style={styles.ratingStatusContainer}>
                      <View style={styles.ratingStatusRow}>
                        <View style={styles.ratingStatusItem}>
                          <Ionicons
                            name={job.completedByClient ? "checkmark-circle" : "ellipse-outline"}
                            size={16}
                            color={job.completedByClient ? colors.greenButton : colors.mutedText}
                          />
                          <Text style={styles.ratingStatusText}>
                            Cliente {job.completedByClient ? 'calificó' : 'pendiente'}
                          </Text>
                        </View>
                        <View style={styles.ratingStatusItem}>
                          <Ionicons
                            name={job.completedByProfessional ? "checkmark-circle" : "ellipse-outline"}
                            size={16}
                            color={job.completedByProfessional ? colors.greenButton : colors.mutedText}
                          />
                          <Text style={styles.ratingStatusText}>
                            Profesional {job.completedByProfessional ? 'calificó' : 'pendiente'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  <TouchableOpacity onPress={() => handleOpenChat(job)}>
                  <View style={styles.cardFooter}>
                      <Text style={styles.cardFooterText}>Tocar para abrir el chat</Text>
                      <Ionicons name="arrow-forward-circle" size={24} color={colors.white} />
                    </View>
                  </TouchableOpacity>

                  {/* Botón para calificar si aún no lo hice */}
                  {displayStatus === 'AWAITING_RATING' && (
                    (isProfessional && !job.completedByProfessional) || (!isProfessional && !job.completedByClient)
                  ) && (
                    <TouchableOpacity onPress={() => handleOpenChat(job)}>
                      <View style={[styles.cardFooter, styles.cardFooterHighlight]}>
                        <Text style={styles.cardFooterTextHighlight}>¡Calificá para completar!</Text>
                        <Ionicons name="star" size={24} color="#FFD700" />
                      </View>
                    </TouchableOpacity>
                  )}
              </View>
            );
            })
          )}
          {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
        </ScrollView>
        <Modal
          visible={actionModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setActionModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>

              <Text style={styles.modalTitle}>Acciones del trabajo</Text>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setConfirmModalVisible(true);
                  setActionModalVisible(false);
                }}
              >
                <Ionicons name="calendar-outline" size={20} color="#38bdf8" />
                <Text style={styles.actionButtonText}>Confirmar trabajo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setCompleteModalVisible(true);
                  setActionModalVisible(false);
                }}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.greenButton} />
                <Text style={styles.actionButtonText}>Completar trabajo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setActionModalVisible(false);
                  setConfirmModalVisible(false);
                  setCancelModalVisible(true);
                }}
              >
                <Ionicons name="close-circle-outline" size={20} color={colors.error} />
                <Text style={[styles.actionButtonText, { color: colors.error }]}>Cancelar trabajo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setActionModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>
        <Modal
          visible={confirmModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setConfirmModalVisible(false)}
        >
          <View style={styles.popupOverlay}>
            <View style={styles.popupContainer}>
              <Text style={styles.popupTitle}>Confirmar trabajo</Text>
              <Text style={styles.popupSubtitle}>Enviá un mensaje opcional al cliente:</Text>

              <TextInput
                placeholder="Ej: Estaré llegando a la hora acordada"
                placeholderTextColor={colors.mutedText}
                value={confirmMessage}
                onChangeText={setConfirmMessage}
                style={styles.popupInput}
              />

              <View style={styles.popupButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setConfirmModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Volver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={async () => {
                    setLoadingAction(true);
                    try {
                      await serviceOrdersApi.confirmJob(selectedJob.id, token, confirmMessage);
                      await loadJobs();
                      setConfirmModalVisible(false);
                    } finally { setLoadingAction(false); }
                  }}
                >
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>
        <Modal
          visible={completeModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setCompleteModalVisible(false)}
        >
          <View style={styles.popupOverlay}>
            <View style={styles.popupContainer}>
              <Text style={styles.popupTitle}>Completar trabajo</Text>
              <Text style={styles.popupSubtitle}>Calificá al cliente</Text>

              <View style={styles.ratingRow}>
                {[1,2,3,4,5].map(star => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Ionicons
                      name={rating >= star ? "star" : "star-outline"}
                      size={36}
                      color="#FFD700"
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                placeholder="Comentario (opcional)"
                placeholderTextColor={colors.mutedText}
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                style={styles.popupInput}
              />

              <View style={styles.popupButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setCompleteModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={async () => {
                    if (rating === 0) return Alert.alert("Seleccioná una calificación");
                    setLoadingAction(true);
                    try {
                      await serviceOrdersApi.complete(selectedJob.id, token, rating, reviewComment);
                      await loadJobs();
                      setCompleteModalVisible(false);
                    } finally { setLoadingAction(false); }
                  }}
                >
                  <Text style={styles.confirmButtonText}>Enviar</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>
        <Modal
          visible={cancelModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setCancelModalVisible(false)}
        >
          <View style={styles.popupOverlay}>
            <View style={styles.popupContainer}>

              <Text style={styles.popupTitle}>Cancelar trabajo</Text>
              <Text style={styles.popupSubtitle}>Motivo de cancelación</Text>

              <TextInput
                placeholder="Escribí el motivo..."
                placeholderTextColor={colors.mutedText}
                value={cancelReason}
                onChangeText={setCancelReason}
                multiline
                style={styles.popupInput}
              />

              <View style={styles.popupButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setCancelModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Volver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: colors.error }]}
                  onPress={async () => {
                    if (!cancelReason.trim()) return Alert.alert("Ingresá un motivo");
                    setLoadingAction(true);
                    try {
                      await serviceOrdersApi.cancel(selectedJob.id, token, cancelReason);
                      await loadJobs();
                      setCancelModalVisible(false);
                    } finally { setLoadingAction(false); }
                  }}
                >
                  <Text style={styles.confirmButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>

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
  ratingStatusContainer: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  ratingStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  ratingStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingStatusText: {
    color: colors.white,
    fontSize: 12,
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
  cardFooterHighlight: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderTopWidth: 1,
  },
  cardFooterTextHighlight: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
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
  statusPillBig: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  statusTextBig: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.primaryBlue,
    width: '90%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
  },

  popupOverlay: {
    flex:1,
    backgroundColor:'rgba(0,0,0,0.7)',
    justifyContent:'center',
    padding:20,
  },
  popupContainer:{
    backgroundColor:colors.primaryBlue,
    borderRadius:16,
    padding:20,
  },
  popupTitle:{
    color:colors.white,
    fontSize:20,
    fontWeight:'700',
    marginBottom:10,
  },
  popupSubtitle:{
    color:colors.mutedText,
    fontSize:14,
    marginBottom:14,
  },
  popupInput:{
    backgroundColor:'rgba(255,255,255,0.1)',
    borderRadius:10,
    padding:12,
    color:colors.white,
    minHeight:90,
    marginBottom:20,
  },
  popupButtons:{
    flexDirection:'row',
    justifyContent:'space-between',
    gap:12,
  },
  cancelButton:{
    flex:1,
    borderWidth:1,
    borderColor:'rgba(255,255,255,0.4)',
    borderRadius:12,
    padding:12,
    alignItems:'center',
  },
  cancelButtonText:{
    color:colors.white,
    fontWeight:'600',
  },
  confirmButton:{
    flex:1,
    backgroundColor:colors.greenButton,
    borderRadius:12,
    padding:12,
    alignItems:'center',
  },
  confirmButtonText:{
    color:colors.white,
    fontWeight:'700',
  },
  ratingRow:{
    flexDirection:'row',
    justifyContent:'center',
    gap:8,
    marginBottom:20,
  },

});
