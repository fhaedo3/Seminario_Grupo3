import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme/colors';
import { BackButton } from '../components/BackButton';
import { professionalsApi, reviewsApi } from '../api';
import { useAuth } from '../context/AuthContext';

export const ProfessionalDetails = ({ route, navigation }) => {
  const { professionalId } = route.params;
  const { user, roles } = useAuth();
  const [professional, setProfessional] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myProfessionalProfile, setMyProfessionalProfile] = useState(null);

  // Estados para filtros y ordenamiento
  const [sortBy, setSortBy] = useState('CREATED_AT');
  const [order, setOrder] = useState('DESC');
  const [filterByRating, setFilterByRating] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Función para cargar reviews con filtros y ordenamiento
  const loadReviews = async (newSortBy, newOrder, newFilterByRating) => {
    setLoadingReviews(true);
    try {
      const params = {
        page: 0,
        size: 20,
        sortBy: newSortBy,
        order: newOrder
      };

      if (newFilterByRating !== null) {
        params.filterByRating = newFilterByRating;
      }

      const reviewsResponse = await reviewsApi.listByProfessional(professionalId, params);
      const reviewsContent = Array.isArray(reviewsResponse?.content) ? reviewsResponse.content : [];
      setReviews(reviewsContent);
    } catch (error) {
      console.error('Error loading reviews', error);
    } finally {
      setLoadingReviews(false);
    }
  };

    useEffect(() => {
    const loadProfessional = async () => {
      try {
        const profile = await professionalsApi.getById(professionalId);
        setProfessional(profile);

        // Cargar reviews con configuración inicial (ESTA ES AHORA LA ÚNICA LLAMADA)
        await loadReviews(sortBy, order, filterByRating);

        // Verificar si el usuario actual es profesional y obtener su perfil
        if (user && roles.includes('PROFESSIONAL')) {
          try {
            const myProfile = await professionalsApi.getByUserId(user.id);
            setMyProfessionalProfile(myProfile);
          } catch (error) {
            // No tiene perfil profesional o error al obtenerlo
            console.log('No professional profile found for current user');
          }
        }
      } catch (error) {
        console.error('Error loading professional details', error);
        Alert.alert('No se pudo cargar el perfil del profesional');
      } finally {
        setLoading(false);
      }
    };

      loadProfessional();
    }, [professionalId, user, roles, sortBy, order, filterByRating]); // <-- Agregué los filtros a la dependencia


  // Manejar cambios en ordenamiento
  const handleSortChange = (newSortBy, newOrder) => {
    setSortBy(newSortBy);
    setOrder(newOrder);
    loadReviews(newSortBy, newOrder, filterByRating);
  };

  // Manejar cambios en filtro de rating
  const handleFilterChange = (rating) => {
    setFilterByRating(rating);
    loadReviews(sortBy, order, rating);
  };

  if (loading) {
    return (
      <LinearGradient colors={[colors.primaryBlue, colors.secondaryBlue]} style={styles.centered}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.white} />
        <Text style={styles.loadingText}>Cargando profesional...</Text>
      </LinearGradient>
    );
  }

  if (!professional) {
    return (
      <LinearGradient colors={[colors.primaryBlue, colors.secondaryBlue]} style={styles.centered}>
        <StatusBar style="light" />
        <Ionicons name="alert-circle-outline" size={64} color={colors.white} />
        <Text style={styles.errorText}>Profesional no encontrado</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Volver</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primaryBlue, colors.secondaryBlue]}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Botones superiores */}
      <View style={styles.topButtons}>
        <BackButton
          navigation={navigation}
          backgroundColor="rgba(0,0,0,0.5)"
        />
      </View>

      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card del perfil */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Image
              source={professional.avatarUrl ? { uri: professional.avatarUrl } : require('../assets/images/plomero1.png')}
              style={styles.profileImage}
            />
            <View style={styles.verifiedBadge}>
              <Ionicons
                name={professional.verificationStatus?.faceVerified ? "checkmark-circle" : "alert-circle"}
                size={28}
                color={professional.verificationStatus?.faceVerified ? colors.gold : colors.error}
              />
            </View>
          </View>

          <Text style={styles.name}>{professional.displayName || professional.name}</Text>

          <View style={styles.professionBadge}>
            <Ionicons name="briefcase" size={16} color={colors.white} />
            <Text style={styles.professionText}>{professional.profession}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.statValue}>
                {professional.rating != null ? professional.rating.toFixed(2) : 'N/D'}
              </Text>
              <Text style={styles.statLabel}>Calificación</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="briefcase-outline" size={20} color={colors.white} />
              <Text style={styles.statValue}>{professional.experienceYears ?? 0}</Text>
              <Text style={styles.statLabel}>Años exp.</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={20} color={colors.white} />
              <Text style={styles.statValue}>{professional.reviewsCount ?? reviews.length}</Text>
              <Text style={styles.statLabel}>Opiniones</Text>
            </View>
          </View>
        </View>

        {/* Sección: Sobre mí */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-circle-outline" size={24} color={colors.white} />
            <Text style={styles.sectionTitle}>Sobre mí</Text>
          </View>
          <Text style={styles.sectionText}>{professional.biography || 'Sin descripción disponible.'}</Text>
        </View>

        {/* Sección: Servicios */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="construct-outline" size={24} color={colors.white} />
            <Text style={styles.sectionTitle}>Servicios que ofrezco</Text>
          </View>
          {(professional.services || []).map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.greenButton} />
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
          {(!professional.services || professional.services.length === 0) && (
            <Text style={styles.sectionText}>Sin servicios detallados.</Text>
          )}
        </View>

        {/* Sección: Contacto */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call-outline" size={24} color={colors.white} />
            <Text style={styles.sectionTitle}>Información de contacto</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call" size={18} color={colors.white} />
            <Text style={styles.contactText}>{professional.contactPhone || 'No disponible'}</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="mail" size={18} color={colors.white} />
            <Text style={styles.contactText}>{professional.contactEmail || 'No disponible'}</Text>
          </View>
        </View>

        {/* Sección: Opiniones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbox-ellipses-outline" size={24} color={colors.white} />
            <Text style={styles.sectionTitle}>Opiniones de clientes ({reviews.length})</Text>
          </View>

          {/* Controles de ordenamiento y filtrado */}
          {reviews.length > 0 && (
            <View style={styles.filtersContainer}>
              {/* Ordenamiento */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Ordenar por:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
                  <TouchableOpacity
                    style={[styles.filterChip, sortBy === 'CREATED_AT' && order === 'DESC' && styles.filterChipActive]}
                    onPress={() => handleSortChange('CREATED_AT', 'DESC')}
                  >
                    <Ionicons name="time-outline" size={14} color={colors.white} />
                    <Text style={styles.filterChipText}>Más recientes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterChip, sortBy === 'CREATED_AT' && order === 'ASC' && styles.filterChipActive]}
                    onPress={() => handleSortChange('CREATED_AT', 'ASC')}
                  >
                    <Ionicons name="time-outline" size={14} color={colors.white} />
                    <Text style={styles.filterChipText}>Más antiguas</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterChip, sortBy === 'RATING' && order === 'DESC' && styles.filterChipActive]}
                    onPress={() => handleSortChange('RATING', 'DESC')}
                  >
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.filterChipText}>Mejor calificación</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterChip, sortBy === 'RATING' && order === 'ASC' && styles.filterChipActive]}
                    onPress={() => handleSortChange('RATING', 'ASC')}
                  >
                    <Ionicons name="star-outline" size={14} color="#FFD700" />
                    <Text style={styles.filterChipText}>Menor calificación</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Filtro por rating */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Filtrar por estrellas:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
                  <TouchableOpacity
                    style={[styles.filterChip, filterByRating === null && styles.filterChipActive]}
                    onPress={() => handleFilterChange(null)}
                  >
                    <Text style={styles.filterChipText}>Todas</Text>
                  </TouchableOpacity>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      style={[styles.filterChip, filterByRating === rating && styles.filterChipActive]}
                      onPress={() => handleFilterChange(rating)}
                    >
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.filterChipText}>{rating}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}

          {/* Indicador de carga */}
          {loadingReviews && (
            <View style={styles.loadingReviews}>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.loadingReviewsText}>Actualizando...</Text>
            </View>
          )}

          {reviews.length === 0 ? (
            <Text style={styles.sectionText}>
              {filterByRating !== null
                ? `No hay opiniones con ${filterByRating} estrellas.`
                : 'Aún no hay opiniones para este profesional.'}
            </Text>
          ) : (
            reviews.map((opinion) => (
                <View key={opinion.id} style={styles.opinionCard}>
                    <View style={styles.opinionHeader}>
                        <View style={styles.opinionAvatar}>
                            <Ionicons name="person" size={20} color={colors.white} />
                        </View>
                        <View style={styles.opinionInfo}>
                            <Text style={styles.opinionUser}>{opinion.userDisplayName || opinion.userId}</Text>
                            <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Ionicons
                                        key={star}
                                        name={star <= opinion.rating ? "star" : "star-outline"}
                                        size={14}
                                        color="#FFD700"
                                    />
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* --- Lógica de parseo de Tags --- */}
                    {(() => {
                        const tagRegex = /^\[Tags: (.*?)\]\s*(.*)$/;
                        const match = opinion.comment ? opinion.comment.match(tagRegex) : null;

                        let commentText = opinion.comment;
                        let tags = [];

                        if (match) {
                            tags = match[1] ? match[1].split(', ') : [];
                            commentText = match[2] || ''; // El resto es el comentario
                        }

                        return (
                            <>
                                {/* Muestra solo el texto del comentario */}
                                {commentText ? <Text style={styles.opinionText}>{commentText}</Text> : null}

                                {/* Muestra los tags en el footer */}
                                {tags.length > 0 && (
                                    <View style={styles.tagsFooter}>
                                        {tags.map((tag, index) => (
                                            <View key={index} style={styles.tagChip}>
                                                <Text style={styles.tagChipText}>{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </>
                        );
                    })()}
                    {/* --- Fin de la lógica --- */}

                </View>
            ))
          )}
        </View>

        {/* Espaciado inferior */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Botones de acción fijos */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.hireButtonFullWidth}
          onPress={() => navigation.navigate('HireForm', { professional })}
        >
          <Ionicons name="checkmark-circle" size={22} color={colors.white} />
          <Text style={styles.hireButtonText}>Contratar ahora</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: colors.white,
    marginTop: 12,
  },
  errorText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  errorButton: {
    marginTop: 24,
    backgroundColor: colors.greenButton,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  errorButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  topButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  scroll: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 100 : 90,
  },
  scrollContent: {
    paddingBottom: 180,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 2,
  },
  name: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  professionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.greenButton,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  professionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    color: colors.white,
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionText: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  serviceText: {
    color: colors.white,
    fontSize: 15,
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contactText: {
    color: colors.white,
    fontSize: 15,
    flex: 1,
  },
  opinionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  opinionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  opinionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  opinionInfo: {
    flex: 1,
  },
  opinionUser: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  opinionText: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
    opacity: 1,
  },
  replyContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  replyLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
  replyText: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
    marginBottom: 6,
  },
  replyDate: {
    color: colors.white,
    fontSize: 11,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.4)',
  },
  replyButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  filtersContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.9,
  },
  filterScrollView: {
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterChipActive: {
    backgroundColor: colors.greenButton,
    borderColor: colors.greenButton,
  },
  filterChipText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  loadingReviews: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  loadingReviewsText: {
    color: colors.white,
    fontSize: 13,
    opacity: 0.8,
  },
  bottomSpace: {
    height: 80,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    backgroundColor: colors.primaryBlue,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  hireButtonFullWidth: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    backgroundColor: colors.greenButton,
    borderRadius: 28,
    shadowColor: colors.greenButton,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  hireButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  tagsFooter: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'flex-end', // <-- Esto los alinea a la derecha
  },
  tagChip: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
  },
  tagChipText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: '500',
  },
});
