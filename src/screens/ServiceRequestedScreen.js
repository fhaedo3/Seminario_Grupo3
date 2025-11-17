import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const ServiceRequestedScreen = ({ route, navigation }) => {
  const { hireSummary, paymentMethod } = route.params || {};

  const handleGoToMyJobs = () => {
    navigation.navigate('MyJobs');
  };

  const handleGoToHome = () => {
    navigation.navigate('Homepage');
  };

  return (
    <LinearGradient
      colors={[colors.primaryBlue, colors.secondaryBlue]}
      style={styles.container}
    >
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Icono de éxito */}
        <View style={styles.successIconContainer}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-circle" size={120} color={colors.greenButton} />
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title}>¡Servicio Solicitado!</Text>
        <Text style={styles.subtitle}>
          Tu pago inicial ha sido procesado correctamente
        </Text>

        {/* Card de información */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={24} color={colors.white} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Esperando confirmación</Text>
              <Text style={styles.infoDescription}>
                El profesional {hireSummary?.professional?.displayName || hireSummary?.professional?.name}
                revisará tu solicitud y se pondrá en contacto contigo pronto.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="notifications-outline" size={24} color={colors.white} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Te notificaremos</Text>
              <Text style={styles.infoDescription}>
                Recibirás una notificación cuando el profesional confirme tu solicitud.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="chatbubble-outline" size={24} color={colors.white} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Chat disponible</Text>
              <Text style={styles.infoDescription}>
                Podrás comunicarte directamente con el profesional desde "Mis Trabajos".
              </Text>
            </View>
          </View>
        </View>

        {/* Resumen del servicio */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen del servicio</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Profesional:</Text>
            <Text style={styles.summaryValue}>
              {hireSummary?.professional?.displayName || hireSummary?.professional?.name}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Servicio:</Text>
            <Text style={styles.summaryValue}>{hireSummary?.clientData?.serviceType}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fecha preferida:</Text>
            <Text style={styles.summaryValue}>{hireSummary?.clientData?.preferredDate}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Dirección:</Text>
            <Text style={styles.summaryValue}>{hireSummary?.clientData?.address}</Text>
          </View>
          <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Deposito:</Text>
                      <Text style={styles.summaryValue}>{hireSummary?.totalAmount}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Método de pago:</Text>
            <Text style={styles.summaryValue}>
              {paymentMethod === 'mercadopago' ? 'Mercado Pago' :
               paymentMethod === 'card' ? 'Tarjeta' :
               'Transferencia'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Monto pagado:</Text>
            <Text style={styles.totalValue}>ARS ${hireSummary?.totalAmount}</Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGoToMyJobs}
          >
            <Ionicons name="briefcase" size={22} color={colors.white} />
            <Text style={styles.primaryButtonText}>Ver mis trabajos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoToHome}
          >
            <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  infoCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoDescription: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 16,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 16,
  },
  summaryLabel: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.8,
    flex: 1,
  },
  summaryValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 12,
  },
  totalLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    color: colors.greenButton,
    fontSize: 20,
    fontWeight: '700',
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.greenButton,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: colors.greenButton,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
