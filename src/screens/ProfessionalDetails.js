import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme/colors';
import { BackButton } from '../components/BackButton';
import { professionalsApi, reviewsApi } from '../api';

export const ProfessionalDetails = ({ route, navigation }) => {
  const { professionalId } = route.params;
  const [professional, setProfessional] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadProfessional = async () => {
      try {
        const profile = await professionalsApi.getById(professionalId);
        setProfessional(profile);
        const reviewsResponse = await reviewsApi.listByProfessional(professionalId, { page: 0, size: 20 });
        const reviewsContent = Array.isArray(reviewsResponse?.content) ? reviewsResponse.content : [];
        setReviews(reviewsContent);
      } catch (error) {
        console.error('Error loading professional details', error);
        Alert.alert('No se pudo cargar el perfil del profesional');
      } finally {
        setLoading(false);
      }
    };

    loadProfessional();
  }, [professionalId]);

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
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#ff4757" : colors.white} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card del perfil */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Image source={require('../assets/images/plomero1.png')} style={styles.profileImage} />
            <View style={styles.verifiedBadge}>
              <Ionicons
                name={professional.verificationStatus?.faceVerified ? "checkmark-circle" : "alert-circle"}
                size={28}
                color={professional.verificationStatus?.faceVerified ? colors.greenButton : colors.error}
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
              <Text style={styles.statValue}>{professional.rating ?? 'N/D'}</Text>
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
            <Text style={styles.sectionTitle}>Opiniones de clientes</Text>
          </View>
          {reviews.length === 0 ? (
            <Text style={styles.sectionText}>Aún no hay opiniones para este profesional.</Text>
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
                <Text style={styles.opinionText}>{opinion.comment}</Text>
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
          style={styles.chatButton}
          onPress={() =>
            navigation.navigate('Chat', {
              professional: {
                id: professional.id,
                name: professional.displayName || professional.name,
                profession: professional.profession,
                avatar: null,
              },
              jobSummary: `Consulta sobre ${professional.profession?.toLowerCase?.() || 'el servicio'}`,
              serviceOrderId: null,
            })
          }
        >
          <Ionicons name="chatbubble-ellipses" size={22} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.hireButton}
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
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 100 : 90,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    opacity: 0.9,
  },
  bottomSpace: {
    height: 20,
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
  chatButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  hireButton: {
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
});
