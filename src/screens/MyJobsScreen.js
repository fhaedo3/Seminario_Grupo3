import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { BottomNav } from '../components/BottomNav';
import { BackButton } from '../components/BackButton';

const jobs = [
  {
    id: 'job-1',
    professional: {
      name: 'Jonathan Leguizamón',
      profession: 'Plomero',
      avatar: require('../assets/images/plomero3.png'),
    },
    issue: 'Gotera en techo de cocina',
    status: 'En curso',
    scheduledAt: '21 Oct · 18:00',
    lastMessage: 'Perfecto, llevo los materiales que necesitamos',
  },
  {
    id: 'job-2',
    professional: {
      name: 'Gustavo Román',
      profession: 'Gasista',
      avatar: require('../assets/images/plomero2.png'),
    },
    issue: 'Revision de instalacion de gas',
    status: 'Presupuesto enviado',
    scheduledAt: 'A coordinar',
    lastMessage: 'Te mandé el presupuesto estimado, avisame cualquier duda',
  },
  {
    id: 'job-3',
    professional: {
      name: 'Manolo Cáceres',
      profession: 'Plomero',
      avatar: require('../assets/images/plomero1.png'),
    },
    issue: 'Cambio de griferia del bano',
    status: 'Finalizado',
    scheduledAt: '16 Oct · 10:30',
    lastMessage: 'Gracias por tu trabajo, quedó impecable',
  },
];

const statusStyles = {
  'En curso': { label: 'En curso', color: '#FCD34D', icon: 'time-outline' },
  'Presupuesto enviado': { label: 'Presupuesto enviado', color: '#60A5FA', icon: 'document-text-outline' },
  Finalizado: { label: 'Finalizado', color: colors.greenButton, icon: 'checkmark-done-outline' },
};

export const MyJobsScreen = ({ navigation }) => {
  const handleOpenChat = (job) => {
    navigation.navigate('Chat', {
      professional: job.professional,
      jobSummary: job.issue,
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
          <View style={styles.headerTopRow}>
            <BackButton navigation={navigation} fallbackRoute="Homepage" />
            <Text style={styles.headerTitle}>Mis trabajos</Text>
          </View>
          <Text style={styles.headerSubtitle}>Seguimiento rápido de tus servicios activos</Text>
        </View>

        <ScrollView
          style={[styles.list, styles.scroll]}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {jobs.map((job) => {
            const status = statusStyles[job.status] ?? statusStyles['En curso'];
            return (
              <View key={job.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Image source={job.professional.avatar} style={styles.avatar} />
                  <View style={styles.cardTitleArea}>
                    <Text style={styles.professionalName}>{job.professional.name}</Text>
                    <Text style={styles.professionalProfession}>{job.professional.profession}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: status.color }]}>
                    <Ionicons name={status.icon} size={14} color={colors.white} style={styles.statusIcon} />
                    <Text style={styles.statusText}>{status.label}</Text>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.issueLabel}>Trabajo</Text>
                  <Text style={styles.issueText}>{job.issue}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={16} color={colors.white} />
                      <Text style={styles.metaText}>{job.scheduledAt}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.white} />
                      <Text style={styles.metaText}>Último mensaje</Text>
                    </View>
                  </View>
                  <Text style={styles.lastMessage}>{job.lastMessage}</Text>
                </View>
                <TouchableOpacity onPress={() => handleOpenChat(job)}>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardFooterText}>Tocar para abrir el chat</Text>
                    <Ionicons name="arrow-forward-circle" size={24} color={colors.white} />
                  </View>
                </TouchableOpacity>
                { 
                (job.status == 'Finalizado') &&
                <TouchableOpacity onPress={() => handleOpenReviewScreen(job)}>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardFooterText}>Tocar para calificar</Text>
                    <Ionicons name="arrow-forward-circle" size={24} color={colors.white} />
                  </View>
                </TouchableOpacity>
                }
              </View>
            );
          })}
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
    shadowColor: '#0f172a',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
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
});

export default MyJobsScreen;
