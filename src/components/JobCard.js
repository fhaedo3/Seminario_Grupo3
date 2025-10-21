// src/components/JobCard.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors'; // Importamos tus colores

// Recibimos 'item' que será cada objeto de trabajo
const JobCard = ({ item }) => {
  // Pequeña lógica para el color del estado
  const getStatusColor = (status) => {
    if (status === 'En Realizacion') return '#E6A919'; // Un color para en-realizacion
    if (status === 'Pendiente') return '#E6A919'; // Mismo color para pendiente
    if (status === 'Completado') return '#34A853'; // Verde para completado
    return '#E6A919'; // Default
  };

  return (
    <View style={styles.cardContainer}>
      {/* Sección Superior: Foto, Status, Nombre, etc. */}
      <View style={styles.topSection}>
        <Image source={item.image} style={styles.profileImage} />
        <View style={styles.infoContainer}>
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
          <Text style={styles.dates}>{item.dates}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>

      {/* Sección Inferior: Botones */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.verButton]}>
          <Text style={styles.buttonText}>VER</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.contratarButton]}>
          <Text style={styles.buttonText}>CONTRATAR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.chatButton]}>
          <Text style={styles.buttonText}>CHAT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.primaryBlue, // Usando tu color primario (azul)
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  topSection: {
    flexDirection: 'row',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1, // Para que ocupe el espacio restante
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dates: {
    fontSize: 10,
    color: '#B0B0B0', // Un gris claro para las fechas
    marginVertical: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  description: {
    fontSize: 12,
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)', // Línea divisoria
    paddingTop: 12,
  },
  button: {
    flex: 1, // Para que los botones ocupen espacio similar
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  verButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Un color semi-transparente
  },
  contratarButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  chatButton: {
    backgroundColor: '#34A853', // Verde para el chat
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default JobCard;