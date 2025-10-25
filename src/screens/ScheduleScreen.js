import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { BackButton } from '../components/BackButton';

export const ScheduleScreen = ({ route, navigation }) => {
  const { professional } = route.params || {};
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Generar próximos 14 días
  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Simular disponibilidad: días pares disponibles, impares ocupados
      const isAvailable = date.getDate() % 2 === 0;

      dates.push({
        date: date,
        day: date.getDate(),
        month: date.toLocaleDateString('es-ES', { month: 'short' }),
        weekDay: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        available: isAvailable,
      });
    }
    return dates;
  };

  // Horarios disponibles
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const dates = generateDates();

  const handleContinue = () => {
    if (!selectedDate) {
      Alert.alert('Atención', 'Por favor selecciona una fecha');
      return;
    }
    if (!selectedTime) {
      Alert.alert('Atención', 'Por favor selecciona un horario');
      return;
    }

    navigation.navigate('Payment', {
      professional,
      selectedDate,
      selectedTime,
      amount: 5000,
    });
  };

  return (
    <LinearGradient
      colors={[colors.primaryBlue, colors.secondaryBlue]}
      style={styles.container}
    >
      <BackButton
        navigation={navigation}
        style={styles.backButton}
        backgroundColor="rgba(0,0,0,0.3)"
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="calendar" size={40} color="#fff" />
          <Text style={styles.title}>Seleccionar Fecha y Horario</Text>
          <Text style={styles.subtitle}>
            Agenda tu cita con {professional?.name || 'el profesional'}
          </Text>
        </View>

        {/* Profesional Info */}
        <View style={styles.professionalCard}>
          <Text style={styles.professionalName}>{professional?.name}</Text>
          <Text style={styles.profession}>{professional?.profession}</Text>
        </View>

        {/* Selector de Fecha */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fecha disponible</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.datesScroll}
          >
            {dates.map((dateItem, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateCard,
                  !dateItem.available && styles.dateCardDisabled,
                  selectedDate === index && styles.dateCardSelected,
                ]}
                onPress={() => dateItem.available && setSelectedDate(index)}
                disabled={!dateItem.available}
              >
                <Text
                  style={[
                    styles.weekDay,
                    !dateItem.available && styles.disabledText,
                    selectedDate === index && styles.selectedText,
                  ]}
                >
                  {dateItem.weekDay}
                </Text>
                <Text
                  style={[
                    styles.day,
                    !dateItem.available && styles.disabledText,
                    selectedDate === index && styles.selectedText,
                  ]}
                >
                  {dateItem.day}
                </Text>
                <Text
                  style={[
                    styles.month,
                    !dateItem.available && styles.disabledText,
                    selectedDate === index && styles.selectedText,
                  ]}
                >
                  {dateItem.month}
                </Text>
                {!dateItem.available && (
                  <View style={styles.unavailableBadge}>
                    <Ionicons name="close-circle" size={16} color="#f87171" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Leyenda */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.greenButton }]} />
              <Text style={styles.legendText}>Disponible</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#94a3b8' }]} />
              <Text style={styles.legendText}>Ocupado</Text>
            </View>
          </View>
        </View>

        {/* Selector de Horario */}
        {selectedDate !== null && dates[selectedDate].available && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Horario</Text>
            <View style={styles.timeSlotsContainer}>
              {timeSlots.map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlot,
                    selectedTime === time && styles.timeSlotSelected,
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={selectedTime === time ? '#fff' : colors.primaryBlue}
                  />
                  <Text
                    style={[
                      styles.timeText,
                      selectedTime === time && styles.timeTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Resumen de selección */}
        {selectedDate !== null && selectedTime && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumen de tu cita</Text>
            <View style={styles.summaryRow}>
              <Ionicons name="calendar" size={20} color={colors.primaryBlue} />
              <Text style={styles.summaryText}>
                {dates[selectedDate].weekDay}, {dates[selectedDate].day} de{' '}
                {dates[selectedDate].month}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="time" size={20} color={colors.primaryBlue} />
              <Text style={styles.summaryText}>{selectedTime} hs</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="cash" size={20} color={colors.primaryBlue} />
              <Text style={styles.summaryText}>$5000</Text>
            </View>
          </View>
        )}

        {/* Botón Continuar */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedDate || !selectedTime) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedDate || !selectedTime}
        >
          <Text style={styles.continueButtonText}>Siguiente: Método de Pago</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    opacity: 0.9,
    textAlign: 'center',
  },
  professionalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  professionalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profession: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  datesScroll: {
    marginBottom: 12,
  },
  dateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dateCardDisabled: {
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
  },
  dateCardSelected: {
    backgroundColor: colors.greenButton,
    borderColor: '#fff',
  },
  weekDay: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  day: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
  },
  month: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  disabledText: {
    color: '#94a3b8',
  },
  selectedText: {
    color: '#fff',
  },
  unavailableBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    color: '#fff',
    fontSize: 12,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeSlotSelected: {
    backgroundColor: colors.greenButton,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryBlue,
  },
  timeTextSelected: {
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  continueButton: {
    backgroundColor: colors.greenButton,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
