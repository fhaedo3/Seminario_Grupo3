import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { BottomNav } from '../components/BottomNav';
import { professionals } from '../assets/data/plomerosdata';

export const Homepage = ({ navigation, route }) => {
  const userName = route?.params?.userName ?? 'Usuario';
  const featuredProfessionals = professionals;

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
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>Hola, {userName}!</Text>
            <Text style={styles.headline}>Encontra profesionales de confianza en minutos</Text>
            <Text style={styles.subheadline}>
              Gestiona tus pedidos, segui tus trabajos y mantene todo en un solo lugar.
            </Text>
            <TouchableOpacity style={styles.primaryCta} onPress={() => navigation.navigate('SearchProfessionals')}>
              <Ionicons name="sparkles" size={20} color={colors.white} />
              <Text style={styles.primaryCtaText}>Buscar especialistas disponibles</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accesos directos</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((item) => (
                <TouchableOpacity key={item.id} style={styles.quickActionCard} onPress={item.action}>
                  <View style={[styles.quickActionIcon, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon} size={20} color={colors.white} />
                  </View>
                  <Text style={styles.quickActionLabel}>{item.label}</Text>
                  <Text style={styles.quickActionDescription}>{item.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profesionales destacados</Text>
            <View style={styles.featuredList}>
              {featuredProfessionals.map((prof) => (
                <View key={prof.id} style={styles.featuredCard}>
                  <View style={styles.featuredHeader}>
                    <View style={styles.featuredAvatar}>
                      <Ionicons name="person" size={24} color={colors.white} />
                    </View>
                    <View style={styles.featuredInfo}>
                      <Text style={styles.featuredName}>{prof.name}</Text>
                      <Text style={styles.featuredMeta}>{prof.profession} · {prof.experience} anios</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.featuredButton}
                      onPress={() => navigation.navigate('Chat', {
                        professional: {
                          name: prof.name,
                          profession: prof.profession,
                          avatar: prof.image,
                        },
                        jobSummary: `Consulta sobre ${prof.profession.toLowerCase()}`,
                      })}
                    >
                      <Ionicons name="chatbubble-ellipses" size={18} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.featuredDescription}>{prof.description.replace(/"/g, '')}</Text>
                </View>
              ))}
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
  scrollContent: { paddingBottom: 220, flexGrow: 1 },
  header: { paddingHorizontal: 24, marginBottom: 24 },
  greeting: { color: colors.white, fontSize: 16, opacity: 0.85, marginBottom: 6 },
  headline: { color: colors.white, fontSize: 28, fontWeight: '700', marginBottom: 10 },
  subheadline: { color: colors.white, opacity: 0.8, lineHeight: 20 },
  primaryCta: {
    marginTop: 20,
    backgroundColor: colors.greenButton,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryCtaText: { color: colors.white, fontSize: 16, fontWeight: '600', flex: 1 },
  section: { marginBottom: 28, paddingHorizontal: 24 },
  sectionTitle: { color: colors.white, fontSize: 20, fontWeight: '600', marginBottom: 16 },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickActionCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    padding: 18,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionLabel: { color: colors.white, fontSize: 16, fontWeight: '600' },
  quickActionDescription: { color: colors.white, opacity: 0.75, marginTop: 6, lineHeight: 18 },
  featuredList: { gap: 16 },
  featuredCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 18,
  },
  featuredHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featuredAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featuredInfo: { flex: 1 },
  featuredName: { color: colors.white, fontSize: 16, fontWeight: '600' },
  featuredMeta: { color: colors.white, opacity: 0.7, marginTop: 4 },
  featuredButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.greenButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredDescription: { color: colors.white, opacity: 0.85, lineHeight: 18 },
  tipsList: { gap: 12 },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15,23,42,0.35)',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  tipIcon: { marginTop: 2 },
  tipBody: { flex: 1 },
  tipTitle: { color: colors.white, fontSize: 16, fontWeight: '600' },
  tipDescription: { color: colors.white, opacity: 0.75, marginTop: 4, lineHeight: 18 },
});