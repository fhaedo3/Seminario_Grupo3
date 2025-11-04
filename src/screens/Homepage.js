import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { BottomNav } from '../components/BottomNav';
import { professionalsApi } from '../api';
import { useAuth } from '../context/AuthContext';

// Mapeo de profesiones a iconos
const professionIcons = {
  'Plomero': { family: MaterialIcons, name: 'plumbing', size: 14 },
  'Electricista': { family: MaterialIcons, name: 'electrical-services', size: 14 },
  'Pintor': { family: FontAwesome5, name: 'paint-brush', size: 12 },
  'Pintora': { family: FontAwesome5, name: 'paint-brush', size: 12 },
  'Carpintero': { family: MaterialIcons, name: 'carpenter', size: 14 },
  'Gasista': { family: Ionicons, name: 'flame', size: 14 },
};

export const Homepage = ({ navigation, route }) => {
  const { user } = useAuth();
  const [featuredProfessionals, setFeaturedProfessionals] = useState([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);

  // Función para obtener el icono de la profesión
  const getProfessionIcon = (profession) => {
    return professionIcons[profession] || null;
  };

  const userName = useMemo(() => {
    if (user?.fullName) {
      return user.fullName.split(' ')[0];
    }
    if (user?.username) {
      return user.username;
    }
    return route?.params?.userName ?? 'Usuario';
  }, [user, route?.params?.userName]);

  useEffect(() => {
    const loadProfessionals = async () => {
      setLoadingProfessionals(true);
      try {
        const response = await professionalsApi.search({ page: 0, size: 5 });
        const content = Array.isArray(response?.content) ? response.content : [];
        setFeaturedProfessionals(content);
      } catch (error) {
        console.error('Error fetching professionals', error);
        Alert.alert('No se pudieron cargar los profesionales destacados');
      } finally {
        setLoadingProfessionals(false);
      }
    };

    loadProfessionals();
  }, []);

  const quickActions = [
    {
      id: 'search',
      icon: 'search',
      label: 'Buscar profesionales',
  description: 'Filtra por oficio y encontra tu especialista',
      action: () => navigation.navigate('SearchProfessionals'),
      color: colors.greenButton,
    },
    {
      id: 'jobs',
      icon: 'briefcase',
      label: 'Mis trabajos',
      description: 'Seguimiento del estado y conversaciones',
      action: () => navigation.navigate('MyJobs'),
      color: '#38bdf8',
    },
    {
      id: 'profile',
      icon: 'person',
  label: 'Mi perfil',
  description: 'Actualiza tu informacion y preferencias',
      action: () => navigation.navigate('ProfileUser'),
      color: '#a78bfa',
    },
  ];

  const tips = [
    {
      id: 'tip-1',
      icon: 'shield-checkmark-outline',
      title: 'Profesionales verificados',
  description: 'Revisa las insignias y resenas en cada perfil antes de contratar.',
    },
    {
      id: 'tip-2',
      icon: 'chatbubble-ellipses-outline',
      title: 'Canal directo',
  description: 'Usa el chat integrado para coordinar visitas y presupuestos.',
    },
  ];

  return (
    <LinearGradient colors={[colors.primaryBlue, colors.secondaryBlue]} style={styles.background}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headline}>Encuentra profesionales de confianza</Text>
          <Text style={styles.subheadline}>
            Gestiona tus pedidos, segui tus trabajos y mantene todo en un solo lugar.
          </Text>
          <TouchableOpacity style={styles.primaryCta} onPress={() => navigation.navigate('SearchProfessionals')}>
            <Ionicons name="sparkles" size={20} color={colors.white} />
            <Text style={styles.primaryCtaText}>Buscar especialistas disponibles</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accesos directos</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((item) => (
                <TouchableOpacity key={item.id} style={styles.quickActionCard} onPress={item.action}>
                  <View style={styles.quickActionContent}>
                    <View style={styles.quickActionTextSection}>
                      <Text style={styles.quickActionLabel}>{item.label}</Text>
                      <Text style={styles.quickActionDescription}>{item.description}</Text>
                    </View>
                    <View style={[styles.quickActionIcon, { backgroundColor: item.color }]}>
                      <Ionicons name={item.icon} size={24} color={colors.white} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profesionales destacados</Text>
            <View style={styles.featuredList}>
              {loadingProfessionals ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={colors.white} />
                  <Text style={styles.loadingText}>Buscando profesionales...</Text>
                </View>
              ) : (
                featuredProfessionals.map((prof) => (
                  <View key={prof.id} style={styles.featuredCard}>
                    {/* Header con nombre y badge de profesión */}
                    <View style={styles.featuredCardHeader}>
                      <View style={styles.featuredNameContainer}>
                        <Text style={styles.featuredName}>{prof.displayName || prof.name}</Text>
                        <View style={styles.featuredVerifiedBadge}>
                          <Ionicons name="checkmark-circle" size={16} color={colors.gold} />
                          <Text style={styles.featuredVerifiedText}>Verificado</Text>
                        </View>
                      </View>
                      <View style={styles.featuredProfessionBadge}>
                        {getProfessionIcon(prof.profession) && (() => {
                          const iconConfig = getProfessionIcon(prof.profession);
                          const IconComponent = iconConfig.family;
                          return (
                            <IconComponent
                              name={iconConfig.name}
                              size={iconConfig.size}
                              color={colors.white}
                            />
                          );
                        })()}
                        <Text style={styles.featuredProfessionText}>{prof.profession}</Text>
                      </View>
                    </View>

                    {/* Imagen del profesional centrada */}
                    <View style={styles.featuredImageContainer}>
                      <Image
                        source={prof.avatarUrl ? { uri: prof.avatarUrl } : require('../assets/images/plomero1.png')}
                        style={styles.featuredProfileImage}
                      />
                      <View style={styles.featuredExperienceBadge}>
                        <Text style={styles.featuredExperienceText}>{prof.experienceYears ?? 0} años</Text>
                      </View>
                    </View>
                    
                    {/* Descripción */}
                    <Text style={styles.featuredDescription}>
                      {prof.summary || 'Consultá para conocer más sobre este profesional.'}
                    </Text>

                    {/* Stats Row mejorado */}
                    <View style={styles.featuredStatsContainer}>
                      <View style={styles.featuredStatItem}>
                        <View style={styles.featuredStatIconContainer}>
                          <Ionicons name="star" size={16} color="#FFD700" />
                        </View>
                        <View style={styles.featuredStatTextContainer}>
                          <Text style={styles.featuredStatValue}>
                            {prof.rating != null ? prof.rating.toFixed(2) : 'N/D'}
                          </Text>
                          <Text style={styles.featuredStatLabel}>Rating</Text>
                        </View>
                      </View>
                      
                      <View style={styles.featuredStatItem}>
                        <View style={styles.featuredStatIconContainer}>
                          <Ionicons name="people-outline" size={16} color={colors.white} />
                        </View>
                        <View style={styles.featuredStatTextContainer}>
                          <Text style={styles.featuredStatValue}>{prof.reviewsCount ?? 0}</Text>
                          <Text style={styles.featuredStatLabel}>Opiniones</Text>
                        </View>
                      </View>
                    </View>

                    {/* View Profile Button */}
                    <TouchableOpacity
                      style={styles.viewProfileButton}
                      onPress={() => navigation.navigate('ProfessionalDetails', {
                        professionalId: prof.id,
                      })}
                    >
                      <Ionicons name="person-circle-outline" size={18} color={colors.white} />
                      <Text style={styles.viewProfileButtonText}>Ver perfil</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips para aprovechar la app</Text>
            <View style={styles.tipsList}>
              {tips.map((tip) => (
                <View key={tip.id} style={styles.tipCard}>
                  <Ionicons name={tip.icon} size={24} color={colors.white} style={styles.tipIcon} />
                  <View style={styles.tipBody}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipDescription}>{tip.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <BottomNav
          navigation={navigation}
          homeRoute="Homepage"
          searchRoute="SearchProfessionals"
          jobsRoute="MyJobs"
          profileRoute="ProfileUser"
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 80 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20, flexGrow: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 12 },
  headline: { color: colors.white, fontSize: 26, fontWeight: '700', marginBottom: 8 },
  subheadline: { color: colors.white, opacity: 0.8, lineHeight: 20 },
  primaryCta: {
    marginTop: 16,
    backgroundColor: colors.greenButton,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryCtaText: { color: colors.white, fontSize: 16, fontWeight: '600', flex: 1 },
  section: { marginBottom: 20, paddingHorizontal: 20 },
  sectionTitle: { color: colors.white, fontSize: 18, fontWeight: '600', marginBottom: 12 },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickActionCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickActionTextSection: {
    flex: 1,
    paddingRight: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionLabel: { 
    color: colors.white, 
    fontSize: 16, 
    fontWeight: '700',
    marginBottom: 6,
  },
  quickActionDescription: { 
    color: colors.white, 
    opacity: 0.8, 
    lineHeight: 20,
    fontSize: 14,
  },
  featuredList: { gap: 12 },
  featuredCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 16,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: colors.white,
    opacity: 0.8,
  },
  // Nuevos estilos para las tarjetas rediseñadas
  featuredCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featuredNameContainer: {
    flex: 1,
  },
  featuredName: { 
    color: colors.white, 
    fontSize: 18, 
    fontWeight: '700',
    marginBottom: 6,
  },
  featuredVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredVerifiedText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '600',
  },
  featuredProfessionBadge: {
    backgroundColor: colors.primaryBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  featuredProfessionText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  featuredImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  featuredProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.white,
  },
  featuredExperienceBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: colors.greenButton,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.white,
  },
  featuredExperienceText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  featuredDescription: { 
    color: colors.white, 
    opacity: 0.9, 
    lineHeight: 20, 
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  featuredStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    marginBottom: 16,
  },
  featuredStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredStatIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredStatTextContainer: {
    alignItems: 'flex-start',
  },
  featuredStatValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  featuredStatLabel: {
    color: colors.white,
    opacity: 0.7,
    fontSize: 11,
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  viewProfileButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  tipsList: { gap: 10 },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15,23,42,0.35)',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  tipIcon: { marginTop: 2 },
  tipBody: { flex: 1 },
  tipTitle: { color: colors.white, fontSize: 15, fontWeight: '600' },
  tipDescription: { color: colors.white, opacity: 0.75, marginTop: 3, lineHeight: 18 },
});