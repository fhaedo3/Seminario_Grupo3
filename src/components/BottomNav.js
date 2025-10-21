import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

export const BottomNav = ({
  navigation,
  homeRoute = 'Homepage',
  searchRoute = 'SearchProfessionals',
  jobsRoute = 'MyJobs',
  profileRoute = 'ProfileUser',
}) => {
  const insets = useSafeAreaInsets();
  const defaultPadding = Platform.OS === 'ios' ? 18 : 14;
  const paddingBottom = Math.max(insets.bottom, defaultPadding);

  return (
    <View style={[styles.bottomNav, { paddingBottom }] }>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate(homeRoute)}>
        <Ionicons name="home" size={24} color={colors.white} />
        <Text style={styles.navText}>Inicio</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate(searchRoute)}>
        <Ionicons name="search" size={24} color={colors.white} />
        <Text style={styles.navText}>Buscar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate(jobsRoute)}>
        <Ionicons name="briefcase" size={24} color={colors.white} />
        <Text style={styles.navText}>Mis Trabajos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate(profileRoute)}>
        <Ionicons name="person" size={24} color={colors.white} />
        <Text style={styles.navText}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.primaryBlue,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1000,
    elevation: 16,
  },
  navButton: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navText: { color: colors.white, fontSize: 12, marginTop: 4 },
});

export default BottomNav;