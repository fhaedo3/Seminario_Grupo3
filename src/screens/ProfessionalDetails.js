import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { BackButton } from '../components/BackButton';
import { professionals } from '../assets/data/plomerosdata';

export const ProfessionalDetails = ({ route, navigation }) => {
  const { professionalId } = route.params;
  const professional = professionals.find(p => p.id === professionalId);

  if (!professional) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Profesional no encontrado</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primaryBlue, colors.secondaryBlue]}
      style={styles.container}
    >
      {/* Botón Volver */}
      <BackButton
        navigation={navigation}
        style={styles.backButton}
        backgroundColor="rgba(0,0,0,0.3)"
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Imagen y encabezado */}
        <View style={styles.card}>
          <Image source={professional.image} style={styles.image} />

          <Text style={styles.name}>{professional.name}</Text>

          <View style={styles.row}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>4.4</Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{professional.profession}</Text>
          </View>

          <Text style={styles.description}>{professional.historia}</Text>

          <Text style={styles.extra}>
            Más de {professional.experience} año
            {professional.experience !== 1 ? 's' : ''} de experiencia brindando
            soluciones rápidas y eficientes en: destapaciones, arreglos de
            cañerías, colocación de sanitarios, cocinas y calefones.
          </Text>
        </View>

        {/* Opiniones */}
        <View style={styles.opinionesContainer}>
          <Text style={styles.opinionesTitle}>Opiniones</Text>

          <View style={styles.opinionCard}>
            <Text style={styles.opinionUser}>@Mariano76:</Text>
            <Text style={styles.opinionText}> Muy prolijo y económico</Text>
          </View>
        </View>

        {/* Botón Contratar */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Schedule', {
            professional: professional
          })}
        >
          <Text style={styles.buttonText}>Contratar Ahora!</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 140,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  card: {
    width: '100%',
    backgroundColor: '#3A7BD5',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 60, // para que no se tape con el botón
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#32CD32',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
  },
  description: {
    color: '#fff',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  extra: {
    color: '#fff',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
    opacity: 0.9,
  },
  opinionesContainer: {
    width: '100%',
    marginTop: 20,
  },
  opinionesTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  opinionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  opinionUser: {
    fontWeight: 'bold',
  },
  opinionText: {
    color: '#333',
  },
  button: {
    marginTop: 24,
    backgroundColor: colors.greenButton,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
  },
});
